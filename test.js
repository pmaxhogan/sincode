const text = "the extremely fast and quick tan and brown fox and beaver jump over and on top of the very lazy dogs.";
const NS_PER_SEC = 1e9;

const mutate = require("./mutations/1-trim-first-x-chars-delete-every-y-chars-keep-every-z-chars-chars");
const mutations = mutate(text, {
    keepEveryMax: 30,
    deleteEveryMax: 15
});


const knownWordsDetector = require("./detectors/knownwords");
let start = process.hrtime.bigint();
const mut1 = mutations.map(mutation => knownWordsDetector(mutation.text, {}));
console.log(Number(process.hrtime.bigint() - start) / NS_PER_SEC + "s");


start = process.hrtime.bigint();
const mut2 = mutations.map(mutation => knownWordsDetector(mutation.text, {fast: true}));
console.log(Number(process.hrtime.bigint() - start) / NS_PER_SEC + "s");

console.log(JSON.stringify(mut1) === JSON.stringify(mut2));
