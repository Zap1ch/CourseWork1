import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import path from "path";
import fs from "fs"; // Для читання файлу
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { db } from "./db.js";

// LANGCHAIN IMPORTS (RAG та Вектори)
import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { Document } from "@langchain/core/documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";

dotenv.config();

const app = express();
const PORT = 3000;
const SECRET = process.env.JWT_SECRET;

app.use(cors());
app.use(express.json());

// Статичні файли (Frontend)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "../frontend")));

// RAG СИСТЕМА (Векторна База Знань)
let vectorStore;

// Функція для створення бази знань при старті
async function initVectorStore() {
    try {
        console.log("Завантаження бази знань (NABC Methodology)...");
        
        // 1. Читаємо файл зі статтею (переконайся, що nabc_source.txt існує!)
        const filePath = path.join(__dirname, "nabc_source.txt");
        if (!fs.existsSync(filePath)) {
            console.error("Файл nabc_source.txt не знайдено! RAG не працюватиме.");
            return;
        }
        const text = fs.readFileSync(filePath, "utf8");

        // 2. Створюємо документ
        const docs = [new Document({ pageContent: text })];

        // 3. Налаштовуємо модель для ембедінгів (перетворення тексту в цифри)
        const embeddings = new GoogleGenerativeAIEmbeddings({
            apiKey: process.env.GEMINI_API_KEY,
            modelName: "embedding-001", 
        });

        // 4. Зберігаємо у вектори (в пам'ять сервера)
        vectorStore = await MemoryVectorStore.fromDocuments(docs, embeddings);
        
        console.log("Векторна база знань успішно створена і готова до роботи!");
    } catch (err) {
        console.error("Помилка ініціалізації RAG:", err);
    }
}

// Запускаємо створення бази
initVectorStore();

// Налаштування основної чат-моделі (для генерації відповідей)
const model = new ChatGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,
    modelName: "gemini-2.5-flash", 
    temperature: 0.7
});

// MIDDLEWARE & ROUTES

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

app.get("/", (req, res) => res.sendFile(path.join(__dirname, "../frontend/index.html")));

// Auth (Register/Login)
app.post("/api/register", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: "Missing fields" });
    try {
        const [existing] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
        if (existing.length > 0) return res.status(400).json({ success: false, message: "User exists" });
        const hash = await bcrypt.hash(password, 10);
        await db.query("INSERT INTO users (email, password_hash) VALUES (?, ?)", [email, hash]);
        res.json({ success: true, message: "User created" });
    } catch (err) { res.status(500).json({ success: false, message: "Server error" }); }
});

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
    } catch (err) { res.status(500).json({ success: false, message: "Server error" }); }
});

// History Routes
app.get("/api/ideas", authenticateToken, async (req, res) => {
    try {
        const [rows] = await db.query("SELECT id, idea_text, created_at FROM ideas WHERE user_id = ? ORDER BY created_at DESC", [req.user.id]);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: "Database error" }); }
});

app.get("/api/idea/:id", authenticateToken, async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM ideas WHERE id = ? AND user_id = ?", [req.params.id, req.user.id]);
        if (rows.length === 0) return res.status(404).json({ error: "Not found" });
        res.json(rows[0]);
    } catch (err) { res.status(500).json({ error: "Database error" }); }
});

// RAG-ANALYSIS ROUTE (Основна логіка)
app.post("/api/analyze", authenticateToken, async (req, res) => {
    const { idea_text } = req.body;
    if (!idea_text) return res.status(400).json({ error: "Idea is required" });

    try {
        // КРОК 1: Пошук контексту (Retrieval)
        let contextInfo = "";
        if (vectorStore) {
            // Шукаємо топ-2 найбільш релевантні шматки тексту для запиту "NABC methodology definitions"
            const results = await vectorStore.similaritySearch("NABC methodology definitions needs approach benefit competition", 2);
            // Об'єднуємо знайдене в один рядок
            contextInfo = results.map(doc => doc.pageContent).join("\n\n");
            console.log("🔍 RAG: Контекст знайдено і додано до промта.");
        } else {
            console.warn("⚠️ RAG: Векторна база не готова, працюю без контексту.");
        }

        // КРОК 2: Створення ланцюжка (Chain)
        const promptTemplate = ChatPromptTemplate.fromMessages([
            ["system", `You are an expert consultant from SRI International. 
            
            Use the following CONTEXT (Knowledge Base) to understand the NABC methodology:
            ---------------------
            {context}
            ---------------------
            
            Analyze the user's startup idea based STRICTLY on the definitions from the context above.
            
            IMPORTANT: Respond in the SAME LANGUAGE as the startup idea (Ukrainian if Ukrainian).
            
            Return ONLY valid JSON with these 4 keys:
            - "need": (N) What is the customer need?
            - "approach": (A) What is the unique approach?
            - "benefit": (B) What are the benefits per costs?
            - "competition": (C) Who are the competitors?
            `],
            ["user", "Startup Idea: {idea}"]
        ]);

        const chain = RunnableSequence.from([
            promptTemplate,
            model,
            new StringOutputParser()
        ]);

        // КРОК 3: Виконання (Generation)
        const responseText = await chain.invoke({
            context: contextInfo, // Передаємо знайдений текст
            idea: idea_text       // Передаємо ідею юзера
        });

        // КРОК 4: Обробка та збереження
        const cleanJson = responseText.replace(/```json|```/g, '').trim();
        const analysis = JSON.parse(cleanJson);

        const competitionStr = Array.isArray(analysis.competition) 
            ? analysis.competition.join(', ') 
            : analysis.competition;

        const [insertRes] = await db.query(
            "INSERT INTO ideas (user_id, idea_text, need, approach, benefit, competition) VALUES (?, ?, ?, ?, ?, ?)",
            [req.user.id, idea_text, analysis.need, analysis.approach, analysis.benefit, competitionStr]
        );

        res.json({ id: insertRes.insertId, ...analysis });

    } catch (err) {
        console.error("AI/RAG Error:", err);
        res.status(500).json({ error: "Failed to analyze idea" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});