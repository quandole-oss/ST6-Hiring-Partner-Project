import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CarryForwardWarning } from "./CarryForwardWarning";
import type { CommitItem } from "../types";

const staleItem: CommitItem = {
  id: "1",
  weeklyCommitId: "c1",
  outcomeId: null,
  outcomeTitle: null,
  title: "Stale Task",
  description: null,
  chessCategory: "OPERATIONAL",
  effortEstimate: 3,
  impactEstimate: 3,
  sortOrder: 0,
  reconciliation: null,
  carryForwardCount: 3,
  flaggedStale: true,
  riskFlag: null,
  riskNote: null,
  riskFlaggedAt: null,
};

describe("CarryForwardWarning", () => {
  it("renders warning with item title", () => {
    render(<CarryForwardWarning item={staleItem} onDelete={() => {}} onEdit={() => {}} onClose={() => {}} />);
    expect(screen.getByText("Resolve Stale Task")).toBeInTheDocument();
    expect(screen.getByText(/3 times/)).toBeInTheDocument();
  });

  it("fires onDelete callback", async () => {
    const onDelete = vi.fn();
    render(<CarryForwardWarning item={staleItem} onDelete={onDelete} onEdit={() => {}} onClose={() => {}} />);
    await userEvent.click(screen.getByText("Delete"));
    expect(onDelete).toHaveBeenCalledOnce();
  });

  it("fires onEdit callback", async () => {
    const onEdit = vi.fn();
    render(<CarryForwardWarning item={staleItem} onDelete={() => {}} onEdit={onEdit} onClose={() => {}} />);
    await userEvent.click(screen.getByText("Resize"));
    expect(onEdit).toHaveBeenCalledOnce();
  });
});
