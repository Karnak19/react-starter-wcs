#! /usr/bin/env node

const fs = require("fs");
const clear = require("clear");
const ora = require("ora");
const axios = require("axios");
const mkdirp = require("mkdirp");

const runCommand = require("./runCommand");
const { promptHeader, promptEnd, depsPrompt, caproverPrompt, ghActionsPrompt } = require("./prompts");
const downloadGist = require("./downloadGist");
const dependencies = require("./deps.json");

const repoURL = "https://github.com/Karnak19/react-starter-template.git";
const name = process.argv[2];

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
      deps: deps.flatMap((dep) => {
        return dependencies[dep].packages ? dependencies[dep].packages : null;
      }),
      caprover: caprover[0] ? true : false,
      ghActions:
        ghActions.length > 0
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

    // await runCommand("npm", ["install"], {
    //   cwd: process.cwd() + "/" + name,
    // });

    if (datas.deps.length > 0) {
      console.log(datas.deps);
      await runCommand("npm", ["install", ...datas.deps], {
        cwd: process.cwd() + "/" + name,
      });
    }

    if (datas.caprover) {
      // Download Caprover files gist
      const gists = await downloadGist("https://api.github.com/users/Karnak19/gists", [dependencies.caprover.id]);

      const files = gists.flatMap((gist) => {
        return Object.values(gist).map((val) => {
          return {
            promise: axios.get(val.raw_url),
          };
        });
      });

      const res = await Promise.all(files.map((f) => f.promise));

      res.forEach((f) => {
        if (typeof f.data === "object") {
          f.data = JSON.stringify(f.data);
        }
        filename = f.request.path.split("/")[5];
        fs.writeFile(`${process.cwd()}/${name}/${filename}`, f.data, (err) => {
          if (err) throw err;
        });
      });
    }

    if (datas.ghActions) {
      // Download GH Actions files gist
      const ids = datas.ghActions.map((e) => {
        return dependencies[e].id;
      });
      const gists = await downloadGist("https://api.github.com/users/Karnak19/gists", ids);

      const files = gists.flatMap((gist) => {
        return Object.values(gist).map((val) => {
          return {
            promise: axios.get(val.raw_url),
          };
        });
      });

      const res = await Promise.all(files.map((f) => f.promise));

      await mkdirp(`${process.cwd()}/${name}/.github/workflows`);

      res.forEach((f) => {
        filename = f.request.path.split("/")[5];
        fs.writeFile(`${process.cwd()}/${name}/.github/workflows/${filename}`, f.data, (err) => {
          if (err) throw err;
        });
      });
    }

    spinner.stop();
    promptEnd(name);
  } catch (error) {
    spinner.stop();
    promptEnd(name);
    console.error(error);
  }
})();
