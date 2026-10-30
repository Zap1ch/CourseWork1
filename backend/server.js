import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import path from "path";
import fs from "fs"; 
import { fileURLToPath } from "url";
import dotenv from "dotenv"; 
import { db } from "./db.js"; 

// --- LANGCHAIN ТА AI IMPORTS ---
import { ChatGoogleGenerativeAI } from "@langchain/google-genai"; 
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

// --- ІМПОРТ ЛОКАЛЬНОЇ МОДЕЛІ ---
import { pipeline } from '@xenova/transformers';

dotenv.config();

const app = express();
const PORT = 3000;
const SECRET = process.env.JWT_SECRET;

app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "../frontend")));

// ==========================================
// CUSTOM EMBEDDINGS CLASS
// ==========================================
class LocalEmbeddings {
    constructor() {
        this.pipe = null;
    }

    async init() {
        if (!this.pipe) {
            this.pipe = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
        }
    }

    async embedDocuments(texts) {
        await this.init();
        const embeddings = [];
        for (const text of texts) {
            const output = await this.pipe(text, { pooling: 'mean', normalize: true });
            embeddings.push(Array.from(output.data));
        }
        return embeddings;
    }

    async embedQuery(text) {
        await this.init();
        const output = await this.pipe(text, { pooling: 'mean', normalize: true });
        return Array.from(output.data);
    }
}

// ==========================================
// RAG СИСТЕМА
// ==========================================

let vectorStore = null; 
const embeddingsModel = new LocalEmbeddings();

const model = new ChatGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,
    modelName: "gemini-2.5-flash", 
    temperature: 0.6
});

async function initVectorStore() {
    try {
        console.log("[RAG] Сканую папку 'knowledge_base'...");
        
        // Шлях до папки knowledge_base
        const directoryPath = path.join(__dirname, "knowledge_base");
        
        // 1. Створюємо папку, якщо її немає
        if (!fs.existsSync(directoryPath)) {
            console.warn(`Папка ${directoryPath} не знайдена. Створюю її...`);
            fs.mkdirSync(directoryPath);
            console.log("Папка створена. Покладіть туди .txt файли (наприклад nabc_source.txt) і перезапустіть сервер.");
            return;
        }

        // 2. Читаємо всі файли .txt
        const files = fs.readdirSync(directoryPath);
        const allDocs = [];
        const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 200 });
        let loadedCount = 0;

        for (const file of files) {
            if (path.extname(file).toLowerCase() === '.txt') {
                const filePath = path.join(directoryPath, file);
                const text = fs.readFileSync(filePath, "utf8");
                
                const docs = await splitter.createDocuments([text]);
                allDocs.push(...docs);
                
                console.log(`Прочитано знання: ${file}`);
                loadedCount++;
            }
        }

        // 3. Генеруємо вектори
        if (allDocs.length > 0) {
            console.log(`[RAG] Генерація векторів для ${loadedCount} файлів...`);
            await embeddingsModel.init();
            vectorStore = await MemoryVectorStore.fromDocuments(allDocs, embeddingsModel);
            console.log(`[RAG] База знань готова! Фрагментів: ${allDocs.length}`);
        } else {
            console.warn("Папка 'knowledge_base' порожня. AI працюватиме, але без підказок.");
        }

    } catch (err) {
        console.error("[RAG] Критична помилка ініціалізації:", err);
    }
}

initVectorStore();

// ==========================================
// AUTH MIDDLEWARE
// ==========================================
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

// ==========================================
// ФУНКЦІЯ ОЧИЩЕННЯ (ВАЖЛИВО!)
// ==========================================
function cleanAIField(data) {
    if (!data) return "Не визначено";
    
    // Якщо масив -> рядок через кому
    if (Array.isArray(data)) return data.join(', ');
    
    // Якщо об'єкт -> рядок формату "Ключ: Значення"
    if (typeof data === 'object') {
        try {
            return Object.entries(data)
                .map(([key, val]) => {
                    // Робимо ключі красивими
                    const niceKey = key.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase());
                    // Якщо значення теж об'єкт (вкладеність), перетворюємо в JSON рядок
                    const niceVal = typeof val === 'object' ? JSON.stringify(val) : val;
                    return `${niceKey}: ${niceVal}`;
                })
                .join('\n'); // Кожен пункт з нового рядка
        } catch (e) {
            // Якщо щось пішло не так, просто перетворюємо в JSON рядок
            return JSON.stringify(data);
        }
    }
    
    // Якщо це вже рядок -> просто повертаємо
    return String(data);
}

// ==========================================
// ROUTES
// ==========================================

app.get("/", (req, res) => res.sendFile(path.join(__dirname, "../frontend/index.html")));

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

// === ГОЛОВНИЙ ROUTE АНАЛІЗУ ===
app.post("/api/analyze", authenticateToken, async (req, res) => {
    const { idea_text } = req.body;
    if (!idea_text) return res.status(400).json({ error: "Idea is required" });

    try {
        let contextInfo = "";
        if (vectorStore) {
            try {
                // Беремо 1 найкращий документ
                const results = await vectorStore.similaritySearch(idea_text, 3);
                contextInfo = results.map(doc => doc.pageContent).join("\n");
            } catch (e) { console.log("RAG search skipped"); }
        }

        const promptTemplate = ChatPromptTemplate.fromMessages([
 
       ["system", `Act as an expert consultant from SRI International using the NABC value proposition framework.
            
            Use the following KNOWLEDGE BASE (CONTEXT) to help your analysis:
            {context}
            
            Analyze the user's startup idea based on this context and the NABC framework.
            
            IMPORTANT: Respond in the SAME LANGUAGE as the startup idea.
            
            Return ONLY valid JSON with these 4 keys:
            
            - "need": (N) What is the specific customer need or market pain point?
            - "approach": (A) What is the unique approach or solution? (Technical & Business).
            - "benefit": (B) What are the specific benefits per costs for the user?
            - "competition": (C) Who are the competitors and alternatives? Why is this approach superior? (If missing, suggest potential ones based on context).`],
            
            ["user", "Startup Idea: {idea}"]
        ]);

        const chain = RunnableSequence.from([
            promptTemplate,
            model,
            new StringOutputParser()
        ]);

        console.log("AI думає...");
        const responseText = await chain.invoke({
            context: contextInfo,
            idea: idea_text
        });

        // 1. Очищення JSON
        const cleanJson = responseText.replace(/```json|```/g, '').trim();
        let analysis;
        try {
            analysis = JSON.parse(cleanJson);
        } catch (e) {
            console.error("JSON Error, saving raw text");
            analysis = { need: "Error", approach: responseText, benefit: "-", competition: "-" };
        }

        // 2. Підготовка значень (тут застосовуємо нашу магічну функцію cleanAIField)
        const needStr = cleanAIField(analysis.need);
        const approachStr = cleanAIField(analysis.approach);
        const benefitStr = cleanAIField(analysis.benefit);
        const competitionStr = cleanAIField(analysis.competition);

        // 3. Запис у БД
        const [insertRes] = await db.query(
            "INSERT INTO ideas (user_id, idea_text, need, approach, benefit, competition) VALUES (?, ?, ?, ?, ?, ?)",
            [req.user.id, idea_text, needStr, approachStr, benefitStr, competitionStr]
        );

        res.json({ id: insertRes.insertId, ...analysis });

    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ error: "Analysis failed: " + err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});