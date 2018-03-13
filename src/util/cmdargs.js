const util = require("util");
const required_arguments = [
    "CP",
    "FLOW_ID",
    "ESSENCE_FILE_TYPE",
    "RABBIT_MQ_HOST",
    "RABBIT_MQ_PORT",
    "RABBIT_MQ_VHOST",
    "RABBIT_MQ_SUCCESS_EXCHANGE",
    "RABBIT_MQ_SUCCESS_QUEUE",
    "RABBIT_MQ_ERROR_EXCHANGE",
    "RABBIT_MQ_ERROR_QUEUE",
    "RABBIT_MQ_TOPIC_TYPE",
    "RABBIT_MQ_USER",
    "RABBIT_MQ_PASSWORD",
    "FTP_SERVER",
    "FTP_USERNAME",
    "FTP_PASSWORD",
    "CHECK_PACKAGE_INTERVAL",
    "CHECK_PACKAGE_AMOUNT",
    "PROCESSING_FOLDER_NAME",
    "INCOMPLETE_FOLDER_NAME",
    "REFUSED_FOLDER_NAME",
    "FOLDER_TO_WATCH"
];
const fileTypeArguments = [
    "ESSENCE_FILE_TYPE",
    "SIDECAR_FILE_TYPE",
    "COLLATERAL_FILE_TYPE",
    "IGNORE_FILE_TYPE"
];

const parseArguments = () => {
    const argv = require('minimist')(process.argv.slice(2));
    required_arguments.forEach((argument) => {
        if (!argv[argument]) throw ('Argument ' + argument + ' was missing but is required.');
    });

    // Derived arguments
    argv.folder = argv.FOLDER_TO_WATCH;
    argv.broker = util.format('amqp://%s:%s@%s:%d/%s',
        argv.RABBIT_MQ_USER,
        argv.RABBIT_MQ_PASSWORD,
        argv.RABBIT_MQ_HOST,
        argv.RABBIT_MQ_PORT,
        argv.RABBIT_MQ_VHOST);

    fileTypeArguments.forEach((ft) => {
        if (argv[ft] && argv[ft] !== undefined && argv[ft] !== true) {
            argv[ft] = argv[ft].toString().replace(/ /g, '').split(',');
        }
        else {
            argv[ft] = undefined;
        }
    });
    /*
    // Check if essence type exists
    if (argv.ESSENCE_FILE_TYPE && argv.ESSENCE_FILE_TYPE.length != undefined) {
        argv.ESSENCE_FILE_TYPE = argv.ESSENCE_FILE_TYPE.split(',');
    }
    else {
        argv.ESSENCE_FILE_TYPE = undefined;
    }
    //argv.ESSENCE_FILE_TYPE = argv.ESSENCE_FILE_TYPE.split(',');

    // Check if sidecar type exists
    if (argv.SIDECAR_FILE_TYPE && argv.SIDECAR_FILE_TYPE.length != undefined) {
        argv.SIDECAR_FILE_TYPE = argv.SIDECAR_FILE_TYPE.split(',');
    }
    else {
        argv.SIDECAR_FILE_TYPE = undefined;
    }
    // Check if collateral type exists
    if (argv.COLLATERAL_FILE_TYPE && argv.COLLATERAL_FILE_TYPE.length != undefined) {
        argv.COLLATERAL_FILE_TYPE = argv.COLLATERAL_FILE_TYPE.split(',');
    }
    else {
        argv.COLLATERAL_FILE_TYPE = undefined;
    }
    */



    if (!argv.RETRY_PACKAGE_INTERVAL) {
        argv.RETRY_PACKAGE_INTERVAL = 15000
    }
    return argv;
};

module.exports = {
    parseArguments: parseArguments
};