import { describe, expect, it } from "vitest";
import { sanitizeText, createRateLimiter } from "../security";

describe("security helpers", () => {
  it("sanitizes html-like characters", () => {
    expect(sanitizeText("<script>alert(1)</script>")).toBe("scriptalert(1)/script");
  });

  it("limits repeated requests per key", () => {
    const limiter = createRateLimiter(2, 60_000);
    expect(limiter.allow("user-1")).toBe(true);
    expect(limiter.allow("user-1")).toBe(true);
    expect(limiter.allow("user-1")).toBe(false);
  });
});
