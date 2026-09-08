# Security rules

Sprint 0 is a public foundation demonstration. It contains no authentication, private organizer data, transactions, or payment processing. It is not a production ticketing service.

## Secrets and environment variables

- Never commit `.env`, `.env.*`, credentials, database passwords, provider secrets, or session keys. Only the placeholder `.env.example` is tracked.
- Read application secrets through `src/lib/env.server.ts`. It validates configuration and is marked `server-only`; the database module is also marked `server-only`.
- `src/validation/environment.ts` validates inputs without exposing the supplied connection string in error messages. Database scripts also redact connection errors.
- No browser environment variables are needed in Sprint 0. `NEXT_PUBLIC_` values are embedded into browser bundles and must always be safe for anyone to read.
- Do not log raw request bodies, tokens, payment responses, or personal data when later integrations are added. Redact before logging, not afterward.
- If a secret is accidentally exposed, revoke/rotate it immediately. Removing a file from the latest commit is not sufficient to remove it from Git history.

## Database boundaries

- PostgreSQL is the only configured database. The `Country` table contains identifiers only; typed market configuration remains in source code.
- Keep Prisma and all queries behind server-only application modules. Never import the generated database client into interactive components.
- Validate inputs on the server. Use parameterized Prisma queries. Do not concatenate user input into SQL or use unsafe raw-query APIs.
- The provided Compose service binds to loopback only. Its initialization user is for local development only. A future deployment must separate migration privileges from the least-privilege application role.
- Use verified TLS for nonlocal database connections. Do not disable certificate validation to make a connection succeed.
- `db:deploy` applies reviewed migrations; it does not generate changes or reset data. `db:migrate` is for local development only. Review generated migration SQL before applying it.
- The seed only inserts missing country identifiers; it never deletes or rewrites existing records. The database check performs a read query and disconnects.
- Each application process reuses a bounded connection pool. Revisit total connection limits for the eventual deployment's process/instance count.

## Authentication and organizer isolation in later sprints

- Role constants are vocabulary, not authentication or authorization. There are no mock sessions or trusted browser-supplied roles.
- Before private records exist, establish verified server-side sessions with secure, HttpOnly, SameSite cookies, expiration, rotation, revocation, and appropriate CSRF protection.
- Derive the organizer scope from the authenticated user's verified membership. Never trust an organizer ID, role, URL parameter, or country selector as proof of access.
- Every private organizer read and write must enforce ownership/membership on the server. An unguessable record ID is not an access check. Organizer A must never read or mutate Organizer B's private data.
- Add negative cross-organizer access tests when the first organizer-owned model/query is introduced. UI visibility does not replace authorization.

## Payments in later sprints

- Never store raw card numbers, CVV, or other raw card data.
- Never issue tickets based on a browser redirect or a client-supplied success flag.
- Verify payments on the server, authenticate provider notifications, validate order/amount/currency, and make processing idempotent before implementing ticket issuance.
- Keep provider integrations isolated under `src/modules/payments` and financial policy centralized under `src/config/business.ts`.
- Prototype policy values are undecided. They do not authorize fees, refunds, payouts, advances, or reserves.

## Browser and dependency defaults

- The application disables the framework identification header and sets MIME-sniffing, referrer, framing, and permissions headers. Camera, microphone, and geolocation are disabled for this foundation; future scanner requirements need an intentional permissions change.
- Use semantic controls, explicit text feedback, and visible focus. Do not expose internal error details in the page.
- The prototype requests no indexing. This is not an access-control mechanism.
- Before deployment, configure HTTPS, an appropriate Content Security Policy compatible with Next.js, production session protection, and operational secret storage. Those are not simulated in this local sprint.
- Direct dependencies and the package manager are pinned. The lockfile is versioned. Dependency lifecycle scripts are explicitly listed in `pnpm-workspace.yaml`; do not approve unfamiliar scripts without inspecting them.
- CI has read-only repository permissions, does not persist checkout credentials, and uses only a disposable PostgreSQL service. It has no deployment or production credentials.
- Report a security issue privately to the repository owner. Do not post secrets or exploitable private details in a public issue.
