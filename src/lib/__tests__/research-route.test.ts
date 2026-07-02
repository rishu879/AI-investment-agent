import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/api/research/route";

const invokeMock = vi.fn();

vi.mock("@/langgraph/research-workflow", () => ({
  createResearchWorkflow: () => ({
    invoke: invokeMock,
  }),
}));

describe("research route", () => {
  beforeEach(() => {
    invokeMock.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns a fallback report when the workflow fails to produce one", async () => {
    invokeMock.mockResolvedValueOnce({});

    const request = new Request("http://localhost/api/research", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ticker: "AAPL" }),
    });

    const response = await POST(request as never);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.success).toBe(true);
    expect(payload.data.ticker).toBe("AAPL");
    expect(payload.data.recommendation.value).toBe("hold");
  });
});
