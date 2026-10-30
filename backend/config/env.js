import dotenv from "dotenv";

// Читаємо змінні з файлу .env у process.env
dotenv.config();

// Змінні, без яких сервер не може працювати
const requiredVars = ["DB_HOST", "DB_USER", "DB_NAME", "JWT_SECRET", "GEMINI_API_KEY"];

for (const name of requiredVars) {
    if (!process.env[name]) {
        console.error(`Помилка: у файлі .env немає змінної ${name}`);
        process.exit(1);
    }
}

// Усі налаштування в одному об'єкті
export const config = {
    port: process.env.PORT || 3000,
    jwtSecret: process.env.JWT_SECRET,
    geminiApiKey: process.env.GEMINI_API_KEY,
    db: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    }
};