import Link from 'next/link';
import { countries } from '../../config/countries';
import type { Dictionary } from '../../i18n';
import type { Language } from '../../i18n/locales';
import type { EventRecord } from '../../modules/events/domain';
import { formatMoney } from '../../modules/events/money';
import { moneyToMajorUnits } from '../../modules/events/money-input';
import type { PrototypeOrganizerContext } from '../../modules/organizers/context.server';
import type { PromotionRecord } from '../../modules/promotions/domain';
import {
  formatBasisPoints,
  previewPromotion,
  promotionStatus,
} from '../../modules/promotions/money';
import { savePromotionAction } from '../../app/[locale]/organizer/actions';
import { FormField } from './form-field';

function dateTimeLocal(isoDate: string) {
  return isoDate.slice(0, 16);
}

function promotionHref(
  context: PrototypeOrganizerContext,
  eventId: string,
  promotionId?: string,
) {
  const query = new URLSearchParams({
    country: context.country,
    organizer: context.organizerSlug,
  });
  if (promotionId) query.set('promotion', promotionId);
  return `/${context.locale}/organizer/events/${eventId}/promotions?${query}`;
}

function PromotionCard({
  promotion,
  event,
  context,
  language,
  text,
}: {
  promotion: PromotionRecord;
  event: EventRecord;
  context: PrototypeOrganizerContext;
  language: Language;
  text: Dictionary;
}) {
  const state = promotionStatus(promotion);
  const applicableTiers = promotion.ticketTierIds.length
    ? event.ticketTiers.filter((tier) =>
        promotion.ticketTierIds.includes(tier.id),
      )
    : event.ticketTiers;
  const discount =
    promotion.type === 'PERCENTAGE'
      ? formatBasisPoints(promotion.percentageBasisPoints)
      : formatMoney(promotion.fixedAmount, event.venue.countryCode, language);
  return (
    <article className="promotion-card">
      <div className="promotion-card__heading">
        <div>
          <span className="workspace-status" data-status={state}>
            <span aria-hidden="true">●</span>
            {text.organizer.statuses[state]}
          </span>
          <h3>{promotion.code}</h3>
          <p>
            {promotion.name} · {discount}
          </p>
        </div>
        <Link href={promotionHref(context, event.id, promotion.id)}>
          {text.organizer.actions.editPromotion}
        </Link>
      </div>
      <p className="promotion-restriction">
        {promotion.ticketTierIds.length
          ? text.organizer.selectedTiers
          : text.organizer.allTiers}
      </p>
      <div
        className="promotion-preview"
        aria-label={text.organizer.promotionPreview}
      >
        {applicableTiers.map((tier) => (
          <div key={tier.id}>
            <span>{tier.name}</span>
            <p>
              <span>
                {text.organizer.originalPrice}:{' '}
                {formatMoney(tier.price, event.venue.countryCode, language)}
              </span>
              <strong>
                {text.organizer.previewPrice}:{' '}
                {formatMoney(
                  previewPromotion(tier.price, promotion),
                  event.venue.countryCode,
                  language,
                )}
              </strong>
            </p>
          </div>
        ))}
      </div>
      {promotion.attributionLabel && (
        <p className="promotion-attribution">{promotion.attributionLabel}</p>
      )}
    </article>
  );
}

