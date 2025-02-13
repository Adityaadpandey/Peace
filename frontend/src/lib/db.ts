import { PrismaClient } from '@prisma/client';

interface GlobalPrisma {
  db?: PrismaClient;
}

const globalWithPrisma = global as typeof globalThis & GlobalPrisma;
const db = globalWithPrisma.db || new PrismaClient();

export {db};