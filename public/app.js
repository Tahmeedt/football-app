let allMatches = [];
let visibleCount = 10;

// -------------------------
// START APP
// -------------------------
window.onload = () => {
    loadLeagues();
    loadPLMatches();
};

// -------------------------
// LEAGUES TABLE
// -------------------------
function loadLeagues() {
    fetch("/api/competitions")
        .then(res => res.json())
        .then(data => {
            const body = document.getElementById("tableBody");

            body.innerHTML = "";

            data.forEach(league => {
                const row = document.createElement("tr");

                row.innerHTML = `
                    <td>${league.name}</td>
                    <td>${league.area?.name ?? "-"}</td>
                    <td>${league.type}</td>
                    <td>${league.code}</td>
                `;

                body.appendChild(row);
            });
        })
        .catch(err => console.error("Leagues error:", err));
}

// -------------------------
// LOAD MATCHES
// -------------------------
async function loadPLMatches() {
    try {
        const response = await fetch("/api/plmatches");
        allMatches = await response.json();

        visibleCount = 10;
        renderMatches();
    } catch (err) {
        console.error("Matches error:", err);
    }
}

// -------------------------
// RENDER MATCHES TABLE
// -------------------------
function renderMatches() {
    const table = document.getElementById("matchesTable");
    table.innerHTML = "";

    const visible = allMatches.slice(0, visibleCount);

    visible.forEach(match => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${match.homeTeam?.name ?? "-"}</td>
            <td>${match.awayTeam?.name ?? "-"}</td>
            <td>${match.score?.fullTime?.home ?? "-"}</td>
            <td>${match.score?.fullTime?.away ?? "-"}</td>
            <td>${match.status ?? "-"}</td>
        `;

        table.appendChild(row);
    });

    // -------------------------
    // SHOW MORE ROW (INSIDE TABLE)
    // -------------------------
    if (visibleCount < allMatches.length) {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td colspan="5" style="
                text-align:left;
                cursor:pointer;
                font-weight:bold;
                padding:10px;
                color:blue;
            ">
                Show all
            </td>
        `;

        row.onclick = () => {
            visibleCount = allMatches.length;
            renderMatches();
        };

        table.appendChild(row);
    }
    else {
        const row = document.createElement("tr");

        row.innerHTML = `
        <td colspan="5" style="
            text-align:left;
            cursor:pointer;
            font-weight:bold;
            padding:10px;
            color:gray;
        ">
            No more matches
        </td>
    `;

        table.appendChild(row);
    }
}