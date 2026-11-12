import { registerUser, loginUser } from "../services/authService.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

// Чи є значення непорожнім рядком
function isFilled(value) {
    return typeof value === "string" && value.trim() !== "";
}

// POST /api/register
export async function register(req, res) {
    const { email, password } = req.body || {};

    if (!isFilled(email) || !isFilled(password)) {
        return res.status(400).json({ success: false, message: "Missing fields" });
    }

    const cleanEmail = email.trim().toLowerCase();

    if (!EMAIL_PATTERN.test(cleanEmail) || cleanEmail.length > 255) {
        return res.status(400).json({ success: false, message: "Invalid email format" });
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
        return res.status(400).json({ success: false, message: "Password should be at least 6 characters" });
    }

    try {
        const result = await registerUser(cleanEmail, password);

        if (!result.success) {
            return res.status(400).json(result);
        }

        res.json(result);
    } catch (err) {
        console.error("Register error:", err.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
}

// POST /api/login
export async function login(req, res) {
    const { email, password } = req.body || {};

    if (!isFilled(email) || !isFilled(password)) {
        return res.status(400).json({ success: false, message: "Missing fields" });
    }

    try {
        const result = await loginUser(email.trim().toLowerCase(), password);

        if (!result.success) {
            return res.status(400).json(result);
        }

        res.json(result);
    } catch (err) {
        console.error("Login error:", err.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
}
