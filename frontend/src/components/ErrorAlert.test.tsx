import { render, screen } from "@testing-library/react";
import { ErrorAlert } from "./ErrorAlert";

describe("ErrorAlert", () => {
  it("renders message", () => {
    render(<ErrorAlert message="Something broke" />);
    expect(screen.getByText("Something broke")).toBeInTheDocument();
  });

  it("renders nothing when null", () => {
    const { container } = render(<ErrorAlert message={null} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when undefined", () => {
    const { container } = render(<ErrorAlert message={undefined} />);
    expect(container.firstChild).toBeNull();
  });
});