export function PromotionManager({
  event,
  promotions,
  editing,
  context,
  language,
  text,
}: {
  event: EventRecord;
  promotions: readonly PromotionRecord[];
  editing: PromotionRecord | undefined;
  context: PrototypeOrganizerContext;
  language: Language;
  text: Dictionary;
}) {
  const country = event.venue.countryCode;
  const currency = countries[country].currency;
  const saveAction = savePromotionAction.bind(
    null,
    context,
    event.id,
    editing?.id,
  );
  return (
    <div className="promotion-layout">
      <section
        className="workspace-section"
        aria-labelledby="promotion-list-title"
      >
        <div className="workspace-section-heading">
          <h2 id="promotion-list-title">{text.organizer.promotions}</h2>
          <span>{promotions.length}</span>
        </div>
        {promotions.length ? (
          <div className="promotion-list">
            {promotions.map((promotion) => (
              <PromotionCard
                key={promotion.id}
                promotion={promotion}
                event={event}
                context={context}
                language={language}
                text={text}
              />
            ))}
          </div>
        ) : (
          <p className="workspace-empty">{text.organizer.noPromotions}</p>
        )}
      </section>

      <section
        className="workspace-section"
        aria-labelledby="promotion-form-title"
      >
        <div className="workspace-section-heading">
          <h2 id="promotion-form-title">
            {text.organizer.promotionConfiguration}
          </h2>
          {editing && (
            <Link href={promotionHref(context, event.id)}>
              {text.organizer.actions.cancelEdit}
            </Link>
          )}
        </div>
        <form
          action={saveAction}
          className="workspace-form workspace-form--embedded"
        >
          <div className="workspace-form-grid">
            <FormField
              label={text.organizer.fields.promoCode}
              htmlFor="promo-code"
            >
              <input
                id="promo-code"
                name="code"
                defaultValue={editing?.code}
                required
                maxLength={32}
                autoCapitalize="characters"
              />
            </FormField>
            <FormField
              label={text.organizer.fields.promoName}
              htmlFor="promo-name"
            >
              <input
                id="promo-name"
                name="name"
                defaultValue={editing?.name}
                required
                maxLength={120}
              />
            </FormField>
          </div>
          <fieldset>
            <legend>{text.organizer.fields.promoType}</legend>
            <div className="choice-row">
              <label>
                <input
                  type="radio"
                  name="type"
                  value="PERCENTAGE"
                  defaultChecked={!editing || editing.type === 'PERCENTAGE'}
                />{' '}
                {text.organizer.discounts.PERCENTAGE}
              </label>
              <label>
                <input
                  type="radio"
                  name="type"
                  value="FIXED_AMOUNT"
                  defaultChecked={editing?.type === 'FIXED_AMOUNT'}
                />{' '}
                {text.organizer.discounts.FIXED_AMOUNT}
              </label>
            </div>
          </fieldset>
          <div className="workspace-form-grid">
            <FormField
              label={text.organizer.fields.percentage}
              htmlFor="percentage"
              hint={text.organizer.hints.percentage}
            >
              <input
                id="percentage"
                name="percentage"
                inputMode="decimal"
                defaultValue={
                  editing?.type === 'PERCENTAGE'
                    ? formatBasisPoints(editing.percentageBasisPoints).replace(
                        '%',
                        '',
                      )
                    : ''
                }
                placeholder="20.00"
              />
            </FormField>
            <FormField
              label={`${text.organizer.fields.fixedAmount} (${currency})`}
              htmlFor="fixedAmount"
              hint={text.organizer.hints.fixedAmount}
            >
              <input
                id="fixedAmount"
                name="fixedAmount"
                inputMode="decimal"
                defaultValue={
                  editing?.type === 'FIXED_AMOUNT'
                    ? moneyToMajorUnits(editing.fixedAmount.minorUnits, country)
                    : ''
                }
                placeholder={
                  countries[country].currencyFractionDigits === 0
                    ? '500'
                    : '10.00'
                }
              />
            </FormField>
          </div>
          <div className="workspace-form-grid">
            <FormField
              label={text.organizer.fields.promoStart}
              htmlFor="promo-start"
            >
              <input
                id="promo-start"
                name="startsAt"
                type="datetime-local"
                defaultValue={
                  editing
                    ? dateTimeLocal(editing.startsAt)
                    : dateTimeLocal(new Date().toISOString())
                }
                required
              />
            </FormField>
            <FormField
              label={text.organizer.fields.promoEnd}
              htmlFor="promo-end"
            >
              <input
                id="promo-end"
                name="endsAt"
                type="datetime-local"
                defaultValue={
                  editing
                    ? dateTimeLocal(editing.endsAt)
                    : dateTimeLocal(event.startDateTime)
                }
                required
              />
            </FormField>
          </div>
          <div className="workspace-form-grid">
            <FormField
              label={text.organizer.fields.usageLimit}
              htmlFor="usageLimit"
              hint={text.organizer.usageNotTracked}
            >
              <input
                id="usageLimit"
                name="usageLimit"
                type="number"
                min="1"
                step="1"
                defaultValue={editing?.usageLimit}
              />
            </FormField>
            <FormField
              label={text.organizer.fields.attribution}
              htmlFor="attributionLabel"
            >
              <input
                id="attributionLabel"
                name="attributionLabel"
                defaultValue={editing?.attributionLabel}
                maxLength={120}
              />
            </FormField>
          </div>
          <fieldset>
            <legend>{text.organizer.fields.tierRestrictions}</legend>
            <p className="field-hint">
              {text.organizer.hints.tierRestrictions}
            </p>
            <div className="choice-list">
              {event.ticketTiers.map((tier) => (
                <label key={tier.id}>
                  <input
                    type="checkbox"
                    name="ticketTierIds"
                    value={tier.id}
                    defaultChecked={editing?.ticketTierIds.includes(tier.id)}
                  />
                  <span>{tier.name}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <label className="toggle-field">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={editing?.isActive}
            />
            <span>{text.organizer.fields.active}</span>
          </label>
          <button type="submit" className="workspace-primary-action">
            {editing
              ? text.organizer.actions.updatePromotion
              : text.organizer.actions.addPromotion}
          </button>
        </form>
      </section>
    </div>
  );
}
