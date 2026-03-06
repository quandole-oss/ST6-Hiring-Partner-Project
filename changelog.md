# Changelog

All notable changes to this project will be documented in this file.

## [0.3.0] - 2026-03-06

### Added

#### Database
- `V3__fibonacci_story_points.sql`: Fibonacci CHECK constraint on effort_estimate (1,2,3,5,8,13), renamed actual_effort → actual_story_points
- `V4__carry_forward_count.sql`: carry_forward_count and flagged_stale columns on commit_item
- `V5__item_risk_flag.sql`: risk_flag (BLOCKED/AT_RISK), risk_note, risk_flagged_at on commit_item
- `V6__audit_log.sql`: audit_log table with state transitions, manual override flag, triggered_by

#### Backend
- `@ValidFibonacci` custom constraint annotation + `FibonacciValidator` for Fibonacci story points
- `RiskFlag` enum (BLOCKED, AT_RISK) for mid-week item status flagging
- `AuditLog` entity + repository for state machine transition logging
- `AiSummaryService` using Spring RestClient to call Anthropic Claude Messages API
- `AnthropicConfig` configuration properties (api key, model, max tokens, enabled)
- `CommitController`: `GET /{id}/audit-log`, `POST /{id}/override`, `PUT /{cId}/items/{iId}/risk`
- `DashboardController`: `GET /team/{teamId}/blocked-items`, `GET /team/{teamId}/summary`
- `CommitLifecycleService`: overloaded transition with triggeredBy, manual override support, lock guards (missing SP, stale items)
- `DashboardService`: totalStoryPoints/completedStoryPoints per member, blocked/atRisk counts, getBlockedItems()
- `ScheduledTasks`: carry-forward count increment, flaggedStale detection at limit
- DTOs: `AuditLogDto`, `UpdateItemRiskRequest`, `BlockedItemDto`, `TeamSummaryDto`
- `DashboardMemberDto`: totalStoryPoints, completedStoryPoints, blockedItems, atRiskItems
- `WeeklyCommitDto`: hasBlockedItems flag
- `CommitItemDto`: carryForwardCount, flaggedStale, riskFlag, riskNote, riskFlaggedAt

#### Frontend
- `FibonacciSelector` component: horizontal row of clickable Fibonacci point buttons with motion animations
- `CarryForwardWarning` component: modal for resolving stale carry-forward items (Delete/Resize/Reassign)
- `AuditTimeline` component: vertical timeline of commit state transitions with override badges
- `AuditTrailTicker` component: staggered fade-in recent activity list for dashboard
- `AISummaryPanel` component: on-demand AI summary with generate/regenerate, loading skeleton, gradient card
- `useAuditLog(commitId)` query hook
- `useTeamSummary(teamId)` query hook (enabled: false, on-demand via refetch)
- `useUpdateItemFlag(commitId)` mutation hook
- CommitItemCard: SP display, CF badge with color escalation, persistent border trail for stale, BLOCKED/AT_RISK badges, flag toggle buttons
- CommitEditorPage: FibonacciSelector, total SP display, lock guards, CarryForwardWarning modal, collapsible AuditTimeline
- DashboardPage: AISummaryPanel, Total SP/Completed SP metrics, Blocked/At Risk columns, sort by blocked
- ReconciliationPage: FibonacciSelector for actual story points
- 20 new frontend tests (50 total across 12 test files)

### Changed

#### Backend
- `Reconciliation`: actualEffort → actualStoryPoints
- `CreateCommitItemRequest`/`UpdateCommitItemRequest`: @Min/@Max → @ValidFibonacci on effortEstimate
- `UpdateReconciliationRequest`: actualEffort → actualStoryPoints with @ValidFibonacci
- `ReconciliationService`: uses actualStoryPoints
- Lock/reconcile/submit endpoints accept optional X-Triggered-By header

#### Frontend
- `ChessGrid`: effort threshold updated for Fibonacci scale (>=5 = high)
- Types: FIBONACCI_POINTS const, ItemFlag type, TeamSummary/AuditLogEntry interfaces
- All mock handlers updated with new fields and endpoints

## [0.2.0] - 2026-03-06

### Added

#### Infrastructure
- `.gitignore` covering backend/target, frontend/node_modules, .env, IDE files
- `.env.example` and `.env` with PostgreSQL credentials for local dev
- Maven wrapper (`mvnw`, `mvnw.cmd`, `.mvn/wrapper/`) for `./mvnw` support
- Frontend nginx config (`nginx.conf`) with API reverse proxy and SPA routing

### Changed

#### Infrastructure
- Backend Dockerfile: uses `maven:3.9-eclipse-temurin-21` with dependency caching layer
- Frontend Dockerfile: multi-stage build with `nginx:alpine` runtime (serves static files on port 80)
- `docker-compose.yml`: env var interpolation from `.env`, backend health check, frontend port `5173:80`, `depends_on` with `service_healthy`
- `application.yml`: env var overrides for datasource URL/credentials and CORS origins

