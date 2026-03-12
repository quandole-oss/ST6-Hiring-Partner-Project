import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FibonacciSelector } from "./FibonacciSelector";

describe("FibonacciSelector", () => {
  it("renders all 6 Fibonacci values", () => {
    render(<FibonacciSelector value={null} onChange={() => {}} />);
    for (const v of [1, 2, 3, 5, 8, 13]) {
      expect(screen.getByText(String(v))).toBeInTheDocument();
    }
  });

  it("highlights the selected value", () => {
    render(<FibonacciSelector value={5} onChange={() => {}} />);
    const btn = screen.getByText("5");
    expect(btn.className).toContain("text-white");
  });

  it("fires onChange with clicked value", async () => {
    const onChange = vi.fn();
    render(<FibonacciSelector value={null} onChange={onChange} />);
    await userEvent.click(screen.getByText("8"));
    expect(onChange).toHaveBeenCalledWith(8);
  });

  it("disables all buttons when disabled", () => {
    render(<FibonacciSelector value={3} onChange={() => {}} disabled />);
    const buttons = screen.getAllByRole("button");
    buttons.forEach((btn) => expect(btn).toBeDisabled());
  });
});
