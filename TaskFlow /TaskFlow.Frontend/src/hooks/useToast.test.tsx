/**
 * useToast Hook Tests - TaskFlow
 *
 * useToast hook'u için unit testler.
 * Toast gösterimi, gizleme ve state management testleri.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useToast } from "./useToast";

// Mock Timer functions for testing
beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useToast Hook", () => {
  it("initializes with empty toasts array", () => {
    const { result } = renderHook(() => useToast());

    expect(result.current.toasts).toEqual([]);
  });

  it("adds a toast when showToast is called", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast("Test mesajı", "success");
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0]).toMatchObject({
      message: "Test mesajı",
      type: "success",
    });
    expect(result.current.toasts[0]).toHaveProperty("id");
  });

  it("generates unique IDs for different toasts", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast("İlk mesaj", "info");
      result.current.showToast("İkinci mesaj", "warning");
    });

    expect(result.current.toasts).toHaveLength(2);
    expect(result.current.toasts[0].id).not.toBe(result.current.toasts[1].id);
  });

  it("supports different toast types", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast("Success mesajı", "success");
      result.current.showToast("Error mesajı", "error");
      result.current.showToast("Info mesajı", "info");
      result.current.showToast("Warning mesajı", "warning");
    });

    expect(result.current.toasts).toHaveLength(4);
    expect(result.current.toasts[0].type).toBe("success");
    expect(result.current.toasts[1].type).toBe("error");
    expect(result.current.toasts[2].type).toBe("info");
    expect(result.current.toasts[3].type).toBe("warning");
  });

  it("removes toast by ID when hideToast is called", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast("İlk mesaj", "success");
      result.current.showToast("İkinci mesaj", "error");
    });

    const firstToastId = result.current.toasts[0].id;

    act(() => {
      result.current.hideToast(firstToastId);
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].message).toBe("İkinci mesaj");
  });

  it("auto-hides toast after timeout", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast("Auto-hide mesajı", "info", 3000);
    });

    expect(result.current.toasts).toHaveLength(1);

    // Fast-forward timer
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.toasts).toHaveLength(0);
  });

  it("uses default timeout when not specified", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast("Default timeout", "success");
    });

    expect(result.current.toasts).toHaveLength(1);

    // Default timeout is usually 5000ms
    act(() => {
      vi.advanceTimersByTime(4999);
    });

    expect(result.current.toasts).toHaveLength(1);

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(result.current.toasts).toHaveLength(0);
  });

  it("does not auto-hide when timeout is 0", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast("Persistent mesaj", "warning", 0);
    });

    expect(result.current.toasts).toHaveLength(1);

    // Wait much longer than normal timeout
    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(result.current.toasts).toHaveLength(1);
  });

  it("handles multiple toasts with different timeouts", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast("Kısa süre", "info", 1000);
      result.current.showToast("Orta süre", "success", 3000);
      result.current.showToast("Uzun süre", "warning", 5000);
    });

    expect(result.current.toasts).toHaveLength(3);

    // After 1 second, first toast should be gone
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.toasts).toHaveLength(2);
    expect(
      result.current.toasts.find((t) => t.message === "Kısa süre")
    ).toBeUndefined();

    // After 3 seconds total, second toast should be gone
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].message).toBe("Uzun süre");

    // After 5 seconds total, all toasts should be gone
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.toasts).toHaveLength(0);
  });

  it("clears all toasts when clearToasts is called", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast("İlk mesaj", "success");
      result.current.showToast("İkinci mesaj", "error");
      result.current.showToast("Üçüncü mesaj", "info");
    });

    expect(result.current.toasts).toHaveLength(3);

    act(() => {
      result.current.clearToasts();
    });

    expect(result.current.toasts).toHaveLength(0);
  });

  it("prevents memory leaks by clearing timeouts on unmount", () => {
    const clearTimeoutSpy = vi.spyOn(global, "clearTimeout");
    const { result, unmount } = renderHook(() => useToast());

    act(() => {
      result.current.showToast("Test mesajı", "success", 5000);
    });

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
  });

  it("provides convenient methods for different toast types", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      if (result.current.success) {
        result.current.success("Success mesajı");
      }
      if (result.current.error) {
        result.current.error("Error mesajı");
      }
      if (result.current.info) {
        result.current.info("Info mesajı");
      }
      if (result.current.warning) {
        result.current.warning("Warning mesajı");
      }
    });

    expect(result.current.toasts).toHaveLength(4);
    expect(result.current.toasts.map((t) => t.type)).toEqual([
      "success",
      "error",
      "info",
      "warning",
    ]);
  });
});
