import express from "express";
import cors from "cors";
import { config } from "./config/env.js";
import authRoutes from "./routes/authRoutes.js";
import ideaRoutes from "./routes/ideaRoutes.js";
import { initVectorStore } from "./ai/ragService.js";

const app = express();

app.use(cors());
app.use(express.json());

// Перевірка, що сервер працює
app.get("/", (req, res) => res.send("Startup Validator API is running"));

// Маршрути API
app.use("/api", authRoutes);
app.use("/api", ideaRoutes);

// Спочатку база знань, потім запуск сервера
await initVectorStore();

app.listen(config.port, () => {
    console.log(`Server running on http://localhost:${config.port}`);
});