import { getUserIdeas, getIdeaById } from "../services/ideaService.js";

// GET /api/ideas — історія ідей поточного користувача
export async function getHistory(req, res) {
    try {
        // req.user з'явився завдяки authMiddleware
        const ideas = await getUserIdeas(req.user.id);
        res.json(ideas);
    } catch (err) {
        console.error("History error:", err.message);
        res.status(500).json({ error: "Database error" });
    }
}

// GET /api/idea/:id — одна ідея з повним аналізом
export async function getIdea(req, res) {
    try {
        // req.params.id — це число з адреси, наприклад /api/idea/5 -> "5"
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