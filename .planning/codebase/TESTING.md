# Testing Patterns

**Analysis Date:** 2026-04-21

## Test Framework

**Frontend:**

**Runner:**
- Vitest 4.0.18
- Config: `frontend/vitest.config.ts`
- Environment: jsdom (browser simulation)
- Globals: true (describe, it, expect available without imports)

**Assertion Library:**
- Vitest built-in + @testing-library/jest-dom matchers
- Jest-DOM matchers: `toBeInTheDocument()`, `toBeDisabled()`, etc.

**Run Commands:**
```bash
npm test                          # Run all tests in watch mode
npm run build && npm test         # Full compile + test
```

**Backend:**

**Runner:**
- JUnit 5 (Jupiter)
- Config: Embedded in `pom.xml`
- Test context: Spring Boot Test with MockMvc or Testcontainers

**Test Database:**
- Testcontainers with PostgreSQL
- Active profile: "test" (separate application-test.properties)
- Config: `TestcontainersConfig` class (imported via `@Import`)

**Run Commands:**
```bash
mvn test                          # Run all tests
mvn test -Dtest=CommitServiceTest # Run single test class
```

## Test File Organization

**Frontend:**

**Location:**
- Co-located with source files in same directory
- Example: `frontend/src/components/CommitItemCard.tsx` → `frontend/src/components/CommitItemCard.test.tsx`

**Naming:**
- `.test.tsx` for component tests
- `.test.ts` for utility/hook tests

**Structure:**
```
frontend/src/
├── components/
│   ├── CommitItemCard.tsx
│   ├── CommitItemCard.test.tsx
│   └── ...
├── pages/
│   ├── DashboardPage.tsx
│   ├── DashboardPage.test.tsx
│   └── ...
├── test/                         # Shared test utilities
│   ├── setup.ts                  # Global test setup
│   ├── utils.tsx                 # Custom render functions
│   └── mocks/
│       ├── server.ts             # MSW server instance
│       └── handlers.ts           # API route mocks
```

**Backend:**

**Location:**
- Parallel structure: `src/test/java/` mirrors `src/main/java/`
- Example: `backend/src/main/java/com/st6/weeklycommit/service/CommitService.java` → `backend/src/test/java/com/st6/weeklycommit/service/CommitServiceTest.java`

**Naming:**
- Unit tests: `*Test.java`
- Integration tests: `*IntegrationTest.java`

**Structure:**
```
backend/src/test/java/com/st6/weeklycommit/
├── controller/
│   ├── CommitControllerIntegrationTest.java
│   ├── RcdoControllerIntegrationTest.java
│   └── ...
├── service/
│   ├── CommitServiceTest.java
│   ├── CommitLifecycleServiceTest.java
│   ├── RcdoServiceTest.java
│   └── ...
└── TestcontainersConfig.java     # Shared test configuration
```

## Test Structure

**Frontend Suite Organization:**

```typescript
// frontend/src/components/FibonacciSelector.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FibonacciSelector } from "./FibonacciSelector";

describe("FibonacciSelector", () => {
  it("renders all 6 Fibonacci values", () => {
    render(<FibonacciSelector value={null} onChange={() => {}} />);
    for (const v of [1, 2, 3, 5, 8, 13]) {
      expect(screen.getByText(String(v))).toBeInTheDocument();
    }
  });

  it("highlights the selected value", () => {
    render(<FibonacciSelector value={5} onChange={() => {}} />);
    const btn = screen.getByText("5");
    expect(btn.className).toContain("text-white");
  });

  it("fires onChange with clicked value", async () => {
    const onChange = vi.fn();
    render(<FibonacciSelector value={null} onChange={onChange} />);
    await userEvent.click(screen.getByText("8"));
    expect(onChange).toHaveBeenCalledWith(8);
  });
});
```

**Patterns:**
- One `describe()` block per component/module
- Nested `describe()` blocks for related test groups (e.g., "error state", "user interactions")
- One assertion per test where practical, multiple assertions allowed for related checks
- Async tests use `async/await` with `userEvent.setup()`
- `waitFor()` used for async state updates

