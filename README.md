# ticketingprototyppe

A mobile-first web foundation for a multi-country event ticketing platform. One Next.js application serves Sierra Leone, Ghana, and Côte d’Ivoire. The repository name is retained; no product or company name has been assigned.

## Sprint 0 scope

This sprint establishes application structure, market configuration, English/French localization, a poster-first visual system, PostgreSQL/Prisma configuration, secure server boundaries, and verification tools.

The visible page is a foundation demonstration: country and language selection, an intentionally empty poster canvas, accessible button/feedback examples, and a short architecture overview. No fake events or purchasing functionality are presented.

## Stack and version choices

- Node.js 24 LTS; pnpm 11.19.0; standard package scripts.
- Next.js 16.3.4 App Router; React/React DOM 19.2.8.
- TypeScript 6.0.3 with strict mode, checked indexed access, and exact optional properties.
- Tailwind CSS 4.3.3 with centralized CSS tokens and local system fonts.
- PostgreSQL 18.6; Prisma ORM/client/adapter 7.10.0.
- ESLint 9.39.5 with the matching Next.js config; Prettier 3.9.6; Vitest 5.0.0.

Versions were checked against published package metadata and peer requirements. Prisma's `latest` tag pointed to `8.0.0-rc.13`, so the stable 7.10.0 packages are pinned together. TypeScript 7 is outside the installed lint toolchain's supported range. ESLint 9 emits a deprecation notice, but the current React/import/accessibility plugins used by Next.js do not declare support for ESLint 10. Upgrade these together when their supported ranges align; do not force incompatible peers.

Direct versions are exact in `package.json`; resolved dependencies are in `pnpm-lock.yaml`. There are no payment, authentication, UI component suite, state management, or browser-test dependencies.

Production builds explicitly use Next.js's supported Webpack option. Turbopack development works, but its production CSS worker encountered a local port-permission error in this desktop environment, including after a permission retry. Webpack builds the same application successfully without changing the architecture. The project-local pnpm store is ignored by Git.

## Local setup

Use this existing repository. Node 24 and pnpm 11.19.0 must already be available. This project does not install machine-level prerequisites. If either is missing, install them yourself using your preferred supported method before running the commands below.

```sh
node --version
pnpm --version
pnpm install --frozen-lockfile
pnpm dev
```

Open `http://127.0.0.1:3000`. The real root page redirects to `/en?country=SL`, the documented prototype default. The dev/start scripts bind to loopback.

**The foundation UI, unit tests, lint, type checking, client generation, and production build do not require PostgreSQL or an `.env` file.** The page does not claim that the database is connected. Database operations require the separate setup below.

## Environment configuration

For database work only:

```sh
cp .env.example .env
```

Replace the placeholders locally. Never put actual credentials in `.env.example`.

| Variable            | Used by                                | Requirement                                                                             |
| ------------------- | -------------------------------------- | --------------------------------------------------------------------------------------- |
| `DATABASE_URL`      | Server/database scripts and Prisma CLI | A PostgreSQL URL containing the target database; required only for database operations. |
| `POSTGRES_PASSWORD` | Optional local Compose service         | A local password matching the one in `DATABASE_URL`.                                    |

There are no required `NEXT_PUBLIC_` variables, session secrets, or provider keys. Next.js loads application environment files; Prisma and standalone scripts explicitly load `.env`. Use `.env` for local database configuration so all commands read the same settings. Invalid supplied database configuration fails validation rather than silently selecting another database.

Passwords containing URL-reserved characters must be URL-encoded in `DATABASE_URL`; the Compose password remains the original value. The application does not print either value.

## PostgreSQL setup

Choose either an existing local PostgreSQL installation or the optional Compose service. Do not install Docker solely to render the foundation page. No alternate database is used when PostgreSQL is unavailable.

With Docker already installed and `.env` configured:

```sh
docker compose up -d postgres
docker compose ps
pnpm db:generate
pnpm db:validate
pnpm db:deploy
pnpm db:seed
pnpm db:check
```

Compose binds PostgreSQL to `127.0.0.1:5432`, uses a named data volume, and includes a readiness check. Its initialization role is intended only for local development. `docker compose stop postgres` stops the service while retaining data. Changing `POSTGRES_PASSWORD` after initialization does not rotate an existing database user's password.

