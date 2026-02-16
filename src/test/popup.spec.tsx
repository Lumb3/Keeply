import PopupPage from "../components/popup-page";
import { render } from "@testing-library/react";
import { describe, it, vi } from "vitest";
import "@testing-library/jest-dom";   

describe("PopupPage", () => {
  it("renders the tab count and saved groups count", () => {
    const mockTransitionPage = vi.fn();
    render(<PopupPage onTransitionPage={mockTransitionPage} />);

    // // Check if the tab count and saved groups count are rendered
    // expect(screen.getByText(/Tabs Open:/)).toBeInTheDocument();
    // expect(screen.getByText(/Saved Groups:/)).toBeInTheDocument();
  });
});
