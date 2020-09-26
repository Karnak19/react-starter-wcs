const chalk = require('chalk');
const figlet = require('figlet');
const Prompt = require('prompt-checkbox');

const promptHeader = () =>
  console.log(
    chalk.yellow(
      figlet.textSync('react-starter-wcs', {
        horizontalLayout: 'fitted',
      }),
    ),
  );
const promptEnd = (name) => {
  colorlog('Success ! 🔥', chalk.green);
  console.log('');
  console.log('');
  colorlog('Getting started :', chalk.yellow);
  console.log('');
  colorlog(`  cd ${name}`, chalk.cyan);
  colorlog('  npm run dev', chalk.cyan);
  console.log('');
};

function colorlog(text, color) {
  return console.log(color(text));
}

const depsPrompt = new Prompt({
  name: 'packages',
  message:
    'Do you want any third-party libraries ? \n(press space to choose, enter to confirm)\n',
  choices: [
    'react-router',
    'redux',
    'recoil',
    'prop-types',
    'material-ui',
    'semantic-ui',
    'reactstrap',
  ],
});

const caproverPrompt = new Prompt({
  name: 'caprover',
  message: 'Do you want Caprover config files ?',
  radio: true,
  choices: ['yes'],
});

const ghActionsPrompt = new Prompt({
  name: 'actions',
  message: 'Do you want any pre-configured Github Actions ?',
  choices: ['ESLint on PR', "Build and push to a 'production' branch"],
});

module.exports = {
  promptEnd,
  promptHeader,
  depsPrompt,
  caproverPrompt,
  ghActionsPrompt,
};
