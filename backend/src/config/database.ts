import { prisma } from "./prisma";

export async function connectDB() {
  await prisma.$connect();
}
