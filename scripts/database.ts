import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';
import { parseDatabaseEnvironment } from '../src/validation/environment';

export function createScriptDatabase() {
  const { DATABASE_URL } = parseDatabaseEnvironment(process.env);
  return new PrismaClient({
    adapter: new PrismaPg({
      connectionString: DATABASE_URL,
      max: 1,
      connectionTimeoutMillis: 5000,
    }),
  });
}