For an existing PostgreSQL 18 installation, create a local development database and role using your normal database administration process, set `DATABASE_URL`, and run the same `db:*` commands. There is no requirement to install the `psql` CLI when another administration tool is available.

The schema has one model: `Country(code CHAR(2) PRIMARY KEY)`. The first migration creates that table. The idempotent seed inserts `SL`, `GH`, and `CI` from the TypeScript registry. It does not copy currency, language, locale, payment methods, or policy into the database. These identifiers provide future foreign-key targets without prematurely modeling the product.

`db:check` queries through the real Prisma PostgreSQL adapter and confirms that all configured country identifiers exist. It does not mock the database. Run seeding twice to verify repeatability. Migration application and this live query remain unverified until a real PostgreSQL instance is available.

## Commands

| Command                                 | Purpose                                                                   |
| --------------------------------------- | ------------------------------------------------------------------------- |
| `pnpm dev`                              | Local development server with hot reload.                                 |
| `pnpm build`                            | Generate Prisma client, then create the production Next.js build.         |
| `pnpm start`                            | Serve the production build on loopback.                                   |
| `pnpm lint`                             | ESLint with zero warnings allowed.                                        |
| `pnpm typecheck`                        | Generate client and route types, then run strict TypeScript.              |
| `pnpm test` / `pnpm test:watch`         | Run or watch the focused Vitest suite.                                    |
| `pnpm format` / `pnpm format:check`     | Apply or verify formatting.                                               |
| `pnpm check`                            | Lint, types, unit tests, formatting, and production build.                |
| `pnpm db:generate` / `pnpm db:validate` | Generate the database client or validate the schema; no live DB required. |
| `pnpm db:deploy`                        | Apply existing reviewed migrations to the configured database.            |
| `pnpm db:migrate --name <change>`       | Develop a new migration against a local development database only.        |
| `pnpm db:seed` / `pnpm db:check`        | Seed identifiers or query a real database to verify the foundation.       |

## Tests and CI

The unit suite covers country defaults and unsupported inputs, independent market/language choices, dictionary completeness, currency fraction digits, undecided financial policy, and redacted environment-validation failures. It needs no database credentials.

There is no Playwright installation or browser-test framework in the repository. Browser review should check root redirection, all three markets, French/English switching, feedback/reset buttons, keyboard navigation, narrow widths, and zoom/reduced-motion behavior.

`.github/workflows/ci.yml` prepares a single verification job: install, lint, strict types, unit tests, formatting, schema validation, PostgreSQL migration, repeatable seeding, live database query, and build. It provisions a disposable PostgreSQL service and installs the pinned package manager only on its disposable GitHub runner. No deployment, publishing, merge, or push step exists. CI has not run until these local changes are reviewed and pushed with approval.

## Architecture

| Location                    | Responsibility                                                              |
| --------------------------- | --------------------------------------------------------------------------- |
| `src/app/(default)`         | Real `/` route and its redirect-only root layout.                           |
| `src/app/[locale]`          | Localized root layout, foundation page, and loading/error/not-found states. |
| `src/components/ui`         | Small semantic button, select, and feedback primitives.                     |
| `src/components/foundation` | Interactive country/language selectors and feedback demonstration.          |
| `src/styles/tokens.css`     | Central design token definitions and Tailwind theme mapping.                |
| `src/config`                | Typed countries and explicitly undecided business configuration.            |
| `src/i18n`                  | Language registry, dictionary types, and English/French content.            |
| `src/lib`                   | Display formatting and server-only environment/database entry points.       |
| `src/validation`            | Pure environment validation, shared by the server and CLI.                  |
| `src/domain`                | Role and future ticket-status vocabulary only.                              |
| `src/modules/payments`      | Future payment integration boundary and status vocabulary only.             |
| `prisma`                    | Minimal schema, reviewed migration files, and country seed.                 |
| `scripts`                   | Explicit environment and real database verification commands.               |
| `tests`                     | Focused unit tests.                                                         |

