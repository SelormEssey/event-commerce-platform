import type { ReactNode } from 'react';
import { isLanguage } from '../../i18n/locales';
import '../globals.css';

export default async function LocalizedLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  // Invalid locale pages are rejected by the route. English lets the nested
  // not-found boundary render valid full-document markup for that response.
  const documentLanguage = isLanguage(locale) ? locale : 'en';
  return (
    <html lang={documentLanguage}>
      <body>{children}</body>
    </html>
  );
}
