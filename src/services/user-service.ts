import { prisma } from "@/database/prisma";

export interface AppUser {
  id: string;
  email: string;
  name: string | null;
  password: string;
  plan: string;
  searchesRemaining: number;
}

export async function createUser(input: { email: string; passwordHash: string; name?: string | null }) {
  return prisma.user.create({
    data: {
      email: input.email,
      password: input.passwordHash,
      name: input.name,
      plan: "free",
      searchesRemaining: 6,
    },
  }) as Promise<AppUser>;
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: {
      email,
    },
  }) as Promise<AppUser | null>;
}

export async function findUserById(id: string) {
  return prisma.user.findUnique({
    where: {
      id,
    },
  }) as Promise<AppUser | null>;
}

export async function decrementSearches(userId: string) {
  const user = await findUserById(userId);
  if (!user) return null;
  if (user.plan !== "free") {
    return user;
  }
  const remaining = Math.max(0, user.searchesRemaining - 1);
  return prisma.user.update({
    where: { id: userId },
    data: { searchesRemaining: remaining },
  }) as Promise<AppUser>;
}

export async function subscribePlan(userId: string, plan: "week" | "month") {
  const searchesRemaining = plan === "week" ? 999 : 999;
  return prisma.user.update({
    where: { id: userId },
    data: {
      plan,
      searchesRemaining,
    },
  }) as Promise<AppUser>;
}
