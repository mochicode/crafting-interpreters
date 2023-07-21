
async function main() {
	let file = process.argv.at(2);

	if (file) {
		console.log("Run File: ", file);
		process.exit(0);
	}

	console.log("Start interactive");
}

main();