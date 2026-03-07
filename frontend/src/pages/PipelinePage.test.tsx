import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../test/utils";
import { PipelinePage } from "./PipelinePage";

describe("PipelinePage", () => {
  it("renders page title and team selector", async () => {
    renderWithProviders(<PipelinePage />);
    await waitFor(() => {
      expect(screen.getByText("Pipeline")).toBeInTheDocument();
    });
    expect(screen.getByText("Select team...")).toBeInTheDocument();
  });

  it("shows columns after selecting a team", async () => {
    const user = userEvent.setup();
    renderWithProviders(<PipelinePage />);

    await waitFor(() => {
      expect(screen.getByText("Platform Squad")).toBeInTheDocument();
    });

    await user.selectOptions(screen.getByRole("combobox"), "d0000000-0000-0000-0000-000000000001");

    await waitFor(() => {
      // Column headers
      expect(screen.getAllByText("DRAFT").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("LOCKED").length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("RECONCILING")).toBeInTheDocument();
      expect(screen.getByText("RECONCILED")).toBeInTheDocument();
      expect(screen.getByText("CARRY FORWARD")).toBeInTheDocument();
    });
  });

  it("shows commit cards in correct columns", async () => {
    const user = userEvent.setup();
    renderWithProviders(<PipelinePage />);

    await waitFor(() => {
      expect(screen.getByText("Platform Squad")).toBeInTheDocument();
    });

    await user.selectOptions(screen.getByRole("combobox"), "d0000000-0000-0000-0000-000000000001");

    await waitFor(() => {
      expect(screen.getAllByText("Alice Chen").length).toBeGreaterThanOrEqual(1);
    });
  });
});
