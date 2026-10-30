import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { embeddingsModel } from "./embeddingsService.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const KNOWLEDGE_DIR = path.join(__dirname, "..", "knowledge_base");

// Векторне сховище (в оперативній пам'яті)
let vectorStore = null;

// Завантаження бази знань: читання -> розбиття -> вектори
export async function initVectorStore() {
    try {
        console.log("[RAG] Сканую папку 'knowledge_base'...");

        if (!fs.existsSync(KNOWLEDGE_DIR)) {
            console.warn("[RAG] Папку knowledge_base не знайдено, створюю порожню");
            fs.mkdirSync(KNOWLEDGE_DIR);
            return;
        }

        const files = fs.readdirSync(KNOWLEDGE_DIR);
        const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 200 });
        const allDocs = [];

        for (const file of files) {
            if (path.extname(file).toLowerCase() === ".txt") {
                const text = fs.readFileSync(path.join(KNOWLEDGE_DIR, file), "utf8");
                const docs = await splitter.createDocuments([text]);
                allDocs.push(...docs);
                console.log(`[RAG] Прочитано: ${file}`);
            }
        }

        if (allDocs.length === 0) {
            console.warn("[RAG] База знань порожня, AI працюватиме без контексту");
            return;
        }

        vectorStore = await MemoryVectorStore.fromDocuments(allDocs, embeddingsModel);
        console.log(`[RAG] База знань готова. Фрагментів: ${allDocs.length}`);
    } catch (err) {
        console.error("[RAG] Помилка ініціалізації:", err.message);
    }
}

// Пошук найближчих фрагментів до запиту
export async function searchContext(query, count = 3) {
    if (!vectorStore) return "";

    try {
        const results = await vectorStore.similaritySearch(query, count);
        return results.map(doc => doc.pageContent).join("\n");
    } catch (err) {
        console.error("[RAG] Помилка пошуку:", err.message);
        return "";
    }
}