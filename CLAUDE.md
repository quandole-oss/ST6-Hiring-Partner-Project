# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

**Full stack (preferred for end-to-end work):**
```bash
docker-compose up --build        # Postgres + Spring Boot + nginx-fronted SPA
```
- Frontend: http://localhost:5173
- API:      http://localhost:8080/api/v1
- DB:       localhost:5432 (`wcuser`/`wcpass`, db `weeklycommit`)

**Backend (Java 21 / Spring Boot 3.4):**
```bash
cd backend
./mvnw spring-boot:run           # run API; requires a reachable Postgres
./mvnw test                      # all tests (Testcontainers spins up Postgres — Docker must be running)
./mvnw test -Dtest=CommitLifecycleServiceTest                # single class
./mvnw test -Dtest=CommitLifecycleServiceTest#rejectsInvalid # single method
./mvnw -DskipTests package       # build jar
```

**Frontend (Vite + TS strict):**
```bash
cd frontend
npm install
npm run dev                      # Vite on 5173, proxies /api → localhost:8080
npm run build                    # tsc -b && vite build (strict type-check runs first)
npm test                         # vitest, interactive
npm test -- --run                # CI mode, no watch
npm test -- FibonacciSelector    # filter by filename
```

Every PR must pass `npm run build` (type check) and `npm test -- --run` — CI enforces both in `.github/workflows/ci.yml`.

## Architecture

Monorepo with `backend/` (Spring Boot API) and `frontend/` (React SPA, exposed as a Module Federation remote named `weeklyCommitMfe`). Docker Compose wires Postgres 16 + backend + nginx-fronted frontend. In production on Railway, backend and frontend deploy as **two separate services**; the frontend's nginx also reverse-proxies `/api/*` to the backend service via `BACKEND_ORIGIN` (see `frontend/nginx.conf.template`).

### Domain: RCDO + Weekly Commits + State Machine

The product models ST6's RCDO framework: `RallyCry → DefiningObjective → Outcome`. Each `TeamMember` writes a `WeeklyCommit` per `week_start` date; each commit has `CommitItem`s linked to an `Outcome` with a `Fibonacci` story-point estimate and a `ChessCategory` (Strategic/Tactical/Operational/Maintenance — the 2×2 Impact×Effort grid). Each item may have a `Reconciliation` row recording actual completion.

Commits move through a strict one-directional state machine at `backend/src/main/java/com/st6/weeklycommit/statemachine/CommitLifecycleService.java` — note the `statemachine` package, not `service`:

```
DRAFT → LOCKED → RECONCILING → RECONCILED → CARRY_FORWARD
```

Key invariants:
- **Lock guards** fire on `DRAFT → LOCKED`: reject if any item has `null` `effortEstimate`, or any item is `flaggedStale` (carry-forward count hit `app.lifecycle.carry-forward-limit`, default 3). The UI must resolve stale items via `CarryForwardWarning` modal (Delete / Resize / Reassign).
- **Override path** — `overrideTransition()` is a manager escape hatch that skips guards but requires a `notes` reason and writes an `AuditLog` row with `is_manual_override = true`.
- **Every** transition writes an `AuditLog` row with `triggered_by` from the `X-Triggered-By` header (default `"SYSTEM"`). Auto-lock runs via `ScheduledTasks` cron `0 0 10 * * MON` (UTC, hardcoded).
- **Mid-week** flagging: once `LOCKED`, items are otherwise frozen, but `risk_flag` (BLOCKED / AT_RISK) + `risk_note` can still be set via `PUT /commits/{cId}/items/{iId}/risk`.

### Persistence

