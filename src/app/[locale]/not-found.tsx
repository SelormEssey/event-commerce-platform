import type { Metadata } from 'next';
import { getDictionary } from '../../i18n';
import { foundationPath, prototypeDefault } from '../../config/countries';

const text = getDictionary(prototypeDefault.language);

export const metadata: Metadata = {
  title: text.notFound.title,
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="page-width route-state">
      <h1>{text.notFound.title}</h1>
      <p>{text.notFound.detail}</p>
      <a
        className="button button--primary"
        href={foundationPath(
          prototypeDefault.language,
          prototypeDefault.country,
        )}
      >
        {text.error.home}
      </a>
    </main>
  );
}
