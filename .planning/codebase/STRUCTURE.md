# Codebase Structure

**Analysis Date:** 2026-04-21

## Directory Layout

```
ST6 Hiring Partner Project/
├── backend/                          # Spring Boot 3.4 Java 21 backend
│   ├── pom.xml                       # Maven project config
│   ├── src/main/java/com/st6/weeklycommit/
│   │   ├── WeeklyCommitApplication.java
│   │   ├── controller/               # REST API endpoints
│   │   │   ├── AuthController.java
│   │   │   ├── CommitController.java
│   │   │   ├── DashboardController.java
│   │   │   ├── ExportController.java
│   │   │   ├── PersonalAnalyticsController.java
│   │   │   ├── RcdoController.java
│   │   │   ├── TeamController.java
│   │   │   ├── TeamPulseController.java
│   │   │   ├── GlobalExceptionHandler.java
│   │   ├── service/                  # Business logic
│   │   │   ├── CommitService.java
│   │   │   ├── RcdoService.java
│   │   │   ├── DashboardService.java
│   │   │   ├── AiSummaryService.java
│   │   │   ├── AiQaService.java
│   │   │   ├── PersonalAnalyticsService.java
│   │   │   ├── TeamPulseService.java
│   │   │   ├── PdfExportService.java
│   │   │   ├── EmailExportService.java
│   │   │   ├── ExportDataService.java
│   │   │   ├── ReconciliationService.java
│   │   │   ├── GoogleTokenVerifier.java
│   │   │   ├── ScheduledTasks.java
│   │   ├── statemachine/             # State management
│   │   │   ├── CommitLifecycleService.java
│   │   ├── repository/               # JPA data access
│   │   │   ├── WeeklyCommitRepository.java
│   │   │   ├── CommitItemRepository.java
│   │   │   ├── TeamRepository.java
│   │   │   ├── TeamMemberRepository.java
│   │   │   ├── RallyCryRepository.java
│   │   │   ├── DefiningObjectiveRepository.java
│   │   │   ├── OutcomeRepository.java
│   │   │   ├── ReconciliationRepository.java
│   │   │   ├── AuditLogRepository.java
│   │   │   ├── HighFiveRepository.java
│   │   │   ├── RetrospectiveEntryRepository.java
│   │   │   ├── TeamExportSettingsRepository.java
│   │   ├── model/
│   │   │   ├── entity/               # JPA entities
│   │   │   │   ├── WeeklyCommit.java
│   │   │   │   ├── CommitItem.java
│   │   │   │   ├── Team.java
│   │   │   │   ├── TeamMember.java
│   │   │   │   ├── RallyCry.java
│   │   │   │   ├── DefiningObjective.java
│   │   │   │   ├── Outcome.java
│   │   │   │   ├── Reconciliation.java
│   │   │   │   ├── AuditLog.java
│   │   │   │   ├── CommitStatus.java (enum)
│   │   │   │   ├── ChessCategory.java (enum)
│   │   │   │   ├── CompletionStatus.java (enum)
│   │   │   │   ├── RiskFlag.java (enum)
│   │   │   │   ├── HighFive.java
│   │   │   │   ├── RetrospectiveEntry.java
│   │   │   │   ├── TeamExportSettings.java
│   │   │   ├── dto/                  # Data transfer objects
│   │   │   │   ├── WeeklyCommitDto.java
│   │   │   │   ├── CommitItemDto.java
│   │   │   │   ├── AuditLogDto.java
│   │   │   │   ├── (+ request classes)
│   │   ├── config/                   # Spring configuration
│   │   │   ├── SecurityConfig.java
│   │   │   ├── WebConfig.java
│   │   │   ├── AnthropicConfig.java
│   │   │   ├── ExportConfig.java
│   │   │   ├── DemoDataSeeder.java
│   │   │   ├── StartupDiagnostics.java
│   │   ├── security/                 # Auth/auth components
│   │   │   ├── JwtAuthFilter.java
│   │   │   ├── JwtService.java
│   │   │   ├── TeamMemberUserDetailsService.java
│   │   ├── validation/               # Custom validators
│   │   │   ├── @ValidFibonacci annotation
│   ├── src/main/resources/
│   │   ├── application.yml           # Spring config
│   │   ├── db/migration/             # Flyway migrations
│   │   │   ├── V1__init_schema.sql (15 total migrations)
│   ├── src/test/java/
│   │   ├── service/                  # Service unit tests
│   │   ├── controller/               # Controller integration tests
│   │   ├── TestcontainersConfig.java # PostgreSQL test container setup
│   ├── Dockerfile
├── frontend/                         # React 18 + Vite + TypeScript
│   ├── package.json
│   ├── vite.config.ts
│   ├── vitest.config.ts
│   ├── tsconfig.json
│   ├── src/
│   │   ├── main.tsx                  # React root + providers
│   │   ├── App.tsx                   # Routes, page lazy loading
│   │   ├── index.css                 # Tailwind CSS
│   │   ├── pages/                    # Page-level components
│   │   ├── components/               # Reusable UI components
│   │   │   ├── ui/
│   │   │   ├── layout/
│   │   │   ├── animations/
│   │   │   ├── charts/
│   │   │   ├── pulse/
│   │   │   └── (+ individual component files)
│   │   ├── contexts/                 # React Context providers
│   │   ├── hooks/                    # Custom React hooks
│   │   ├── api/                      # API client layer
│   │   ├── services/
│   │   ├── utils/
│   │   ├── types/
│   │   └── test/                     # Test setup and mocks
│   ├── dist/
│   ├── Dockerfile
│   └── nginx.conf
├── .env.example
├── .gitignore
├── docker-compose.yml
├── README.md
├── changelog.md
└── todo.md
```

