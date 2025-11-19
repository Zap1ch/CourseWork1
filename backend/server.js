import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = 3000;
const SECRET = "my_secret_key";

app.use(cors());
app.use(express.json());

// --- Static frontend folder ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "../frontend")));

// --- Default page (login.html) ---
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/login.html"));
});

// Temporary "database"
let users = [];

// REGISTER
app.post("/api/register", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password)
        return res.json({ success: false, message: "Missing fields" });

    const exists = users.find(u => u.email === email);
    if (exists)
        return res.json({ success: false, message: "User already exists" });

    const hash = await bcrypt.hash(password, 10);

    users.push({ email, password: hash });

    return res.json({ success: true, message: "User created successfully" });
});

// LOGIN
app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;

    const user = users.find(u => u.email === email);
    if (!user)
        return res.json({ success: false, message: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
        return res.json({ success: false, message: "Invalid password" });

    const token = jwt.sign({ email }, SECRET, { expiresIn: "2h" });

    return res.json({
        success: true,
        message: "Login successful",
        token
    });
});

app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});
