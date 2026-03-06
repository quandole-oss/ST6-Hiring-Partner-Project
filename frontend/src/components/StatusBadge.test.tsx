import { render, screen } from "@testing-library/react";
import { StatusBadge } from "./StatusBadge";
import type { CommitStatus } from "../types";

describe("StatusBadge", () => {
  const statuses: CommitStatus[] = ["DRAFT", "LOCKED", "RECONCILING", "RECONCILED", "CARRY_FORWARD"];

  statuses.forEach((status) => {
    it(`renders ${status} text`, () => {
      render(<StatusBadge status={status} />);
      expect(screen.getByText(status.replace("_", " "))).toBeInTheDocument();
    });
  });
});
