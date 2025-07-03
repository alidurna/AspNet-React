/**
 * Card Component Tests - TaskFlow
 *
 * Card component'i için unit testler.
 * Layout, accessibility ve content rendering testleri.
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Card from "./Card";

describe("Card Component", () => {
  it("renders card with content", () => {
    render(
      <Card>
        <h2>Card Başlığı</h2>
        <p>Card içeriği burada yer alır.</p>
      </Card>
    );

    expect(screen.getByText("Card Başlığı")).toBeInTheDocument();
    expect(
      screen.getByText("Card içeriği burada yer alır.")
    ).toBeInTheDocument();
  });

  it("applies basic card styles", () => {
    const { container } = render(<Card>Test Content</Card>);

    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass(
      "bg-white",
      "rounded-xl",
      "border",
      "border-gray-200"
    );
  });

  it("supports custom className", () => {
    const { container } = render(
      <Card className="custom-class">Test Content</Card>
    );

    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass("custom-class");
    // Temel card stilleri korunmalı
    expect(card).toHaveClass("bg-white", "rounded-xl");
  });

  it("renders with different padding sizes", () => {
    const { rerender } = render(<Card padding="sm">Small Padding</Card>);

    let container = screen.getByText("Small Padding").parentElement;
    expect(container).toHaveClass("p-4");

    rerender(<Card padding="md">Medium Padding</Card>);
    container = screen.getByText("Medium Padding").parentElement;
    expect(container).toHaveClass("p-6");

    rerender(<Card padding="lg">Large Padding</Card>);
    container = screen.getByText("Large Padding").parentElement;
    expect(container).toHaveClass("p-8");
  });

  it("renders with different shadow sizes", () => {
    const { rerender } = render(<Card shadow="sm">Small Shadow</Card>);

    let container = screen.getByText("Small Shadow").parentElement;
    expect(container).toHaveClass("shadow-sm");

    rerender(<Card shadow="md">Medium Shadow</Card>);
    container = screen.getByText("Medium Shadow").parentElement;
    expect(container).toHaveClass("shadow-md");

    rerender(<Card shadow="lg">Large Shadow</Card>);
    container = screen.getByText("Large Shadow").parentElement;
    expect(container).toHaveClass("shadow-lg");
  });

  it("applies hover effect when enabled", () => {
    render(<Card hover>Hover Card</Card>);

    const container = screen.getByText("Hover Card").parentElement;
    expect(container).toHaveClass(
      "hover:shadow-md",
      "transition-shadow",
      "duration-200"
    );
  });

  it("does not apply hover effect by default", () => {
    render(<Card>Normal Card</Card>);

    const container = screen.getByText("Normal Card").parentElement;
    expect(container).not.toHaveClass("hover:shadow-md");
  });

  it("handles multiple children", () => {
    render(
      <Card>
        <div data-testid="child-1">Birinci çocuk</div>
        <div data-testid="child-2">İkinci çocuk</div>
        <div data-testid="child-3">Üçüncü çocuk</div>
      </Card>
    );

    expect(screen.getByTestId("child-1")).toBeInTheDocument();
    expect(screen.getByTestId("child-2")).toBeInTheDocument();
    expect(screen.getByTestId("child-3")).toBeInTheDocument();
  });

  it("supports complex nested content", () => {
    render(
      <Card>
        <header>
          <h1>Başlık</h1>
          <p>Alt başlık</p>
        </header>
        <main>
          <section>
            <h2>İçerik Bölümü</h2>
            <p>Ana içerik metni.</p>
          </section>
        </main>
        <footer>
          <button>Aksiyon</button>
        </footer>
      </Card>
    );

    expect(screen.getByText("Başlık")).toBeInTheDocument();
    expect(screen.getByText("Alt başlık")).toBeInTheDocument();
    expect(screen.getByText("İçerik Bölümü")).toBeInTheDocument();
    expect(screen.getByText("Ana içerik metni.")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /aksiyon/i })
    ).toBeInTheDocument();
  });

  it("maintains accessibility with proper structure", () => {
    render(
      <Card>
        <h2>Erişilebilir Başlık</h2>
        <p>Bu card erişilebilir bir yapıya sahiptir.</p>
        <button>Etkileşim Butonu</button>
      </Card>
    );

    // Başlık elements doğru hierarchy'de
    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading).toHaveTextContent("Erişilebilir Başlık");

    // Button erişilebilir
    const button = screen.getByRole("button", { name: /etkileşim butonu/i });
    expect(button).toBeInTheDocument();
  });

  it("combines padding, shadow and hover properties", () => {
    render(
      <Card padding="lg" shadow="lg" hover>
        Full Featured Card
      </Card>
    );

    const container = screen.getByText("Full Featured Card").parentElement;
    expect(container).toHaveClass("p-8", "shadow-lg", "hover:shadow-md");
  });

  it("applies default values correctly", () => {
    render(<Card>Default Card</Card>);

    const container = screen.getByText("Default Card").parentElement;
    // Default padding="md", shadow="sm", hover=false
    expect(container).toHaveClass("p-6", "shadow-sm");
    expect(container).not.toHaveClass("hover:shadow-md");
  });
});