**Page-level Test Pattern:**

```typescript
// frontend/src/pages/DashboardPage.test.tsx
describe("DashboardPage", () => {
  describe("team selector (no teamId)", () => {
    it("renders team dropdown", async () => {
      const user = userEvent.setup();
      renderWithProviders(<DashboardPage />);
      await waitFor(() => {
        expect(screen.getByText("Select a team...")).toBeInTheDocument();
      });
      await user.click(screen.getByText("Select a team..."));
      await waitFor(() => {
        expect(screen.getByText("Platform Squad")).toBeInTheDocument();
      });
    });
  });

  describe("error state", () => {
    it("shows error when dashboard fetch fails", async () => {
      server.use(
        http.get("/api/v1/dashboard/team/:id", () => 
          HttpResponse.json({ detail: "Server error" }, { status: 500 })
        )
      );
      renderWithProviders(
        <Routes>
          <Route path="/dashboard/:teamId" element={<DashboardPage />} />
        </Routes>,
        { initialEntries: ["/dashboard/d0000000-0000-0000-0000-000000000001"] }
      );
      await waitFor(() => {
        expect(screen.getByText(/Server error/)).toBeInTheDocument();
      });
    });
  });
});
```

**Backend Unit Test Pattern:**

```java
// backend/src/test/java/com/st6/weeklycommit/service/CommitServiceTest.java
@ExtendWith(MockitoExtension.class)
class CommitServiceTest {

    @Mock private WeeklyCommitRepository commitRepo;
    @Mock private TeamMemberRepository memberRepo;
    @InjectMocks
    private CommitService commitService;

    private TeamMember member;
    private WeeklyCommit commit;

    @BeforeEach
    void setUp() {
        // Create test fixtures
        member = new TeamMember();
        member.setId(UUID.randomUUID());
        
        commit = new WeeklyCommit();
        commit.setId(UUID.randomUUID());
        commit.setStatus(CommitStatus.DRAFT);
    }

    @Test
    void createCommit() {
        // Setup mocks
        var req = new CreateWeeklyCommitRequest(member.getId(), LocalDate.of(2026, 3, 2));
        when(memberRepo.findById(member.getId())).thenReturn(Optional.of(member));
        when(commitRepo.save(any())).thenAnswer(inv -> {
            WeeklyCommit wc = inv.getArgument(0);
            wc.setId(UUID.randomUUID());
            return wc;
        });

        // Execute and verify
        var result = commitService.createCommit(req);
        assertNotNull(result.id());
        assertEquals(member.getName(), result.teamMemberName());
    }

    @Test
    void createCommitDuplicateThrows() {
        // Arrange
        var req = new CreateWeeklyCommitRequest(member.getId(), LocalDate.of(2026, 3, 2));
        when(memberRepo.findById(member.getId())).thenReturn(Optional.of(member));
        when(commitRepo.findByTeamMemberIdAndWeekStart(member.getId(), req.weekStart()))
            .thenReturn(Optional.of(commit));

        // Act & Assert
        assertThrows(IllegalStateException.class, () -> commitService.createCommit(req));
    }
}
```

**Backend Integration Test Pattern:**

```java
// backend/src/test/java/com/st6/weeklycommit/controller/CommitControllerIntegrationTest.java
@SpringBootTest
@AutoConfigureMockMvc
@Import(TestcontainersConfig.class)
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class CommitControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @Order(1)
    void listTeams() throws Exception {
        mockMvc.perform(get("/api/v1/teams"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Platform Squad"));
    }

    @Test
    @Order(5)
    void lockCommit() throws Exception {
        mockMvc.perform(post("/api/v1/commits/f0000000-0000-0000-0000-000000000001/lock")
                        .header("X-Triggered-By", "TEST_USER"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("LOCKED"));
    }

    @Test
    @Order(6)
    void addItemToLockedCommitFails() throws Exception {
        mockMvc.perform(post("/api/v1/commits/f0000000-0000-0000-0000-000000000001/items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"title": "Should fail", "sortOrder": 5}
                                """))
                .andExpect(status().isConflict());
    }
}
```

