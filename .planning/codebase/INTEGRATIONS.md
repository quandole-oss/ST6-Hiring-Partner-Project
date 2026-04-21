# External Integrations

**Analysis Date:** 2025-04-21

## APIs & External Services

**Anthropic Claude (AI Summaries):**
- Purpose: Generate team summaries and Q&A responses from commit data
- Endpoint: `https://api.anthropic.com/v1` (Messages API)
- SDK/Client: Spring RestClient (native HTTP client)
- Auth: Bearer token via `ANTHROPIC_API_KEY` environment variable
- Implementation: `backend/src/main/java/com/st6/weeklycommit/service/AiSummaryService.java`
- Configuration: `backend/src/main/java/com/st6/weeklycommit/config/AnthropicConfig.java`
- Features:
  - Team summary generation from dashboard data (max 1024 tokens)
  - Q&A mode with extended context (max 2048 tokens)
  - Model: `claude-sonnet-4-5-20250514` (configurable via `app.ai.model`)
  - Timeouts: 5s connect, 30s read
  - Can be disabled via `app.ai.enabled` config or missing API key

**Google OAuth 2.0:**
- Purpose: User authentication via Google ID tokens
- Frontend SDK: `@react-oauth/google@0.13.4` (credential-based flow)
- Backend verification: Custom implementation in `backend/src/main/java/com/st6/weeklycommit/service/GoogleTokenVerifier.java`
- Endpoints:
  - Verification: `https://oauth2.googleapis.com/tokeninfo?id_token={token}`
  - Frontend: POST `/api/v1/auth/oauth2/google` with credential
- Configuration:
  - Client ID: `GOOGLE_CLIENT_ID` environment variable
  - Frontend passes Client ID via Docker build ARG `VITE_GOOGLE_CLIENT_ID`
  - Verification validates token audience (aud) against stored Client ID
- Implementation:
  - Frontend: `frontend/src/contexts/AuthContext.tsx` - `googleLogin()` method
  - Backend: Extracts Google user data (sub, email, name, picture) and returns JWT
  - HTTP Client: `java.net.http.HttpClient` (native Java HTTP)

## Data Storage

**Databases:**
- PostgreSQL 16 (Alpine container)
  - Connection: `jdbc:postgresql://[host]:5432/weeklycommit`
  - Environment variables: `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`
  - Connection pool: HikariCP with max 5 connections, 10s timeout
  - ORM: Spring Data JPA with Hibernate
  - Dialect: PostgreSQL-specific (JSON/UUID support, enums)

**File Storage:**
- Local filesystem only
- PDF export: Generated in-memory using OpenPDF library
- Email attachments: Binary PDF data attached to MimeMessage

**Caching:**
- Spring Cache abstraction (configuration not explicitly set; defaults to no-op)
- Client-side: TanStack React Query with default staleness policies

## Authentication & Identity

**Auth Provider:**
- Dual implementation: JWT + Google OAuth 2.0

**JWT (Token-based):**
- Implementation: `jjwt-api/0.12.6` (JJWT library)
- Secret: `JWT_SECRET` environment variable (HS256 signing)
- Expiry: `JWT_EXPIRY_MS` (default 24 hours = 86400000ms)
- Token storage: Frontend LocalStorage (`wc_auth` key in `frontend/src/api/tokenStore.ts`)
- Transport: Bearer token in `Authorization` header
- Validation: Spring Security filter chain (not explicitly visible; likely via JwtAuthenticationFilter)

**Google OAuth 2.0:**
- ID token flow: Client-side token retrieval, backend verification
- No refresh tokens used (stateless JWT issued after verification)

**Demo Mode:**
- Controlled by `DEMO_MODE` environment variable
- Frontend: Uses hardcoded demo user `Alice Chen` (memberId: e0000000-0000-0000-0000-000000000001)
- Backend: Demo-specific logic for skipping auth checks
- Configuration: `VITE_DEMO_MODE` for frontend, `DEMO_MODE` for backend

## Monitoring & Observability

**Error Tracking:**
- None detected (no Sentry, Datadog, or similar integration)

**Logs:**
- Server-side: SLF4J with Logback (Spring Boot default)
- Log levels configurable via Spring Boot properties
- Services use Logger instances: `LoggerFactory.getLogger(ClassName.class)`
- Examples: `AiSummaryService`, `GoogleTokenVerifier`, `EmailExportService`

