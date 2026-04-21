# Architecture

**Analysis Date:** 2026-04-21

## Pattern Overview

**Overall:** Layered Architecture with State Machine orchestration

**Key Characteristics:**
- Clear separation between API layer, business logic, and data access
- Stateful lifecycle management for WeeklyCommit entities via state machine
- Frontend uses composition with Context API for global state (auth, team)
- Backend uses Spring dependency injection with transactional boundaries
- Full-stack type safety: Java enums ↔ TypeScript unions for CommitStatus, ChessCategory

## Layers

**API Layer (HTTP):**
- Purpose: Handle REST requests/responses, validate inputs, delegate to services
- Location: Backend: `backend/src/main/java/com/st6/weeklycommit/controller/`; Frontend: `frontend/src/api/`
- Contains: Controllers mapping to `/api/v1/*` routes, client request/response handling
- Depends on: Services, Lifecycle State Machine
- Used by: Frontend via fetch API, external clients

**Business Logic (Domain Services):**
- Purpose: Orchestrate workflows, enforce business rules, coordinate multiple repositories
- Location: Backend: `backend/src/main/java/com/st6/weeklycommit/service/`
- Contains: CommitService, DashboardService, AiSummaryService, ExportService, PersonalAnalyticsService
- Depends on: Repositories, Lifecycle State Machine, configuration (e.g., AnthropicConfig for AI)
- Used by: Controllers, scheduled tasks

**State Machine (Orchestration):**
- Purpose: Manage WeeklyCommit lifecycle state transitions with validation
- Location: `backend/src/main/java/com/st6/weeklycommit/statemachine/CommitLifecycleService.java`
- Pattern: State enum-based transition map with guards and audit logging
- States: DRAFT → LOCKED → RECONCILING → RECONCILED → CARRY_FORWARD
- Guards: Validates all items have effort estimates before LOCKED; checks for stale carry-forwards

**Data Access (Repositories):**
- Purpose: Encapsulate database queries, JPA entity management
- Location: `backend/src/main/java/com/st6/weeklycommit/repository/`
- Contains: 12 Spring Data JPA repositories (WeeklyCommitRepository, CommitItemRepository, etc.)
- Depends on: JPA entities, PostgreSQL via Hibernate
- Used by: Services

**Security Layer:**
- Purpose: Authenticate users, manage JWT tokens, control access
- Location: `backend/src/main/java/com/st6/weeklycommit/security/`
- Contains: JwtAuthFilter, JwtService, GoogleTokenVerifier, TeamMemberUserDetailsService
- Pattern: JWT tokens in Authorization header; filter-based auth without session state
- Integration: Google OAuth2 ID token flow + basic email/password authentication

**Frontend Components (UI Layer):**
- Purpose: Render views, capture user input, dispatch to API
- Location: `frontend/src/pages/`, `frontend/src/components/`
- Contains: Page components (CommitEditorPage, DashboardPage, etc.), UI components (StatusBadge, FibonacciSelector, etc.)
- Depends on: React Query hooks, context (auth, team), API client
- Pattern: Lazy-loaded pages, suspense boundaries, error boundaries

**Frontend Hooks & Context (State Management):**
- Purpose: Manage app-wide state (authentication, team selection)
- Location: `frontend/src/contexts/` (AuthContext, TeamContext), `frontend/src/hooks/`
- Pattern: React Context + useState for shared state; React Query for server state
- Depends on: API client, browser localStorage

**Persistence Layer (Database):**
- Purpose: Store all application data durably
- Location: PostgreSQL 16; schema defined in `backend/src/main/resources/db/migration/`
- Pattern: Flyway versioned migrations (15 migrations: V1-V15)
- Entity mapping: JPA @Entity classes in `backend/src/main/java/com/st6/weeklycommit/model/entity/`

## Data Flow

**Creating a Weekly Commit:**

1. User navigates to CommitEditorPage
2. Frontend calls `POST /api/v1/commits` with CreateWeeklyCommitRequest
3. CommitController delegates to CommitService.createCommit()
4. CommitService validates teamMember exists, checks for existing commit same week
5. Service creates new WeeklyCommit entity (status = DRAFT), saves to WeeklyCommitRepository
6. Database persists with audit trail; returns WeeklyCommitDto
7. Frontend updates React Query cache, displays success toast

**Locking a Commit (State Transition):**

1. User clicks "Lock" on CommitEditorPage
2. Frontend calls `POST /api/v1/commits/{id}/lock`
3. CommitController extracts user context, delegates to CommitLifecycleService.transition()
4. CommitLifecycleService validates transition (DRAFT → LOCKED allowed)
5. Validates all items have effortEstimate assigned and no stale items
6. Updates commit.status = LOCKED, sets lockedAt timestamp
7. Creates AuditLog entry with previousState, newState, triggeredBy
8. Returns updated WeeklyCommitDto; frontend reflects status change

**Fetching Dashboard (Team Roll-Up):**

1. User clicks team in sidebar, navigates to `/dashboard/:teamId`
2. Frontend calls `GET /api/v1/dashboard/team/:teamId`
3. DashboardController delegates to DashboardService.getTeamDashboard()
4. DashboardService queries commits for all team members, aggregates metrics
5. Computes per-member: completionRate, alignmentScore, blockedItems, moodScore
6. Returns DashboardTeam with nested DashboardMember list
7. Frontend renders manager roll-up view with completion cards

**AI Summary Generation:**

1. User opens commit card, requests summary
2. Frontend calls `GET /api/v1/commits/{id}/ai-summary?regenerate=true` (React Query hook disabled by default)
3. CommitController delegates to AiSummaryService.generateSummary()
4. AiSummaryService fetches commit items, formats into prompt
5. Service calls Anthropic API (Claude model) via AnthropicConfig HTTP client
6. Returns summary text; frontend displays in AISummaryPanel

