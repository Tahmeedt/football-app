const express = require("express");
const Database = require("better-sqlite3");

const app = express();

app.use(express.json());
app.use(express.static("public"));

// DATABASE (better-sqlite3)
const db = new Database("football.db");

// CREATE TABLE (run once safely)
db.prepare(`
  CREATE TABLE IF NOT EXISTS players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    goals INTEGER
  )
`).run();

// ---------------------------
// FOOTBALL API ROUTES
// ---------------------------

// Get all competitions (leagues)
app.get("/api/competitions", async (req, res) => {
    try {
        const response = await fetch("https://api.football-data.org/v4/competitions", {
            headers: {
                "X-Auth-Token": "313913361b2942998b1e643b77eb6f4f"
            }
        });

        const data = await response.json();
        res.json(data.competitions || []);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch competitions" });
    }
});

// Premier League teams
app.get("/api/pl", async (req, res) => {
    try {
        const response = await fetch("https://api.football-data.org/v4/competitions/PL/teams", {
            headers: {
                "X-Auth-Token": "313913361b2942998b1e643b77eb6f4f"
            }
        });

        const data = await response.json();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch PL teams" });
    }
});

// Premier League matches
app.get("/api/plmatches", async (req, res) => {
    try {
        const response = await fetch("https://api.football-data.org/v4/competitions/PL/matches", {
            headers: {
                "X-Auth-Token": "313913361b2942998b1e643b77eb6f4f"
            }
        });

        const data = await response.json();
        res.json(data.matches || []);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch PL matches" });
    }
});

// ---------------------------
// SQLITE ROUTES
// ---------------------------

// Get players
app.get("/api/players", (req, res) => {
    try {
        const rows = db.prepare("SELECT * FROM players").all();
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add player
app.post("/api/players", (req, res) => {
    let { name, goals } = req.body;
    goals = Number(goals);

    if (!name || isNaN(goals)) {
        return res.status(400).json({
            error: "Name and goals must be valid"
        });
    }

    try {
        const stmt = db.prepare("INSERT INTO players (name, goals) VALUES (?, ?)");
        const result = stmt.run(name, goals);

        res.json({
            id: result.lastInsertRowid,
            name,
            goals
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ---------------------------
// START SERVER
// ---------------------------

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});