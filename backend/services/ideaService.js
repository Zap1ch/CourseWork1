import { db } from "../config/db.js";

// Список ідей користувача для сторінки історії (без результатів аналізу)
export async function getUserIdeas(userId) {
    const [rows] = await db.query(
        "SELECT id, idea_text, created_at FROM ideas WHERE user_id = ? ORDER BY created_at DESC",
        [userId]
    );
    return rows;
}

// Одна ідея з повним аналізом.
// Шукаємо і за id ідеї, і за user_id, щоб не можна було відкрити чужу ідею
export async function getIdeaById(ideaId, userId) {
    const [rows] = await db.query(
        "SELECT * FROM ideas WHERE id = ? AND user_id = ?",
        [ideaId, userId]
    );

    if (rows.length === 0) return null;
    return rows[0];
}

// Зберігаємо ідею і результат аналізу, повертаємо id нового запису
export async function saveIdea(userId, ideaText, analysis) {
    const [result] = await db.query(
        "INSERT INTO ideas (user_id, idea_text, need, approach, benefit, competition) VALUES (?, ?, ?, ?, ?, ?)",
        [userId, ideaText, analysis.need, analysis.approach, analysis.benefit, analysis.competition]
    );
    return result.insertId;
}