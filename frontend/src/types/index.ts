export type CommitStatus = "DRAFT" | "LOCKED" | "RECONCILING" | "RECONCILED" | "CARRY_FORWARD";
export type ChessCategory = "STRATEGIC" | "TACTICAL" | "OPERATIONAL" | "MAINTENANCE";
export type CompletionStatus = "COMPLETED" | "PARTIAL" | "NOT_STARTED" | "DEFERRED";

export const FIBONACCI_POINTS = [1, 2, 3, 5, 8, 13] as const;

export type ItemFlag = "BLOCKED" | "AT_RISK" | null;

export interface RallyCry {
  id: string;
  title: string;
  description: string | null;
  createdAt: string;
  definingObjectives: DefiningObjective[];
}

export interface DefiningObjective {
  id: string;
  rallyCryId: string;
  title: string;
  description: string | null;
  outcomes: Outcome[];
}

export interface Outcome {
  id: string;
  definingObjectiveId: string;
  title: string;
  description: string | null;
}

export interface WeeklyCommit {
  id: string;
  teamMemberId: string;
  teamMemberName: string;
  weekStart: string;
  status: CommitStatus;
  lockedAt: string | null;
  reconciledAt: string | null;
  items: CommitItem[];
  hasBlockedItems: boolean;
  moodScore: number | null;
}

export interface CommitItem {
  id: string;
  weeklyCommitId: string;
  outcomeId: string | null;
  outcomeTitle: string | null;
  title: string;
  description: string | null;
  chessCategory: ChessCategory | null;
  effortEstimate: number | null;
  impactEstimate: number | null;
  sortOrder: number;
  reconciliation: Reconciliation | null;
  carryForwardCount: number;
  flaggedStale: boolean;
  riskFlag: ItemFlag;
  riskNote: string | null;
  riskFlaggedAt: string | null;
}

export interface Reconciliation {
  id: string;
  commitItemId: string;
  completionStatus: CompletionStatus;
  notes: string | null;
  actualStoryPoints: number | null;
}

export interface DashboardTeam {
  teamId: string;
  teamName: string;
  members: DashboardMember[];
  categoryBreakdown: Record<string, number>;
}

export interface DashboardMember {
  memberId: string;
  memberName: string;
  commitStatus: CommitStatus | null;
  totalItems: number;
  completedItems: number;
  partialItems: number;
  completionRate: number;
  alignmentScore: number;
  totalStoryPoints: number;
  completedStoryPoints: number;
  blockedItems: number;
  atRiskItems: number;
  moodScore: number | null;
  previousMoodScore: number | null;
}

export interface AlignmentScore {
  overallAlignment: number;
  totalItems: number;
  linkedItems: number;
  unlinkedItems: number;
}

export interface CreateCommitItemRequest {
  outcomeId?: string;
  title: string;
  description?: string;
  chessCategory?: ChessCategory;
  effortEstimate?: number;
  impactEstimate?: number;
  sortOrder: number;
}

export interface UpdateReconciliationRequest {
  completionStatus: CompletionStatus;
  notes?: string;
  actualStoryPoints?: number;
}

export interface Team {
  id: string;
  name: string;
}

export interface TeamMember {
  id: string;
  teamId: string;
  name: string;
  email: string;
  role: string;
}

export interface TeamSummary {
  teamId: string;
  teamName: string;
  summary: string;
  generatedAt: string;
}

export interface AuditLogEntry {
  id: string;
  commitId: string;
  previousState: CommitStatus | null;
  newState: CommitStatus | null;
  triggeredBy: string;
  isManualOverride: boolean;
  notes: string | null;
  createdAt: string;
  commitItemId: string | null;
  commitItemTitle: string | null;
  actionType: string;
  oldValue: string | null;
  newValue: string | null;
}

export interface UpdateCommitItemRequest {
  outcomeId?: string;
  title: string;
  description?: string;
  chessCategory?: ChessCategory;
  effortEstimate?: number;
  impactEstimate?: number;
  sortOrder: number;
}
