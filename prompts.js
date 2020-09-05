const chalk = require("chalk");
const figlet = require("figlet");

const promptHeader = () =>
  console.log(
    chalk.yellow(
      figlet.textSync("react-starter-wcs", {
        horizontalLayout: "fitted",
      })
    )
  );
const promptEnd = (name) => {
  colorlog("Success ! 🔥", chalk.green);
  console.log("");
  console.log("");
  colorlog("Getting started :", chalk.yellow);
  console.log("");
  colorlog(`  cd ${name}`, chalk.cyan);
  colorlog("  npm run dev", chalk.cyan);
  console.log("");
};

function colorlog(text, color) {
  return console.log(color(text));
}

module.exports = {
  promptEnd,
  promptHeader,
};
