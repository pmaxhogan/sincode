const letters = "abcdefghijklmnopqrstuvwxyz";

// returns the string using rot[1-25]
module.exports = text => {
	// data to return
	const ret = [];

	for(let i = 1; i < letters.length; i ++){
		// try each shift
		ret.push(rot(text, i));
	}
	// return it
	return ret;
};

const rot = (str, amount) => {
	// make an output variable
	var output = "";

	// go through each character
	for (var i = 0; i < str.length; i ++) {

		// get the character we'll be appending
		var c = str[i];

		// if it's a letter...
		if (letters.includes(c)) {
			// shift it
			c = letters[(letters.indexOf(c) + amount) % letters.length];
		}

		// append the shifted letter
		output += c;
	}

	// done
	return output;
};
