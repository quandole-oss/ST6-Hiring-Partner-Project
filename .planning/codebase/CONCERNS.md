# Codebase Concerns

**Analysis Date:** 2026-04-21

## Auth & Security

### Client-Side Token Storage in localStorage

**Risk:** JWT tokens are stored in localStorage (`frontend/src/api/tokenStore.ts`, `frontend/src/contexts/AuthContext.tsx`), which is vulnerable to XSS attacks. An attacker can inject JavaScript to steal tokens.

**Files:** 
- `frontend/src/api/tokenStore.ts` (lines 1-23)
- `frontend/src/contexts/AuthContext.tsx` (lines 36-53)
- `frontend/src/api/export.ts` (token retrieval from localStorage)

**Current mitigation:** None. Tokens are stored in plain localStorage without HttpOnly flag (localStorage has no HttpOnly option).

**Recommendations:**
1. Migrate to HttpOnly, Secure cookies for token storage (requires backend coordination)
2. Implement Content Security Policy (CSP) headers to prevent XSS
3. Add SameSite cookie attribute
4. Consider using sessionStorage as temporary measure (cleared on tab close, but still XSS-vulnerable)

**Impact:** High - Compromised token gives attacker full API access with user's identity.

---

### Default JWT Secret in Development

**Risk:** `backend/src/main/resources/application.yml` line 41 contains a default JWT secret for local development: `a-default-dev-secret-that-is-at-least-256-bits-long-for-hs256`

**Files:** `backend/src/main/resources/application.yml` (line 41)

**Current mitigation:** Only active when `JWT_SECRET` env var is not set. Can be misuse in production if env var setup is missed.

**Recommendations:**
1. Fail startup if `JWT_SECRET` is default (detect via length or pattern)
2. Document required env vars explicitly
3. Add startup diagnostic check

**Impact:** Medium - Production deployment without proper secret rotation.

---

### Google OAuth Token Verification

**Risk:** Google token verification in `backend/src/main/java/com/st6/weeklycommit/service/GoogleTokenVerifier.java` needs verification. If token validation is weak, attackers can forge logins.

**Files:** `backend/src/main/java/com/st6/weeklycommit/service/GoogleTokenVerifier.java`

**Current implementation:** Uses Google's library via `org.springframework.security.oauth2`. Library version and implementation pattern need review.

**Recommendations:**
1. Verify token expiration is checked
2. Ensure issuer validation (`iss` claim)
3. Verify audience (`aud` claim) matches app's client ID
4. Log failed verification attempts for security monitoring

**Impact:** High - Compromised Google OAuth flow allows account takeover.

---

### Auto-Login in Demo Mode

**Risk:** `frontend/src/contexts/AuthContext.tsx` lines 33-35 automatically logs in demo user without credential validation. Demo mode can be accidentally enabled in production.

**Files:** `frontend/src/contexts/AuthContext.tsx` (lines 23-30, 34)

**Issue:** Demo mode is checked via `import.meta.env.VITE_DEMO_MODE === "true"`. If this env var is unintentionally set in production build, authentication is bypassed.

**Recommendations:**
1. Add startup check to warn if DEMO_MODE enabled outside localhost
2. Require explicit opt-in via config flag
3. Log every request when demo mode is active
4. Disable demo mode in production builds entirely

**Impact:** High - Accidental authentication bypass in production.

---

## Test Coverage Gaps

### API Client Not Tested

**Issue:** `frontend/src/api/client.ts` has no test coverage. Critical auth/error handling logic is untested.

**Files:** `frontend/src/api/client.ts`
- `request()` function (lines 33-49) - error handling, JSON parsing
- `handle401()` function (lines 21-31) - redirect logic
- Delete endpoint (lines 59-66) - not covered by test utilities

**What's missing:**
- 401 handling redirects correctly
- Network errors are caught and reported
- Response parsing failures
- Delete requests work end-to-end

**Coverage:** Only 15 test files for ~82 source files (18% test file ratio). ~50 tests for hundreds of React hooks/components.

**Recommendations:**
1. Add `api.test.ts` with MSW handler mocking
2. Test 401 handling triggers redirect callback
3. Test network error messaging
4. Test malformed JSON response handling

**Impact:** Medium - API contract changes could break silently in production.

---

