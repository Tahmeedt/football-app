const express = require("express");
const sqlite3 = require("sqlite3").verbose();

const app = express();

app.use(express.json());
app.use(express.static("public"));

// DATABASE
const db = new sqlite3.Database("football.db");

// CREATE TABLE
db.run(`
  CREATE TABLE IF NOT EXISTS players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    goals INTEGER
  )
`);

// ---------------------------
// FOOTBALL API ROUTES
// ---------------------------

// Get all competitions (leagues)
app.get("/api/competitions", async (req, res) => {
    try {
        const response = await fetch(
            "https://api.football-data.org/v4/competitions",
            {
                headers: {
                    "X-Auth-Token": "313913361b2942998b1e643b77eb6f4f"
                }
            }
        );

        const data = await response.json();
        res.json(data.competitions); // IMPORTANT FIX
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch competitions" });
    }
});

// Premier League teams
app.get("/api/pl", async (req, res) => {
    try {
        const response = await fetch(
            "https://api.football-data.org/v4/competitions/PL/teams",
            {
                headers: {
                    "X-Auth-Token": "313913361b2942998b1e643b77eb6f4f"
                }
            }
        );

        const data = await response.json();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch PL teams" });
    }
});

app.get("/api/plmatches", async (req, res) => {
    try {
        const response = await fetch(
            "https://api.football-data.org/v4/competitions/PL/matches",
            {
                headers: {
                    "X-Auth-Token": "313913361b2942998b1e643b77eb6f4f"
                }
            }
        );

        const data = await response.json();

        res.json(data.matches);
    } catch (err) {
        res.status(500).json({
            error: "Failed to fetch PL matches"
        });
    }
});

// ---------------------------
// YOUR SQLITE ROUTES
// ---------------------------

// Get players from YOUR database
app.get("/api/players", (req, res) => {
    db.all("SELECT * FROM players", (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Add player to YOUR database
app.post("/api/players", (req, res) => {
    let { name, goals } = req.body;

    // convert goals to number
    goals = Number(goals);

    // validation
    if (!name || isNaN(goals)) {
        return res.status(400).json({
            error: "Name and goals must be valid"
        });
    }

    db.run(
        "INSERT INTO players (name, goals) VALUES (?, ?)",
        [name, goals],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            res.json({
                id: this.lastID,
                name,
                goals
            });
        }
    );
});

// ---------------------------
// START SERVER
// ---------------------------

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});