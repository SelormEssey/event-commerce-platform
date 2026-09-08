import 'dotenv/config';
import { defineConfig } from 'prisma/config';
import { parseDatabaseEnvironment } from './src/validation/environment';

// Generation and schema validation need no live database or invented URL.
const datasource = process.env.DATABASE_URL
  ? { url: parseDatabaseEnvironment(process.env).DATABASE_URL }
  : undefined;

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations', seed: 'tsx prisma/seed.ts' },
  ...(datasource ? { datasource } : {}),
});