**Patterns:**
- `@Test` per test case
- `@BeforeEach` for setup (runs before each test)
- `@Order` annotation for integration tests requiring specific sequence (database state dependent)
- Fluent MockMvc API for request building and assertion

## Setup and Teardown

**Frontend:**

```typescript
// frontend/src/test/setup.ts
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
import { server } from "./mocks/server";

// Mock browser APIs
globalThis.IntersectionObserver = class IntersectionObserver {
  // ... mock implementation for framer-motion whileInView
};

beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
afterEach(() => {
  cleanup();          // Clear React DOM
  server.resetHandlers(); // Reset MSW mocks to defaults
});
afterAll(() => server.close());
```

**Patterns:**
- MSW server started in `beforeAll`, reset in `afterEach`
- React Testing Library `cleanup()` called automatically via vitest lifecycle
- Global mocks (IntersectionObserver) applied once in setup file
- Test files omit setup imports (loaded automatically via vitest config `setupFiles`)

**Backend:**

```java
@BeforeEach
void setUp() {
    // Create fresh test fixtures for each test
    team = new Team();
    team.setId(UUID.randomUUID());
    team.setName("Test Team");

    member = new TeamMember();
    member.setId(UUID.randomUUID());
    member.setTeam(team);

    commit = new WeeklyCommit();
    commit.setId(UUID.randomUUID());
    commit.setTeamMember(member);
}
```

**Patterns:**
- `@BeforeEach` creates fresh fixtures (not reused across tests)
- Spring Boot Test / Testcontainers handle database cleanup via transaction rollback
- No explicit `@AfterEach` cleanup observed; framework handles it

## Mocking

**Frontend Framework:** MSW (Mock Service Worker)

**Patterns:**

```typescript
// frontend/src/test/mocks/handlers.ts
import { http, HttpResponse } from "msw";

export const handlers = [
  http.post("/api/v1/auth/login", () =>
    HttpResponse.json({
      token: "mock-jwt-token",
      memberId: "e0000000-0000-0000-0000-000000000001",
      name: "Alice Chen",
      role: "LEAD",
    })
  ),
  http.get("/api/v1/commits/:id", () => HttpResponse.json(mockCommit)),
  http.put("/api/v1/commits/:commitId/items/:itemId", () =>
    HttpResponse.json(mockCommit.items[0])
  ),
  http.delete("/api/v1/commits/:commitId/items/:itemId", () =>
    new HttpResponse(null, { status: 204 })
  ),
];

// frontend/src/test/mocks/server.ts
import { setupServer } from "msw/node";
export const server = setupServer(...handlers);
```

**Runtime Mock Override:**

```typescript
// In test file
it("shows error when dashboard fetch fails", async () => {
  server.use(
    http.get("/api/v1/dashboard/team/:id", () => 
      HttpResponse.json({ detail: "Server error" }, { status: 500 })
    )
  );
  // ... test code
});
```

**Patterns:**
- MSW handlers defined once in `handlers.ts`
- Handlers cover all API routes used in tests
- Runtime overrides via `server.use()` for error/edge cases
- Method & status codes specified: `post()`, `get()`, `put()`, `delete()`
- Response factory: `HttpResponse.json()`, `new HttpResponse(null, { status: 204 })`

**Backend Framework:** Mockito

**Patterns:**

```java
@ExtendWith(MockitoExtension.class)
class CommitServiceTest {
    @Mock private WeeklyCommitRepository commitRepo;
    @Mock private TeamMemberRepository memberRepo;
    @InjectMocks
    private CommitService commitService;

    @Test
    void createCommit() {
        // Stub: return Optional.of(member)
        when(memberRepo.findById(member.getId())).thenReturn(Optional.of(member));
        
        // Stub: save returns modified argument
        when(commitRepo.save(any())).thenAnswer(inv -> {
            WeeklyCommit wc = inv.getArgument(0);
            wc.setId(UUID.randomUUID());
            return wc;
        });

        // Execute
        var result = commitService.createCommit(req);
        
        // Verify interaction
        verify(commitRepo).save(any());
    }
}
```

