import { render, screen } from "@testing-library/react";
import { StatusBadge } from "./StatusBadge";
import type { CommitStatus } from "../types";

describe("StatusBadge", () => {
  const statusLabels: Record<CommitStatus, string> = {
    DRAFT: "Draft",
    LOCKED: "Locked",
    RECONCILING: "Reconciling",
    RECONCILED: "Reconciled",
    CARRY_FORWARD: "Carry Forward",
  };

  (Object.entries(statusLabels) as [CommitStatus, string][]).forEach(([status, label]) => {
    it(`renders ${status} text`, () => {
      render(<StatusBadge status={status} />);
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });
});
