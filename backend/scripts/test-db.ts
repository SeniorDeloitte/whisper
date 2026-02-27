import { ping } from "../src/config/database";

async function main() {
  try {
    const ok = await ping();
    if (ok) {
      console.log("✅ Conexión a Postgres OK");
      process.exit(0);
    } else {
      console.error("❌ Conexión a Postgres falló (ping regresó falso)");
      process.exit(1);
    }
  } catch (err) {
    console.error("❌ Error conectando a Postgres:", err);
    process.exit(1);
  }
}

main();
