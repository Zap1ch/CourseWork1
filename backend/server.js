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

// 3. Налаштування AI (Gemini)
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

// --- АНАЛІЗ (AI) ---
app.post("/api/analyze", authenticateToken, async (req, res) => {
    const { idea_text } = req.body;
    if (!idea_text) return res.status(400).json({ error: "Idea is required" });

    try {
        // 4. Промт для AI
        const prompt = `
            Act as an expert Venture Capitalist. Analyze this startup idea: "${idea_text}"
            IMPORTANT: Respond in the same language as the startup idea. 
            (If the idea is in Ukrainian, respond in Ukrainian).
            
            Return ONLY valid JSON with these keys:
            - "need": What problem does it solve?
            - "solution": Technical solution summary.
            - "benefit": Key business value.
            - "competitors": List 3 competitors.
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Чистимо JSON від зайвих символів
        const cleanJson = responseText.replace(/```json|```/g, '').trim();
        const analysis = JSON.parse(cleanJson);

        // Зберігаємо в БД
        const competitorsStr = Array.isArray(analysis.competitors) 
            ? analysis.competitors.join(', ') 
            : analysis.competitors;

        // Зберігаємо в БД
        const [insertRes] = await db.query(
            "INSERT INTO ideas (user_id, idea_text, need, solution, benefit, competitors) VALUES (?, ?, ?, ?, ?, ?)",
            [req.user.id, idea_text, analysis.need, analysis.solution, analysis.benefit, competitorsStr]
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