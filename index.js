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
  let scores = [];
	fs.readdirSync(path.join(__dirname, "detectors")).forEach(detectorName => {
		// console.log(detectorName);
		// load a module from the mutations folder and add its score
    const score = require(
      path.join(__dirname, "detectors/" + detectorName)
    )(mutation.text);
		console.log(mutation.desc, "scored on " + detectorName, score);
    scores.push(score);
	});
  const avg = parseInt((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(15));
  console.log(avg + "\n");
});
