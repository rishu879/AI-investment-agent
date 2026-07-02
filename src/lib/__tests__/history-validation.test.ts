import { describe, expect, it } from "vitest";
import { historyQuerySchema } from "../validation";

describe("historyQuerySchema", () => {
  it("uses defaults when page parameters are missing", () => {
    const parsed = historyQuerySchema.parse({});

    expect(parsed).toEqual({
      search: undefined,
      page: 1,
      pageSize: 8,
    });
  });
});
