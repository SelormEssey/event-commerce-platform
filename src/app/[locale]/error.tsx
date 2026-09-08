'use client';

import { useParams } from 'next/navigation';
import { getDictionary } from '../../i18n';
import { isLanguage } from '../../i18n/locales';
import { Button } from '../../components/ui/button';

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { locale } = useParams<{ locale: string }>();
  const text = getDictionary(isLanguage(locale) ? locale : 'en').error;
  return (
    <main className="page-width route-state">
      <h1>{text.title}</h1>
      <p>{text.detail}</p>
      <Button onClick={reset}>{text.retry}</Button>
    </main>
  );
}
