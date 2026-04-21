# Technology Stack

**Analysis Date:** 2025-04-21

## Languages

**Primary:**
- Java 21 - Backend API (Spring Boot 3.4)
- TypeScript 5.6.3 - Frontend application with strict mode enabled
- SQL - Database migrations using Flyway

**Secondary:**
- YAML - Spring Boot configuration
- HTML/CSS - Email templates and UI styling

## Runtime

**Environment:**
- JVM: Eclipse Temurin 21 (Java runtime)
- Node.js: v20-alpine (development and build)

**Package Manager:**
- Maven 3.9 - Java dependency management
- npm - Node.js package management (lockfile: `frontend/package-lock.json` present)

## Frameworks

**Core:**
- Spring Boot 3.4.0 - Backend web framework
- React 18.3.1 - Frontend UI framework
- Spring Data JPA - ORM and database abstraction
- Spring Security - Authentication and authorization

**Testing:**
- JUnit 5 - Backend testing (via Spring Boot starter-test)
- Testcontainers - Docker-based database testing (PostgreSQL)
- Vitest 4.0.18 - Frontend unit testing
- Testing Library (@testing-library/react 16.3.2) - React component testing
- MSW (Mock Service Worker 2.12.10) - API mocking for tests

**Build/Dev:**
- Vite 5.4.11 - Frontend bundler and dev server
- Flyway 10.x - Database migration management
- Docker & Docker Compose - Containerization and orchestration

## Key Dependencies

**Critical:**
- TanStack React Query 5.60.0 - Server state management (caching, synchronization)
- spring-boot-starter-web - RESTful API support
- postgresql 16 - Database driver (runtime scope)
- jjwt 0.12.6 (api/impl/jackson) - JWT token generation and validation

**Infrastructure:**
- Tailwind CSS 3.4.16 - Utility-first CSS framework
- Framer Motion 12.35.0 - Animation library for React components
- react-router-dom 6.28.0 - Client-side routing
- Recharts 3.7.0 - Data visualization charts
- @dnd-kit (core, sortable, utilities) - Drag-and-drop UI library
- react-markdown 10.1.0 - Markdown rendering (for AI summaries)
- remark-gfm 4.0.1 - GitHub Flavored Markdown support
- @react-oauth/google 0.13.4 - Google OAuth client integration
- Spring Mail (spring-boot-starter-mail) - Email sending
- OpenPDF 2.0.3 - PDF generation for reports
- Jackson (jackson-databind) - JSON serialization/deserialization
- SLF4J - Logging abstraction (via Spring Boot)

## Configuration

**Environment:**
- `.env` file for Docker Compose variables (not committed; use `.env.example` template)
- `application.yml` - Spring Boot configuration in `backend/src/main/resources/`
- Build-time environment variables for frontend (VITE_*):
  - `VITE_DEMO_MODE` - Demo mode toggle
  - `VITE_GOOGLE_CLIENT_ID` - Google OAuth client ID
  - `VITE_AI_ENABLED` - AI summary feature toggle

**Build:**
- `backend/pom.xml` - Maven project configuration
- `frontend/package.json` - npm dependencies
- `frontend/tsconfig.json` - TypeScript compiler options (strict mode, ES2020 target)
- `frontend/vite.config.ts` - Vite bundler and dev server configuration
- `vitest.config.ts` - Vitest test runner configuration
- `.prettierrc` or ESLint config (check repo for linting setup)

## Database

**PostgreSQL 16-alpine:**
- Location: Containerized via `docker-compose.yml`
- Connection: JDBC via `spring.datasource.url` (jdbc:postgresql://postgres:5432/{DB_NAME})
- Migrations: 15 Flyway migrations in `backend/src/main/resources/db/migration/`
  - V1: Initial schema (RCDO hierarchy, teams, commits, items)
  - V2-V15: Feature increments (Fibonacci SP, carry-forward, risk flags, audit logs, OAuth)
- Schema management: Flyway auto-migration on application startup
- DDL strategy: `hibernate.ddl-auto: validate` (schema validation only, no generation)

## Docker

**Backend:**
- Base image: `eclipse-temurin:21-jre`
- Build: Multi-stage Maven build in `backend/Dockerfile`
- Memory: Limited to 192MB JVM heap (-Xmx192m)
- GC: Serial GC for memory efficiency (-XX:+UseSerialGC)
- Healthcheck: GET `/api/v1/auth/health` on port 8080

**Frontend:**
- Build stage: `node:20-alpine` with Vite build
- Runtime: `nginx:alpine` for static asset serving
- Environment variables: Passed as Docker build ARGs
- Entrypoint: `docker-entrypoint.sh` with dynamic nginx config

**Composition:**
- Services: PostgreSQL, Backend Spring Boot, Frontend Nginx
- Networking: All services on default Docker network
- Volumes: Named volume `pgdata` for PostgreSQL persistence
- Dependencies: Backend depends on healthy PostgreSQL; Frontend depends on healthy Backend

## Platform Requirements

**Development:**
- No local JVM required - Backend compiles only in Docker
- Node.js 20+ for frontend development
- Docker & Docker Compose for backend and database

**Production:**
- Deployment: Docker Compose stack or Kubernetes-compatible containers
- Java 21 JRE required for backend
- PostgreSQL 16 database instance
- NGINX for frontend static serving (pre-built SPA)

---

*Stack analysis: 2025-04-21*
