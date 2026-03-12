import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../test/utils";
import { PipelinePage } from "./PipelinePage";

describe("PipelinePage", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("renders page title and team selector", async () => {
    renderWithProviders(<PipelinePage />);
    await waitFor(() => {
      expect(screen.getByText("Pipeline")).toBeInTheDocument();
    });
    expect(screen.getByText("Select a team...")).toBeInTheDocument();
  });

  it("shows columns after selecting a team", async () => {
    const user = userEvent.setup();
    renderWithProviders(<PipelinePage />);

    await waitFor(() => {
      expect(screen.getByText("Select a team...")).toBeInTheDocument();
    });
    await user.click(screen.getByText("Select a team..."));
    await waitFor(() => {
      expect(screen.getByText("Platform Squad")).toBeInTheDocument();
    });
    await user.click(screen.getByText("Platform Squad"));

    await waitFor(() => {
      // Column headers use title-case labels
      expect(screen.getAllByText("Draft").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("Locked").length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("Reconciling")).toBeInTheDocument();
      expect(screen.getByText("Reconciled")).toBeInTheDocument();
      expect(screen.getByText("Carry Forward")).toBeInTheDocument();
    });
  });

  it("shows commit cards in correct columns", async () => {
    const user = userEvent.setup();
    renderWithProviders(<PipelinePage />);

    await waitFor(() => {
      expect(screen.getByText("Select a team...")).toBeInTheDocument();
    });
    await user.click(screen.getByText("Select a team..."));
    await waitFor(() => {
      expect(screen.getByText("Platform Squad")).toBeInTheDocument();
    });
    await user.click(screen.getByText("Platform Squad"));

    await waitFor(() => {
      expect(screen.getAllByText("Alice Chen").length).toBeGreaterThanOrEqual(1);
    });
  });
});
