import Link from 'next/link';
import type { ReactNode } from 'react';
import type { CountryCode } from '../../config/countries';
import type { Dictionary } from '../../i18n';
import type { Language } from '../../i18n/locales';
import type { OrganizerRecord } from '../../modules/organizers/domain';
import type { WorkspaceErrorCode } from '../../modules/organizers/errors';
import { StatusMessage } from '../ui/status-message';
import { WorkspaceSwitcher } from './workspace-switcher';

type SavedKey = keyof Dictionary['organizer']['saved'];

function workspaceHref(
  language: Language,
  country: CountryCode,
  organizer: string,
  path = '',
) {
  return `/${language}/organizer${path}?${new URLSearchParams({ country, organizer })}`;
}

export function OrganizerShell({
  children,
  country,
  language,
  organizer,
  organizers,
  currentRoute,
  text,
  saved,
  error,
}: {
  children: ReactNode;
  country: CountryCode;
  language: Language;
  organizer: OrganizerRecord;
  organizers: readonly OrganizerRecord[];
  currentRoute: string;
  text: Dictionary;
  saved: string | undefined;
  error: string | undefined;
}) {
  const savedMessage =
    saved && Object.hasOwn(text.organizer.saved, saved)
      ? text.organizer.saved[saved as SavedKey]
      : undefined;
  const errorMessage =
    error && Object.hasOwn(text.organizer.errors, error)
      ? text.organizer.errors[error as WorkspaceErrorCode]
      : undefined;

  return (
    <>
      <a className="skip-link" href="#main-content">
        {text.navigation.skip}
      </a>
      <header className="workspace-header page-width">
        <div className="workspace-brand">
          <Link href={workspaceHref(language, country, organizer.slug)}>
            <span aria-hidden="true">↗</span>
            {text.organizer.workspace}
          </Link>
          <Link href={`/${language}?country=${country}`}>
            {text.organizer.viewPublic}
          </Link>
        </div>
        <WorkspaceSwitcher
          country={country}
          language={language}
          organizerSlug={organizer.slug}
          organizers={organizers}
          currentRoute={currentRoute}
          text={text}
        />
      </header>
      <div className="workspace-frame page-width">
        <aside className="workspace-sidebar">
          <p className="workspace-organizer-name">{organizer.displayName}</p>
          <nav aria-label={text.organizer.workspace}>
            <Link href={workspaceHref(language, country, organizer.slug)}>
              {text.organizer.dashboard}
            </Link>
            <Link
              href={workspaceHref(
                language,
                country,
                organizer.slug,
                '/profile',
              )}
            >
              {text.organizer.profile}
            </Link>
            <Link
              href={workspaceHref(
                language,
                country,
                organizer.slug,
                '/events/new',
              )}
            >
              {text.organizer.newEvent}
            </Link>
          </nav>
          <p className="prototype-workspace-note">
            {text.organizer.prototypeWarning}
          </p>
        </aside>
        <main id="main-content" className="workspace-main" tabIndex={-1}>
          {savedMessage && (
            <StatusMessage tone="success">{savedMessage}</StatusMessage>
          )}
          {errorMessage && (
            <StatusMessage tone="error">{errorMessage}</StatusMessage>
          )}
          {children}
        </main>
      </div>
    </>
  );
}
