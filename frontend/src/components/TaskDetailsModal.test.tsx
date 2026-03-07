import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../test/utils";
import { TaskDetailsModal } from "./TaskDetailsModal";
import type { CommitItem } from "../types";

const item: CommitItem = {
  id: "1",
  weeklyCommitId: "f0000000-0000-0000-0000-000000000001",
  outcomeId: "o1",
  outcomeTitle: "Guided setup wizard live",
  title: "Design wizard wireframes",
  description: "Create low-fi wireframes",
  chessCategory: "STRATEGIC",
  effortEstimate: 3,
  impactEstimate: 5,
  sortOrder: 0,
  reconciliation: null,
  carryForwardCount: 2,
  flaggedStale: false,
  riskFlag: "BLOCKED",
  riskNote: "Waiting on API",
  riskFlaggedAt: "2026-03-02T10:00:00Z",
};

describe("TaskDetailsModal", () => {
  it("renders task details", () => {
    renderWithProviders(
      <TaskDetailsModal item={item} commitStatus="LOCKED" onClose={() => {}} />
    );
    expect(screen.getByText("Design wizard wireframes")).toBeInTheDocument();
    expect(screen.getByText("Create low-fi wireframes")).toBeInTheDocument();
    expect(screen.getByText("STRATEGIC")).toBeInTheDocument();
    expect(screen.getByText("BLOCKED")).toBeInTheDocument();
    expect(screen.getByText("CF: 2/3")).toBeInTheDocument();
    expect(screen.getByText("Guided setup wizard live")).toBeInTheDocument();
    expect(screen.getByText("Waiting on API")).toBeInTheDocument();
  });

  it("closes on Escape key", async () => {
    const onClose = vi.fn();
    renderWithProviders(
      <TaskDetailsModal item={item} commitStatus="DRAFT" onClose={onClose} />
    );
    await userEvent.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("supports adding mock notes", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <TaskDetailsModal item={item} commitStatus="DRAFT" onClose={() => {}} />
    );
    const textarea = screen.getByPlaceholderText("Add a note...");
    await user.type(textarea, "My test note");
    await user.click(screen.getByText("Add"));
    expect(screen.getByText("My test note")).toBeInTheDocument();
  });

  it("renders audit timeline section", () => {
    renderWithProviders(
      <TaskDetailsModal item={item} commitStatus="DRAFT" onClose={() => {}} />
    );
    expect(screen.getByText("Audit History")).toBeInTheDocument();
  });

  it("shows file drop zone for attachments", () => {
    renderWithProviders(
      <TaskDetailsModal item={item} commitStatus="DRAFT" onClose={() => {}} />
    );
    expect(screen.getByText("Attachments")).toBeInTheDocument();
    expect(screen.getByText(/Drop files here/)).toBeInTheDocument();
  });
});
