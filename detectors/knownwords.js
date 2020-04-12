const fs = require("fs");
const path = require("path");

const outputTransformFunction = x => 3 * x - 2;

const bigWordList = fs.readFileSync(path.join(__dirname, `../big.txt`)).toString().split("\n");
const smallWordList = fs.readFileSync(path.join(__dirname, `../small.txt`)).toString().split("\n");

module.exports = (text, program) => {
  const bigWordList = program.big ? bigWordList : smallWordList;
  const words = text.toLowerCase().replace(/[^a-z]/g, " ").replace(/ {2,}/g, " ").split(" ").filter(Boolean);

  const totalWords = words.length;
  const foundWords = words.filter(word => bigWordList.includes(word)).length;
  return outputTransformFunction(foundWords / totalWords);
};