**State Management (Frontend):**

1. AuthProvider initializes on mount: loads token from localStorage (or sessionStorage)
2. AuthContext exposes user state, login/logout functions
3. Every API call includes Authorization header via api.client authHeaders()
4. On 401 response, handle401() callback triggers logout
5. TeamContext tracks selected teamId for team views (singleton per app)
6. React Query QueryClient configured with 30s staleTime, retries on non-401/403 errors

## Key Abstractions

**WeeklyCommit Entity & State Machine:**
- Purpose: Central aggregate root for weekly commitment tracking
- Examples: `backend/src/main/java/com/st6/weeklycommit/model/entity/WeeklyCommit.java`
- Pattern: JPA entity with lazy-loaded relationship to CommitItem list; status field uses PostgreSQL enum (commit_status)
- State transitions enforced in CommitLifecycleService with @Transactional boundary

**Audit Logging:**
- Purpose: Track all state changes and item edits for compliance/debugging
- Entities: `AuditLog` (status transitions), action types (item title change, effort change)
- Examples: `backend/src/main/java/com/st6/weeklycommit/model/entity/AuditLog.java`
- Pattern: Created on each transition via createAuditEntry(); supports manual overrides with notes

**RCDO Hierarchy:**
- Purpose: Strategic alignment structure (Rally Cry → Defining Objective → Outcome)
- Entities: RallyCry, DefiningObjective, Outcome in model/entity
- Pattern: Parent-child relationships via ManyToOne; Outcome linked to CommitItem for alignment tracking

**Reconciliation Flow:**
- Purpose: Log actual completion status vs planned commitment
- Entity: `Reconciliation` (completionStatus: COMPLETED/PARTIAL/NOT_STARTED/DEFERRED, actualStoryPoints)
- Pattern: One-to-one with CommitItem; created during RECONCILING state

**Chess Category Grid:**
- Purpose: Categorize items by impact vs effort (2x2 matrix)
- Enum: ChessCategory (STRATEGIC, TACTICAL, OPERATIONAL, MAINTENANCE)
- Pattern: Enum stored on CommitItem; frontend renders ChessGrid component

## Entry Points

**Backend Main:**
- Location: `backend/src/main/java/com/st6/weeklycommit/WeeklyCommitApplication.java`
- Triggers: Docker startup or local `./mvnw spring-boot:run`
- Responsibilities: Initializes Spring Boot, loads configuration, starts Tomcat on port 8080

**Frontend Main:**
- Location: `frontend/src/main.tsx`
- Triggers: Vite dev server or production build
- Responsibilities: Renders React root, wraps with providers (ErrorBoundary, GoogleOAuthProvider, QueryClientProvider, AuthProvider, TeamProvider), mounts to #root

**Frontend Router:**
- Location: `frontend/src/App.tsx`
- Triggers: On mount and route change via React Router
- Responsibilities: Defines route structure, lazy-loads pages, enforces ProtectedRoute wrapper for authenticated views

**Scheduled Tasks:**
- Location: `backend/src/main/java/com/st6/weeklycommit/service/ScheduledTasks.java`
- Triggers: @EnableScheduling on WeeklyCommitApplication
- Responsibilities: Auto-locks commits at Monday 10 AM, exports team summaries (configurable)

## Error Handling

**Strategy:** Centralized exception handling + granular validation

**Backend Patterns:**
- Controllers throw IllegalArgumentException, IllegalStateException
- GlobalExceptionHandler catches and maps to HTTP responses (400, 409, 500)
- Location: `backend/src/main/java/com/st6/weeklycommit/controller/GlobalExceptionHandler.java`
- Validation: @Valid on @RequestBody with custom @ValidFibonacci annotation for effort estimates
- Location: `backend/src/main/java/com/st6/weeklycommit/validation/`

**Frontend Patterns:**
- ErrorBoundary component wraps entire app: catches React rendering errors, displays ErrorAlert
- Location: `frontend/src/components/ErrorBoundary.tsx`, `frontend/src/components/ErrorAlert.tsx`
- API errors: api.client throws Error with res.status + message; React Query logs to console, displays toast
- Toast notifications: useToast() hook for user feedback
- Location: `frontend/src/components/Toast.tsx`, `frontend/src/hooks/useToast.ts`

## Cross-Cutting Concerns

**Logging:** 
- Backend: Spring Boot default (console to stdout); application.yml configures level
- Frontend: console.log for debug; Toast for user-facing errors
- Approach: Minimal, only errors and state transitions

**Validation:**
- Backend: Spring Validation (@Valid @NotNull @ValidFibonacci); database constraints (unique on weekStart+teamMemberId)
- Frontend: TypeScript strict mode; React Hook Form for commit editor (not yet visible in explored files)
- Approach: Fail-fast at API boundary; allow render-time type checking

**Authentication:**
- Backend: JwtAuthFilter intercepts Bearer token, parses claims (email, role), sets SecurityContext
- Frontend: AuthContext loads token on init; includes in every request via api.client
- Approach: Stateless JWT; token stored in localStorage (reload-persistent)

**Authorization:**
- Backend: Role-based access (LEAD, CONTRIBUTOR, MANAGER roles on TeamMember entity)
- Pattern: Not yet enforced at endpoint level; all authenticated users can access all endpoints
- Future: Add @PreAuthorize("hasRole('MANAGER')") on dashboard endpoints

**Transactional Boundaries:**
- Backend: Service methods marked @Transactional; lifecycle transitions atomic with audit writes
- Pattern: Database commit happens only if all operations succeed; rollback on exception
- Database-level: Flyway migrations ensure schema consistency on startup

---

*Architecture analysis: 2026-04-21*
