const fs = require("fs");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// Save messages to a plain text file
app.post("/contact", (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const entry = `ID: ${Date.now()}\nName: ${name}\nEmail: ${email}\nMessage: ${message}\nDate: ${new Date().toISOString()}\n----------------------\n`;

  try {
    fs.appendFileSync("messages.txt", entry, "utf8");
    res.json({ message: "✅ Message saved successfully to messages.txt!" });
  } catch (err) {
    console.error("❌ File Write Error:", err);
    res.status(500).json({ message: "Error saving message" });
  }
});

// Simple page to view messages
app.get("/messages", (req, res) => {
  if (!fs.existsSync("messages.txt")) {
    return res.send("<h2>No messages yet</h2>");
  }

  const data = fs.readFileSync("messages.txt", "utf8");
  res.send(`<pre>${data}</pre>`);
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
