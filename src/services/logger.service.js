const chalk = require('chalk');

module.exports = {
    debug,
    error,
    info,
    success,
    warn
};

function debug(message) {
    if (env === 'development') {
        console.log(message);
    }
}

function error(message) {
    console.log(chalk.red(message));
}

function info(message) {
    console.log(message);
}

function success(message) {
    console.log(chalk.green(message));
}

function warn(message) {
    console.log(chalk.yellow(message));
}