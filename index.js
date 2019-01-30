const fs = require("fs");
const path = require("path");

const text = fs.readFileSync(path.join(__dirname, "text.txt")).toString();

// mutations contain info about themselves
let mutations = [
	{
		text,
		desc: "normal text"
	}
];
fs.readdirSync(path.join(__dirname, "mutations")).forEach(mutationName => {
	// load a module from the mutations folder and add its output
	mutations = mutations.concat(
		require(
			path.join(__dirname, "mutations/" + mutationName)
		)(text)
	);
});

mutations.forEach(mutation => {
	fs.readdirSync(path.join(__dirname, "detectors")).forEach(detectorName => {
		// console.log(mutation);
		// load a module from the mutations folder and add its output
		console.log(mutation.desc,
			require(
				path.join(__dirname, "detectors/" + detectorName)
			)(mutation.text)
		);
	});
});
