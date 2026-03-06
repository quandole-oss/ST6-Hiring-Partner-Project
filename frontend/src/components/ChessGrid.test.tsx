import { render, screen } from "@testing-library/react";
import { ChessGrid } from "./ChessGrid";
import type { CommitItem } from "../types";

function makeItem(overrides: Partial<CommitItem>): CommitItem {
  return {
    id: "1",
    weeklyCommitId: "c1",
    outcomeId: null,
    outcomeTitle: null,
    title: "Item",
    description: null,
    chessCategory: "STRATEGIC",
    effortEstimate: 3,
    impactEstimate: 3,
    sortOrder: 0,
    reconciliation: null,
    carryForwardCount: 0,
    flaggedStale: false,
    riskFlag: null,
    riskNote: null,
    riskFlaggedAt: null,
    ...overrides,
  };
}

describe("ChessGrid", () => {
  it("places low SP + high impact item in Quick Wins", () => {
    const items = [makeItem({ id: "1", title: "Quick Win", effortEstimate: 3, impactEstimate: 4 })];
    render(<ChessGrid items={items} />);
    expect(screen.getByText("Quick Win")).toBeInTheDocument();
  });

  it("places high SP + high impact item in Major Projects", () => {
    const items = [makeItem({ id: "2", title: "Major Proj", effortEstimate: 5, impactEstimate: 4 })];
    render(<ChessGrid items={items} />);
    expect(screen.getByText("Major Proj")).toBeInTheDocument();
  });

  it("places low SP + low impact item in Fill-Ins", () => {
    const items = [makeItem({ id: "3", title: "Fill In", effortEstimate: 2, impactEstimate: 2 })];
    render(<ChessGrid items={items} />);
    expect(screen.getByText("Fill In")).toBeInTheDocument();
  });

  it("places high SP + low impact item in Thankless Tasks", () => {
    const items = [makeItem({ id: "4", title: "Thankless", effortEstimate: 8, impactEstimate: 2 })];
    render(<ChessGrid items={items} />);
    expect(screen.getByText("Thankless")).toBeInTheDocument();
  });

  it("skips items without effort/impact estimates", () => {
    const items = [makeItem({ id: "5", title: "No Estimates", effortEstimate: null, impactEstimate: null })];
    render(<ChessGrid items={items} />);
    expect(screen.queryByText("No Estimates")).not.toBeInTheDocument();
  });
});
