import 'server-only';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import { getServerEnvironment } from './env.server';

// Lazy creation keeps page rendering/builds independent of database availability.
// Reuse the connection pool across development module reloads.
const databaseGlobal = globalThis as typeof globalThis & {
  databaseClient?: PrismaClient;
};

export function getDatabase() {
  if (!databaseGlobal.databaseClient) {
    const { DATABASE_URL } = getServerEnvironment();
    databaseGlobal.databaseClient = new PrismaClient({
      adapter: new PrismaPg({
        connectionString: DATABASE_URL,
        max: 5,
        connectionTimeoutMillis: 5000,
      }),
    });
  }
  return databaseGlobal.databaseClient;
}
