import { NextRequest } from "next/server";
import { badRequest, internalError, ok } from "@/lib/http";
import { authLoginSchema } from "@/lib/validation";
import { createJwt, verifyPassword } from "@/lib/auth";
import { findUserByEmail } from "@/services/user-service";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const parsed = authLoginSchema.safeParse(body);

  if (!parsed.success) {
    return badRequest("Invalid login request", parsed.error.flatten());
  }

  try {
    const user = await findUserByEmail(parsed.data.email.toLowerCase());
    if (!user || !user.password || !verifyPassword(parsed.data.password, user.password)) {
      return badRequest("Invalid email or password");
    }

    const token = createJwt({ sub: user.id, email: user.email });

    return ok({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name ?? "Investor",
        },
      },
    });
  } catch {
    return internalError("Unable to sign in. Please try again.");
  }
}
