import { getUserIdeas, getIdeaById, saveIdea } from "../services/ideaService.js";
import { analyzeIdea } from "../ai/analysisService.js";

const MIN_IDEA_LENGTH = 20;
const MAX_IDEA_LENGTH = 2000;

// GET /api/ideas — історія ідей користувача
export async function getHistory(req, res) {
    try {
        const ideas = await getUserIdeas(req.user.id);
        res.json(ideas);
    } catch (err) {
        console.error("History error:", err.message);
        res.status(500).json({ error: "Database error" });
    }
}

// GET /api/idea/:id — одна ідея з аналізом
export async function getIdea(req, res) {
    try {
        const idea = await getIdeaById(req.params.id, req.user.id);

        if (!idea) {
            return res.status(404).json({ error: "Not found" });
        }

        res.json(idea);
    } catch (err) {
        console.error("Get idea error:", err.message);
        res.status(500).json({ error: "Database error" });
    }
}

// POST /api/analyze — аналіз нової ідеї
export async function analyze(req, res) {
    const { idea_text } = req.body || {};

    if (typeof idea_text !== "string" || idea_text.trim() === "") {
        return res.status(400).json({ error: "Idea is required" });
    }

    const ideaText = idea_text.trim();

    if (ideaText.length < MIN_IDEA_LENGTH) {
        return res.status(400).json({ error: "Idea is too short. Describe it in at least 20 characters." });
    }

    if (ideaText.length > MAX_IDEA_LENGTH) {
        return res.status(400).json({ error: "Idea is too long. Maximum is 2000 characters." });
    }

    try {
        const analysis = await analyzeIdea(ideaText);
        const id = await saveIdea(req.user.id, ideaText, analysis);

        res.json({ id, ...analysis });
    } catch (err) {
        // Деталі помилки лишаються в терміналі сервера
        console.error("Analyze error:", err.message);
        res.status(500).json({ error: "Analysis failed. Please try again later." });
    }
}
