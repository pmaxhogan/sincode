const fs = require("fs");
const path = require("path");
const readline = require("readline");
const cluster = require("cluster");
const chalk = require("chalk");

const maxChars = 150;
const numChildren = parseInt(process.argv[2]) || require("os").cpus().length;

if(cluster.isMaster){
	const package = require("./package.json");
	console.log(chalk`{bgRedBright \n{black \n${package.name} v${package.version}\n}}`);

	// read text
	const text = fs.readFileSync(path.join(__dirname, "text.txt")).toString();

	console.log(chalk`{greenBright Read text}\n\t{bold ${text.slice(0, 150)}}\n`);

	// mutations contain info about themselves
	let mutations = [
		{
			text,
			desc: "normal text"
		}
	];
	console.log(chalk`\n{greenBright {bold Running mutations}}\n`);
	fs.readdirSync(path.join(__dirname, "mutations")).forEach(newMutation => {
		let oldMutationsCount = mutations.length;
		console.log(chalk`{bold \tRunning mutation} {yellowBright ${newMutation}}`);
		// load a module from the mutations folder and add its output
		const newBatch = [];
		mutations.forEach(mutation => {
			const results = require(
				path.join(__dirname, "mutations/" + newMutation)
			)(mutation.text);
			results.forEach(result => {
				newBatch.push({
					text: result.text,
					desc: mutation.desc + " + " + result.desc
				});
			});
		});
		mutations = mutations.concat(newBatch);
		console.log(chalk`{bold \tRan mutation {yellowBright ${newMutation}} and added {greenBright ${(mutations.length - oldMutationsCount)} new mutations}}\n`);
	});
	console.log(chalk`\n{greenBright {bold Running detectors on {yellowBright ${mutations.length} mutations}}}\n`);

	// create one cluster / core
	for(let i = 0; i < numChildren; i++){
		cluster.fork();
	}

	// the processed mutations
	let newMutations = [];

	// if a worker is done with a job
	cluster.on("message", (worker, message, handle) => {
		// if we're done
		if(message && message.type === "done"){
			// add it
			newMutations.push(message.data);

			// display progress
			readline.clearLine(process.stdout, 0);
    	readline.cursorTo(process.stdout, 0, null);
			process.stdout.write(newMutations.length + "/" + mutations.length);

			// if everything's done
			if(newMutations.length === mutations.length){
				onDone();
			}
		}
	});

	// cluster ids
	let ids = [];
	for(const id in cluster.workers){
		ids.push(id);
	}


	// index of worker in cluster ids to send the message to (round-robin)
	let i = 0;

	// assign mutation test jobs
	mutations.forEach(mutation => {
		// wrap it around
		if(i === ids.length) i = 0;

		cluster.workers[ids[i]].send({type: "mutationtestjob", data: mutation});
	});

	const onDone = () => {
		mutations = newMutations;
		for(const id in cluster.workers){
			cluster.workers[id].kill();
		}
		// these are the 5 most likely decryptions
		const mostLikely5 = mutations.sort((a, b) => b.avg - a.avg).slice(0, 5);

		console.log(chalk`\n{bold {greenBright Analyzing reults...}}\n`);
		// most chars to display
		mostLikely5.forEach(mutation => {
			const detectorString = mutation.detectors.reduce((str, detector) => str + ", " + detector[0] + ": " + detector[1], ", ").slice(4) +
			(mutation.text.length > maxChars ? "..." : "");
			// display the 5 mostly likely mutations
			console.log(chalk`\t{yellowBright score: ${mutation.avg}} ({cyanBright ${detectorString}})\n\t{greenBright ${mutation.desc}}\n\t\t{bold ${mutation.text.slice(0, maxChars)}}\n`);
		});
	};
}else{
	process.on("message", (msg) => {
		if(msg.type === "mutationtestjob"){
			mutation = msg.data;
			mutation.text = mutation.text.trim();
			let scores = [];
			mutation.detectors = [];
			fs.readdirSync(path.join(__dirname, "detectors")).forEach(detectorName => {
				// console.log(detectorName);
				// load a module from the mutations folder and add its score
				const score = parseFloat(require(
					path.join(__dirname, "detectors/" + detectorName)
				)(mutation.text).toFixed(5));
				mutation.detectors.push([detectorName, score]);
				scores.push(score);
			});
			// average the scores and get rid of stupid floating point crap
			const avg = parseFloat((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(5));
			// console.log(avg + "\n");
			mutation.avg = avg;
			process.send({type: "done", data: mutation});
		}
	});
}
