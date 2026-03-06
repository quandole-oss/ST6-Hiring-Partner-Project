import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../test/utils";
import { CommitEditorPage } from "./CommitEditorPage";
import { Routes, Route } from "react-router-dom";
import { http, HttpResponse } from "msw";
import { server } from "../test/mocks/server";

describe("CommitEditorPage", () => {
  describe("selector mode (no ID)", () => {
    it("renders team dropdown", async () => {
      renderWithProviders(<CommitEditorPage />);
      await waitFor(() => {
        expect(screen.getByText("Platform Squad", { selector: "option" })).toBeInTheDocument();
      });
    });

    it("shows member dropdown after selecting team", async () => {
      const user = userEvent.setup();
      renderWithProviders(<CommitEditorPage />);
      await waitFor(() => expect(screen.getByText("Platform Squad", { selector: "option" })).toBeInTheDocument());

      await user.selectOptions(screen.getAllByRole("combobox")[0], "d0000000-0000-0000-0000-000000000001");
      await waitFor(() => {
        expect(screen.getByText("Alice Chen", { selector: "option" })).toBeInTheDocument();
      });
    });
  });

  describe("editor mode (with ID)", () => {
    it("renders commit details", async () => {
      renderWithProviders(
        <Routes>
          <Route path="/commits/:id" element={<CommitEditorPage />} />
        </Routes>,
        { initialEntries: ["/commits/f0000000-0000-0000-0000-000000000001"] }
      );

      await waitFor(() => {
        expect(screen.getByText(/Alice Chen/)).toBeInTheDocument();
        expect(screen.getByText("Design wizard wireframes")).toBeInTheDocument();
      });
    });

    it("shows edit/delete buttons for DRAFT items", async () => {
      renderWithProviders(
        <Routes>
          <Route path="/commits/:id" element={<CommitEditorPage />} />
        </Routes>,
        { initialEntries: ["/commits/f0000000-0000-0000-0000-000000000001"] }
      );

      await waitFor(() => {
        expect(screen.getAllByText("Edit").length).toBeGreaterThan(0);
        expect(screen.getAllByText("Delete").length).toBeGreaterThan(0);
      });
    });
  });

  describe("error state", () => {
    it("shows error when commit fetch fails", async () => {
      server.use(
        http.get("/api/v1/commits/:id", () => HttpResponse.json({ detail: "Not found" }, { status: 404 }))
      );

      renderWithProviders(
        <Routes>
          <Route path="/commits/:id" element={<CommitEditorPage />} />
        </Routes>,
        { initialEntries: ["/commits/00000000-0000-0000-0000-000000000099"] }
      );

      await waitFor(() => {
        expect(screen.getByText(/Not found/)).toBeInTheDocument();
      });
    });
  });
});
