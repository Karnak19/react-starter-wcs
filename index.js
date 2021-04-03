#! /usr/bin/env node

const fs = require('fs');
const clear = require('clear');
const ora = require('ora');
const axios = require('axios');
const mkdirp = require('mkdirp');
const chalk = require('chalk');

const runCommand = require('./runCommand');
const {
  promptHeader,
  promptEnd,
  depsPrompt,
  caproverPrompt,
  ghActionsPrompt,
} = require('./prompts');
const downloadGist = require('./downloadGist');
const dependencies = require('./deps.json');

const repoURL = 'https://github.com/Karnak19/react-starter-template.git';
const name = process.argv[2];

clear();

// eslint-disable-next-line no-control-regex
if (!name || name.match(/[<>:"\/\\|?*\x00-\x1F]/)) {
  // eslint-disable-next-line no-console
  return console.log(`
  ${chalk.red('Invalid directory name.')}
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
    // const ghActions = await ghActionsPrompt.run();

    const datas = {
      deps: deps.flatMap((dep) =>
        dependencies[dep].packages ? dependencies[dep].packages : null,
      ),
      caprover: !!caprover[0],
      // ghActions:
      //   ghActions.length > 0
      //     ? ghActions.map((e) => {
      //         if (e === 'ESLint on PR') {
      //           return 'eslint';
      //         }
      //         if (e === "Build and push to a 'production' branch") {
      //           return 'build';
      //         }
      //         return e;
      //       })
      //     : false,
    };

    await runCommand('git', ['clone', repoURL, name]);
    await runCommand('rm', ['-rf', `${name}/.git`]);
    await runCommand('git', ['init', `${name}`]);

    spinner = ora('Installing dependencies...').start();

    await runCommand('npm', ['install'], {
      cwd: `${process.cwd()}/${name}`,
    });

    if (datas.deps.length > 0) {
      await runCommand('npm', ['install', ...datas.deps], {
        cwd: `${process.cwd()}/${name}`,
      });
    }

    if (datas.deps.includes('tailwindcss@latest')) {
      const gist = await downloadGist(
        'https://api.github.com/users/Karnak19/gists',
        [dependencies.tailwindcss.id],
      );

      const files = gist.flatMap((gist) =>
        Object.values(gist).map((val) => ({
          promise: axios.get(val.raw_url),
        })),
      );

      const res = await Promise.all(files.map((f) => f.promise));

      res.forEach((f) => {
        if (typeof f.data === 'object') {
          // eslint-disable-next-line no-param-reassign
          f.data = JSON.stringify(f.data);
        }
        const filename = f.request.path.split('/')[5];

        const isfileNameCss = filename.includes('.css')
          ? `src/${filename}`
          : filename;
        console.log(isfileNameCss);

        fs.writeFile(
          `${process.cwd()}/${name}/${isfileNameCss}`,
          f.data,
          (err) => {
            if (err) throw err;
          },
        );
      });
    }

    if (datas.caprover) {
      // Download Caprover files gist
      const gists = await downloadGist(
        'https://api.github.com/users/Karnak19/gists',
        [dependencies.caprover.id],
      );

      const files = gists.flatMap((gist) =>
        Object.values(gist).map((val) => ({
          promise: axios.get(val.raw_url),
        })),
      );

      const res = await Promise.all(files.map((f) => f.promise));

      res.forEach((f) => {
        if (typeof f.data === 'object') {
          // eslint-disable-next-line no-param-reassign
          f.data = JSON.stringify(f.data);
        }
        const filename = f.request.path.split('/')[5];
        fs.writeFile(`${process.cwd()}/${name}/${filename}`, f.data, (err) => {
          if (err) throw err;
        });
      });
    }

    if (datas.ghActions) {
      // Download GH Actions files gist
      const ids = datas.ghActions.map((e) => dependencies[e].id);
      const gists = await downloadGist(
        'https://api.github.com/users/Karnak19/gists',
        ids,
      );

      const files = gists.flatMap((gist) =>
        Object.values(gist).map((val) => ({
          promise: axios.get(val.raw_url),
        })),
      );

      const res = await Promise.all(files.map((f) => f.promise));

      await mkdirp(`${process.cwd()}/${name}/.github/workflows`);

      res.forEach((f) => {
        // eslint-disable-next-line prefer-destructuring
        const filename = f.request.path.split('/')[5];
        fs.writeFile(
          `${process.cwd()}/${name}/.github/workflows/${filename}`,
          f.data,
          (err) => {
            if (err) throw err;
          },
        );
      });
    }

    spinner.stop();
    promptEnd(name);
  } catch (error) {
    // spinner.stop();
    // promptEnd(name);
    // eslint-disable-next-line no-console
    console.error(error);
  }
})();
