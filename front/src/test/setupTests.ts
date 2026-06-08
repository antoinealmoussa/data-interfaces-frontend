import "@testing-library/jest-dom";
import { afterEach, beforeEach } from "vitest";
import { cleanup } from "@testing-library/react";

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
