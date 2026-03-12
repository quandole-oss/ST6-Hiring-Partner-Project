import type { TeamSummary } from "../types";

const USE_MOCK_AI = import.meta.env.VITE_AI_ENABLED !== "true";

const MOCK_SUMMARIES = [
  "Team velocity is strong this week with {sp} story points committed. RCDO alignment sits at 67% — consider linking unattached operational tasks to outcomes for better visibility.\n\nNo blocked items detected. Strategic work accounts for the majority of effort, which aligns well with quarterly objectives.",

  "Heads up: {count} items are currently blocked, which may impact delivery targets. The team should prioritize unblocking these before mid-week.\n\nOverall commitment is healthy at {sp} story points. Consider redistributing effort if blockers persist beyond Wednesday.",

  "Excellent alignment this week — 80% of committed items link directly to RCDO outcomes. The team is focused on high-impact strategic work.\n\nVelocity trend shows a 15% increase over the 4-week rolling average. Maintain current pace and watch for over-commitment in the next cycle.",

  "Completion rates are below target at 45% through mid-week. Several tactical items remain in progress with no reconciliation updates.\n\nRecommendation: Hold a brief stand-up to identify blockers early. The {sp} story points committed this week are achievable if the team re-prioritizes by Wednesday.",

  "Strong week for {team}! All strategic items have clear outcome linkage, and the carry-forward count is at zero — no lingering tasks from previous weeks.\n\nThe effort/impact ratio looks favorable: most high-impact items are sized at 3-5 SP, keeping individual workloads manageable.",

  "Mixed signals this week: while total commitment ({sp} SP) is on target, the category breakdown skews heavily toward maintenance work (60%).\n\nConsider rebalancing: strategic items should represent at least 30% of weekly effort to maintain progress on key objectives.",
];

export function shouldUseMock(): boolean {
  return USE_MOCK_AI;
}

export function getMockSummary(teamId: string, teamName: string): Promise<TeamSummary> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const template = MOCK_SUMMARIES[Math.floor(Math.random() * MOCK_SUMMARIES.length)];
      const summary = template
        .replace(/\{team\}/g, teamName)
        .replace(/\{sp\}/g, String(Math.floor(Math.random() * 15) + 8))
        .replace(/\{count\}/g, String(Math.floor(Math.random() * 3) + 1));

      resolve({
        teamId,
        teamName,
        summary,
        generatedAt: new Date().toISOString(),
      });
    }, 1500);
  });
}

const MOCK_QA_RESPONSES = [
  "Based on the current week's data, the team has committed a total of 24 story points across 8 items. Alice leads with 13 SP on strategic work, while Bob has 2 items currently blocked that may need attention.",
  "Looking at the commit history, the team's completion rate has been trending upward over the past few weeks. RCDO alignment is at 67%, with most unlinked items falling in the operational category.",
  "The data shows that Carol has been consistently delivering on tactical items with a 100% completion rate. Consider shifting some strategic work her way to balance the team's workload.",
];

export function getMockQaResponse(question: string): Promise<{ question: string; answer: string; generatedAt: string }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        question,
        answer: MOCK_QA_RESPONSES[Math.floor(Math.random() * MOCK_QA_RESPONSES.length)],
        generatedAt: new Date().toISOString(),
      });
    }, 1500);
  });
}
