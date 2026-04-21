# Coding Conventions

**Analysis Date:** 2026-04-21

## Naming Patterns

**Files:**
- Components: PascalCase (e.g., `CommitItemCard.tsx`, `FibonacciSelector.tsx`)
- Test files: Same name with `.test.tsx` or `.test.ts` suffix (e.g., `CommitItemCard.test.tsx`)
- Utilities: camelCase (e.g., `metrics.ts`, `week.ts`, `tokenStore.ts`)
- API services: camelCase (e.g., `commits.ts`, `dashboard.ts`, `rcdo.ts`)
- Backend services: PascalCase with `Service` suffix (e.g., `CommitService`, `CommitLifecycleService`)
- Backend entities: PascalCase (e.g., `WeeklyCommit`, `CommitItem`, `TeamMember`)
- Backend repositories: PascalCase with `Repository` suffix (e.g., `WeeklyCommitRepository`, `CommitItemRepository`)
- Backend tests: Same as class with `Test` or `IntegrationTest` suffix (e.g., `CommitServiceTest`, `CommitControllerIntegrationTest`)

**Functions:**
- Frontend: camelCase for all function names including React components (components use PascalCase for JSX)
- Backend: camelCase for methods and functions
- Event handlers: `on` prefix followed by camelCase (e.g., `onEdit`, `onDelete`, `onFlagChange`)
- Getter/setter methods: Spring convention `get`/`set` prefix (e.g., `getId()`, `setTeamMember()`)

**Variables:**
- camelCase throughout codebase
- Const lookups: UPPERCASE with underscores (e.g., `STORAGE_KEY`, `FIBONACCI_POINTS`)
- React state: camelCase (e.g., `user`, `token`, `isOpen`)
- Props interfaces: Prefix with `Props` (e.g., `CommitItemCardProps`, `WrapperProps`)
- UI style maps: UPPERCASE (e.g., `CHESS_COLORS`, `CHESS_BG`, `RISK_BADGE`)

**Types:**
- TypeScript interfaces: PascalCase without prefix (e.g., `CommitItem`, `WeeklyCommit`, `Team`)
- Union types: PascalCase (e.g., `CommitStatus`, `ChessCategory`, `CompletionStatus`)
- Type suffixes: Type names describe domain entities, no `Type` or `I` prefix
- Const types: Used for literal unions (e.g., `const FIBONACCI_POINTS = [1, 2, 3, 5, 8, 13] as const`)
- Backend DTOs: Suffix with `Dto` or `Request` (e.g., `WeeklyCommitDto`, `CreateWeeklyCommitRequest`)

**Database & Enums:**
- PostgreSQL enums: snake_case (e.g., `commit_status`, `chess_category`)
- Enum class names: PascalCase (e.g., `CommitStatus`, `ChessCategory`, `RiskFlag`)
- Enum values: UPPERCASE (e.g., `DRAFT`, `LOCKED`, `STRATEGIC`)

## Code Style

**Formatting:**
- No linter configuration found (`.eslintrc`, `.prettierrc` not present in root)
- TypeScript strict mode enabled: `"strict": true` in `tsconfig.json`
- Indentation: 2 spaces (inferred from source files)
- Line length: Pragmatic, no hard limit enforced
- Semicolons: Used throughout (TypeScript/Java convention)

**Linting:**
- TypeScript strict options enforced:
  - `noUnusedLocals: true` - Unused variables flagged
  - `noUnusedParameters: true` - Unused parameters flagged
  - `noFallthroughCasesInSwitch: true` - Switch cases must have break/return
  - `forceConsistentCasingInFileNames: true` - File name casing must match imports

**Code Organization:**
- Imports organized by source: external packages first, then relative imports
- React imports use `import { type ReactNode }` for type-only imports
- Backend services use constructor injection (dependency injection via Spring)
- Components typically 100-200 lines; larger ones broken into sub-components

## Import Organization

**Order (Frontend):**
1. Third-party React/UI imports (react, react-router-dom, framer-motion)
2. Third-party utilities (tanstack/react-query, msw)
3. Internal type imports (types/)
4. Internal context imports (contexts/)
5. Internal component imports (components/)
6. Internal utility imports (utils/, services/)
7. CSS imports

**Path Aliases:**
- `@/*` maps to `src/*` (configured in `tsconfig.json`)
- Used in internal imports: `import { renderWithProviders } from "@/test/utils"`

**Order (Backend):**
1. java.* and javax.* (JDK classes)
2. org.* (third-party)
3. com.st6.* (internal)
4. Static imports at the end for test assertions

**Example Backend:**
```java
import java.time.LocalDate;
import java.util.Optional;
import org.springframework.stereotype.Service;
import com.st6.weeklycommit.model.dto.*;
import com.st6.weeklycommit.repository.*;
import static org.junit.jupiter.api.Assertions.*;
```

## Error Handling

**Frontend Patterns:**
- API errors caught and converted to user-friendly messages in client wrapper (`client.ts`)
- `handle401()` function manages unauthorized responses with callback pattern
- Error boundaries wrap route trees (e.g., `ErrorBoundary` component)
- Query errors surface in UI via error state checks
- Form validation errors shown inline (TBD: specific patterns in form components)

**Backend Patterns:**
- Service layer throws domain-specific exceptions: `IllegalArgumentException`, `IllegalStateException`
- Controller layer relies on Spring exception handling for HTTP status codes
- No custom exception classes observed; standard Java exceptions used
- State machine validates transitions and throws `IllegalStateException` for invalid states
- Repository methods return `Optional` for existence checks

