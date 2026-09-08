import type { Metadata } from 'next';
import { foundationPath, prototypeDefault } from '../config/countries';
import { getDictionary } from '../i18n';
import './globals.css';

const text = getDictionary(prototypeDefault.language);

export const metadata: Metadata = {
  title: text.notFound.title,
  robots: { index: false, follow: false },
};

export default function GlobalNotFound() {
  return (
    <html lang={prototypeDefault.language}>
      <body>
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
      </body>
    </html>
  );
}
