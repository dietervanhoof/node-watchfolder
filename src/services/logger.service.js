const chalk = require('chalk');
const util = require("util");
require( "console-stamp" )( console, { pattern : "dd/mm/yyyy HH:MM:ss.l" } );

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
    console.error(chalk.red(message));
}

function info(message) {
    console.info(message);
}

function success(message) {
    console.log(chalk.green(message));
}

function warn(message) {
    console.warn(chalk.yellow(message));
}