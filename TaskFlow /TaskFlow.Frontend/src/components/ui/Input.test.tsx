/**
 * Input Component Tests - TaskFlow
 *
 * Input component'i için unit testler.
 * Form validation, accessibility ve user interaction testleri.
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Input from "./Input";

describe("Input Component", () => {
  it("renders input with label", () => {
    render(<Input label="E-posta Adresi" />);

    const label = screen.getByText("E-posta Adresi");
    const input = screen.getByRole("textbox");

    expect(label).toBeInTheDocument();
    expect(input).toBeInTheDocument();
  });

  it("renders input without label", () => {
    render(<Input placeholder="Placeholder metni" />);

    const input = screen.getByPlaceholderText("Placeholder metni");
    expect(input).toBeInTheDocument();
    expect(screen.queryByText("Label")).not.toBeInTheDocument();
  });

  it("handles value changes", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<Input label="Test Input" onChange={handleChange} />);

    const input = screen.getByRole("textbox");
    await user.type(input, "test değeri");

    expect(handleChange).toHaveBeenCalled();
    expect(input).toHaveValue("test değeri");
  });

  it("shows validation error", () => {
    render(<Input label="Test Input" error="Bu alan zorunludur" />);

    const errorMessage = screen.getByText("Bu alan zorunludur");
    const input = screen.getByRole("textbox");

    expect(errorMessage).toBeInTheDocument();
    expect(input).toHaveClass("border-red-300");
  });

  it("applies disabled state correctly", () => {
    render(<Input label="Disabled Input" disabled />);

    const input = screen.getByRole("textbox");
    expect(input).toBeDisabled();
  });

  it("renders different input types", () => {
    const { rerender } = render(<Input label="Email" type="email" />);

    let input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("type", "email");

    rerender(<Input label="Password" type="password" />);
    input = screen.getByLabelText("Password");
    expect(input).toHaveAttribute("type", "password");

    rerender(<Input label="Number" type="number" />);
    input = screen.getByRole("spinbutton");
    expect(input).toHaveAttribute("type", "number");
  });

  it("shows placeholder text", () => {
    render(<Input label="Search" placeholder="Arama yapın..." />);

    const input = screen.getByPlaceholderText("Arama yapın...");
    expect(input).toBeInTheDocument();
  });

  it("handles required attribute", () => {
    render(<Input label="Required Field" required />);

    const input = screen.getByRole("textbox");
    expect(input).toBeRequired();
  });

  it("renders with icon", () => {
    const icon = <span data-testid="search-icon">🔍</span>;

    render(<Input label="Search" icon={icon} />);

    const iconElement = screen.getByTestId("search-icon");
    const input = screen.getByRole("textbox");

    expect(iconElement).toBeInTheDocument();
    expect(input).toHaveClass("pl-10"); // Icon varsa left padding
  });

  it("supports controlled input", () => {
    const handleChange = vi.fn();
    const { rerender } = render(
      <Input
        label="Controlled"
        value="başlangıç değeri"
        onChange={handleChange}
      />
    );

    const input = screen.getByRole("textbox");
    expect(input).toHaveValue("başlangıç değeri");

    rerender(
      <Input
        label="Controlled"
        value="güncellenmiş değer"
        onChange={handleChange}
      />
    );

    expect(input).toHaveValue("güncellenmiş değer");
  });

  it("handles focus and blur events", async () => {
    const user = userEvent.setup();
    const handleFocus = vi.fn();
    const handleBlur = vi.fn();

    render(
      <Input label="Focus Test" onFocus={handleFocus} onBlur={handleBlur} />
    );

    const input = screen.getByRole("textbox");

    await user.click(input);
    expect(handleFocus).toHaveBeenCalled();

    await user.tab(); // blur the input
    expect(handleBlur).toHaveBeenCalled();
  });

  it("supports custom className", () => {
    render(<Input label="Custom" className="custom-input-class" />);

    const input = screen.getByRole("textbox");
    expect(input).toHaveClass("custom-input-class");
  });

  it("shows password toggle button", async () => {
    const user = userEvent.setup();

    render(<Input label="Password" type="password" showPasswordToggle />);

    const input = screen.getByLabelText("Password");
    const toggleButton = screen.getByRole("button");

    expect(input).toHaveAttribute("type", "password");
    expect(toggleButton).toBeInTheDocument();
    expect(input).toHaveClass("pr-10"); // Toggle button varsa right padding

    // Password toggle tıklama
    await user.click(toggleButton);
    expect(input).toHaveAttribute("type", "text");

    // Tekrar tıklama
    await user.click(toggleButton);
    expect(input).toHaveAttribute("type", "password");
  });

  it("applies focus styles correctly", async () => {
    const user = userEvent.setup();

    render(<Input label="Focus Styles" />);

    const input = screen.getByRole("textbox");

    await user.click(input);
    expect(input).toHaveClass(
      "ring-2",
      "ring-primary-500",
      "border-transparent"
    );
  });

  it("handles error state styling", () => {
    render(<Input label="Error Input" error="Hata mesajı" />);

    const input = screen.getByRole("textbox");
    expect(input).toHaveClass("border-red-300", "focus:ring-red-500");
  });

  it("has proper accessibility attributes", () => {
    render(<Input label="Accessible Input" required id="test-input" />);

    const input = screen.getByRole("textbox");
    const label = screen.getByText("Accessible Input");

    expect(input).toBeRequired();
    expect(input).toHaveAttribute("id", "test-input");
    expect(label).toBeInTheDocument();
  });

  it("handles maxLength attribute", () => {
    render(<Input label="Limited Input" maxLength={10} />);

    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("maxLength", "10");
  });

  it("passes through all HTML input attributes", () => {
    render(
      <Input
        label="Full Input"
        name="test-name"
        data-testid="custom-input"
        autoComplete="email"
        autoFocus
      />
    );

    const input = screen.getByTestId("custom-input");
    expect(input).toHaveAttribute("name", "test-name");
    expect(input).toHaveAttribute("autoComplete", "email");
    expect(input).toHaveFocus();
  });

  it("combines icon and password toggle correctly", () => {
    const icon = <span data-testid="email-icon">📧</span>;

    render(
      <Input
        label="Password with Icon"
        type="password"
        icon={icon}
        showPasswordToggle
      />
    );

    const input = screen.getByLabelText("Password with Icon");
    const iconElement = screen.getByTestId("email-icon");
    const toggleButton = screen.getByRole("button");

    expect(iconElement).toBeInTheDocument();
    expect(toggleButton).toBeInTheDocument();
    expect(input).toHaveClass("pl-10", "pr-10"); // Hem sol hem sağ padding
  });
});
