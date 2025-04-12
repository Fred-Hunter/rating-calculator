const Glicko2 = require("glicko2").Glicko2;

let glicko;
let players;

initGlicko();

function initGlicko() {
    const settings = {
        tau: 0.5,
        rpd: 604800,
        rating: 1500,
        rd: 300,
        vol: 0.06,
    };
    glicko = new Glicko2(settings);
    
    players = [];
}

function loadMatches() {
    const storedMatches = localStorage.getItem("matches");
    return storedMatches ? JSON.parse(storedMatches) : [];
}


function saveMatches(matches) {
    localStorage.setItem("matches", JSON.stringify(matches));
}

const getPlayer = (name) => players.find((p) => p.name === name).glicko;

window.onload = (e) => {
    addEventListeners();
    loadAndProcessMatches();
};

function showRankings() {
	players.sort((pl1, pl2) => pl2.glicko.getRating() - pl1.glicko.getRating());

	const rankingsDiv = document.getElementById("rankings");
	rankingsDiv.innerHTML = "";

	const title = document.createElement("h3");
	title.textContent = "Rankings";
	rankingsDiv.appendChild(title);

	const list = document.createElement("ul");
	players.forEach((player) => {
		const listItem = document.createElement("li");
		const rating = player.glicko.getRating().toFixed(1);
		const deviation = player.glicko.getRd().toFixed(1);
		listItem.textContent = `${player.name}: ${rating} (rd: ${deviation})`;
		list.appendChild(listItem);
	});
	rankingsDiv.appendChild(list);

	rankingsDiv.style.display = "block";
}

function loadAndProcessMatches() {
    const storedMatches = loadMatches();
    if (storedMatches.length > 0) {
        processMatches(storedMatches);
        updateMatchesTable(storedMatches);
    }
}

function updateMatchesTable(matches) {
    const tableContainer = document.getElementById("matchesTableContainer");
    const tableBody = document.getElementById("matchesTable").querySelector("tbody");

    // Clear existing rows
    tableBody.innerHTML = "";

    // Add rows for each match
    matches.forEach((match, index) => {
        const row = document.createElement("tr");

        const player1Cell = document.createElement("td");
        player1Cell.textContent = match.player1Name;
        row.appendChild(player1Cell);

        const player2Cell = document.createElement("td");
        player2Cell.textContent = match.player2Name;
        row.appendChild(player2Cell);

        const resultCell = document.createElement("td");
        resultCell.textContent = match.result;
        row.appendChild(resultCell);

        const weekCell = document.createElement("td");
        weekCell.textContent = match.week || "1";
        row.appendChild(weekCell);

        const actionsCell = document.createElement("td");
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Remove";
        deleteButton.addEventListener("click", () => removeMatch(index));
        actionsCell.appendChild(deleteButton);
        row.appendChild(actionsCell);

        tableBody.appendChild(row);
    });

    tableContainer.style.display = matches.length > 0 ? "block" : "none";
}

function removeMatch(index) {
    const matches = loadMatches();
    matches.splice(index, 1);
    saveMatches(matches);
    loadAndProcessMatches();
}

function createMatches(event) {
    if (event) event.preventDefault();

    const separator = document.getElementById("separator").value;

    let table = document.getElementById("tableInput").value;
    table = table.split("\n");
    table = table.map((r) => r.split(separator));

    const defaultWeek = "1";
    table.forEach((r) => {
        if (r.length === 2) {
            r.push(defaultWeek);
        }
    });

    const newMatches = [];
    table.forEach((r) => {
        const [player1Name, player2Name, result, week] = r;
        newMatches.push({ player1Name, player2Name, result, week });
    });

    if (newMatches.some((m) => !m.player1Name || !m.player2Name || !m.result)) {
        return loadAndProcessMatches();
    }

    const storedMatches = loadMatches();
    const allMatches = [...storedMatches, ...newMatches];
    saveMatches(allMatches);

    loadAndProcessMatches();
}

function processMatches(matches) {
    // Refresh glicko
    initGlicko();

    const weeks = [...new Set(matches.map((m) => m.week || "1"))];

    weeks.forEach((weekNumber) => {
        console.log(`\nRankings after week ${weekNumber}`);

        const records = matches.filter((m) => m.week === weekNumber);

        // Add new players dynamically
        records.forEach((r) => {
            const { player1Name, player2Name } = r;
            if (!players.some((p) => p.name === player1Name)) {
                players.push({ name: player1Name, glicko: glicko.makePlayer() });
            }
            if (!players.some((p) => p.name === player2Name)) {
                players.push({ name: player2Name, glicko: glicko.makePlayer() });
            }
        });

        // Create matches
        const glickoMatches = records.map((r) => [
            getPlayer(r.player1Name),
            getPlayer(r.player2Name),
            getScore(r.result),
        ]);

        glicko.updateRatings(glickoMatches);
    });

    showRankings();
}

function getScore(scoreText) {
    switch (scoreText) {
        case "w":
            return 1;
        case "l":
            return 0;
        case "d":
            return 0.5;
        default:
            throw new Error("Invalid score text");
    }
}

function addEventListeners() { 
    addInstructionToggleListener();
    addFormListener();
    addClearMatchesListener();
}

function addInstructionToggleListener() {
    document.getElementById("toggleInstructions").addEventListener("click", function () {
        const instructions = document.getElementById("instructions");
        if (instructions.style.display === "none") {
            instructions.style.display = "block";
            this.textContent = "Hide Instructions";
        } else {
            instructions.style.display = "none";
            this.textContent = "Show Instructions";
        }
    });
}

function addFormListener() {
    const form = document.getElementById("form-ingest");
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        createMatches(event);
        return false;
    });
}

function clearMatches() {
    localStorage.removeItem("matches");
    initGlicko();
    document.getElementById("rankings").style.display = "none";
}

function addClearMatchesListener() {
    document.getElementById("clearMatches").addEventListener("click", clearMatches);
}
