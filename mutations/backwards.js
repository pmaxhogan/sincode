const esrever = require("esrever");

// reverses text
module.exports = text => [{
	text:	esrever.reverse(text),
	desc: "reversed text"
}];
