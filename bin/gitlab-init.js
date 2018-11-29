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

const path = fs.realpathSync.native(program.path.toString()) + "/";

const api = new Gitlab({
	url: program.endpoint,
	token: program.token
});

(async()=>{
	console.log(`Getting projects from ${program.endpoint}\n`.underline.blue);
	let projects = await api.Projects.all({ maxPages:10, perPage:program.max });

	for(const project of projects) {
		console.log("Project: ".cyan + project.name + "\n");
		if(project.description.length > 0) {
			console.log(project.description + "\n");
		}
		console.log(" PATH: ".bgBlue + "  " + path + project.path_with_namespace);
		console.log("  GIT: ".bgBlue + "  " + project.ssh_url_to_repo);
		console.log("\n");
		await gitClone(project.ssh_url_to_repo, path + project.path_with_namespace);
	}
})();

async function gitClone(url, path) {
	return new Promise(resolve => {
		const { spawn } = require("child_process");
		const git = spawn("git", ["clone", url, path]);

		git.stdout.on("data", data => console.log(data.toString()).gray);
		git.stderr.on("data", data => console.error(data.toString().gray));
		git.on("close", code => {
			if(code === 0) {
				console.log("  OK!  ".bgGreen);
				resolve();
			} else {
				console.log(" ERROR ".bgRed);
				console.error(`git process exited with code ${code}`);
				resolve();
			}
		});
	})
}