The foundation page is a Server Component. Only selectors, feedback controls, and error recovery use client code. Selector transitions expose loading feedback without adding a redundant route-level loading boundary to a page with no asynchronous data. Two root layouts let `/` redirect cleanly while localized pages produce the correct `<html lang>` without middleware or a client-side language patch. Future feature routes can sit beneath the localized layout. English is the documented fallback for an unsupported URL because no valid language was selected. Unknown language segments return a styled 404; malformed countries fall back to Sierra Leone with a visible warning.

`src/lib/db.server.ts` creates the client lazily and reuses a bounded pool. No UI component imports database code, and no database availability check runs during rendering or builds. Generated client/build output is ignored; schema, migration, configuration, and lockfile are versioned.

Next.js automatic agent-file generation is disabled to keep development from introducing unrelated root files. Framework documentation remains available under the installed `next/dist/docs` directory.

## Country and localization architecture

| Country       | Code | Currency | Default language | Default locale |
| ------------- | ---- | -------- | ---------------- | -------------- |
| Sierra Leone  | SL   | SLE      | English          | `en-SL`        |
| Ghana         | GH   | GHS      | English          | `en-GH`        |
| Côte d’Ivoire | CI   | XOF      | French           | `fr-CI`        |

`src/config/countries.ts` is the source of truth. All payment-method lists are empty and prototype ticket sales are disabled. No country-specific provider is activated.

Language is in the URL path and country is in the query string. Choosing a country applies its default language; choosing a language afterward retains country and currency. Refresh and browser history preserve the URL's selection. This supports combinations such as `/fr?country=GH` without treating French as proof that the market is Côte d’Ivoire.

To add a language, register it in `src/i18n/locales.ts`, add a dictionary matching `Dictionary`, and register that dictionary in `src/i18n/index.ts`. Compile-time checks and the key-completeness test enforce coverage. Additional languages do not require changes to country-switching logic. Default formatting uses the country's configured locale; overrides combine the selected language with the country code.

`Intl.NumberFormat` handles display currency conventions, including XOF's zero fraction digits. This utility is for display only. Future financial calculations must use currency-aware minor units or an appropriate exact representation, not floating-point arithmetic.

## Design system

The shell uses near-black/charcoal surfaces, softened white text, muted secondary text, restrained blue actions, and green/amber/red feedback. Lilac and coral accents demonstrate room for more expressive artwork without assigning those colors financial meaning.

Colors are defined only in `src/styles/tokens.css`. It also centralizes typography, spacing, radii, touch targets, focus, and motion. Styles refer to semantic tokens rather than scattered hex values. Tailwind provides small layout utilities alongside the shared stylesheet.

The page uses semantic HTML, labeled native selects, visible focus, a skip link, text with status symbols, live feedback, 44-pixel minimum controls, responsive grids, local system fonts, and a reduced-motion override. The poster canvas is intentionally empty and labeled; no event discovery data is fabricated.

## Business and security boundaries

`src/config/business.ts` is labeled **PROTOTYPE DEFAULTS — NOT FINAL BUSINESS POLICY**. Fee, payer, payout timing, refund, and reserve settings are `null`, meaning undecided. Founder 1 must approve financial behavior before it is implemented.

See [SECURITY.md](SECURITY.md) for server-only secrets, database privileges, future secure sessions, organizer isolation, payment verification, and incident handling. Roles do not grant access. Organizer ownership must be enforced on the server when private models first appear, with negative cross-organizer tests at the same time.

## Intentionally not implemented

Event discovery or management, event pages, organizer tools, checkout, payment integrations, authentication providers, customer data, order/payment records, tickets, QR generation, scanners, admin tools, refunds, payouts, analytics, and a final product schema are absent. Provider candidates are documented only in the future payments module. No credentials are requested or embedded.

## Next planned sprint

Sprint 1 is events. This foundation provides localized routes, market identity/configuration, reusable UI tokens/components, a migration workflow, and a future server-side data-access entry point. Before adding events, agree on the minimal event/venue model and public event behavior. Private organizer access must wait for real authentication and ownership enforcement.

Sprint 1 has not started. Local PostgreSQL migration/query verification is still required before treating the database foundation as fully verified. No changes are pushed or merged automatically.
