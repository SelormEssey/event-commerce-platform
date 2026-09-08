import { en, type Dictionary } from './dictionaries/en';
import { fr } from './dictionaries/fr';
import type { Language } from './locales';

export const dictionaries = { en, fr } satisfies Record<Language, Dictionary>;
export function getDictionary(language: Language): Dictionary {
  return dictionaries[language];
}
export type { Dictionary } from './dictionaries/en';
