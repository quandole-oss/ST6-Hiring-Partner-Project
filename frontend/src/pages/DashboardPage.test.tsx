import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../test/utils";
import { DashboardPage } from "./DashboardPage";
import { Routes, Route } from "react-router-dom";
import { http, HttpResponse } from "msw";
import { server } from "../test/mocks/server";

describe("DashboardPage", () => {
  describe("team selector (no teamId)", () => {
    it("renders team dropdown", async () => {
      renderWithProviders(<DashboardPage />);
      await waitFor(() => {
        expect(screen.getByText("Platform Squad", { selector: "option" })).toBeInTheDocument();
      });
    });
  });

  describe("dashboard view (with teamId)", () => {
    it("renders team data", async () => {
      renderWithProviders(
        <Routes>
          <Route path="/dashboard/:teamId" element={<DashboardPage />} />
        </Routes>,
        { initialEntries: ["/dashboard/d0000000-0000-0000-0000-000000000001"] }
      );

      await waitFor(() => {
        expect(screen.getByText("Platform Squad")).toBeInTheDocument();
        expect(screen.getByText("Alice Chen")).toBeInTheDocument();
      });
    });

    it("shows alignment metrics", async () => {
      renderWithProviders(
        <Routes>
          <Route path="/dashboard/:teamId" element={<DashboardPage />} />
        </Routes>,
        { initialEntries: ["/dashboard/d0000000-0000-0000-0000-000000000001"] }
      );

      await waitFor(() => {
        expect(screen.getAllByText("Alignment").length).toBeGreaterThan(0);
        expect(screen.getByText("Total Items")).toBeInTheDocument();
      });
    });

    it("shows story point metrics", async () => {
      renderWithProviders(
        <Routes>
          <Route path="/dashboard/:teamId" element={<DashboardPage />} />
        </Routes>,
        { initialEntries: ["/dashboard/d0000000-0000-0000-0000-000000000001"] }
      );

      await waitFor(() => {
        expect(screen.getByText("Total SP")).toBeInTheDocument();
        expect(screen.getByText("Completed SP")).toBeInTheDocument();
      });
    });

    it("shows blocked and at risk columns", async () => {
      renderWithProviders(
        <Routes>
          <Route path="/dashboard/:teamId" element={<DashboardPage />} />
        </Routes>,
        { initialEntries: ["/dashboard/d0000000-0000-0000-0000-000000000001"] }
      );

      await waitFor(() => {
        expect(screen.getByText("Blocked")).toBeInTheDocument();
        expect(screen.getByText("At Risk")).toBeInTheDocument();
      });
    });
  });

  describe("error state", () => {
    it("shows error when dashboard fetch fails", async () => {
      server.use(
        http.get("/api/v1/dashboard/team/:id", () => HttpResponse.json({ detail: "Server error" }, { status: 500 }))
      );

      renderWithProviders(
        <Routes>
          <Route path="/dashboard/:teamId" element={<DashboardPage />} />
        </Routes>,
        { initialEntries: ["/dashboard/d0000000-0000-0000-0000-000000000001"] }
      );

      await waitFor(() => {
        expect(screen.getByText(/Server error/)).toBeInTheDocument();
      });
    });
  });
});
