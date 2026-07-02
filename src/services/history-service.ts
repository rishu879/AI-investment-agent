import { prisma } from "@/database/prisma";

export const historyService = {
  async list(options?: { search?: string; page?: number; pageSize?: number; userId?: string }) {
    const search = options?.search?.trim();
    const page = options?.page ?? 1;
    const pageSize = options?.pageSize ?? 8;

    const where = {
      ...(options?.userId ? { userId: options.userId } : {}),
      ...(search
        ? {
            OR: [
              { ticker: { contains: search, mode: "insensitive" } },
              { companyName: { contains: search, mode: "insensitive" } },
              { recommendation: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const total = await prisma.historyEntry.count({ where });
    const entries = await prisma.historyEntry.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return { entries, total };
  },
  async create(input: { ticker: string; companyName: string; recommendation: string; score: number; userId?: string }) {
    return prisma.historyEntry.create({ data: input });
  },
  async remove(id: string) {
    return prisma.historyEntry.delete({ where: { id } });
  },
};
