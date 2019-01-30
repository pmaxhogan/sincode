
console.log(words);
const words = text.toLowerCase().replace(/[^a-z]/g, " ").replace(/ {2,}/g, " ").split(" ").filter(Boolean);
let remainingWords = words.slice();
const stream = fs.createReadStream(path.join(__dirname, "big.txt"));
let leftOver = "";

// stores words & frequencies
// eg. {"the": 5, "of": 3}
let histogram = Object.create(null);

stream.on("data", data => {
	// ensure that we can read the file quickly & across line boundaries
	data = leftOver + data;
	const split = data.split("\n");

	// loop through whole words
	split.slice(0, -1).forEach(word => {
		word = word.trim();
		while(true){// eslint-disable-line no-constant-condition
			// try to find the word
			const idx = remainingWords.indexOf(word);
			// if found
			if(idx === -1){
				break;
			}else{
				// add it to data
				if(histogram[word]){
					histogram[word]++;
				}else{
					histogram[word] = 1;
				}
				// remove it
				remainingWords.splice(idx, 1);
				// and tell us
				console.log("found", word);
			}
		}
	});

	// any not completed words go here
	leftOver = split[split.length - 1];
});
stream.on("end", () => {
	// console.log("could not find", remainingWords);
	Object.entries(histogram).forEach(([word, freq]) => {
		// pad to 25 chars
		word = (word + " ".repeat(25)).slice(0, 25);
		// graph it

	});
});
