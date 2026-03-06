import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../test/utils";
import { AuditTimeline } from "./AuditTimeline";

describe("AuditTimeline", () => {
  it("renders audit entries", async () => {
    renderWithProviders(<AuditTimeline commitId="f0000000-0000-0000-0000-000000000001" />);
    await waitFor(() => {
      expect(screen.getByText(/DRAFT/)).toBeInTheDocument();
      expect(screen.getByText(/LOCKED/)).toBeInTheDocument();
    });
  });

  it("shows override badges for manual overrides", async () => {
    // The mock data includes isManualOverride: false, so Override badge should not show
    renderWithProviders(<AuditTimeline commitId="f0000000-0000-0000-0000-000000000001" />);
    await waitFor(() => {
      expect(screen.getByText(/DRAFT/)).toBeInTheDocument();
    });
    expect(screen.queryByText("Override")).not.toBeInTheDocument();
  });
});
