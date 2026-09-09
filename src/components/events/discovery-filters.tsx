import Link from 'next/link';
import type { CountryCode } from '../../config/countries';
import type { Dictionary } from '../../i18n';
import type { Language } from '../../i18n/locales';
import {
  categorySlugs,
  type CategorySlug,
} from '../../modules/events/categories';
import {
  eventCategories,
  type EventCategory,
} from '../../modules/events/domain';

function discoveryUrl(
  language: Language,
  country: CountryCode,
  search: string,
  category?: CategorySlug,
) {
  const query = new URLSearchParams({ country });
  if (search) query.set('q', search);
  if (category) query.set('category', category);
  return `/${language}?${query}`;
}

export function DiscoveryFilters({
  language,
  country,
  search,
  category,
  text,
}: {
  language: Language;
  country: CountryCode;
  search: string;
  category?: EventCategory;
  text: Dictionary;
}) {
  return (
    <section className="discovery-controls" aria-labelledby="categories-title">
      <form action={`/${language}`} method="get" role="search">
        <input type="hidden" name="country" value={country} />
        {category && (
          <input
            type="hidden"
            name="category"
            value={categorySlugs[category]}
          />
        )}
        <label htmlFor="event-search">{text.discovery.searchLabel}</label>
        <div className="search-row">
          <input
            id="event-search"
            name="q"
            type="search"
            defaultValue={search}
            placeholder={text.discovery.searchPlaceholder}
          />
          <button type="submit">{text.discovery.searchButton}</button>
        </div>
      </form>
      <div className="category-section">
        <h2 id="categories-title">{text.discovery.categories}</h2>
        <nav className="category-list" aria-label={text.discovery.categories}>
          <Link
            href={discoveryUrl(language, country, search)}
            aria-current={!category ? 'page' : undefined}
          >
            {text.discovery.all}
          </Link>
          {eventCategories.map((item) => (
            <Link
              href={discoveryUrl(
                language,
                country,
                search,
                categorySlugs[item],
              )}
              aria-current={category === item ? 'page' : undefined}
              key={item}
            >
              {text.categories[item]}
            </Link>
          ))}
        </nav>
      </div>
    </section>
  );
}
