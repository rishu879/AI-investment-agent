import { POST as handleResearch } from "@/api/research/route";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return handleResearch(request as never);
}