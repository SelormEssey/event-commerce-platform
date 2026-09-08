import 'server-only';
import { parseDatabaseEnvironment } from '../validation/environment';

export function getServerEnvironment() {
  return parseDatabaseEnvironment(process.env);
}
