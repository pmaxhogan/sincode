const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
console.log(chalk.bold("\treading wordlist file into memory..."));
const bigWordList = fs.readFileSync(path.join(__dirname, "../small.txt")).toString().split("\n");
console.log(chalk.bold("\tdone reading wordlist"));

module.exports = text => {
  const words = text.toLowerCase().replace(/[^a-z]/g, " ").replace(/ {2,}/g, " ").split(" ").filter(Boolean);
  let remainingWords = words.slice();
  let leftOver = "";

  // stores words & frequencies
  // eg. {"the": 5, "of": 3}
  let histogram = Object.create(null);

  bigWordList.forEach(word => {
		word = word.trim();
		while(true){// eslint-disable-line no-constant-condition
			// try to find the word
			const idx = remainingWords.indexOf(word);
			// if found
			if(idx === -1){
				break;
			}else{
        // console.log(word, idx, remainingWords);
				// add it to data
				if(histogram[word]){
					histogram[word]++;
				}else{
					histogram[word] = 1;
				}
				// remove it
				remainingWords.splice(idx, 1);
				// and tell us
				// console.log("found", word);
			}
		}
	});

  // return 1 - the ratio of words not found to total words
  return 1 - (remainingWords.length / words.length);
};