### Auth Context Not Tested

**Issue:** `frontend/src/contexts/AuthContext.tsx` has critical login/logout logic without direct tests.

**Files:** `frontend/src/contexts/AuthContext.tsx`

**What's missing:**
- `login()` flow stores token correctly
- `googleLogin()` handles credential parsing
- `logout()` clears all state
- Demo mode behavior
- Token persistence across page reloads

**Coverage:** AuthContext is only indirectly tested through page tests (DashboardPage, CommitEditorPage).

**Recommendations:**
1. Create `AuthContext.test.tsx` with dedicated tests
2. Mock fetch for login/google endpoints
3. Test localStorage side effects
4. Test error states and fallback UI

**Impact:** Medium - Auth flow regressions could lock users out.

---

### Untested Pages/Components

**Issue:** Many pages and heavy components have no test coverage.

**Untested files:**
- `frontend/src/pages/CommitEditorPage.tsx` (806 lines) - partial test coverage only
- `frontend/src/pages/RcdoPage.tsx` (401 lines) - no test file
- `frontend/src/pages/PersonalAnalyticsPage.tsx` (136 lines) - no test file
- `frontend/src/pages/SettingsPage.tsx` (197 lines) - no test file
- `frontend/src/pages/TeamPulsePage.tsx` (126 lines) - no test file
- `frontend/src/components/FloatingAIChat.tsx` (96 lines) - no test file
- `frontend/src/components/AIQAPanel.tsx` (138 lines) - no test file
- `frontend/src/components/MarkdownContent.tsx` - no test file
- Many utility modules: `metrics.ts`, `week.ts`, `aiSummaryService.ts`

**Impact:** Medium - RCDO workflow, Personal Analytics, Settings, and AI features not validated.

---

### Mock Data Incomplete

**Issue:** MSW handlers in `frontend/src/test/mocks/handlers.ts` only cover happy paths. Error cases not mocked.

**Files:** `frontend/src/test/mocks/handlers.ts` (179 lines)

**What's missing:**
- 401/403 error responses
- 400 validation error responses
- 500 server error responses
- Network timeout scenarios
- Partial data responses (missing required fields)

**Impact:** Medium - Integration with real backend error handling untested.

---

## State Management & Data Flow

### Query Cache Invalidation Too Broad

**Issue:** `frontend/src/api/commits.ts` lines 15-18 invalidates ALL query keys on mutation success.

```typescript
function invalidateAll(qc: QueryClient) {
  qc.invalidateQueries({ queryKey: ["commits"] });
  qc.invalidateQueries({ queryKey: ["dashboard"] });
}
```

**Problem:** 
- Creates race conditions if multiple queries run in parallel
- Causes unnecessary refetches (all commits invalidated on single item update)
- Can cause flashing UI

**Recommendations:**
1. Invalidate specific query: `qc.invalidateQueries({ queryKey: ["commits", commitId] })`
2. Use React Query's `setQueryData` for optimistic updates
3. Only invalidate when needed (creation, deletion, status changes)

**Impact:** Low - UX degradation, not correctness issue.

---

### Missing Error Boundaries on Pages

**Issue:** `frontend/src/components/ErrorBoundary.tsx` exists but global catch-all at root only. Individual pages (CommitEditorPage, RcdoPage, etc.) don't have error boundaries.

**Files:** `frontend/src/main.tsx` (line 31) - single global error boundary

**Problem:**
- One error crashes entire app
- No page-level recovery
- Error message not contextual

**Recommendations:**
1. Wrap each page route with error boundary
2. Add fallback UI for each page type
3. Log errors to monitoring service

**Impact:** Low - Rare, but user experience poor when errors occur.

---

### No Optimistic Updates

**Issue:** Mutation calls (`useCreateItem`, `useUpdateItem`, `useDeleteItem`, etc.) don't update UI optimistically. Users see spinners while waiting for server.

**Files:** `frontend/src/api/commits.ts`, `frontend/src/api/rcdo.ts`

**Impact:** Medium - Poor perceived performance. Network latency directly visible to user.

**Recommendations:**
1. Use `onMutate` to update cache immediately
2. Rollback on error
3. Show pending state with different styling (disabled button with loading spinner)

---

## Token Expiration & Refresh

### No Token Refresh Flow

