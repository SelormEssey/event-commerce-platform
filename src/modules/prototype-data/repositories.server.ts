import 'server-only';
import {
  createPrototypeData,
  createPrototypeRepositories,
  type PrototypeData,
} from './repositories';

const globalPrototypeData = globalThis as typeof globalThis & {
  prototypeOrganizerData?: PrototypeData;
};

export function getPrototypeRepositories() {
  globalPrototypeData.prototypeOrganizerData ??= createPrototypeData();
  return createPrototypeRepositories(
    globalPrototypeData.prototypeOrganizerData,
  );
}
