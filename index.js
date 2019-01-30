const fs = require("fs");
const path = require("path");

const text = fs.readFileSync(path.join(__dirname, "text.txt")).toString();

let mutations = [];
fs.readdirSync(path.join(__dirname, "mutations")).forEach(mutationName => {
	// load a module from the mutations folder and add its output
	mutations = mutations.concat(
		require(
			path.join(__dirname, "mutations/" + mutationName)
		)(text)
	);
});

console.log(mutations);
