import type { ReactNode } from 'react';
import '../globals.css';

// Separate root layout allows the localized root to set the correct HTML lang.
export default function DefaultLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
