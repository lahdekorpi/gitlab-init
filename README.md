# gitlab-init
**A simple CLI tool that connects to your Gitlab installation, lists all projects you have access to and attempts to git clone them into the same folder structure as in Gitlab.**

Why on earth would you need this?  
- When installing a new machine and wanting to get a quick start
- Getting new people joining your team quickly set up
- Use a unified directory structure for everyone

## Installation

1. Install git and node
2. `git clone https://github.com/lahdekorpi/gitlab-init.git`
3. `cd gitlab-init`
4. `npm install`

## Usage

```
Usage: index [options]

Options:
  -V, --version           output the version number
  -e, --endpoint [url]    Gitlab installation endpoint
  -t, --token [string]    Your Gitlab profile token (Can be provided as env: GITLAB_TOKEN)
  -m, --max <n>           Maximum project pages to get (10 per page) [10] (default: 10)
  -p, --path [directory]  Root projects directory where the project will be cloned into (default: "./projects/")
  -h, --help              output usage information
```
