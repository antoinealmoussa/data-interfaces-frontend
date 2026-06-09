import "@testing-library/jest-dom";
import { afterEach, beforeEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

vi.mock("axios", () => {
  const mockAxios: Record<string, unknown> = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
    request: vi.fn(),
    create: vi.fn(() => mockAxios),
    defaults: { withCredentials: false },
    interceptors: {
      request: { use: vi.fn(), eject: vi.fn() },
      response: { use: vi.fn(), eject: vi.fn() },
    },
  };
  return { default: mockAxios };
});

const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeEach(() => {
  console.error = (...args: any[]) => {
    const msg = typeof args[0] === "string" ? args[0] : "";
    if (msg.includes("not wrapped in act")) {
      return;
    }
    originalConsoleError.call(console, ...args);
  };

  console.warn = (...args: any[]) => {
    const msg = typeof args[0] === "string" ? args[0] : "";
    if (msg.includes("No routes matched location")) {
      return;
    }
    originalConsoleWarn.call(console, ...args);
  };
});

afterEach(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
  cleanup();
});
