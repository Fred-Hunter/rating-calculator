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
	{ name: "Fred Hunter", glicko: FH },
	{ name: "Josh Davis", glicko: JD },
	{ name: "Alex Barlow-Doran", glicko: ABD },
	{ name: "Adam Hulme", glicko: AH },
	{ name: "Michael Hancock", glicko: MH },
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
	// Create 2d array from string
	//let table = prompt('Paste table in here:');
	let table = document.getElementById("tableInput").value;
	table = table.split("\n");
	table = table.map((r) => r.split("\t"));
	table.shift();

	const matches = [];
	const weeks = new Set(table.map((t) => t[4])).size;

	for (let i = 1; i <= weeks; i++) {
		console.log(`\nRankings after week ${i}`);

		const records = table.filter((r) => +r[4] === i);

		// Create matches
		records.forEach((r) => {
			let newMatch = [getPlayer(r[0]), getPlayer(r[2]), +r[3]];
			matches.push(newMatch);
		});

		glicko.updateRatings(matches);
		showRankings();
	}
}
