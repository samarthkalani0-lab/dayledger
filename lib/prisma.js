import { PrismaClient } from "@prisma/client";

// One shared client, created on first use (so `next build` doesn't need a database),
// and reused across hot-reloads in development.
const g = globalThis;
function client() {
  if (!g.__prisma) g.__prisma = new PrismaClient();
  return g.__prisma;
}

export const prisma = new Proxy({}, { get: (_, prop) => client()[prop] });
