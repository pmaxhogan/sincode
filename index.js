const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const maxChars = 150;
console.log(chalk`{bgRedBright \n{black \nSherlock v${require("./package.json").version}\n}}`);
const text = fs.readFileSync(path.join(__dirname, "text.txt")).toString();
console.log(chalk`{greenBright Read text}\n\t{bold ${text.slice(0, 150)}}\n`);


// mutations contain info about themselves
let mutations = [
  {
    text,
    desc: "normal text"
  }
];

console.log(chalk`\n{greenBright {bold Running mutations}}\n`);

fs.readdirSync(path.join(__dirname, "mutations")).forEach(newMutation => {
  let oldMutationsCount = mutations.length;
  console.log(chalk`{bold \tRunning mutation} {yellowBright ${newMutation}}`);
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
  console.log(chalk`{bold \tRan mutation {yellowBright ${newMutation}} and added {greenBright ${(mutations.length - oldMutationsCount)} new mutations}}\n`);
});

console.log(chalk`\n{greenBright {bold Running detectors on {yellowBright ${mutations.length} mutations}}}\n`);


mutations.forEach(mutation => {
  mutation.text = mutation.text.trim();
  let scores = [];
  mutation.detectors = [];
  fs.readdirSync(path.join(__dirname, "detectors")).forEach(detectorName => {
    // console.log(detectorName);
    // load a module from the mutations folder and add its score
    const score = parseFloat(require(
      path.join(__dirname, "detectors/" + detectorName)
    )(mutation.text).toFixed(5));
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

console.log();
console.log(chalk`\n{bold {greenBright Analyzing reults...}}\n`);
// most chars to display
mostLikely5.forEach(mutation => {
  const detectorString = mutation.detectors.reduce((str, detector) => str + ", " + detector[0] + ": " + detector[1], ", ").slice(4) +
  (mutation.text.length > maxChars ? "..." : "");
  // display the 5 mostly likely mutations
  console.log(chalk`\t{yellowBright score: ${mutation.avg}} ({cyanBright ${detectorString}})\n\t{greenBright ${mutation.desc}}\n\t\t{bold ${mutation.text.slice(0, maxChars)}}\n`);
});
