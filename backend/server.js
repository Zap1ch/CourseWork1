import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai"; 
import { db } from "./db.js"; 

dotenv.config();

const app = express();
const PORT = 3000;
const SECRET = process.env.JWT_SECRET;

// Налаштування AI (Gemini 2.5 Flash)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

app.use(cors());
app.use(express.json());

// Статичні файли (фронтенд)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "../frontend")));

// --- MIDDLEWARE (Захист маршрутів) ---
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// --- МАРШРУТИ ---

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// Реєстрація
app.post("/api/register", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: "Missing fields" });

    try {
        const [existing] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
        if (existing.length > 0) return res.status(400).json({ success: false, message: "User exists" });

        const hash = await bcrypt.hash(password, 10);
        await db.query("INSERT INTO users (email, password_hash) VALUES (?, ?)", [email, hash]);
        
        res.json({ success: true, message: "User created" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// Логін
app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
        if (rows.length === 0) return res.status(400).json({ success: false, message: "User not found" });

        const user = rows[0];
        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) return res.status(400).json({ success: false, message: "Invalid password" });

        const token = jwt.sign({ id: user.id, email: user.email }, SECRET, { expiresIn: "2h" });
        res.json({ success: true, token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// Отримати всі ідеї (Історія)
app.get("/api/ideas", authenticateToken, async (req, res) => {
    try {
        const [rows] = await db.query("SELECT id, idea_text, created_at FROM ideas WHERE user_id = ? ORDER BY created_at DESC", [req.user.id]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: "Database error" });
    }
});

// Отримати одну ідею
app.get("/api/idea/:id", authenticateToken, async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM ideas WHERE id = ? AND user_id = ?", [req.params.id, req.user.id]);
        if (rows.length === 0) return res.status(404).json({ error: "Not found" });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Database error" });
    }
});

// --- АНАЛІЗ (NABC Methodology - SRI International) ---
app.post("/api/analyze", authenticateToken, async (req, res) => {
    const { idea_text } = req.body;
    if (!idea_text) return res.status(400).json({ error: "Idea is required" });

    try {
        // 1. Оновлений ПРОМТ за методологією NABC
        const prompt = `
            Act as an expert consultant from SRI International using the NABC value proposition framework.
            
            Analyze the following startup idea (The Document):
            "${idea_text}"
            
            Based on this document, answer the 4 fundamental NABC questions.
            IMPORTANT: Respond in the SAME LANGUAGE as the startup idea.
            
            Return ONLY valid JSON with these 4 keys:
            
            - "need": (N) What is the specific customer need or market pain point?
            - "approach": (A) What is the unique approach or solution? (Technical & Business).
            - "benefit": (B) What are the specific benefits per costs for the user?
            - "competition": (C) Who are the competitors and alternatives? Why is this approach superior?
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // 2. Чистимо JSON від зайвих символів
        const cleanJson = responseText.replace(/```json|```/g, '').trim();
        const analysis = JSON.parse(cleanJson);

        // 3. Обробляємо список конкурентів (тепер це поле competition)
        const competitionStr = Array.isArray(analysis.competition) 
            ? analysis.competition.join(', ') 
            : analysis.competition;

        // 4. Зберігаємо в БД (Нові назви колонок: approach, competition)
        const [insertRes] = await db.query(
            "INSERT INTO ideas (user_id, idea_text, need, approach, benefit, competition) VALUES (?, ?, ?, ?, ?, ?)",
            [req.user.id, idea_text, analysis.need, analysis.approach, analysis.benefit, competitionStr]
        );

        res.json({ id: insertRes.insertId, ...analysis });

    } catch (err) {
        console.error("AI Error:", err);
        res.status(500).json({ error: "Failed to analyze idea" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});