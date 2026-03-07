import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../test/utils";
import { StatusChangeModal } from "./StatusChangeModal";

describe("StatusChangeModal", () => {
  const defaultProps = {
    commitId: "c1",
    fromStatus: "DRAFT" as const,
    toStatus: "LOCKED" as const,
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
    isPending: false,
  };

  it("renders status transition", () => {
    renderWithProviders(<StatusChangeModal {...defaultProps} />);
    expect(screen.getByText(/DRAFT/)).toBeInTheDocument();
    expect(screen.getByText(/LOCKED/)).toBeInTheDocument();
  });

  it("disables confirm when notes are too short", () => {
    renderWithProviders(<StatusChangeModal {...defaultProps} />);
    expect(screen.getByText("Confirm")).toBeDisabled();
  });

  it("enables confirm when notes have 10+ chars", async () => {
    const user = userEvent.setup();
    renderWithProviders(<StatusChangeModal {...defaultProps} />);
    const textarea = screen.getByPlaceholderText(/Explain why/);
    await user.type(textarea, "This is enough text");
    expect(screen.getByText("Confirm")).toBeEnabled();
  });

  it("shows warning for non-standard transition", () => {
    renderWithProviders(
      <StatusChangeModal {...defaultProps} fromStatus="RECONCILED" toStatus="DRAFT" />
    );
    expect(screen.getByText(/non-standard transition/)).toBeInTheDocument();
  });

  it("does not show warning for standard transition", () => {
    renderWithProviders(<StatusChangeModal {...defaultProps} />);
    expect(screen.queryByText(/non-standard transition/)).not.toBeInTheDocument();
  });

  it("calls onConfirm with notes", async () => {
    const onConfirm = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(<StatusChangeModal {...defaultProps} onConfirm={onConfirm} />);
    await user.type(screen.getByPlaceholderText(/Explain why/), "Valid justification notes");
    await user.click(screen.getByText("Confirm"));
    expect(onConfirm).toHaveBeenCalledWith("Valid justification notes");
  });

  it("calls onCancel", async () => {
    const onCancel = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(<StatusChangeModal {...defaultProps} onCancel={onCancel} />);
    await user.click(screen.getByText("Cancel"));
    expect(onCancel).toHaveBeenCalledOnce();
  });
});
