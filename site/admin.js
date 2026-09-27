const loginForm = document.getElementById("loginForm");
const message = document.getElementById("message");

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    message.textContent = "Logging in...";

    try {
        const response = await fetch(
            "https://mehndi-core.onrender.com/api/admin/login",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username,
                    password
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            message.textContent = data.message;
            return;
        }

        sessionStorage.setItem("adminToken", data.token);

        message.textContent = "Login successful!";

        window.location.href = "dashboard.html";

    } catch (error) {
        console.error("Login error:", error);
        message.textContent = "Unable to connect to the server.";
    }
});