## Directory Purposes

**Backend Controllers (`backend/src/main/java/com/st6/weeklycommit/controller/`):**
- Purpose: Handle incoming HTTP requests, validate inputs, delegate to services
- Contains: 9 controller classes mapping to `/api/v1/*` endpoints
- Key files: CommitController (main commit CRUD + state transitions), RcdoController, DashboardController
- Pattern: One controller per feature domain; thin request validation; all business logic delegated to services

**Backend Services (`backend/src/main/java/com/st6/weeklycommit/service/`):**
- Purpose: Implement business logic, coordinate repositories, enforce domain rules
- Contains: 13 service classes covering commits, dashboards, analytics, AI, exports
- Key files: CommitService (commit lifecycle), DashboardService (roll-up metrics), AiSummaryService (Claude integration)
- Pattern: Transactional boundaries at service method level; services call repositories and other services

**Backend Repositories (`backend/src/main/java/com/st6/weeklycommit/repository/`):**
- Purpose: Abstract database queries with Spring Data JPA
- Contains: 12 repository interfaces extending JpaRepository
- Pattern: Query methods derived from method names; custom @Query for complex joins; read-only queries marked @Transactional(readOnly = true)

**Backend Models/Entities (`backend/src/main/java/com/st6/weeklycommit/model/entity/`):**
- Purpose: JPA entity definitions mapping to database schema
- Contains: 16 entity classes (WeeklyCommit, CommitItem, Team, TeamMember, RCDO hierarchy, Reconciliation, AuditLog)
- Pattern: Entities use UUID primary keys, createdAt/updatedAt timestamps, lazy-loaded relationships, PostgreSQL enums

**Backend Models/DTOs (`backend/src/main/java/com/st6/weeklycommit/model/dto/`):**
- Purpose: Data transfer objects for API requests/responses
- Contains: DTO classes and request DTOs (CreateWeeklyCommitRequest, UpdateCommitItemRequest)
- Pattern: DTOs hydrated from entities in controller/service; flatten nested relationships for API clarity

**Backend State Machine (`backend/src/main/java/com/st6/weeklycommit/statemachine/`):**
- Purpose: Centralize commit lifecycle state transitions
- Contains: CommitLifecycleService with state enum and transition map
- Pattern: @Transactional methods validate state, update entity, create audit log atomically

**Backend Configuration (`backend/src/main/java/com/st6/weeklycommit/config/`):**
- Purpose: Spring @Configuration classes for beans, security, data seeding
- Contains: SecurityConfig (CORS, JWT filter), DemoDataSeeder (seed fixture data), AnthropicConfig (AI client)
- Pattern: Beans injected via constructor into services; beans only created once at startup

**Backend Security (`backend/src/main/java/com/st6/weeklycommit/security/`):**
- Purpose: JWT authentication, token validation, user details service
- Contains: JwtAuthFilter (parses Bearer token), JwtService (issues/validates tokens), GoogleTokenVerifier
- Pattern: Stateless (no sessions); SecurityContext set by filter on valid token

