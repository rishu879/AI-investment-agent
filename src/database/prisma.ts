import { env } from "@/config/env";
import { logError } from "@/lib/logger";

interface PrismaLike {
  $connect: () => Promise<void>;
  $disconnect: () => Promise<void>;
  $queryRaw: (...args: unknown[]) => Promise<unknown>;
  company: {
    upsert: (...args: unknown[]) => Promise<unknown>;
    create: (...args: unknown[]) => Promise<unknown>;
    findMany: (...args: unknown[]) => Promise<unknown[]>;
    count: (...args: unknown[]) => Promise<number>;
    delete: (...args: unknown[]) => Promise<unknown>;
  };
  researchReport: {
    create: (...args: unknown[]) => Promise<unknown>;
  };
  historyEntry: {
    count: (...args: unknown[]) => Promise<number>;
    findMany: (...args: unknown[]) => Promise<unknown[]>;
    create: (...args: unknown[]) => Promise<unknown>;
    delete: (...args: unknown[]) => Promise<unknown>;
  };
  user: {
    create: (...args: unknown[]) => Promise<unknown>;
    findUnique: (...args: unknown[]) => Promise<unknown>;
    update: (...args: unknown[]) => Promise<unknown>;
  };
}

type PrismaClientConstructor = new (options?: { datasourceUrl?: string }) => PrismaLike;

class PrismaClientStub implements PrismaLike {
  $connect = async () => undefined;
  $disconnect = async () => undefined;
  $queryRaw = async () => [];
  company = {
    upsert: async (args: unknown) => args,
    create: async (args: unknown) => args,
    findMany: async () => [],
    count: async () => 0,
    delete: async (args: unknown) => args,
  };
  researchReport = {
    create: async (args: unknown) => args,
  };
  historyEntry = {
    count: async () => 0,
    findMany: async () => [],
    create: async (args: unknown) => args,
    delete: async (args: unknown) => args,
  };
  user = {
    create: async (args: unknown) => args,
    findUnique: async (args: unknown) => args,    update: async (args: unknown) => args,  };
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaLike };

const createPrismaClient = (): PrismaLike => {
  try {
    const prismaModule = require("@prisma/client") as { PrismaClient?: PrismaClientConstructor };
    const PrismaClientCtor = prismaModule.PrismaClient;

    if (PrismaClientCtor) {
      return new PrismaClientCtor({ datasourceUrl: env.DATABASE_URL });
    }
  } catch (error) {
    logError("Using Prisma fallback client", { error });
  }

  return new PrismaClientStub();
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

void prisma.$connect().catch((error) => {
  logError("Prisma connection failed", { error });
});
