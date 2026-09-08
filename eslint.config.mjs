import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier/flat';

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  prettier,
  globalIgnores([
    '.next/**',
    'src/generated/**',
    'coverage/**',
    'next-env.d.ts',
  ]),
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/lib/env.server.ts'],
    rules: {
      'no-restricted-properties': [
        'error',
        {
          object: 'process',
          property: 'env',
          message:
            'Read validated environment values through env.server.ts; never expose secrets to clients.',
        },
      ],
    },
  },
]);
