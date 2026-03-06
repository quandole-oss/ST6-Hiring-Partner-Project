import { http, HttpResponse } from "msw";
import type { WeeklyCommit, DashboardTeam, AlignmentScore, Team, TeamMember } from "../../types";

const teams: Team[] = [
  { id: "d0000000-0000-0000-0000-000000000001", name: "Platform Squad" },
];

const teamMembers: TeamMember[] = [
  { id: "e0000000-0000-0000-0000-000000000001", teamId: "d0000000-0000-0000-0000-000000000001", name: "Alice Chen", email: "alice@example.com", role: "LEAD" },
  { id: "e0000000-0000-0000-0000-000000000002", teamId: "d0000000-0000-0000-0000-000000000001", name: "Bob Martinez", email: "bob@example.com", role: "MEMBER" },
];

const mockCommit: WeeklyCommit = {
  id: "f0000000-0000-0000-0000-000000000001",
  teamMemberId: "e0000000-0000-0000-0000-000000000001",
  teamMemberName: "Alice Chen",
  weekStart: "2026-03-02",
  status: "DRAFT",
  lockedAt: null,
  reconciledAt: null,
  hasBlockedItems: false,
  items: [
    {
      id: "10000000-0000-0000-0000-000000000001",
      weeklyCommitId: "f0000000-0000-0000-0000-000000000001",
      outcomeId: "c0000000-0000-0000-0000-000000000001",
      outcomeTitle: "Guided setup wizard live",
      title: "Design wizard wireframes",
      description: "Create low-fi wireframes",
      chessCategory: "STRATEGIC",
      effortEstimate: 3,
      impactEstimate: 5,
      sortOrder: 1,
      reconciliation: null,
      carryForwardCount: 0,
      flaggedStale: false,
      riskFlag: null,
      riskNote: null,
      riskFlaggedAt: null,
    },
    {
      id: "10000000-0000-0000-0000-000000000002",
      weeklyCommitId: "f0000000-0000-0000-0000-000000000001",
      outcomeId: null,
      outcomeTitle: null,
      title: "Fix flaky tests",
      description: null,
      chessCategory: "OPERATIONAL",
      effortEstimate: 2,
      impactEstimate: 3,
      sortOrder: 2,
      reconciliation: null,
      carryForwardCount: 0,
      flaggedStale: false,
      riskFlag: null,
      riskNote: null,
      riskFlaggedAt: null,
    },
  ],
};

const mockDashboard: DashboardTeam = {
  teamId: "d0000000-0000-0000-0000-000000000001",
  teamName: "Platform Squad",
  members: [
    { memberId: "e0000000-0000-0000-0000-000000000001", memberName: "Alice Chen", commitStatus: "DRAFT", totalItems: 3, completedItems: 0, partialItems: 0, completionRate: 0, alignmentScore: 0.67, totalStoryPoints: 8, completedStoryPoints: 0, blockedItems: 0, atRiskItems: 0 },
  ],
  categoryBreakdown: { STRATEGIC: 2, TACTICAL: 1, OPERATIONAL: 1 },
};

const mockAlignment: AlignmentScore = {
  overallAlignment: 0.67,
  totalItems: 3,
  linkedItems: 2,
  unlinkedItems: 1,
};

const rallyCries = [
  {
    id: "a0000000-0000-0000-0000-000000000001",
    title: "Accelerate Product-Led Growth",
    description: "Drive adoption",
    createdAt: "2026-01-01T00:00:00Z",
    definingObjectives: [
      {
        id: "b0000000-0000-0000-0000-000000000001",
        rallyCryId: "a0000000-0000-0000-0000-000000000001",
        title: "Improve Onboarding Conversion",
        description: null,
        outcomes: [
          { id: "c0000000-0000-0000-0000-000000000001", definingObjectiveId: "b0000000-0000-0000-0000-000000000001", title: "Guided setup wizard live", description: null },
        ],
      },
    ],
  },
];

