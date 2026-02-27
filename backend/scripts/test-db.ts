import "dotenv/config";
import { connectDB } from "../src/config/database";

async function main() {
  try {
    console.log("⏳ Conectando a la base de datos con Prisma...");
    await connectDB();
    console.log("✅ Conexión a Prisma exitosa.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error conectando a la base de datos:", err);
    process.exit(1);
  }
}

main();
