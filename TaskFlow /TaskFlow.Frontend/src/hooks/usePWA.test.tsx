/**
 * usePWA Hook Tests - TaskFlow
 *
 * usePWA hook'u için unit testler.
 * PWA install prompt ve offline state testleri.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePWA } from "./usePWA";

// Mock Service Worker and Navigator APIs
const mockNavigator = {
  serviceWorker: {
    ready: Promise.resolve({
      installing: null,
      waiting: null,
      active: { state: "activated" },
    }),
    register: vi.fn().mockResolvedValue({}),
  },
  onLine: true,
};

Object.defineProperty(window, "navigator", {
  value: mockNavigator,
  writable: true,
});

describe("usePWA Hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset online status
    mockNavigator.onLine = true;
  });

  it("initializes with default PWA state", () => {
    const { result } = renderHook(() => usePWA());

    expect(result.current.isOnline).toBe(true);
    expect(result.current.canInstall).toBe(false);
    expect(result.current.isInstalled).toBe(false);
  });

  it("detects online/offline status", () => {
    const { result, rerender } = renderHook(() => usePWA());

    expect(result.current.isOnline).toBe(true);

    // Simulate going offline
    act(() => {
      mockNavigator.onLine = false;
      window.dispatchEvent(new Event("offline"));
    });

    rerender();
    expect(result.current.isOnline).toBe(false);

    // Simulate coming back online
    act(() => {
      mockNavigator.onLine = true;
      window.dispatchEvent(new Event("online"));
    });

    rerender();
    expect(result.current.isOnline).toBe(true);
  });

  it("handles install prompt availability", () => {
    const { result } = renderHook(() => usePWA());

    expect(result.current.canInstall).toBe(false);

    // Simulate beforeinstallprompt event
    const mockEvent = {
      preventDefault: vi.fn(),
      prompt: vi.fn().mockResolvedValue({ outcome: "accepted" }),
    };

    act(() => {
      window.dispatchEvent(
        Object.assign(new Event("beforeinstallprompt"), mockEvent)
      );
    });

    expect(result.current.canInstall).toBe(true);
  });

  it("triggers install prompt when installApp is called", async () => {
    const { result } = renderHook(() => usePWA());

    const mockEvent = {
      preventDefault: vi.fn(),
      prompt: vi.fn().mockResolvedValue({ outcome: "accepted" }),
    };

    // First set up the install prompt
    act(() => {
      window.dispatchEvent(
        Object.assign(new Event("beforeinstallprompt"), mockEvent)
      );
    });

    expect(result.current.canInstall).toBe(true);

    // Then trigger install
    await act(async () => {
      await result.current.installApp();
    });

    expect(mockEvent.prompt).toHaveBeenCalled();
  });

  it("detects when app is installed", () => {
    const { result, rerender } = renderHook(() => usePWA());

    expect(result.current.isInstalled).toBe(false);

    // Simulate app install
    act(() => {
      window.dispatchEvent(new Event("appinstalled"));
    });

    rerender();
    expect(result.current.isInstalled).toBe(true);
    expect(result.current.canInstall).toBe(false);
  });

  it("provides installation statistics", () => {
    const { result } = renderHook(() => usePWA());

    expect(result.current.installPromptShown).toBe(false);
    expect(result.current.installationResult).toBeNull();

    // Show install prompt
    const mockEvent = {
      preventDefault: vi.fn(),
      prompt: vi.fn().mockResolvedValue({ outcome: "accepted" }),
    };

    act(() => {
      window.dispatchEvent(
        Object.assign(new Event("beforeinstallprompt"), mockEvent)
      );
    });

    expect(result.current.installPromptShown).toBe(true);
  });

  it("handles Service Worker registration", async () => {
    const { result } = renderHook(() => usePWA());

    expect(result.current.swRegistration).toBeNull();

    // Simulate service worker registration
    await act(async () => {
      if (result.current.registerSW) {
        await result.current.registerSW();
      }
    });

    expect(mockNavigator.serviceWorker.register).toHaveBeenCalled();
  });

  it("provides update check functionality", async () => {
    const { result } = renderHook(() => usePWA());

    const updateAvailable = result.current.updateAvailable;
    const checkForUpdates = result.current.checkForUpdates;

    expect(updateAvailable).toBe(false);
    expect(typeof checkForUpdates).toBe("function");
  });

  it("handles PWA display mode detection", () => {
    const { result } = renderHook(() => usePWA());

    // Test standalone mode detection
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: query.includes("standalone"),
        addListener: vi.fn(),
        removeListener: vi.fn(),
      })),
    });

    const { result: standaloneResult } = renderHook(() => usePWA());
    expect(standaloneResult.current.isStandalone).toBe(true);
  });

  it("provides PWA capabilities information", () => {
    const { result } = renderHook(() => usePWA());

    expect(result.current.isPWASupported).toBeDefined();
    expect(typeof result.current.isPWASupported).toBe("boolean");
  });
});
