import { getUserIdeas, getIdeaById, saveIdea } from "../services/ideaService.js";
import { analyzeIdea } from "../ai/analysisService.js";

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
    const { idea_text } = req.body;

    if (!idea_text) {
        return res.status(400).json({ error: "Idea is required" });
    }

    try {
        const analysis = await analyzeIdea(idea_text);
        const id = await saveIdea(req.user.id, idea_text, analysis);

        res.json({ id, ...analysis });
    } catch (err) {
        console.error("Analyze error:", err.message);
        res.status(500).json({ error: "Analysis failed: " + err.message });
    }
}