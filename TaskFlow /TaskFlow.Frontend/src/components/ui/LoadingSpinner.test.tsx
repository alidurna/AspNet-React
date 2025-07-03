/**
 * LoadingSpinner Component Tests - TaskFlow
 *
 * LoadingSpinner component'i için unit testler.
 * Visibility, accessibility ve loading state testleri.
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import LoadingSpinner from "./LoadingSpinner";

describe("LoadingSpinner Component", () => {
  it("renders loading spinner", () => {
    render(<LoadingSpinner />);

    const spinner = screen.getByTestId("loading-spinner");
    expect(spinner).toBeInTheDocument();
  });

  it("shows default loading text", () => {
    render(<LoadingSpinner />);

    const loadingText = screen.getByText("Yükleniyor...");
    expect(loadingText).toBeInTheDocument();
  });

  it("shows custom loading text", () => {
    render(<LoadingSpinner text="Veriler getiriliyor..." />);

    const loadingText = screen.getByText("Veriler getiriliyor...");
    expect(loadingText).toBeInTheDocument();
  });

  it("renders with different sizes", () => {
    const { rerender } = render(<LoadingSpinner size="sm" />);

    let spinner = screen.getByTestId("loading-spinner");
    expect(spinner).toHaveClass("w-4", "h-4");

    rerender(<LoadingSpinner size="md" />);
    spinner = screen.getByTestId("loading-spinner");
    expect(spinner).toHaveClass("w-8", "h-8");

    rerender(<LoadingSpinner size="lg" />);
    spinner = screen.getByTestId("loading-spinner");
    expect(spinner).toHaveClass("w-12", "h-12");
  });

  it("applies custom className", () => {
    render(<LoadingSpinner className="custom-spinner" />);

    const container = screen.getByTestId("loading-spinner").parentElement;
    expect(container).toHaveClass("custom-spinner");
  });

  it("renders without text when not provided", () => {
    const { container } = render(<LoadingSpinner />);

    const spinner = container.querySelector("svg");
    expect(spinner).toBeInTheDocument();
    expect(screen.queryByText("Yükleniyor...")).not.toBeInTheDocument();
  });

  it("has proper accessibility attributes", () => {
    render(<LoadingSpinner />);

    const spinner = screen.getByTestId("loading-spinner");
    expect(spinner).toHaveAttribute("role", "status");
    expect(spinner).toHaveAttribute("aria-label", "Yükleniyor");
  });

  it("applies spinning animation", () => {
    render(<LoadingSpinner />);

    const spinner = screen.getByTestId("loading-spinner");
    expect(spinner).toHaveClass("animate-spin");
  });

  it("centers content when fullPage is true", () => {
    render(<LoadingSpinner fullPage />);

    const container = screen.getByTestId("loading-spinner").parentElement;
    expect(container).toHaveClass(
      "fixed",
      "inset-0",
      "flex",
      "items-center",
      "justify-center"
    );
  });

  it("renders inline when fullPage is false", () => {
    render(<LoadingSpinner fullPage={false} />);

    const container = screen.getByTestId("loading-spinner").parentElement;
    expect(container).toHaveClass("flex", "items-center", "justify-center");
    expect(container).not.toHaveClass("fixed", "inset-0");
  });

  it("shows overlay background in fullPage mode", () => {
    render(<LoadingSpinner fullPage />);

    const container = screen.getByTestId("loading-spinner").parentElement;
    expect(container).toHaveClass("bg-white", "bg-opacity-80");
  });

  it("renders different color variants", () => {
    const { rerender } = render(<LoadingSpinner color="primary" />);

    let spinner = screen.getByTestId("loading-spinner");
    expect(spinner).toHaveClass("text-primary-600");

    rerender(<LoadingSpinner color="secondary" />);
    spinner = screen.getByTestId("loading-spinner");
    expect(spinner).toHaveClass("text-secondary-600");

    rerender(<LoadingSpinner color="success" />);
    spinner = screen.getByTestId("loading-spinner");
    expect(spinner).toHaveClass("text-green-600");
  });

  it("combines all props correctly", () => {
    render(
      <LoadingSpinner
        size="lg"
        color="primary"
        text="Büyük yükleme..."
        fullPage
        className="custom-loading"
      />
    );

    const spinner = screen.getByTestId("loading-spinner");
    const container = spinner.parentElement;
    const text = screen.getByText("Büyük yükleme...");

    expect(spinner).toHaveClass(
      "w-12",
      "h-12",
      "text-primary-600",
      "animate-spin"
    );
    expect(container).toHaveClass("custom-loading", "fixed", "inset-0");
    expect(text).toBeInTheDocument();
  });

  it("renders with minimal configuration", () => {
    render(<LoadingSpinner />);

    const spinner = screen.getByTestId("loading-spinner");
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass("animate-spin");
    expect(screen.getByText("Yükleniyor...")).toBeInTheDocument();
  });
});
