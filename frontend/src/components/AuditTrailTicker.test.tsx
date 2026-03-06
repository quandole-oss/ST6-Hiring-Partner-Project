import { render, screen } from "@testing-library/react";
import { AuditTrailTicker } from "./AuditTrailTicker";
import type { AuditLogEntry } from "../types";

const entries: AuditLogEntry[] = [
  { id: "1", commitId: "c1", previousState: "DRAFT", newState: "LOCKED", triggeredBy: "SYSTEM", isManualOverride: false, notes: null, createdAt: "2026-03-02T10:00:00Z", commitItemId: null, commitItemTitle: null, actionType: "STATE_TRANSITION", oldValue: null, newValue: null },
  { id: "2", commitId: "c1", previousState: "RECONCILED", newState: "DRAFT", triggeredBy: "MANAGER", isManualOverride: true, notes: "Reset for revision", createdAt: "2026-03-03T14:00:00Z", commitItemId: null, commitItemTitle: null, actionType: "STATE_TRANSITION", oldValue: null, newValue: null },
];

describe("AuditTrailTicker", () => {
  it("renders staggered entries", () => {
    render(<AuditTrailTicker entries={entries} />);
    expect(screen.getAllByText(/DRAFT/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Override")).toBeInTheDocument();
  });

  it("shows empty state when no entries", () => {
    render(<AuditTrailTicker entries={[]} />);
    expect(screen.getByText("No recent activity.")).toBeInTheDocument();
  });
});
