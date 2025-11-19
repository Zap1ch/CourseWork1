/* ---------------------- Login ---------------------- */
const loginForm = document.getElementById("loginForm");
if (loginForm) {
    loginForm.onsubmit = async (e) => {
        e.preventDefault();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

        try {
            const res = await fetch("http://localhost:3000/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();

            if (data.token) {
                localStorage.setItem("token", data.token);
                location.href = "main.html";
            } else {
                document.getElementById("message").textContent = data.error || "Login failed";
            }
        } catch (err) {
            document.getElementById("message").textContent = "Error connecting to server";
        }
    };
}

/* ---------------------- Register ---------------------- */
const registerForm = document.getElementById("registerForm");
if (registerForm) {
    registerForm.onsubmit = async (e) => {
        e.preventDefault();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();
        const confirmPassword = document.getElementById("confirmPassword").value.trim();

        if (password !== confirmPassword) {
            document.getElementById("message").textContent = "Passwords do not match";
            return;
        }

        try {
            const res = await fetch("http://localhost:3000/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (data.success) {
                document.getElementById("message").textContent = "Registration successful! Redirecting...";
                setTimeout(() => location.href = "login.html", 1000);
            } else {
                document.getElementById("message").textContent = data.message || "Registration failed";
            }
        } catch (err) {
            document.getElementById("message").textContent = "Error connecting to server";
        }
    };
}


/* ---------------------- Main Page ---------------------- */
const token = localStorage.getItem("token");
if (token && document.getElementById("ideasList")) {

    // Logout
    const logoutBtn = document.getElementById("logout");
    logoutBtn.onclick = () => {
        localStorage.removeItem("token");
        location.href = "login.html";
    };

    // Load all ideas
    async function loadIdeas() {
        try {
            const res = await fetch("http://localhost:3000/api/ideas", {
                headers: { "Authorization": "Bearer " + token }
            });
            const data = await res.json();

            const list = document.getElementById("ideasList");
            list.innerHTML = "";

            data.forEach(item => {
                const div = document.createElement("div");
                div.className = "idea-item";
                div.textContent = item.idea_text.slice(0, 60) + "...";
                div.onclick = () => loadIdea(item.id);
                list.appendChild(div);
            });
        } catch (err) {
            console.error(err);
        }
    }

    // Load one idea
    async function loadIdea(id) {
        try {
            const res = await fetch("http://localhost:3000/api/idea/" + id, {
                headers: { "Authorization": "Bearer " + token }
            });
            const data = await res.json();

            document.getElementById("need").textContent = data.need || "";
            document.getElementById("solution").textContent = data.solution || "";
            document.getElementById("benefit").textContent = data.benefit || "";
            document.getElementById("competitors").textContent = data.competitors || "";
        } catch (err) {
            console.error(err);
        }
    }

    // Analyze new idea
    const analyzeBtn = document.getElementById("analyzeBtn");
    analyzeBtn.onclick = async () => {
        const idea_text = document.getElementById("ideaText").value.trim();
        if (!idea_text) return alert("Enter an idea!");

        try {
            const res = await fetch("http://localhost:3000/api/analyze", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify({ idea_text })
            });

            const data = await res.json();

            if (!data.id) return alert(data.error || "Error analyzing idea");

            document.getElementById("need").textContent = data.need;
            document.getElementById("solution").textContent = data.solution;
            document.getElementById("benefit").textContent = data.benefit;
            document.getElementById("competitors").textContent = data.competitors;

            loadIdeas();
        } catch (err) {
            console.error(err);
            alert("Error connecting to server");
        }
    };

    loadIdeas();
} else if (document.getElementById("ideasList") && !token) {
    // Not logged in
    location.href = "login.html";
}
