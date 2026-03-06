# TODO

## High Priority

- [ ] Add authentication/authorization integration (deferred to host PA app)

## Medium Priority

- [ ] Add drag-and-drop reordering for commit items
- [ ] Configurable timezone for lifecycle transitions

## Low Priority

- [ ] Add pagination to list endpoints
- [ ] Add search/filter to RCDO browser

## Completed

- [x] Feature 4: Fibonacci Story Points (V3 migration, @ValidFibonacci, FibonacciSelector, lock guard)
- [x] Feature 2: Carry-Forward Limits (V4 migration, carryForwardCount/flaggedStale, CarryForwardWarning modal, lock blocking)
- [x] Feature 3: Blocked/At-Risk Flags (V5 migration, risk_flag/risk_note, flag toggle on locked items, dashboard sort by blocked)
- [x] Feature 1: Audit Logging (V6 migration, AuditLog entity, manual override support, AuditTimeline/AuditTrailTicker)
- [x] Feature 5: AI Summaries (Anthropic Claude integration via RestClient, AISummaryPanel on dashboard)
- [x] Initial project setup
- [x] Created `todo.md` and `changelog.md`
- [x] Docker Compose with PostgreSQL 16, backend, and frontend services
- [x] Flyway migration V1__init_schema.sql with all tables, constraints, and indexes
- [x] Flyway migration V2__seed_data.sql with sample RCDO hierarchy and demo team
- [x] Spring Boot 3.4 scaffold: pom.xml, application.yml, main class, CORS config
- [x] JPA entity classes for all 8 domain objects (+ 3 enums)
- [x] Spring Data JPA repository interfaces (8 repos)
- [x] Service layer: RcdoService, CommitService, ReconciliationService, DashboardService
- [x] CommitLifecycleService state machine (DRAFT -> LOCKED -> RECONCILING -> RECONCILED -> CARRY_FORWARD)
- [x] REST controllers with DTOs for RCDO, Commits, and Dashboard endpoints
- [x] GlobalExceptionHandler with ProblemDetail responses
- [x] Scheduled tasks for auto-lock and carry-forward transitions
- [x] React + Vite + TypeScript strict + Tailwind + Module Federation + TanStack Query scaffold
- [x] TypeScript interfaces and API client hooks for all endpoints
- [x] Commit Editor page with RCDO selector, Chess Layer categorization, and item CRUD
- [x] Chess Layer 2x2 impact/effort grid visualization component
- [x] Reconciliation side-by-side comparison view
- [x] Manager Dashboard with alignment scores and team roll-up table
- [x] RCDO Browser tree view page
- [x] README with setup instructions, architecture overview, and API reference
- [x] .gitignore, .env.example, .env for local dev
- [x] Fixed backend Dockerfile (maven:3.9 base + dependency caching)
- [x] Fixed frontend Dockerfile (nginx multi-stage with reverse proxy)
- [x] Fixed docker-compose.yml (env vars, health checks, port mapping)
- [x] Maven wrapper (mvnw/mvnw.cmd)
- [x] application.yml env var overrides
- [x] RCDO update/delete endpoints (PUT/DELETE for rally-cries, objectives, outcomes)
- [x] Commit item update/delete endpoints (PUT/DELETE for items, with DRAFT guard)
- [x] Team/Member endpoints (GET /teams, GET /teams/{id}/members)
- [x] Update request DTOs (UpdateRallyCryRequest, UpdateDefiningObjectiveRequest, UpdateOutcomeRequest, UpdateCommitItemRequest)
- [x] TeamDto and TeamMemberDto
- [x] Backend unit tests (CommitLifecycleServiceTest, CommitServiceTest, RcdoServiceTest)
- [x] Backend integration tests (RcdoControllerIntegrationTest, CommitControllerIntegrationTest)
- [x] Testcontainers config for PostgreSQL-based test infrastructure
- [x] Dynamic CommitEditorPage (team/member selector mode + editor mode via route params)
- [x] Dynamic DashboardPage (team selector + dashboard view via route params)
- [x] Edit/delete support for commit items in DRAFT mode
- [x] Error handling components (ErrorAlert, ErrorBoundary, Toast/ToastProvider)
- [x] Error states on all pages (isError rendering, mutation error toasts)
- [x] Navigation improvements (route params, reconciliation links, back links)
- [x] Frontend test setup (vitest, testing-library, msw)
- [x] Component tests (StatusBadge, CommitItemCard, ErrorAlert, ChessGrid)
- [x] Page tests (CommitEditorPage, DashboardPage, ReconciliationPage)
- [x] Production nginx config for frontend
