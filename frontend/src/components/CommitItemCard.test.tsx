import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CommitItemCard } from "./CommitItemCard";
import type { CommitItem } from "../types";

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

describe("CommitItemCard", () => {
  it("renders item data", () => {
    render(<CommitItemCard item={item} />);
    expect(screen.getByText("Test Item")).toBeInTheDocument();
    expect(screen.getByText("Test description")).toBeInTheDocument();
    expect(screen.getByText("STRATEGIC")).toBeInTheDocument();
    expect(screen.getByText("Outcome A")).toBeInTheDocument();
  });

  it("shows edit/delete buttons when isDraft", () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    render(<CommitItemCard item={item} isDraft onEdit={onEdit} onDelete={onDelete} />);
    expect(screen.getByText("Edit")).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
  });

  it("hides edit/delete buttons when not isDraft", () => {
    render(<CommitItemCard item={item} isDraft={false} onEdit={() => {}} onDelete={() => {}} />);
    expect(screen.queryByText("Edit")).not.toBeInTheDocument();
    expect(screen.queryByText("Delete")).not.toBeInTheDocument();
  });

  it("fires onEdit callback", async () => {
    const onEdit = vi.fn();
    render(<CommitItemCard item={item} isDraft onEdit={onEdit} onDelete={() => {}} />);
    await userEvent.click(screen.getByText("Edit"));
    expect(onEdit).toHaveBeenCalledOnce();
  });

  it("fires onDelete callback", async () => {
    const onDelete = vi.fn();
    render(<CommitItemCard item={item} isDraft onEdit={() => {}} onDelete={onDelete} />);
    await userEvent.click(screen.getByText("Delete"));
    expect(onDelete).toHaveBeenCalledOnce();
  });

  it("shows CF badge when carryForwardCount > 0", () => {
    const staleItem = { ...item, carryForwardCount: 2, flaggedStale: false };
    render(<CommitItemCard item={staleItem} />);
    expect(screen.getByText("CF: 2/3")).toBeInTheDocument();
  });

  it("does not show CF badge when carryForwardCount is 0", () => {
    render(<CommitItemCard item={item} />);
    expect(screen.queryByText(/CF:/)).not.toBeInTheDocument();
  });

  it("displays human-readable effort and impact", () => {
    render(<CommitItemCard item={item} />);
    expect(screen.getByText(/3 pts/)).toBeInTheDocument();
    expect(screen.getByText(/Very High/)).toBeInTheDocument();
  });

  it("shows BLOCKED badge when riskFlag is BLOCKED", () => {
    const blockedItem = { ...item, riskFlag: "BLOCKED" as const, riskNote: "Waiting on API" };
    render(<CommitItemCard item={blockedItem} />);
    expect(screen.getByText("BLOCKED")).toBeInTheDocument();
  });

  it("shows flag toggle buttons when isLocked", () => {
    const onFlagChange = vi.fn();
    render(<CommitItemCard item={item} isLocked onFlagChange={onFlagChange} />);
    expect(screen.getByText("Block")).toBeInTheDocument();
    expect(screen.getByText("At Risk")).toBeInTheDocument();
  });
});
