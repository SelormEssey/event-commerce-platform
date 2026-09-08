import { countryCodes } from '../src/config/countries';
import { createScriptDatabase } from '../scripts/database';

async function seed() {
  const database = createScriptDatabase();
  try {
    await database.country.createMany({
      data: countryCodes.map((code) => ({ code })),
      skipDuplicates: true,
    });
    console.info(
      'Country identifiers seeded. Existing records were preserved.',
    );
  } finally {
    await database.$disconnect();
  }
}

seed().catch(() => {
  console.error(
    'Database seed failed. Check local configuration, connectivity, and migration status. Credentials are not logged.',
  );
  process.exitCode = 1;
});