- **15 Flyway migrations** under `backend/src/main/resources/db/migration/` — schema is append-only; never edit an applied migration. `repair-on-migrate: true` is enabled.
- JPA is configured defensively: `ddl-auto: validate` (Hibernate refuses to start if entities drift from migrations) and `open-in-view: false` (lazy loads outside transactions throw immediately, so fetch plans must be declared at the service boundary). `default_batch_fetch_size: 16` softens N+1.
- **Enum storage is deliberate**: `commit_status` uses a PG `ENUM` type; `risk_flag` uses `VARCHAR + CHECK` to avoid `ALTER TYPE` pain when adding values.
- **Validation**: custom `@ValidFibonacci` annotation (see `validation/`) enforces 1/2/3/5/8/13 on effort and actual story points.

### AI integration

AI calls go through the backend only — `AiSummaryService` and `AiQaService` use Spring `RestClient` to hit Anthropic directly. Model is `claude-sonnet-4-6` (no date suffix — see commit `af3531e`; the model hallucinated `-20250514` which doesn't exist). `anthropic-api-key` is injected via `ANTHROPIC_API_KEY`; if blank the service throws 503. A `frontend/src/services/aiSummaryService.ts` exists with mock templates used only when `VITE_AI_ENABLED=false` — real AI never runs browser-side (no API key leak).

### Frontend state + data fetching

- **Server state** lives in TanStack Query; **client state** (selected team, toasts) lives in React Context (`contexts/`, `hooks/useToast.ts`).
- **Lazy fetch pattern**: expensive queries (`useTeamSummary`, AI summary) use `enabled: false` and fire only on explicit user action via `refetch()`. Cheap queries prefetch on mount.
- **Lazy routes**: `App.tsx` uses `React.lazy()` for 7 pages (Dashboard + Login stay static). Chunk filenames are content-hashed → **do not cache `index.html`** at any edge; see `nginx.conf.template` and the `lazy-chunk-404-on-deploy` debug session for the stale-chunk failure mode.
- **Tests**: Vitest + Testing Library + MSW. Handlers in `frontend/src/test/mocks/handlers.ts` are the living contract with backend DTOs — update them when DTOs change or frontend tests will pass while prod 500s.

### Auth

Google OAuth ID-token flow (client-side) exchanges for an HS256 JWT signed by `JwtService` (see `backend/src/main/java/com/st6/weeklycommit/security/`). Token is kept in `frontend/src/api/tokenStore.ts` (single source of truth — added in `794b5c1`). `JwtAuthFilter` populates the `SecurityContext`; `SecurityConfig` guards everything except `/api/v1/auth/*` and `/api/v1/health`. Default `JWT_SECRET` in `application.yml` is a dev fallback — override in every non-local environment.

### Config env vars

`application.yml` reads from env with defaults for local Docker Compose. Key vars:
- `SPRING_DATASOURCE_URL` / `SPRING_DATASOURCE_USERNAME` / `SPRING_DATASOURCE_PASSWORD`
- `JWT_SECRET` (**rotate in any deployed environment** — the default is known)
- `ANTHROPIC_API_KEY`, `AI_SUMMARIES_ENABLED`
- `GOOGLE_CLIENT_ID` (frontend also needs `VITE_GOOGLE_CLIENT_ID` at **build** time — passed through Docker build arg; see commit `4303f4e`)
- `APP_CORS_ALLOWED_ORIGINS`, `DEMO_MODE`, `SEED_DEMO_DATA`, `PORT`

### Known gotchas

- **Backend tests require Docker** (Testcontainers).
- **Frontend Google OAuth** needs `VITE_GOOGLE_CLIENT_ID` **at build time**, not runtime — it's a `<script>` arg in `index.html`.
- **Railway tuning**: JVM heap is 192MB (cost tier), not a capacity choice; `maximum-pool-size: 5` on Hikari is small on purpose. Both will need raising under real load.
- **Timezone is hardcoded UTC** in `app.lifecycle.timezone` — auto-lock cron fires at Monday 10:00 UTC regardless of team location.
- **`.env`** lives at repo root (not per-service); Docker Compose interpolates it.
- **`.planning/`** is GSD workflow state (debug sessions, plans) — not part of the product.
