const fs = require("fs");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const session = require("express-session");

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // for login form
app.use(express.static(path.join(__dirname, "public")));

// Session setup (each user gets their own session)
app.use(
  session({
    secret: "supersecretkey", // change this to something random
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 }, // 1 hour
  })
);

// Login page (GET)
app.get("/login", (req, res) => {
  if (req.session.loggedIn) {
    return res.redirect("/admin");
  }
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Login</title>
      <style>
        body { font-family: Arial, sans-serif; background: #111; color: #fff; display: flex; justify-content: center; align-items: center; height: 100vh; }
        .login-box { background: #222; padding: 30px; border-radius: 10px; width: 300px; text-align: center; }
        input { width: 90%; padding: 10px; margin: 8px 0; border: none; border-radius: 5px; }
        button { background: #0f0; border: none; padding: 10px; width: 100%; border-radius: 5px; cursor: pointer; }
        button:hover { background: #0c0; }
      </style>
    </head>
    <body>
      <div class="login-box">
        <h2>🔒 Admin Login</h2>
        <form action="/login" method="POST">
          <input type="text" name="username" placeholder="Username" required><br>
          <input type="password" name="password" placeholder="Password" required><br>
          <button type="submit">Login</button>
        </form>
      </div>
    </body>
    </html>
  `);
});

// Login handler
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (username === "admin" && password === "admin@cek") {
    req.session.loggedIn = true;
    return res.redirect("/admin");
  }
  res.send("<h2 style='color:red'>❌ Invalid Credentials</h2><a href='/login'>Try Again</a>");
});

// Logout route
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

// Save messages to a plain text file
app.post("/contact", (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const entry = `ID: ${Date.now()}\nName: ${name}\nEmail: ${email}\nMessage: ${message}\nDate: ${new Date().toISOString()}\n----------------------\n`;

  try {
    fs.appendFileSync("messages.txt", entry, "utf8");
    res.json({ message: "✅ Message stored successfully.." });
  } catch (err) {
    console.error("❌ File Write Error:", err);
    res.status(500).json({ message: "Error saving message" });
  }
});

// Clear all messages
app.post("/clear-messages", (req, res) => {
  if (!req.session.loggedIn) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  try {
    fs.writeFileSync("messages.txt", "", "utf8");
    res.json({ message: "🗑️ All messages cleared!" });
  } catch (err) {
    console.error("❌ File Clear Error:", err);
    res.status(500).json({ message: "Error clearing messages" });
  }
});

// Render messages.html (only if logged in)
app.get("/admin", (req, res) => {
  if (!req.session.loggedIn) {
    return res.redirect("/login");
  }

  let content = "<h2>No messages yet</h2>";

  if (fs.existsSync("messages.txt")) {
    const data = fs.readFileSync("messages.txt", "utf8");
    content = `<pre>${data}</pre>`;
  }

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Messages</title>
      <style>
        body { font-family: monospace; background: #111; color: #0f0; padding: 20px; }
        h2 { color: #0ff; }
        pre { 
          white-space: pre-wrap; 
          border: 1px solid #444; 
          padding: 15px; 
          border-radius: 8px; 
          background: #222; 
        }
        button {
          margin-top: 20px;
          background: red;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
        }
        button:hover { background: darkred; }
        a { display:block; margin-top:20px; color:#0ff; }
      </style>
    </head>
    <body>
      <h2>📩 Saved Messages</h2>
      ${content}
      <form id="clearForm" method="POST" action="/clear-messages">
        <button type="submit">Clear All Messages</button>
      </form>
      <a href="/logout">🚪 Logout</a>
      <script>
        document.getElementById("clearForm").addEventListener("submit", async (e) => {
          e.preventDefault();
          if(confirm("Are you sure you want to clear all messages?")) {
            const res = await fetch("/clear-messages", { method: "POST" });
            const data = await res.json();
            alert(data.message);
            location.reload();
          }
        });
      </script>
    </body>
    </html>
  `);
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