**Example Backend:**
```java
@Transactional
public WeeklyCommitDto createCommit(CreateWeeklyCommitRequest req) {
    var member = memberRepo.findById(req.teamMemberId())
        .orElseThrow(() -> new IllegalArgumentException("Team member not found: " + req.teamMemberId()));
    commitRepo.findByTeamMemberIdAndWeekStart(req.teamMemberId(), req.weekStart())
        .ifPresent(existing -> {
            throw new IllegalStateException("Commit already exists for this member and week");
        });
    // ... create and return
}
```

## Logging

**Framework:**
- Frontend: `console` (development logging, no structured logging library detected)
- Backend: Spring's default (SLF4J via Logback, not explicitly configured in visible files)

**Patterns:**
- Frontend: Minimal logging observed in source; primarily error handling via try-catch
- Backend: Service methods log state transitions implicitly via audit logging system
- Audit logging: Dedicated `AuditLog` entity captures state changes, risk flags, category changes

**Example Backend Audit:**
```java
// Captured in AuditLog entity:
// - previousState: "DRAFT", newState: "LOCKED"
// - triggeredBy: user email or "TEST_USER"
// - actionType: "STATE_TRANSITION", "CATEGORY_CHANGE", etc.
// - createdAt: Instant.now()
```

## Comments

**When to Comment:**
- Complex business logic (e.g., state machine transitions, validation rules)
- Workarounds or temporary solutions (not observed in current codebase)
- Context for non-obvious decisions (e.g., why a check is conditional)
- Observed practice: Comments sparse in implementation files; logic is self-documenting via clear naming

**JSDoc/TSDoc:**
- Not consistently used in codebase
- Type annotations preferred over comments for documentation
- Backend: No JavaDoc annotations observed in public methods

**Example (self-documenting):**
```typescript
// Frontend - type-driven clarity
interface CommitItemCardProps {
  item: CommitItem;
  isDraft?: boolean;
  isLocked?: boolean;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}
```

## Function Design

**Size Guidelines:**
- Frontend components: 50-200 lines (split large components into sub-components)
- Utility functions: 5-30 lines
- Backend service methods: 10-40 lines (logic delegated to repositories)

**Parameters:**
- Frontend: Props object pattern (destructured in function signature)
- Backend: Request DTOs for POST/PUT operations, query parameters for GET
- Avoid more than 3-4 positional parameters; use objects/records instead

**Return Values:**
- Frontend: React components return JSX, hooks return typed values/functions
- Backend: Service methods return DTOs (never raw entities)
- Async operations: Promises in frontend (handled by React Query), reactive types in backend (none observed, synchronous)

**Example Frontend:**
```typescript
export function renderWithProviders(
  ui: ReactElement,
  options?: RenderOptions & { initialEntries?: string[] }
) {
  const { initialEntries, ...renderOptions } = options ?? {};
  return render(ui, {
    wrapper: createWrapper(initialEntries) as React.ComponentType,
    ...renderOptions,
  });
}
```

**Example Backend:**
```java
public WeeklyCommitDto createCommit(CreateWeeklyCommitRequest req) {
    // Single responsibility: create and return DTO
    // Validation delegated to request validation
    // Repository interaction isolated in method
}
```

## Module Design

**Exports (Frontend):**
- Components export single named export (e.g., `export function FibonacciSelector(...)`)
- Test utils export named functions (e.g., `export function renderWithProviders(...)`)
- API modules export named functions per resource (e.g., `export function getCommit()`, `export function createCommit()`)
- Types exported as named types from `types/index.ts`

**Barrel Files:**
- `types/index.ts` serves as central type export for entire frontend
- No barrel files observed in components/ or pages/ directories
- Direct imports preferred: `import { FibonacciSelector } from "@/components/FibonacciSelector"`

**Exports (Backend):**
- Services exposed via Spring `@Service` annotation
- DTOs in separate package: `model.dto`
- No barrel files; full package paths used in imports

**Example Frontend Module:**
```typescript
// src/types/index.ts - barrel export
export type CommitStatus = "DRAFT" | "LOCKED" | "RECONCILING" | "RECONCILED" | "CARRY_FORWARD";
export interface WeeklyCommit {
  id: string;
  teamMemberId: string;
  // ...
}

// src/components/FibonacciSelector.tsx - component export
export function FibonacciSelector(props) { /* ... */ }

// Usage:
import { FibonacciSelector } from "@/components/FibonacciSelector";
import type { WeeklyCommit } from "@/types";
```

## Architectural Patterns

**React Patterns:**
- Context API for global state: `AuthContext`, `TeamContext`
- TanStack React Query for server state management (with `enabled: false` for on-demand fetching)
- Lazy loading for page routes using `React.lazy()` with `Suspense` fallback
- Controlled components for forms
- Custom hooks for reusable logic

**Backend Patterns:**
- Layered architecture: Controller → Service → Repository → Entity
- DTOs shield entities from API consumers
- State machine pattern: `CommitLifecycleService` manages state transitions
- Repository pattern for data access
- Spring transactions managed at service layer with `@Transactional` annotation

## Validation

**Frontend:**
- Form validation likely handled at component level (details in specific components)
- Type safety via TypeScript strict mode

**Backend:**
- Request DTOs use Jakarta Validation annotations: `@Valid` on request parameters
- Custom validation annotation: `@ValidFibonacci` (mentioned in project memory)
- Service layer throws `IllegalArgumentException` and `IllegalStateException` for business rule violations
- Database constraints enforced at schema level (CHECK constraints, enums)

---

*Convention analysis: 2026-04-21*
