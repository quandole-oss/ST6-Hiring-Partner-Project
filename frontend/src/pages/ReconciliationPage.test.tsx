import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../test/utils";
import { ReconciliationPage } from "./ReconciliationPage";
import { Routes, Route } from "react-router-dom";
import { http, HttpResponse } from "msw";
import { server } from "../test/mocks/server";

describe("ReconciliationPage", () => {
  it("renders planned items and reconciliation entries", async () => {
    renderWithProviders(
      <Routes>
        <Route path="/commits/:id/reconcile" element={<ReconciliationPage />} />
      </Routes>,
      { initialEntries: ["/commits/f0000000-0000-0000-0000-000000000001/reconcile"] }
    );

    await waitFor(() => {
      expect(screen.getByText("Planned Items")).toBeInTheDocument();
      expect(screen.getByText("Actual Completion")).toBeInTheDocument();
      expect(screen.getAllByText("Design wizard wireframes").length).toBeGreaterThanOrEqual(1);
    });
  });

  it("shows Begin Reconciliation when LOCKED", async () => {
    server.use(
      http.get("/api/v1/commits/:id", () =>
        HttpResponse.json({
          id: "f0000000-0000-0000-0000-000000000001",
          teamMemberId: "e0000000-0000-0000-0000-000000000001",
          teamMemberName: "Alice Chen",
          weekStart: "2026-03-02",
          status: "LOCKED",
          lockedAt: "2026-03-02T10:00:00Z",
          reconciledAt: null,
          items: [],
        })
      )
    );

    renderWithProviders(
      <Routes>
        <Route path="/commits/:id/reconcile" element={<ReconciliationPage />} />
      </Routes>,
      { initialEntries: ["/commits/f0000000-0000-0000-0000-000000000001/reconcile"] }
    );

    await waitFor(() => {
      expect(screen.getByText("Begin Reconciliation")).toBeInTheDocument();
    });
  });

  it("hides Begin Reconciliation when DRAFT", async () => {
    renderWithProviders(
      <Routes>
        <Route path="/commits/:id/reconcile" element={<ReconciliationPage />} />
      </Routes>,
      { initialEntries: ["/commits/f0000000-0000-0000-0000-000000000001/reconcile"] }
    );

    await waitFor(() => {
      expect(screen.getByText(/Alice Chen/)).toBeInTheDocument();
    });
    expect(screen.queryByText("Begin Reconciliation")).not.toBeInTheDocument();
  });
});