**Issue:** JWT tokens expire (default 24 hours per `application.yml` line 42: `JWT_EXPIRY_MS: 86400000`), but no refresh token mechanism exists.

**Files:** 
- `backend/src/main/java/com/st6/weeklycommit/security/JwtService.java` - no refresh logic
- `frontend/src/api/client.ts` - no retry with refresh on 401

**Problem:**
- User loses session after 24 hours even if app is open
- No refresh token endpoint to extend session
- No silent refresh before expiration

**Recommendations:**
1. Implement refresh token endpoint on backend
2. Store refresh token in HttpOnly cookie
3. Intercept 401, call refresh endpoint, retry request
4. Monitor token expiry time and refresh 5 minutes before expiration

**Impact:** Medium - Long-running users experience abrupt logouts.

---

## Performance Concerns

### Large Components Monolithic

**Issue:** Several components exceed 300+ lines and handle too many responsibilities.

**Files:**
- `frontend/src/pages/CommitEditorPage.tsx` (806 lines)
- `frontend/src/pages/RcdoPage.tsx` (401 lines)
- `frontend/src/components/TaskDetailsModal.tsx` (315 lines)

**Problem:**
- Difficult to test individual features
- Inline form submission logic mixed with data fetching
- Hard to reuse parts of component
- Performance: All state changes trigger full re-render

**Recommendations:**
1. Extract form components into separate files
2. Extract modals into custom hook wrappers
3. Use React.memo for sub-components
4. Use useCallback to memoize handlers

**Impact:** Low - Maintainability issue, not correctness.

---

### No Pagination on Commit Lists

**Issue:** All commits for a member loaded at once in `frontend/src/pages/CommitEditorPage.tsx` and list pages.

**Files:** `frontend/src/pages/CommitEditorPage.tsx` line 47

**Problem:**
- If user has 100+ commits, all fetched and rendered
- Memory and DOM overhead
- No filtering/search

**Impact:** Medium - Scaling problem for long-term users.

---

### AI Summaries Not Cached Separately

**Issue:** `frontend/src/api/commits.ts` includes AI summaries in commit queries, but AI generation is slow and expensive.

**Problem:**
- Full commit re-fetch required if AI summary needs update
- No separate `enabled: false` hook for on-demand AI fetching

**Files:** `frontend/src/api/commits.ts` - see useCommit() hook

**Recommendations:**
1. Create `useAISummary(commitId)` hook with separate query key
2. Only fetch on demand via button click
3. Cache summary independently

**Impact:** Low - UX feels slow when viewing summaries.

---

## Data Validation Gaps

### Frontend Validation Incomplete

**Issue:** Form validation exists but may not match backend constraints.

**Examples:**
- Fibonacci selector validates 0-8 range client-side (`FibonacciSelector.tsx`)
- Character limits on descriptions not enforced
- Email format not validated before submission

**Problem:** Mismatch between client/server validation leads to confusing errors.

**Recommendations:**
1. Create shared validation schema (e.g., Zod)
2. Use same validation on frontend and backend
3. Add max-length attributes to inputs

**Impact:** Low - Validation passes but UX confusing when rejected.

---

## Backend-Specific Concerns

### Flyway Repair-on-Migrate Enabled

**Issue:** `backend/src/main/resources/application.yml` line 31: `repair-on-migrate: true`

**Problem:** 
- Automatically repairs failed migrations on startup
- Can mask migration failures and corrupt data
- Unsafe in production without manual oversight

**Recommendations:**
1. Disable in production: `repair-on-migrate: false`
2. Require manual migration repair via admin tool
3. Alert on repair in logs

**Impact:** High - Data corruption risk in production.

---

### Default Team Assignment in Google OAuth

**Issue:** `backend/src/main/java/com/st6/weeklycommit/controller/AuthController.java` lines 84-96.

New Google OAuth users automatically assigned to first team:
```java
Team defaultTeam = teamRepo.findAll().stream().findFirst()
  .orElseThrow(...)
```

**Problem:**
- No control over team assignment
- Users may be assigned to wrong team
- Violates principle of explicit assignment

**Recommendations:**
1. Require admin approval for new OAuth users
2. Create pending user record until approved
3. Email existing team members for approval

**Impact:** Medium - Unauthorized users could join sensitive teams.

