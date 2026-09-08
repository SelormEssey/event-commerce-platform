import { describe, expect, it } from 'vitest';
import { parseDatabaseEnvironment } from '../src/validation/environment';

describe('database environment validation', () => {
  it.each(['postgresql', 'postgres'])(
    'accepts a %s connection and strips unrelated values',
    (protocol) => {
      const DATABASE_URL = `${protocol}://local_user:unit_test_only@localhost:5432/platform`;
      expect(
        parseDatabaseEnvironment({
          DATABASE_URL,
          OTHER_SECRET: 'not returned',
        }),
      ).toEqual({ DATABASE_URL });
    },
  );
  it.each([
    undefined,
    '',
    'invalid',
    'https://example.com/platform',
    'file:./data.db',
    'postgresql://localhost',
    'postgresql://platform:REPLACE_WITH_LOCAL_PASSWORD@localhost/platform',
  ])(
    'rejects missing, non-PostgreSQL, or placeholder configuration',
    (DATABASE_URL) => {
      expect(() => parseDatabaseEnvironment({ DATABASE_URL })).toThrow(
        'DATABASE_URL is missing or invalid',
      );
    },
  );
  it('redacts rejected values from errors', () => {
    const secret = 'sensitive-value-that-must-not-appear';
    try {
      parseDatabaseEnvironment({
        DATABASE_URL: `https://user:${secret}@localhost/platform`,
      });
      expect.fail('Expected invalid configuration to throw.');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(String(error)).not.toContain(secret);
      expect(String(error)).not.toContain('https://');
    }
  });
});
