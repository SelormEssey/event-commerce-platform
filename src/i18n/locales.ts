export const languages = {
  en: { nativeName: 'English' },
  fr: { nativeName: 'Français' },
} as const;

export type Language = keyof typeof languages;

export function isLanguage(value: string): value is Language {
  return Object.hasOwn(languages, value);
}
