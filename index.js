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
fs.readdirSync(path.join(__dirname, "mutations")).forEach(newMutation => {
  // load a module from the mutations folder and add its output
  const newBatch = [];
  mutations.forEach(mutation => {
    const results = require(
      path.join(__dirname, "mutations/" + newMutation)
    )(mutation.text);
    results.forEach(result => {
      newBatch.push({
        text: result.text,
        desc: mutation.desc + " + " + result.desc
      });
    });
  });
  mutations = mutations.concat(newBatch);
});


mutations.forEach(mutation => {
  mutation.text = mutation.text.trim();
  let scores = [];
  mutation.detectors = [];
  fs.readdirSync(path.join(__dirname, "detectors")).forEach(detectorName => {
    // console.log(detectorName);
    // load a module from the mutations folder and add its score
    const score = require(
      path.join(__dirname, "detectors/" + detectorName)
    )(mutation.text);
    mutation.detectors.push([detectorName, score]);
    scores.push(score);
  });
  // average the scores and get rid of stupid floating point crap
  const avg = parseFloat((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(5));
  // console.log(avg + "\n");
  mutation.avg = avg;
});

// these are the 5 most likely decriptions
const mostLikely5 = mutations.sort((a, b) => b.avg - a.avg).slice(0, 5);
// console.log("\n=== Complteted ===\n", mostLikely5);

// most chars to display
const maxChars = 150;
mostLikely5.forEach(mutation => {
  // display the 5 mostly likely mutations
  console.log(`score: ${mutation.avg} \
(${mutation.detectors.reduce((str, detector) => str + ", " + detector[0] + ": " + detector[1], ", ").slice(4)})\
\n${mutation.desc}\n      \
${mutation.text.slice(0, maxChars)}\
${mutation.text.length > maxChars ? "..." : ""}\n`);
});
