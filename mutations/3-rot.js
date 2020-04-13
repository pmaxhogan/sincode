const letters = "abcdefghijklmnopqrstuvwxyz";

// returns the string using rot[1-25]
module.exports = text => {
	// data to return
	const ret = [];

	for(let i = 1; i < letters.length; i ++){
		// try each shift
		ret.push({
			text: rot(text, i),
			desc: "rotated by " + i
		});
	}
	// return it
	return ret;
};

const rot = (str, amount) => {
	// make an output variable
	let output = "";

	// go through each character
	for (let i = 0; i < str.length; i ++) {

		// get the character we'll be appending
		let char = str[i];

		const isUpperCase = char.toUpperCase() === char;

		if(isUpperCase) {
			// if it's a letter...
			if (letters.includes(char.toLowerCase())){
				// shift it
				char = (letters[(letters.indexOf(char.toLowerCase()) + amount) % letters.length]).toUpperCase();
			}
		}else{
			// if it's a letter...
			if (letters.includes(char)) {
				// shift it
				char = letters[(letters.indexOf(char) + amount) % letters.length];
			}
		}

		// append the shifted letter
		output += char;
	}

	// done
	return output;
};
