import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../config/db.js";
import { config } from "../config/env.js";

// Реєстрація нового користувача
export async function registerUser(email, password) {
    // Перевіряємо, чи немає вже такого email
    const [existing] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length > 0) {
        return { success: false, message: "User exists" };
    }

    // Зберігаємо не сам пароль, а його хеш
    const hash = await bcrypt.hash(password, 10);
    await db.query("INSERT INTO users (email, password_hash) VALUES (?, ?)", [email, hash]);

    return { success: true, message: "User created" };
}

// Вхід користувача: перевіряємо пароль і видаємо JWT-токен
export async function loginUser(email, password) {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (rows.length === 0) {
        return { success: false, message: "User not found" };
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
        return { success: false, message: "Invalid password" };
    }

    const token = jwt.sign({ id: user.id, email: user.email }, config.jwtSecret, { expiresIn: "2h" });
    return { success: true, token };
}