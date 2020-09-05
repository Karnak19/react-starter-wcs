#! /usr/bin/env node

const fs = require("fs");
const clear = require("clear");
const ora = require("ora");
const chalk = require("chalk");
const Prompt = require("prompt-checkbox");

const repoURL = "https://github.com/Karnak19/react-starter-template.git";
const runCommand = require("./runCommand");
const { promptHeader, promptEnd } = require("./prompts");

const name = process.argv[2];

const depsPrompt = new Prompt({
  name: "packages",
  message: "Do you want any third-party libraries ? \n(press space to choose, enter to confirm)\n",
  choices: ["react-router", "redux", "recoil", "prop-types"],
});

const caproverPrompt = new Prompt({
  name: "caprover",
  message: "Do you want Caprover config files ?",
  radio: true,
  choices: ["yes"],
});

const ghActionsPrompt = new Prompt({
  name: "actions",
  message: "Do you want any pre-configured Github Actions ?",
  choices: ["ESLint on PR", "Build and push to a 'production' branch"],
});

clear();

if (!name || name.match(/[<>:"\/\\|?*\x00-\x1F]/)) {
  return console.log(`
  ${chalk.red("Invalid directory name.")}
  Usage: react-starter-wcs my-app  
`);
}

promptHeader();

let spinner;

// MAIN FUNCTION
(async () => {
  try {
    const deps = await depsPrompt.run();
    const caprover = await caproverPrompt.run();
    const ghActions = await ghActionsPrompt.run();

    const datas = {
      deps: [...deps],
      caprover: caprover[0] ? true : false,
      ghActions:
        ghActions.lenght > 0
          ? ghActions.map((e) => {
              if (e === "ESLint on PR") {
                return "eslint";
              }
              if (e === "Build and push to a 'production' branch") {
                return "build";
              }
              return e;
            })
          : false,
    };

    await runCommand("git", ["clone", repoURL, name]);
    await runCommand("rm", ["-rf", `${name}/.git`]);

    spinner = ora("Installing dependencies...").start();

    await runCommand("npm", ["install"], {
      cwd: process.cwd() + "/" + name,
    });

    if (datas.deps.length > 0) {
      await runCommand("npm", ["install", datas.deps], {
        cwd: process.cwd() + "/" + name,
      });
    }

    if (datas.caprover) {
      // Download Caprover files gist
    }

    if (datas.ghActions) {
      // Download GH Actions files gist
    }

    spinner.stop();
    promptEnd(name);
  } catch (error) {
    throw new Error(error);
  }
})();
