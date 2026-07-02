import { NextRequest } from "next/server";
import { badRequest, internalError, ok } from "@/lib/http";
import { authSignupSchema } from "@/lib/validation";
import { hashPassword, createJwt } from "@/lib/auth";
import { createUser, findUserByEmail } from "@/services/user-service";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const parsed = authSignupSchema.safeParse(body);

  if (!parsed.success) {
    return badRequest("Invalid signup request", parsed.error.flatten());
  }

  try {
    const existing = await findUserByEmail(parsed.data.email.toLowerCase());
    if (existing) {
      return badRequest("A user with this email already exists.");
    }

    const passwordHash = hashPassword(parsed.data.password);
    const user = await createUser({
      name: parsed.data.name,
      email: parsed.data.email.toLowerCase(),
      passwordHash,
    });

    const token = createJwt({ sub: user.id, email: user.email });

    return ok({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
    });
  } catch (error) {
    return internalError("Unable to create account, please try again.");
  }
}
