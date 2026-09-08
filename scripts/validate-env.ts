import 'dotenv/config';
import { parseDatabaseEnvironment } from '../src/validation/environment';

try {
  parseDatabaseEnvironment(process.env);
} catch {
  console.error(
    'DATABASE_URL is missing or invalid. Configure a PostgreSQL URL using .env.example.',
  );
  process.exitCode = 1;
}