**Database Migrations (`backend/src/main/resources/db/migration/`):**
- Purpose: Version-controlled schema changes via Flyway
- Contains: 15 SQL migrations (V1-V15)
- Pattern: Runs on app startup; cannot be modified once applied; new migrations append with higher version number
- Key migrations: V1 (schema), V3 (Fibonacci), V5 (risk flags), V6 (audit log), V8 (Google OAuth)

**Frontend Pages (`frontend/src/pages/`):**
- Purpose: Top-level route components representing full-page views
- Contains: 9 page components (LoginPage, DashboardPage, CommitEditorPage, etc.)
- Pattern: Lazy-loaded in App.tsx; suspense boundary; fetch data via React Query hooks
- Key pages: CommitEditorPage (edit/view commit), DashboardPage (team/personal roll-up), ReconciliationPage (log completion)

**Frontend Components (`frontend/src/components/`):**
- Purpose: Reusable UI building blocks
- Contains: ~40 component files organized by category (ui/, layout/, animations/, charts/, pulse/)
- Pattern: Functional components with hooks; props-driven; side effects in useEffect; Tailwind CSS for styling
- Key components: CommitItemCard (list item), StatusBadge, ChessGrid (impact/effort), FibonacciSelector, AISummaryPanel

**Frontend API Client (`frontend/src/api/`):**
- Purpose: HTTP request layer with centralized configuration (auth, error handling)
- Contains: client.ts (fetch wrapper), tokenStore.ts (JWT storage), domain-specific files (commits.ts, rcdo.ts, etc.)
- Pattern: client.ts provides api.get/post/put/delete; every request includes Authorization header from tokenStore
- Key files: client.ts (centralized auth & error handling), tokenStore.ts (localStorage persistence)

**Frontend Contexts (`frontend/src/contexts/`):**
- Purpose: Global state providers (authentication, team selection)
- Contains: AuthContext.tsx (user, login/logout), TeamContext.tsx (selected team)
- Pattern: React Context.Provider wraps app; useContext hook for consumption; effects sync to localStorage

**Frontend Hooks (`frontend/src/hooks/`):**
- Purpose: Reusable custom hooks
- Contains: useToast (toast notifications)
- Pattern: Call into component state; return dispatch functions; typically wrap service calls

**Frontend Types (`frontend/src/types/`):**
- Purpose: Centralized TypeScript type definitions
- Contains: index.ts with all DTO/domain types (WeeklyCommit, CommitItem, CommitStatus union type, RCDO hierarchy)
- Pattern: Single file for all types; enums replicated from backend (CommitStatus, ChessCategory)

**Frontend Utils (`frontend/src/utils/`):**
- Purpose: Pure utility functions (date, metrics calculations)
- Contains: week.ts (week date helpers), metrics.ts (statistics calculations)
- Pattern: No side effects; pure functions with inputs → outputs

**Frontend Test Setup (`frontend/src/test/`):**
- Purpose: Testing configuration and helpers
- Contains: setup.ts (Vitest config), mocks/handlers.ts (MSW mock handlers), utils.tsx (test render function)
- Pattern: MSW intercepts fetch calls during tests; custom render() wraps components with providers
- Key files: handlers.ts (all mock endpoint responses), server.ts (MSW server setup)

## Key File Locations

**Entry Points:**
- Backend: `backend/src/main/java/com/st6/weeklycommit/WeeklyCommitApplication.java` (main())
- Frontend: `frontend/src/main.tsx` (ReactDOM.createRoot), `frontend/src/App.tsx` (route definitions)

**Configuration:**
- Backend: `backend/src/main/resources/application.yml` (Spring Boot config)
- Frontend: `frontend/vite.config.ts` (Vite build), `frontend/tsconfig.json` (TS strict mode)
- Docker: `docker-compose.yml` (services), `backend/Dockerfile`, `frontend/Dockerfile`

**Core Logic:**
- Commit lifecycle: `backend/src/main/java/com/st6/weeklycommit/statemachine/CommitLifecycleService.java`
- Commit CRUD: `backend/src/main/java/com/st6/weeklycommit/service/CommitService.java`
- Dashboard roll-up: `backend/src/main/java/com/st6/weeklycommit/service/DashboardService.java`
- AI integration: `backend/src/main/java/com/st6/weeklycommit/service/AiSummaryService.java`

**Testing:**
- Backend: `backend/src/test/java/com/st6/weeklycommit/` (service & controller tests)
- Frontend: `frontend/src/test/` (setup, mocks), `frontend/src/**/*.test.tsx` (co-located tests)
- Mock handlers: `frontend/src/test/mocks/handlers.ts` (all MSW endpoint responses)

