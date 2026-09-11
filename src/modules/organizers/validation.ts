import { WorkspaceError } from './errors';

export function cleanRequired(value: string, maximum: number) {
  const cleaned = value.trim();
  if (!cleaned || cleaned.length > maximum) {
    throw new WorkspaceError('INVALID_TEXT');
  }
  return cleaned;
}

export function cleanOptional(value: string | undefined, maximum: number) {
  const cleaned = value?.trim();
  if (!cleaned) return undefined;
  if (cleaned.length > maximum) throw new WorkspaceError('INVALID_TEXT');
  return cleaned;
}

export function isValidDate(value: string) {
  return Number.isFinite(Date.parse(value));
}
