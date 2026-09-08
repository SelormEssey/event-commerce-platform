import { countryCodes } from '../src/config/countries';
import { createScriptDatabase } from './database';

async function check() {
  const database = createScriptDatabase();
  try {
    const records = await database.country.findMany({ select: { code: true } });
    const found = new Set(records.map(({ code }) => code));
    if (!countryCodes.every((code) => found.has(code))) {
      throw new Error('Expected country identifiers are missing.');
    }
    console.info(
      'PostgreSQL verified: Prisma queried all configured country identifiers.',
    );
  } finally {
    await database.$disconnect();
  }
}

check().catch(() => {
  console.error(
    'Database verification failed. Check DATABASE_URL, connectivity, migrations, and seeding. Credentials are not logged.',
  );
  process.exitCode = 1;
});
