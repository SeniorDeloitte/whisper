import app from "./src/app";
import { connectDB } from "./src/config/database";

// Port number for the server to listen on
const PORT = Number(process.env.PORT) || 3000;

// Connect to the database and start the server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on PORT ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Error conectando a la base de datos:", err);
    process.exit(1);
  });