export const handlers = [
  http.post("/api/v1/auth/login", () =>
    HttpResponse.json({
      token: "mock-jwt-token",
      memberId: "e0000000-0000-0000-0000-000000000001",
      name: "Alice Chen",
      role: "LEAD",
    })
  ),
  http.post("/api/v1/auth/oauth2/google", () =>
    HttpResponse.json({
      token: "mock-jwt-token",
      memberId: "e0000000-0000-0000-0000-000000000001",
      name: "Alice Chen",
      role: "LEAD",
    })
  ),
  http.get("/api/v1/teams", () => HttpResponse.json(teams)),
  http.get("/api/v1/teams/:id/members", () => HttpResponse.json(teamMembers)),
  http.get("/api/v1/commits", () => HttpResponse.json([mockCommit])),
  http.get("/api/v1/commits/:id", () => HttpResponse.json(mockCommit)),
  http.post("/api/v1/commits", () => HttpResponse.json(mockCommit, { status: 201 })),
  http.post("/api/v1/commits/:id/items", () =>
    HttpResponse.json(mockCommit.items[0], { status: 201 })
  ),
  http.put("/api/v1/commits/:commitId/items/:itemId", () =>
    HttpResponse.json(mockCommit.items[0])
  ),
  http.delete("/api/v1/commits/:commitId/items/:itemId", () =>
    new HttpResponse(null, { status: 204 })
  ),
  http.post("/api/v1/commits/:id/lock", () =>
    HttpResponse.json({ ...mockCommit, status: "LOCKED" })
  ),
  http.post("/api/v1/commits/:id/reconcile", () =>
    HttpResponse.json({ ...mockCommit, status: "RECONCILING" })
  ),
  http.post("/api/v1/commits/:id/submit", () =>
    HttpResponse.json({ ...mockCommit, status: "RECONCILED" })
  ),
  http.get("/api/v1/dashboard/team/:id", () => HttpResponse.json(mockDashboard)),
  http.get("/api/v1/dashboard/alignment", () => HttpResponse.json(mockAlignment)),
  http.get("/api/v1/rcdo/rally-cries", () => HttpResponse.json(rallyCries)),
  http.put("/api/v1/commits/:commitId/items/:itemId/reconciliation", () =>
    HttpResponse.json({ id: "r1", commitItemId: "10000000-0000-0000-0000-000000000001", completionStatus: "COMPLETED", notes: null, actualStoryPoints: 3 })
  ),
  http.put("/api/v1/commits/:commitId/items/:itemId/risk", () =>
    HttpResponse.json(mockCommit.items[0])
  ),
  http.patch("/api/v1/commits/:commitId/items/:itemId/category", () =>
    HttpResponse.json(mockCommit.items[0])
  ),
  http.get("/api/v1/dashboard/team/:id/blocked-items", () =>
    HttpResponse.json([])
  ),
  http.get("/api/v1/commits/:id/audit-log", () =>
    HttpResponse.json([
      { id: "al-001", commitId: "f0000000-0000-0000-0000-000000000001", previousState: "DRAFT", newState: "LOCKED", triggeredBy: "alice@example.com", isManualOverride: false, notes: null, createdAt: "2026-03-02T10:00:00Z", commitItemId: null, commitItemTitle: null, actionType: "STATE_TRANSITION", oldValue: null, newValue: null },
      { id: "al-002", commitId: "f0000000-0000-0000-0000-000000000001", previousState: null, newState: null, triggeredBy: "alice@example.com", isManualOverride: false, notes: null, createdAt: "2026-03-02T09:30:00Z", commitItemId: "10000000-0000-0000-0000-000000000001", commitItemTitle: "Design wizard wireframes", actionType: "CATEGORY_CHANGE", oldValue: "TACTICAL", newValue: "STRATEGIC" },
    ])
  ),
  http.post("/api/v1/commits/:id/override", () =>
    HttpResponse.json({ ...mockCommit, status: "DRAFT" })
  ),
  http.get("/api/v1/dashboard/team/:id/summary", () =>
    HttpResponse.json({
      teamId: "d0000000-0000-0000-0000-000000000001",
      teamName: "Platform Squad",
      summary: "The Platform Squad has committed 8 story points this week with 67% RCDO alignment. No items are currently blocked.",
      generatedAt: "2026-03-06T12:00:00Z",
    })
  ),
];
