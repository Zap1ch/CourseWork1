import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { getHistory, getIdea } from "../controllers/ideaController.js";

const router = express.Router();

// Усі маршрути тут захищені: спочатку authenticateToken перевіряє токен, і лише потім викликається контролер
router.get("/ideas", authenticateToken, getHistory);
router.get("/idea/:id", authenticateToken, getIdea);

export default router;