#### Backend
- Added RCDO update/delete: `PUT/DELETE` for rally-cries, objectives, and outcomes (6 new endpoints)
- Added commit item update/delete: `PUT/DELETE /{commitId}/items/{itemId}` with DRAFT status guard
- Added Team/Member endpoints: `GET /api/v1/teams`, `GET /api/v1/teams/{id}/members`
- New DTOs: `UpdateRallyCryRequest`, `UpdateDefiningObjectiveRequest`, `UpdateOutcomeRequest`, `UpdateCommitItemRequest`, `TeamDto`, `TeamMemberDto`
- Testcontainers test infrastructure (`TestcontainersConfig`, `application-test.yml`)
- Unit tests: `CommitLifecycleServiceTest` (9), `CommitServiceTest` (13), `RcdoServiceTest` (13)
- Integration tests: `RcdoControllerIntegrationTest` (12), `CommitControllerIntegrationTest` (9)

#### Frontend
- Dynamic `CommitEditorPage`: selector mode (team -> member -> commits list) and editor mode via `/commits/:id`
- Dynamic `DashboardPage`: team selector and dashboard view via `/dashboard/:teamId`
- Edit/delete support for commit items (buttons shown in DRAFT mode)
- Error handling: `ErrorAlert`, `ErrorBoundary`, `Toast`/`ToastProvider` with auto-dismiss
- All pages show error states (`isError` -> `ErrorAlert`), all mutations show toast on error
- Navigation: added `/commits/:id` and `/dashboard/:teamId` routes, reconciliation link from editor, back link from reconciliation
- API: `useTeams()`, `useTeamMembers()`, `useUpdateItem()`, `useDeleteItem()`, `api.delete()`
- Types: `Team`, `TeamMember`, `UpdateCommitItemRequest` interfaces
- Test setup: vitest, testing-library, msw with mock handlers
- 7 component tests: StatusBadge, CommitItemCard, ErrorAlert, ChessGrid
- 12 page tests: CommitEditorPage, DashboardPage, ReconciliationPage

## [0.1.0] - 2026-03-05

### Added

#### Infrastructure
- Docker Compose with PostgreSQL 16, Spring Boot backend, and Vite frontend services
- Backend Dockerfile (multi-stage build with Eclipse Temurin JDK 21)
- Frontend Dockerfile (Node 20 + Vite dev server)

#### Database
- Flyway migration `V1__init_schema.sql`: 8 tables (rally_cry, defining_objective, outcome, team, team_member, weekly_commit, commit_item, reconciliation) with PostgreSQL enums, foreign keys, indexes, and check constraints
- Flyway migration `V2__seed_data.sql`: sample RCDO hierarchy (2 rally cries, 4 objectives, 7 outcomes), demo team (3 members), and sample weekly commit with 3 items

#### Backend (Java 21 + Spring Boot 3.4)
- Project scaffold with pom.xml, application.yml, virtual threads enabled
- CORS configuration for MFE
- 8 JPA entities: RallyCry, DefiningObjective, Outcome, Team, TeamMember, WeeklyCommit, CommitItem, Reconciliation
- 3 enums: CommitStatus, ChessCategory, CompletionStatus
- 8 Spring Data JPA repositories with custom query methods
- 15 DTO records for request/response
- RcdoService: full RCDO hierarchy CRUD
- CommitService: weekly commit and item management with status guards
- CommitLifecycleService: state machine (DRAFT -> LOCKED -> RECONCILING -> RECONCILED -> CARRY_FORWARD)
- ReconciliationService: upsert reconciliation entries per commit item
- DashboardService: team roll-up with completion rates and alignment scores
- ScheduledTasks: auto-lock draft commits (Monday 10 AM) and carry-forward deferred items
- GlobalExceptionHandler: maps exceptions to RFC 7807 ProblemDetail responses
- 3 REST controllers: RcdoController, CommitController, DashboardController (12 endpoints total)

#### Frontend (React 18 + TypeScript strict + Vite)
- Vite config with Module Federation (exposed as `weeklyCommitMfe`)
- Tailwind CSS setup with PostCSS
- TypeScript strict mode with path aliases
- API client layer with fetch wrapper
- TanStack Query hooks for all endpoints (rcdo, commits, dashboard)
- 5 components: StatusBadge, AlignmentScoreDisplay, ChessGrid, CommitItemCard, RcdoSelector
- 4 pages: CommitEditorPage, ReconciliationPage, DashboardPage, RcdoPage
- React Router navigation with sticky nav bar
- Chess Layer 2x2 impact/effort grid visualization
- Reconciliation side-by-side comparison view
- Manager dashboard with alignment metrics and team table
- RCDO browser with expandable tree view

#### Documentation
- README with architecture overview, quick start, API reference, and project structure
- todo.md and changelog.md
