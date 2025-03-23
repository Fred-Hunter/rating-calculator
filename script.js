const settings = {
	tau: 0.5,
	rpd: 604800,
	rating: 1500,
	rd: 300,
	vol: 0.06,
};
const glicko = new glicko2.Glicko2(settings);

// Make players
FH = glicko.makePlayer();
JD = glicko.makePlayer();
ABD = glicko.makePlayer();
AH = glicko.makePlayer();
MH = glicko.makePlayer();

const players = [
	{ name: "Alice Johnson", glicko: FH },
	{ name: "Bob Smith", glicko: JD },
	{ name: "Charlie Brown", glicko: ABD },
	{ name: "Diana Prince", glicko: AH },
	{ name: "Ethan Hunt", glicko: MH },
];

const getPlayer = (name) => players.find((p) => p.name === name).glicko;

function showRankings() {
	// Sort players
	players.sort((pl1, pl2) => pl2.glicko.getRating() - pl1.glicko.getRating());

	// Build rankings HTML
	let rankingsHTML = "<h3>Rankings</h3><ul>";
	for (let i = 0, len = players.length; i < len; i++) {
		const player = players[i];
		const rating = player.glicko.getRating().toFixed(1);
		const deviation = player.glicko.getRd().toFixed(1);
		rankingsHTML += `<li>${player.name}: ${rating} (rd: ${deviation})</li>`;
	}
	rankingsHTML += "</ul>";

	// Update rankings div
	document.getElementById("rankings").innerHTML = rankingsHTML;
}

function createMatches() {
    // Expecting: Player 1,Player 2,Result (w/l/d),week number
    // Example: Alice Johnson,Bob Smith,w,3
	let table = document.getElementById("tableInput").value;
	table = table.split("\n");
	table = table.map((r) => r.split(",")); 
	table.shift();

	const matches = [];
	const weeks = new Set(table.map((t) => t[3])).size;

	for (let i = 1; i <= weeks; i++) {
		console.log(`\nRankings after week ${i}`);

		const records = table.filter((r) => +r[3] === i);

		 // Add new players dynamically
		records.forEach((r) => {
			const [player1Name, player2Name] = [r[0], r[1]];
			if (!players.some((p) => p.name === player1Name)) {
				players.push({ name: player1Name, glicko: glicko.makePlayer() });
			}
			if (!players.some((p) => p.name === player2Name)) {
				players.push({ name: player2Name, glicko: glicko.makePlayer() });
			}
		});

		// Create matches
		records.forEach((r) => {
			let newMatch = [getPlayer(r[0]), getPlayer(r[1]), getScore(r[2])];
			matches.push(newMatch);
		});

		glicko.updateRatings(matches);
		showRankings();
	}
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
