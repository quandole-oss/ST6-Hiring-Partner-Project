import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../test/utils";
import { AISummaryPanel } from "./AISummaryPanel";

describe("AISummaryPanel", () => {
  it("renders generate button", () => {
    renderWithProviders(<AISummaryPanel teamId="d0000000-0000-0000-0000-000000000001" />);
    expect(screen.getByText("Generate Summary")).toBeInTheDocument();
    expect(screen.getByText("AI Summary")).toBeInTheDocument();
  });

  it("shows summary after clicking generate", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AISummaryPanel teamId="d0000000-0000-0000-0000-000000000001" teamName="Platform Squad" />);
    await user.click(screen.getByText("Generate Summary"));
    await waitFor(() => {
      expect(screen.getByText("Regenerate")).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});
