const fs = require("fs");
const path = require("path");
const ReadlineCounter = require("./lib/readlinecounter").ReadlineCounter;
const cluster = require("cluster");
const chalk = require("chalk");
const program = require("commander");
const packageFile = require("./package.json");
program.
  version(packageFile.version).
  option("-b, --big", "Use a bigger word list").
  option("-d, --delete-every-max <n>", "Delete every <n> characters", parseInt).
  option("-k, --keep-every-max <n>", "Keep every <n> characters", parseInt).
  option("-l, --min-length <n>", "Discard mutations shorter than <n> characters", parseInt).
  option("-m, --max-length <n>", "Discard mutations shorter than <n> characters", parseInt).
  option("-n, --num-results <n>", "Display top <n> results", parseInt, 5).
  option("-j, --processes <n>", "Fork <n> worker threads", parseInt).
  option("--no-color", "Disable color output").
  option("--color <level>", "Explicitly set color level (256 or 16m)").
  option("-f, --filename <name>", "Read <name> as input", "text.txt").
  parse(process.argv);

const maxChars = 150;
const numChildren = program.numProcesses || require("os").cpus().length;

if(cluster.isMaster){
	console.log(chalk`{bgMagentaBright {black \n${packageFile.name} v${packageFile.version}\n}}`);

	// read text
	const text = fs.readFileSync(path.join(__dirname, program.filename)).toString();

	console.log(chalk`{keyword("lime") {bold Read text}}\n\t{bold ${text.slice(0, 150)}}\n`);

	// mutations contain info about themselves
	let mutations = [
		{
			text,
			desc: ""
		}
	];
	console.log(chalk`{keyword("lime") {bold Running mutations}}`);
	fs.readdirSync(path.join(__dirname, "mutations")).forEach(newMutation => {
		const counter = new ReadlineCounter(mutations.length);
		const oldMutationsCount = mutations.length;
		console.log(chalk`{bold \tRunning mutation {keyword("aqua") ${newMutation}}}`);
		// load a module from the mutations folder and add its output
		const newBatch = [];
		mutations.forEach((mutation, idx) => {
			const results = require(
				path.join(__dirname, "mutations/" + newMutation)
			)(mutation.text, program);
			results.forEach(result => {
				newBatch.push({
					text: result.text,
					desc: mutation.desc + " + " + result.desc
				});
			});
			counter.update(idx + 1);
		});
		counter.done();
		mutations = mutations.concat(newBatch);
		console.log(chalk`\n{bold \t\tRan mutation {keyword("aqua") ${newMutation}} and added {keyword("lime") {keyword("red") ${(mutations.length - oldMutationsCount)}} new mutations}}\n\n`);
	});

	if(program.minLength){
		console.log(chalk`\n{keyword("lime") {bold Removing mutations shorter than {keyword("red") ${program.minLength}} characters}}`);
		const oldMutationsCount = mutations.length;
		mutations = mutations.filter(mutation => mutation.text.length >= program.minLength);
		console.log(chalk`{bold \tRemoved {keyword("red") ${(oldMutationsCount - mutations.length)}} mutations ({keyword("red") -${((oldMutationsCount - mutations.length) / oldMutationsCount * 100).toFixed(5)}%})}\n`);
	}

	if(program.maxLength){
		console.log(chalk`\n{keyword("lime") {bold Removing mutations longer than {keyword("red") ${program.maxLength}} characters}}`);
		const oldMutationsCount = mutations.length;
		mutations = mutations.filter(mutation => mutation.text.length <= program.maxLength);
		console.log(chalk`{bold \tRemoved {keyword("red") ${(oldMutationsCount - mutations.length)}} mutations ({keyword("red") -${((oldMutationsCount - mutations.length) / oldMutationsCount * 100).toFixed(5)}%})}\n`);
	}

	console.log(chalk`\n{keyword("lime") {bold Running detectors on {keyword("red") ${mutations.length}} mutations} on {keyword("red") ${numChildren}} processes}`);

	// create one cluster / core
	for(let i = 0; i < numChildren; i++){
		cluster.fork();
	}

	// the processed mutations
	let newMutations = [];

	const counter = new ReadlineCounter(mutations.length);

	// if a worker is done with a job
	cluster.on("message", (worker, message) => {
		// if we're done
		if(message && message.type === "done"){
			// add it
			newMutations.push(message.data);

			counter.update(newMutations.length);

			// if everything's done
			if(newMutations.length === mutations.length){
				counter.done();
				onDone();
			}
		}
	});


	const jobsPerWorker = Math.ceil(mutations.length / numChildren);

	let startIdx = 0;
	for(const id in cluster.workers){
		cluster.workers[id].send({type: "mutationtestjobs", data: {
			text,
			mutations: mutations.slice(startIdx, startIdx + jobsPerWorker)
		}});
		startIdx += jobsPerWorker;
	}

	const onDone = () => {
		console.log();
		mutations = newMutations;
		for(const id in cluster.workers){
			cluster.workers[id].kill();
		}

		console.log(chalk`\n{bold {keyword("lime") Showing {keyword("red") ${program.numResults}} results}}`);

		// these are the 5 most likely decrypted strings
		const mostLikelyN = mutations.sort((a, b) => b.avg - a.avg).slice(0, program.numResults);

		// most chars to display
		mostLikelyN.forEach(mutation => {
			const detectorString = mutation.detectors.reduce((str, detector) => str + ", " + detector[0] + ": " + detector[1].toFixed(5), ", ").slice(4) +
			(mutation.text.length > maxChars ? "..." : "");
			// display the 5 mostly likely mutations
			console.log(chalk`\t{keyword("yellow") score: ${mutation.avg.toFixed(5)}} ({keyword("red") ${detectorString}})\n\t{keyword("aqua") ${mutation.desc.slice(3)}}\n\t\t${mutation.text.slice(0, maxChars)}\n`);
		});
	};
}else{
	process.on("message", (msg) => {
		if(msg.type === "mutationtestjobs"){
			msg.data.mutations.forEach(mutation => {
				mutation.text = mutation.text.trim();
				let scores = [];
				mutation.detectors = [];
				fs.readdirSync(path.join(__dirname, "detectors")).forEach(detectorName => {
					// console.log(detectorName);
					// load a module from the mutations folder and add its score
					const score = require(
						path.join(__dirname, "detectors/" + detectorName)
					)(mutation.text, program, msg.data.text);
					mutation.detectors.push([detectorName, score]);
					scores.push(score);
				});
				// average the scores and round
				mutation.avg = scores.reduce((a, b) => a + b, 0) / scores.length;
				process.send({type: "done", data: mutation});
			});
		}
	});
}