**Audit Trail:**
- Database-backed audit logging
- Table: `audit_log` (from V6__audit_log.sql migration)
- Tracks commit state transitions and user actions
- Service: `backend/src/main/java/com/st6/weeklycommit/service/CommitService.java` (manages audit entries)

## CI/CD & Deployment

**Hosting:**
- Docker Compose orchestration (development/staging)
- Pre-built container images for backend (Spring Boot JAR) and frontend (NGINX SPA)
- Health checks on services (backend: `/api/v1/auth/health`, database: `pg_isready`)

**CI Pipeline:**
- GitHub Actions (inferred from `.github/` directory presence)
- No explicit pipeline config files read; likely handles Docker build and deployment

## Email Configuration

**Email Export:**
- Service: `backend/src/main/java/com/st6/weeklycommit/service/EmailExportService.java`
- Framework: Spring Mail (`spring-boot-starter-mail`)
- Implementation: JavaMailSender with MIME message support
- Features:
  - HTML email body rendering
  - Optional PDF attachment (team reports)
  - From address: `EXPORT_EMAIL_FROM` config (default: `noreply@st6weekly.com`)
- SMTP Configuration: Not embedded in code; expects Spring Mail properties (`spring.mail.*`)
- Fallback: Throws `IllegalStateException` if `spring.mail.host` not configured

## Environment Configuration

**Required env vars (Backend):**
- `SPRING_DATASOURCE_URL` - PostgreSQL connection string
- `SPRING_DATASOURCE_USERNAME` - Database user
- `SPRING_DATASOURCE_PASSWORD` - Database password
- `POSTGRES_DB` - Database name (Docker Compose)
- `POSTGRES_USER` - Database user (Docker Compose)
- `POSTGRES_PASSWORD` - Database password (Docker Compose)
- `JWT_SECRET` - JWT signing key (minimum 256 bits for HS256)
- `ANTHROPIC_API_KEY` - Claude API key (optional; disables AI if missing)
- `GOOGLE_CLIENT_ID` - Google OAuth client identifier
- `AI_SUMMARIES_ENABLED` - Toggle AI features (default: true)
- `APP_CORS_ALLOWED_ORIGINS` - CORS whitelist (default: http://localhost:5173)
- `PORT` - Server port (default: 8080)
- `DEMO_MODE` - Enable demo/sandbox mode
- `SEED_DEMO_DATA` - Auto-seed test data on startup

**Required env vars (Frontend):**
- `VITE_GOOGLE_CLIENT_ID` - Google OAuth client ID (passed at build time)
- `VITE_DEMO_MODE` - Demo mode toggle (default: false)
- `VITE_AI_ENABLED` - AI feature toggle (default: true)

**Secrets location:**
- `.env` file (Git-ignored, not committed)
- Docker Compose `.env_file` directive for container environment injection
- Template: `.env.example` in repository root

## Webhooks & Callbacks

**Incoming:**
- None detected (no webhook receivers in codebase)

**Outgoing:**
- Email export endpoint: Scheduled or on-demand PDF/HTML delivery
- No external webhook integrations found

## API Clients

**Frontend HTTP:**
- Fetch API (native browser HTTP)
- Client: `frontend/src/api/client.ts`
- Base URL: `/api/v1` (proxied via Vite dev server or relative to deployed domain)
- Features:
  - Automatic Bearer token injection from localStorage
  - 401 Unauthorized handling (triggers logout callback)
  - JSON request/response handling
  - Error message extraction from response body
  - Demo mode bypass for auth headers

**Backend HTTP:**
- Spring RestClient - Used for Anthropic API calls
- Java HttpClient - Used for Google token verification
- Both use standard timeout configurations (5s connect, 30s read typical)

## External Integrations Summary

| Service | Purpose | Status | Config Required |
|---------|---------|--------|-----------------|
| Anthropic Claude | AI summaries | Optional | ANTHROPIC_API_KEY |
| Google OAuth 2.0 | User authentication | Optional | GOOGLE_CLIENT_ID |
| PostgreSQL | Primary data store | Required | SPRING_DATASOURCE_* |
| SMTP (Email) | Team report delivery | Optional | spring.mail.* |
| Flyway | Database migrations | Built-in | N/A |

---

*Integration audit: 2025-04-21*