---

### No Request Logging/Audit Trail

**Issue:** No logging of API requests in backend.

**Problem:**
- Cannot audit who accessed what data when
- No security incident investigation capability
- No performance profiling data

**Files:** `backend/src/main/java/com/st6/weeklycommit/controller/` - no request logging filters

**Recommendations:**
1. Add HTTP logging filter that logs: user, endpoint, method, status, duration
2. Sanitize sensitive data (passwords) from logs
3. Store logs in structured format for analysis

**Impact:** Medium - Compliance and incident response gap.

---

### Hardcoded AI Model

**Issue:** `backend/src/main/resources/application.yml` line 45: `model: claude-sonnet-4-6` is hardcoded.

**Problem:**
- Cannot easily test with different models
- No fallback if API changes
- No cost optimization (no option for cheaper model)

**Recommendations:**
1. Make model configurable via env var
2. Add fallback model if primary fails
3. Add metrics for AI API usage

**Impact:** Low - Flexibility concern.

---

## Database Concerns

### No Connection Pooling Limits Tested

**Issue:** `backend/src/main/resources/application.yml` lines 13-15:
```yaml
hikari:
  maximum-pool-size: 5
  connection-timeout: 10000
```

Only 5 connections allowed. Under load, connections will timeout.

**Problem:**
- No load testing to verify pool size sufficient
- Timeout is 10 seconds (aggressive)
- No metrics on pool exhaustion

**Recommendations:**
1. Monitor connection pool usage under load
2. Increase pool size or implement queuing
3. Add health check endpoint for connection pool status

**Impact:** Medium - Production instability under concurrent load.

---

### No Soft Deletes

**Issue:** No soft delete pattern observed. Data deletion is permanent.

**Problem:**
- Cannot audit deleted records
- Cannot restore accidental deletions
- Compliance/data retention issues

**Files:** Repositories use `delete()` directly

**Recommendations:**
1. Add `deleted_at` timestamp to relevant entities
2. Filter deleted records in queries by default
3. Require special admin endpoint to purge

**Impact:** Low - Compliance concern for audited systems.

---

## Observability Gaps

### No Error Tracking Service

**Issue:** Errors logged to console/stdout only. No centralized error tracking.

**Problem:**
- Errors in production go unseen
- Cannot correlate errors to users
- No alerting on critical errors

**Recommendations:**
1. Integrate Sentry or Datadog
2. Add error context (user ID, commit ID, page)
3. Set up alerts for 5xx errors

**Impact:** Medium - Blind to production issues.

---

### No Performance Monitoring

**Issue:** No metrics on API latency, query time, AI generation time.

**Problem:**
- Cannot identify slow endpoints
- Cannot track AI cost/usage
- No SLA enforcement

**Recommendations:**
1. Add Micrometer metrics
2. Export to Prometheus/Grafana
3. Track: endpoint latency, DB query count, AI tokens used

**Impact:** Low - Operational visibility gap.

---

## Configuration & Deployment

### Environment Variables Not Documented

**Issue:** `backend/src/main/resources/application.yml` uses many env vars, but no documentation of required vars.

**Files:** application.yml (all @Value lines)

**Required vars not listed anywhere:**
- `JWT_SECRET`
- `ANTHROPIC_API_KEY`
- `GOOGLE_CLIENT_ID`
- `SPRING_DATASOURCE_URL`, etc.

**Recommendations:**
1. Create `DEPLOYMENT.md` with required env vars table
2. Add descriptions and examples
3. List which vars are optional vs required

**Impact:** Medium - Deployment errors and incomplete setups.

---

## Known Issues Tracker

### Demo Data Seeder Inefficient

**Issue:** `backend/src/main/java/com/st6/weeklycommit/config/DemoDataSeeder.java` runs on every startup.

**Problem:**
- Queries database every startup to check if data needs shifting
- JDBC template calls are synchronous and slow
- Only useful in development, shouldn't run in production

**Recommendations:**
1. Only run if `app.seed-demo-data=true` explicitly set
2. Cache shifted state to avoid repeated queries
3. Add profile to disable in production (`@Profile("dev")`)

**Impact:** Low - Startup latency in development only.

---

### No Content Security Policy (CSP)

**Issue:** Backend doesn't set CSP headers.

