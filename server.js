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

// Render messages.html with content of messages.txt
app.get("/messages.html", (req, res) => {
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
      </style>
    </head>
    <body>
      <h2>Saved Messages</h2>
      ${content}
    </body>
    </html>
  `);
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
