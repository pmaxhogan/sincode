const lev = require("fast-levenshtein");
// most common letters
const commonletters = "etaoinsrhldcumfpgwybvkxjqz";

module.exports = (text) => {
	// get the letters from text
	const letters = text.toLowerCase().replace(/[^a-z]/g, "").split("");
	// console.log(letters);

	// eg. {"e": 5, "t": 3, "l": 1}
	const histogram = {};
	letters.forEach(letter => {
		// increment / create the count of this letter
		if(histogram[letter]){
			histogram[letter] ++;
		}else{
			histogram[letter] = 1;
		}
	});

	const letterFreq = Object.entries(histogram).sort((a, b) => {
		// eg. a is ["e", 5] and b is ["t", 3]
		const firstSort = b[1] - a[1];
		if(firstSort !== 0) return firstSort;
		return a[0].charCodeAt(0) - b[0].charCodeAt(0);
	}).reduce((acc, [letter]) => acc + letter, "");

  // 1 - (the difference from the freq and common letters out of 25)
  return parseFloat((1 - (lev.get(commonletters, letterFreq) / 25)).toFixed(8));
};
