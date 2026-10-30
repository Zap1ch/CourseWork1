import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { getHistory, getIdea, analyze } from "../controllers/ideaController.js";

const router = express.Router();

// Усі маршрути захищені токеном
router.get("/ideas", authenticateToken, getHistory);
router.get("/idea/:id", authenticateToken, getIdea);
router.post("/analyze", authenticateToken, analyze);

export default router;