## Naming Conventions

**Files:**
- Backend Java files: PascalCase (e.g., CommitService.java, CommitStatus.java)
- Frontend TypeScript: PascalCase for components (CommitItemCard.tsx), camelCase for utils/hooks (week.ts, useToast.ts)
- Tests: match source name + .test.tsx/.test.java (CommitEditorPage.test.tsx, CommitServiceTest.java)
- Migrations: Flyway pattern Vn__description (V1__init_schema.sql)

**Directories:**
- Plural for collections of similar items (components/, pages/, controllers/, services/)
- Singular for abstractions or singular concepts (validation/, statemachine/)
- Lowercase with hyphens for multi-word dirs (export-config/); not used in this codebase

**Functions/Variables:**
- Backend: camelCase methods (getCommit(), createCommit()), UPPER_CASE constants (TRANSITIONS map)
- Frontend: camelCase functions/variables, PascalCase React components, CONSTANT_CASE for config (FIBONACCI_POINTS, STORAGE_KEY)

**Types/Enums:**
- PascalCase for TypeScript types/interfaces (WeeklyCommit, CommitStatus, ChessCategory)
- Exported from frontend/src/types/index.ts; replicated in backend as Java enums

## Where to Add New Code

**New REST Endpoint:**
1. Add mapping method in controller: `backend/src/main/java/com/st6/weeklycommit/controller/{DomainController}.java`
2. Implement business logic in service: `backend/src/main/java/com/st6/weeklycommit/service/{DomainService}.java`
3. Call repositories as needed from service
4. Write controller test in `backend/src/test/java/com/st6/weeklycommit/controller/`
5. Add MSW mock handler in `frontend/src/test/mocks/handlers.ts`
6. Add frontend API client function in `frontend/src/api/{domain}.ts`
7. Add React Query hook or direct api call in component/page

**New Page:**
1. Create page component: `frontend/src/pages/{FeaturePage}.tsx`
2. Add lazy-loaded route in `frontend/src/App.tsx` Routes
3. Call API client functions for data fetching
4. Render page-level layout with Sidebar context
5. Add test file: `frontend/src/pages/{FeaturePage}.test.tsx`

**New Component:**
1. Create component file: `frontend/src/components/{ComponentName}.tsx`
2. Define props interface at top of file
3. Use hooks as needed (useAuth, useContext, useQuery)
4. Export as named export
5. Add test file co-located: `frontend/src/components/{ComponentName}.test.tsx`
6. Import and use in pages/other components

**New Database Entity:**
1. Create entity class in: `backend/src/main/java/com/st6/weeklycommit/model/entity/{Entity}.java`
2. Add JPA annotations (@Entity, @Table, relationships)
3. Create repository: `backend/src/main/java/com/st6/weeklycommit/repository/{Entity}Repository.java`
4. Create Flyway migration: `backend/src/main/resources/db/migration/V{next}__description.sql`
5. Create DTO in: `backend/src/main/java/com/st6/weeklycommit/model/dto/{Entity}Dto.java`
6. Add mapper method in service to convert entity → DTO

**New Shared Utility:**
- Frontend utility functions: `frontend/src/utils/{domain}.ts`
- Backend utility class: `backend/src/main/java/com/st6/weeklycommit/util/{Utility}.java`

## Special Directories

**Backend Migrations (`backend/src/main/resources/db/migration/`):**
- Purpose: Versioned schema changes
- Generated: No (manually written SQL)
- Committed: Yes (part of source control)
- Runs on: App startup via Flyway
- Pattern: Cannot modify past migrations; append new ones with V{n+1}__ prefix
- Rollback: Not automatic; requires manual SQL or Flyway Undo plugin

**Frontend Build Output (`frontend/dist/`):**
- Purpose: Production build artifacts
- Generated: Yes (via `npm run build`)
- Committed: No (.gitignore)
- Consumed by: Dockerfile for nginx serving

**Node Modules (`frontend/node_modules/`):**
- Purpose: npm dependencies
- Generated: Yes (via `npm install` from package-lock.json)
- Committed: No (.gitignore)

**Frontend Test Mocks (`frontend/src/test/mocks/`):**
- Purpose: Mock Service Worker (MSW) handlers for API testing
- Contains: handlers.ts (all endpoint mocks), server.ts (MSW setup)
- Pattern: Automatically intercepts fetch during test runs; allows testing without backend

---

*Structure analysis: 2026-04-21*
