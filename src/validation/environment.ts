import { z } from 'zod';

const databaseEnvironment = z.object({
  DATABASE_URL: z
    .string()
    .url()
    .refine((value) => {
      if (!URL.canParse(value)) return false;
      const url = new URL(value);
      return (
        ['postgresql:', 'postgres:'].includes(url.protocol) &&
        Boolean(url.hostname) &&
        url.pathname.length > 1 &&
        !value.includes('REPLACE_')
      );
    }),
});

export function parseDatabaseEnvironment(input: Record<string, unknown>) {
  const result = databaseEnvironment.safeParse(input);
  if (!result.success) {
    // Never include Zod input, connection strings, or credentials in errors.
    throw new Error(
      'DATABASE_URL is missing or invalid. Configure a PostgreSQL URL using .env.example.',
    );
  }
  return result.data;
}
