const chokidar = require("chokidar");
const log = require("./services/logger.service");
const FileIndex = require("./util/fileIndex");
const FileRecognizer = require("./util/fileRecognizer");
const options = require("./util/cmdargs").parseArguments();
const Publisher = require("./amqp/publisher");
const Generator = require("./util/messageGenerator");
const fs = require("fs");

const generator = new Generator(options);
const publisher = new Publisher(options);
const fileindex = new FileIndex(options, new FileRecognizer(options), publisher, generator);

const startWatching = () => {
    return new Promise((resolve, reject) => {
        log.success('Watching folder: ' + options.folder);
        chokidar.watch(options.folder,
            {ignored: (path) => {
                // Ignore sub-folders
                return RegExp(options.folder + '.+/').test(path)
            },
            awaitWriteFinish: {
                stabilityThreshold: 2000,
                pollInterval: 100
            }}).on('add', (path) => {
            fileindex.add_file(path, fileindex.determine_file_type(path, options), options, publisher, generator);
        });
        resolve();
    });
};

startWatching()
    .catch( (err) => {
        log.error(err);
        process.exit(1);
    });