#!/usr/bin/env node
const Gitlab = require("gitlab/dist/es5").default
const fs = require("fs");
const program = require("commander");
const colors = require("colors");
const pkg = require("../package");
const { spawn } = require("child_process");

program
	.version(pkg.version)
	.option("-e, --endpoint [url]", "Gitlab installation endpoint")
	.option("-t, --token [string]", "Your Gitlab profile token (Can be provided as env: GITLAB_TOKEN)",process.env.GITLAB_TOKEN)
	.option("-m, --max <n>","Maximum project pages to get (10 per page) [10]",10)
	.option("-p, --path [directory]","Root projects directory where the project will be cloned into","./projects/")
	.parse(process.argv);


if (!process.argv.slice(2).length) {
	program.outputHelp(txt=>colors.red(txt));
	process.exit(1);
}

// Ensure the root projects directory exists
const targetDir = program.path.toString();
if (!fs.existsSync(targetDir)) {
	fs.mkdirSync(targetDir, { recursive: true });
}

// Resolve real path and ensure it ends with a slash
const path = fs.realpathSync.native(targetDir) + "/";

const api = new Gitlab({
	url: program.endpoint,
	token: program.token
});

(async()=>{
	console.log(`Getting projects from ${program.endpoint}\n`.underline.blue);

	// Fetch projects with pagination
	const maxPages = parseInt(program.max, 10) || 10;
	let projects = await api.Projects.all({ maxPages: maxPages, perPage: 10 });

	for(const project of projects) {
		console.log("Project: ".cyan + project.name + "\n");
		// Log project description if it exists
		if(project.description && project.description.length > 0) {
			console.log(project.description + "\n");
		}
		const clonePath = path + project.path_with_namespace;
		console.log(" PATH: ".bgBlue + "  " + clonePath);
		console.log("  GIT: ".bgBlue + "  " + project.ssh_url_to_repo);
		console.log("\n");

		// Check if the directory already exists
		if (fs.existsSync(clonePath)) {
			console.log("  SKIP  ".bgYellow + ` Directory already exists: ${clonePath}`.gray + "\n");
		} else {
			await gitClone(project.ssh_url_to_repo, clonePath);
		}
	}
})();

/**
 * Clones a git repository into the specified path.
 * @param {string} url - The SSH or HTTP URL of the git repository.
 * @param {string} path - The local filesystem path where the repository should be cloned.
 * @returns {Promise<void>}
 */
async function gitClone(url, path) {
	return new Promise(resolve => {
		const git = spawn("git", ["clone", url, path]);

		git.stdout.on("data", data => process.stdout.write(data.toString().gray));
		git.stderr.on("data", data => process.stderr.write(data.toString().gray));
		git.on("close", code => {
			if(code === 0) {
				console.log("  OK!  ".bgGreen + "\n");
				resolve();
			} else {
				console.log(" ERROR ".bgRed);
				console.error(`git process exited with code ${code}`.red + "\n");
				resolve();
			}
		});
	});
}
