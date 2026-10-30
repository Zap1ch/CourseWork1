import jwt from "jsonwebtoken";
import { config } from "../config/env.js";

// Перевіряє JWT-токен із заголовка "Authorization: Bearer <токен>"
export function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    // Токена немає -> 401 (не авторизований)
    if (!token) return res.sendStatus(401);

    jwt.verify(token, config.jwtSecret, (err, user) => {
        // Токен підроблений або прострочений -> 403 (доступ заборонено)
        if (err) return res.sendStatus(403);

        // Токен правильний -> запам'ятовуємо користувача і пропускаємо запит далі
        req.user = user;
        next();
    });
}