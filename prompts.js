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
  colorlog('  yarn dev', chalk.cyan);
  console.log('');
};

function colorlog(text, color) {
  return console.log(color(text));
}

const caproverPrompt = new Prompt({
  name: 'caprover',
  message: 'Do you want Caprover config files ?',
  radio: true,
  choices: ['yes'],
});

module.exports = {
  promptEnd,
  promptHeader,
  caproverPrompt,
};