**Patterns:**
- `@Mock` for dependencies, `@InjectMocks` for service under test
- `when()...thenReturn()` for stubbing return values
- `any()` matcher for flexible argument matching
- `.thenAnswer()` for complex return logic (e.g., setting ID)
- `verify()` to assert method calls (not always used; test focuses on behavior not implementation)

**What to Mock:**

**Frontend:**
- HTTP requests (MSW) - always mock
- Router (MemoryRouter in test wrapper) - always mock
- Context providers (AuthProvider, TeamProvider) - wrap in test
- IntersectionObserver - mock globally in setup

**Backend:**
- Repositories - always mock in unit tests
- External services - mock if needed
- Database - real database in integration tests via Testcontainers
- Clock/Date - passed as parameters, testable

**What NOT to Mock:**

**Frontend:**
- Component internal state (test via rendered output)
- DOM (use React Testing Library's render)
- Event handlers (test via userEvent click/type)
- CSS (test via class presence, not styling)

**Backend:**
- Database (use real database in integration tests)
- Spring context (use Spring Boot Test)
- Service implementations (test via contracts)

## Fixtures and Factories

**Frontend:**

**Test Data:**
```typescript
// In test file
const item: CommitItem = {
  id: "1",
  weeklyCommitId: "c1",
  outcomeId: "o1",
  outcomeTitle: "Outcome A",
  title: "Test Item",
  description: "Test description",
  chessCategory: "STRATEGIC",
  effortEstimate: 3,
  impactEstimate: 5,
  sortOrder: 0,
  reconciliation: null,
  carryForwardCount: 0,
  flaggedStale: false,
  riskFlag: null,
  riskNote: null,
  riskFlaggedAt: null,
};

// Mock data in handlers
const mockCommit: WeeklyCommit = {
  id: "f0000000-0000-0000-0000-000000000001",
  teamMemberId: "e0000000-0000-0000-0000-000000000001",
  teamMemberName: "Alice Chen",
  weekStart: "2026-03-02",
  status: "DRAFT",
  items: [ /* ... */ ],
};
```

**Location:**
- Inline in test files for component-specific fixtures
- `frontend/src/test/mocks/handlers.ts` contains global mock data (teams, members, commits)
- Fixtures include full object structure (even nullable fields set to null)

**Backend:**

**Test Fixtures:**
```java
@BeforeEach
void setUp() {
    team = new Team();
    team.setId(UUID.randomUUID());
    team.setName("Test Team");

    member = new TeamMember();
    member.setId(UUID.randomUUID());
    member.setTeam(team);
    member.setName("Test User");
    member.setEmail("test@example.com");

    commit = new WeeklyCommit();
    commit.setId(UUID.randomUUID());
    commit.setTeamMember(member);
    commit.setWeekStart(LocalDate.of(2026, 3, 2));
    commit.setStatus(CommitStatus.DRAFT);
    commit.setItems(new ArrayList<>());
}
```

**Location:**
- `@BeforeEach` methods in test classes
- Created fresh for each test (not shared)
- Uses realistic UUIDs and dates

## Test Coverage

**Requirements:**
- No explicit coverage target observed in configuration
- Coverage not enforced via CI/CD (inferred from lack of config)

**Current State (Frontend):**
- 50 tests across 12 test files (per project memory)
- All tests passing
- Components tested: FibonacciSelector, CommitItemCard, AISummaryPanel, DashboardPage, ReconciliationPage, etc.

**Current State (Backend):**
- 56 tests written
- 5 core test files: CommitServiceTest, CommitLifecycleServiceTest, RcdoServiceTest, CommitControllerIntegrationTest, RcdoControllerIntegrationTest
- Some tests may have outdated DTO signatures (can't verify without JVM)

**View Coverage:**
```bash
# Frontend - coverage not configured
# Backend - coverage not configured
```

## Test Types

**Frontend:**

**Unit Tests:**
- Scope: Individual components (FibonacciSelector, StatusBadge, etc.)
- Approach: Render component in isolation, assert output and interactions
- Mocking: Only HTTP via MSW
- Examples: `FibonacciSelector.test.tsx`, `CommitItemCard.test.tsx`

**Integration Tests:**
- Scope: Page components with data flow (DashboardPage, CommitEditorPage)
- Approach: Render with providers, interact with UI, verify state changes and API calls
- Mocking: HTTP via MSW, routing via MemoryRouter, context via providers
- Examples: `DashboardPage.test.tsx`, `ReconciliationPage.test.tsx`

**E2E Tests:**
- Framework: Not used (development relies on integration tests)
- Would use: Playwright or Cypress for full application flows

**Backend:**

**Unit Tests:**
- Scope: Service layer business logic
- Approach: Mock repositories, test method behavior in isolation
- Examples: `CommitServiceTest.java`, `CommitLifecycleServiceTest.java`
- Test all branches: success paths, error conditions, state validation

**Integration Tests:**
- Scope: Full HTTP stack (controller → service → repository → database)
- Approach: Use MockMvc with Testcontainers PostgreSQL database
- State-dependent: Tests ordered with `@Order`, share database state across test method sequence
- Examples: `CommitControllerIntegrationTest.java`, `RcdoControllerIntegrationTest.java`
- Verify: HTTP status codes, JSON response shape, database side effects, audit logging

## Common Patterns

**Frontend Async Testing:**

```typescript
it("fires onChange with clicked value", async () => {
  const onChange = vi.fn();
  render(<FibonacciSelector value={null} onChange={onChange} />);
  await userEvent.click(screen.getByText("8"));  // await user interaction
  expect(onChange).toHaveBeenCalledWith(8);
});

it("renders team data", async () => {
  renderWithProviders(<DashboardPage />);
  await waitFor(() => {  // wait for async data fetch
    expect(screen.getByText("Alice Chen")).toBeInTheDocument();
  });
});
```

**Patterns:**
- `userEvent.setup()` for advanced interactions
- `await userEvent.click()` for user interactions
- `await waitFor()` for async state updates (query refetch, state change)
- No explicit `.then()` chains; async/await preferred

**Frontend Error Testing:**

```typescript
it("shows error when dashboard fetch fails", async () => {
  server.use(
    http.get("/api/v1/dashboard/team/:id", () => 
      HttpResponse.json({ detail: "Server error" }, { status: 500 })
    )
  );
  renderWithProviders(<DashboardPage />);
  await waitFor(() => {
    expect(screen.getByText(/Server error/)).toBeInTheDocument();
  });
});
```

**Patterns:**
- Override MSW handler for error path
- Render component normally (triggers fetch, gets error)
- Assert error message displayed

**Backend State Transition Testing:**

```typescript
@Test
@Order(5)
void lockCommit() throws Exception {
    mockMvc.perform(post("/api/v1/commits/f0000000-0000-0000-0000-000000000001/lock")
                    .header("X-Triggered-By", "TEST_USER"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("LOCKED"));
}

@Test
@Order(6)
void addItemToLockedCommitFails() throws Exception {
    mockMvc.perform(post("/api/v1/commits/f0000000-0000-0000-0000-000000000001/items")
                    // ...
                    )
            .andExpect(status().isConflict());  // 409
}
```

**Patterns:**
- Tests ordered: lock first (@Order(5)), then try to add item (@Order(6))
- State persists in database across ordered tests
- Invalid transition returns HTTP 409 Conflict
- Verifies state machine enforcement

**Backend Exception Testing:**

```java
@Test
void createCommitDuplicateThrows() {
    var req = new CreateWeeklyCommitRequest(member.getId(), LocalDate.of(2026, 3, 2));
    when(memberRepo.findById(member.getId())).thenReturn(Optional.of(member));
    when(commitRepo.findByTeamMemberIdAndWeekStart(member.getId(), req.weekStart()))
        .thenReturn(Optional.of(commit));

    assertThrows(IllegalStateException.class, () -> commitService.createCommit(req));
}
```

**Patterns:**
- `assertThrows(ExceptionType.class, () -> { code })` for expected exceptions
- Setup conditions to trigger exception
- Verify correct exception type thrown

---

*Testing analysis: 2026-04-21*