**Problem:**
- Vulnerable to XSS and clickjacking attacks
- No script/resource loading restrictions
- Third-party script injection possible

**Files:** `backend/src/main/java/com/st6/weeklycommit/config/WebConfig.java` - no CSP headers

**Recommendations:**
1. Add CSP header to all responses
2. Restrict to `https://` only
3. Disallow inline scripts (migrate to external files)
4. Restrict external domains (fonts, CDN)

**Impact:** High - XSS vulnerability.

---

### CORS Too Permissive

**Issue:** `backend/src/main/java/com/st6/weeklycommit/config/SecurityConfig.java` lines 69:
```java
config.setAllowedHeaders(List.of("*"));
```

**Problem:**
- Allows any request header
- No validation of Content-Type, Authorization format
- May allow malformed requests

**Recommendations:**
1. Whitelist specific headers: `["Content-Type", "Authorization"]`
2. Restrict origins to exact frontend URL in production
3. Disallow credentials if origin is wildcard

**Impact:** Low - Defense in depth concern.

---

### No Rate Limiting

**Issue:** No rate limiting on API endpoints.

**Problem:**
- Brute force attacks possible on login endpoint
- AI summary generation unbounded (expensive API calls)
- DoS attacks possible

**Recommendations:**
1. Add Spring Cloud Gateway or servlet filter for rate limiting
2. Limit login attempts: 5 per minute per IP
3. Limit AI summary: 1 per commit per day per user
4. Return 429 Too Many Requests

**Impact:** Medium - Security and cost control gap.

---

## Missing Features

### No Bulk Operations

**Issue:** Cannot create/update multiple commits at once.

**Problem:**
- Import workflow requires 1-by-1 creation
- Slow for teams with many initial commits

**Recommendations:**
1. Add bulk create endpoint
2. Add CSV import feature
3. Implement progress tracking for bulk ops

**Impact:** Low - UX enhancement for data entry.

---

### No Commit Templates

**Issue:** Each week user starts from scratch.

**Problem:**
- Repetitive data entry
- No quick way to use previous week's items as starting point

**Recommendations:**
1. Add "Use last week" button
2. Create reusable item templates
3. Save favorite templates

**Impact:** Low - Productivity enhancement.

---

### No Offline Support

**Issue:** App requires constant internet connection.

**Problem:**
- Cannot draft commits while offline
- No offline queue for submissions

**Recommendations:**
1. Implement service worker for offline caching
2. Queue mutations in IndexedDB
3. Sync when connection restored

**Impact:** Low - PWA enhancement.

---

## Backend Test Coverage

### DTO Signatures Changed, Tests Not Updated

**Issue:** Memory note indicates "Backend tests (56) need updates for new DTO signatures (can't verify without JVM)".

**Files:** `backend/src/test/java/...` - Integration and unit tests

**Problem:** 
- API contract changes not reflected in tests
- Tests may pass with old assumptions
- Mismatch between frontend and backend expectations

**Recommendations:**
1. Run full test suite on every commit (requires Docker)
2. Update DTO tests for all new fields
3. Add integration tests for Google OAuth flow

**Impact:** Medium - Test/code mismatch.

---

## Summary by Priority

### HIGH Priority
1. **Client-side token storage in localStorage** - XSS vulnerability
2. **No token refresh mechanism** - Users logged out after 24h
3. **Demo mode auto-login** - Accidental auth bypass
4. **No Content Security Policy** - XSS vulnerability
5. **Auto Google user team assignment** - Unauthorized access
6. **Flyway repair-on-migrate enabled** - Data corruption risk

### MEDIUM Priority
1. **API client not tested** - Silent contract changes
2. **Auth context not tested** - Login regressions
3. **Untested pages (RcdoPage, SettingsPage, etc.)**
4. **No request logging/audit trail**
5. **Connection pool limits not load tested**
6. **No error tracking service**
7. **No rate limiting**

### LOW Priority
1. **Large monolithic components** - Maintainability
2. **No pagination on commit lists** - Scaling issue
3. **Query cache invalidation too broad** - UX degradation
4. **No optimistic updates** - Perceived performance
5. **Demo data seeder inefficient** - Development only
6. **CORS too permissive** - Defense in depth

---

*Concerns audit: 2026-04-21*
