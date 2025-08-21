require("dotenv").config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const AuthRouter = require("./routes/AuthRouter");
const TaskRouter = require("./routes/TaskRouter");
const path = require("path");

// connect DB
require("./models/db");

// middleware
app.use(bodyParser.json());
app.use(express.json());
app.use(cors());

// routes
app.use("/auth", AuthRouter);
app.use("/api", TaskRouter);

app.get("/ping", (_req, res) => res.send("Pong"));
app.get("/healthz", (_req, res) => res.status(200).send("ok"));

// --- Static frontend (Next export) ---
const publicDir = path.join(__dirname, "public");
app.use(express.static(publicDir, { maxAge: "1h", index: false }));

app.get("*", (req, res) => {
  res.sendFile(path.join(publicDir, "404.html"), (err) => {
    if (err) res.sendFile(path.join(publicDir, "index.html")); // fallback
  });
});

// server listen (ONLY ONCE)
const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
});
