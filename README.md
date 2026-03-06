# Weekly Commit Module

A full-stack application for managing weekly team commitments aligned to strategic Rally Cries, Defining Objectives, and Outcomes (RCDO).

## Architecture

- **Frontend**: React 18 + TypeScript (strict) + Vite + Module Federation + Tailwind CSS + TanStack Query
- **Backend**: Java 21 + Spring Boot 3.4 + Virtual Threads + Spring Data JPA
- **Database**: PostgreSQL 16 + Flyway migrations
- **Infrastructure**: Docker Compose

## Quick Start

```bash
# Copy environment file
cp .env.example .env

# Start all services
docker-compose up --build
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:8080/api/v1
- PostgreSQL: localhost:5432

## Local Development (without Docker)

### Database

```bash
# Start PostgreSQL (e.g., via Homebrew)
brew services start postgresql@16
createdb weeklycommit
```

### Backend

```bash
cd backend
./mvnw spring-boot:run
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Running Tests

```bash
# Backend (requires Docker for Testcontainers)
cd backend
./mvnw test

# Frontend
cd frontend
npm test
```

## API Reference

| Method | Path | Description |
|--------|------|-------------|
| `GET/POST` | `/api/v1/rcdo/rally-cries` | List/create Rally Cries |
| `PUT/DELETE` | `/api/v1/rcdo/rally-cries/{id}` | Update/delete a Rally Cry |
| `GET/POST` | `/api/v1/rcdo/objectives` | List/create Defining Objectives |
| `PUT/DELETE` | `/api/v1/rcdo/objectives/{id}` | Update/delete an Objective |
| `GET/POST` | `/api/v1/rcdo/outcomes` | List/create Outcomes |
| `PUT/DELETE` | `/api/v1/rcdo/outcomes/{id}` | Update/delete an Outcome |
| `GET/POST` | `/api/v1/commits` | Create/list weekly commits |
| `GET/PUT` | `/api/v1/commits/{id}` | Get/update a commit |
| `POST` | `/api/v1/commits/{id}/lock` | Transition to LOCKED |
| `POST` | `/api/v1/commits/{id}/reconcile` | Start reconciliation |
| `POST` | `/api/v1/commits/{id}/submit` | Submit reconciliation |
| `GET/POST` | `/api/v1/commits/{id}/items` | List/create commit items |
| `PUT/DELETE` | `/api/v1/commits/{id}/items/{itemId}` | Update/delete a commit item |
| `PUT` | `/api/v1/commits/{id}/items/{itemId}/reconciliation` | Log reconciliation data |
| `GET` | `/api/v1/teams` | List all teams |
| `GET` | `/api/v1/teams/{id}/members` | List team members |
| `GET` | `/api/v1/dashboard/team/{teamId}` | Manager roll-up dashboard |
| `GET` | `/api/v1/dashboard/alignment` | Alignment score metrics |

## Commit Lifecycle State Machine

```
DRAFT -> LOCKED -> RECONCILING -> RECONCILED -> CARRY_FORWARD
```

- **DRAFT**: Items can be added/edited/deleted
- **LOCKED**: Frozen for the week (auto-locks Monday 10 AM)
- **RECONCILING**: Team member logs actual completion
- **RECONCILED**: Reconciliation submitted
- **CARRY_FORWARD**: Deferred/incomplete items copied to next week

## Chess Layer Categories

Items are categorized into a 2x2 Impact vs Effort grid:

- **Strategic**: High impact, high effort
- **Tactical**: High impact, lower effort
- **Operational**: Day-to-day execution
- **Maintenance**: Upkeep and tech debt

## Project Structure

```
ST6 Hiring Partner Project/
├── .env.example
├── .gitignore
├── docker-compose.yml
├── backend/
│   ├── pom.xml
│   ├── mvnw / mvnw.cmd
│   ├── Dockerfile
│   └── src/
│       ├── main/java/com/st6/weeklycommit/
│       │   ├── WeeklyCommitApplication.java
│       │   ├── config/WebConfig.java
│       │   ├── controller/ (4 controllers)
│       │   ├── service/ (5 services)
│       │   ├── model/{entity,dto}/
│       │   ├── repository/ (8 repos)
│       │   └── statemachine/
│       ├── main/resources/
│       │   ├── application.yml
│       │   └── db/migration/
│       └── test/java/com/st6/weeklycommit/
│           ├── TestcontainersConfig.java
│           ├── service/ (3 unit test classes)
│           └── controller/ (2 integration test classes)
├── frontend/
│   ├── package.json
│   ├── vite.config.ts
│   ├── vitest.config.ts
│   ├── nginx.conf
│   ├── Dockerfile
│   └── src/
│       ├── api/ (4 modules)
│       ├── components/ (7 components)
│       ├── hooks/useToast.ts
│       ├── pages/ (4 pages)
│       ├── test/ (setup, mocks, utils)
│       ├── types/
│       ├── App.tsx
│       └── main.tsx
└── README.md
```
