const chalk = require("chalk");
// the most to try as the keepEvery var (see below)
const keepEveryMax = 6;
// the most to try as the delEvery var (see below)
const delEveryMax = 6;

module.exports = (text, program) => {
  // val to return
  const ret = [];

  // enumerate through possible delete / keep combinations
  // etc. if keepEvery is 2 and delEvery is 3, keep 2, discard 3, etc
  for(let keepEvery = 1; keepEvery <= (program.keepEveryMax || keepEveryMax); keepEvery++){
    for(let delEvery = 1; delEvery <= (program.deleteEveryMax || delEveryMax); delEvery++){
      for(let trimFirst = 0; trimFirst <= (program.deleteEveryMax || delEveryMax); trimFirst++) {
        // the processed string
        let str = "";

        // whether we're currently keeping characters
        let isKeeping = true;
        // how many characters we've currently kept
        let counter = 0;
        // loop through each characters
        text.slice(trimFirst).split("").forEach(char => {
          // if we've kept all the chars we were supposed to
          if (isKeeping && counter === keepEvery) {
            counter = 0;
            isKeeping = false;
          }

          // if we've deleted all the chars we were supposed to
          if (!isKeeping && counter === delEvery) {
            counter = 0;
            isKeeping = true;
          }

          // if we're supposed to keep this char, append it
          if (isKeeping) {
            str += char;
          }

          // increment the counter
          counter++;
        });

        // return this string
        ret.push({
          text: str,
          desc: `trim first ${trimFirst} and keep every ${keepEvery} and remove every ${delEvery}`
        });
      }
    }
  }

  return ret;
};
