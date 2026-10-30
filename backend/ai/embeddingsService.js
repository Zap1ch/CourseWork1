import { pipeline } from "@xenova/transformers";

// Локальна модель: текст -> вектор
const MODEL_NAME = "Xenova/all-MiniLM-L6-v2";

class LocalEmbeddings {
    constructor() {
        this.pipe = null;
    }

    // Завантаження моделі (один раз)
    async init() {
        if (!this.pipe) {
            this.pipe = await pipeline("feature-extraction", MODEL_NAME);
        }
    }

    // Вектори для фрагментів бази знань
    async embedDocuments(texts) {
        await this.init();
        const embeddings = [];
        for (const text of texts) {
            const output = await this.pipe(text, { pooling: "mean", normalize: true });
            embeddings.push(Array.from(output.data));
        }
        return embeddings;
    }

    // Вектор для запиту користувача
    async embedQuery(text) {
        await this.init();
        const output = await this.pipe(text, { pooling: "mean", normalize: true });
        return Array.from(output.data);
    }
}

export const embeddingsModel = new LocalEmbeddings();