const fs = require("fs");
const path = require("path");
const ReadlineCounter = require("./lib/readlinecounter").ReadlineCounter;
const cluster = require("cluster");
const chalk = require("chalk");
const program = require("commander");
const package = require("./package.json");
program.
  version(package.version).
  option("-b, --big", "Use a bigger wordlist").
  option("-d, --delete-every-max <n>", "Delete every <n> characters", parseInt).
  option("-k, --keep-every-max <n>", "Keep every <n> characters", parseInt).
  option("-n, --num-results <n>", "Display top <n> results", parseInt, 5).
  option("-j, --num-processes <n>", "Fork <n> worker threads", parseInt).
  option("-f, --filename <name>", "Read <name> as input", "text.txt").
  parse(process.argv);

const maxChars = 150;
const numChildren = program.numProcesses || require("os").cpus().length;

if(cluster.isMaster){
	console.log(chalk`{bgMagentaBright {black \n${package.name} v${package.version}\n}}`);

	// read text
	const text = fs.readFileSync(path.join(__dirname, program.filename)).toString();

	console.log(chalk`{greenBright {bold Read text}}\n\t{bold ${text.slice(0, 150)}}\n`);

	// mutations contain info about themselves
	let mutations = [
		{
			text,
			desc: ""
		}
	];
	console.log(chalk`{greenBright {bold Running mutations}}`);
	fs.readdirSync(path.join(__dirname, "mutations")).forEach(newMutation => {
		let oldMutationsCount = mutations.length;
		console.log(chalk`{bold \tRunning mutation} {yellowBright ${newMutation}}`);
		// load a module from the mutations folder and add its output
		const newBatch = [];
		mutations.forEach(mutation => {
			const results = require(
				path.join(__dirname, "mutations/" + newMutation)
			)(mutation.text, program);
			results.forEach(result => {
				newBatch.push({
					text: result.text,
					desc: mutation.desc + " + " + result.desc
				});
			});
		});
		mutations = mutations.concat(newBatch);
		console.log(chalk`{bold \tRan mutation {yellowBright ${newMutation}} and added {greenBright {magentaBright ${(mutations.length - oldMutationsCount)}} new mutations}}\n`);
	});
	console.log(chalk`\n{greenBright {bold Running detectors on {magentaBright ${mutations.length}} mutations} on {magentaBright ${numChildren}} processes}`);

	// create one cluster / core
	for(let i = 0; i < numChildren; i++){
		cluster.fork();
	}

	// the processed mutations
	let newMutations = [];

	const counter = new ReadlineCounter(mutations.length);

	// if a worker is done with a job
	cluster.on("message", (worker, message, handle) => {
		// if we're done
		if(message && message.type === "done"){
			// add it
			newMutations.push(message.data);

			counter.update(newMutations.length);

			// if everything's done
			if(newMutations.length === mutations.length){
				onDone();
			}
		}
	});


	const jobsPerWorker = Math.ceil(mutations.length / numChildren);

	let startIdx = 0;
	for(const id in cluster.workers){
		cluster.workers[id].send({type: "mutationtestjobs", data: mutations.slice(startIdx, startIdx + jobsPerWorker)});
		startIdx += jobsPerWorker;
	}

	const onDone = () => {
		console.log();
		mutations = newMutations;
		for(const id in cluster.workers){
			cluster.workers[id].kill();
		}
		// these are the 5 most likely decryptions
		const mostLikelyN = mutations.sort((a, b) => b.avg - a.avg).slice(0, program.numResults);

		console.log(chalk`\n{bold {greenBright Showing {magentaBright ${program.numResults}} results}}`);
		// most chars to display
		mostLikelyN.forEach(mutation => {
			const detectorString = mutation.detectors.reduce((str, detector) => str + ", " + detector[0] + ": " + detector[1].toFixed(5), ", ").slice(4) +
			(mutation.text.length > maxChars ? "..." : "");
			// display the 5 mostly likely mutations
			console.log(chalk`\t{yellowBright score: ${mutation.avg.toFixed(5)}} ({magentaBright ${detectorString}})\n\t{greenBright ${mutation.desc.slice(3)}}\n\t\t{bold ${mutation.text.slice(0, maxChars)}}\n`);
		});
	};
}else{
	process.on("message", (msg) => {
		if(msg.type === "mutationtestjobs"){
			msg.data.forEach(mutation => {
				mutation.text = mutation.text.trim();
				let scores = [];
				mutation.detectors = [];
				fs.readdirSync(path.join(__dirname, "detectors")).forEach(detectorName => {
					// console.log(detectorName);
					// load a module from the mutations folder and add its score
					const score = require(
						path.join(__dirname, "detectors/" + detectorName)
					)(mutation.text, program);
					mutation.detectors.push([detectorName, score]);
					scores.push(score);
				});
				// average the scores and round
				const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
				mutation.avg = avg;
				process.send({type: "done", data: mutation});
			});
		}
	});
}
