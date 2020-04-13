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

const rot = require("./mutations/3-rot");
const rotM = rot("Bzl jhbapvu dolu thrpun bzl vm Lewlyptluahs mlhabylz, whyapjbshysf dpaopu tvkbslz. Luk bzlyz thf uva il hdhyl aoha lewlyptluahs mlhabylz hyl ilpun bzlk. Ibnz vy ilohcpvy johunlz thf zbywypzl luk bzlyz dolu Lewlyptluahs HWP tvkpmpjhapvuz vjjby. Av hcvpk zbywypzlz, bzl vm hu Lewlyptluahs mlhabyl thf ullk h jvtthuk-spul mshn. Lewlyptluahs mlhabylz thf hszv ltpa h dhyupun.\n", {
    keepEveryMax: 30,
    deleteEveryMax: 15
});
console.log(rotM);
