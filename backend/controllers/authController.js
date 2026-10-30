import { registerUser, loginUser } from "../services/authService.js";

// POST /api/register
export async function register(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Missing fields" });
    }

    try {
        const result = await registerUser(email, password);

        // Сервіс сказав "ні" (наприклад, такий email уже є) -> 400
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
    const { email, password } = req.body;

    try {
        const result = await loginUser(email, password);

        // Неправильний email або пароль -> 400
        if (!result.success) {
            return res.status(400).json(result);
        }

        res.json(result);
    } catch (err) {
        console.error("Login error:", err.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
}