const chokidar = require("chokidar");
const log = require("./services/logger.service");
const FileIndex = require("./util/fileindex");
const FileRecognizer = require("./util/file_recognizer");
const options = require("./util/cmdargs").parseArguments();
const Publisher = require("./amqp/publisher");
const Generator = require("./util/message_generator");
const fs = require("fs");

const generator = new Generator(options);
const publisher = new Publisher(options);
let fileindex = new FileIndex(options, new FileRecognizer(options), publisher, generator);

const fileCopyDelaySeconds = 3;

publisher.initialize().then(startWatching);

function startWatching() {
    log.success('Watching folder: ' + options.folder);
    chokidar.watch(options.folder, {ignored: (path) => {
        // Ignore sub-folders
        return RegExp(options.folder + '.+/').test(path)
    }}).on('add', (event, path) => {
        tryWatchFile(event);
    });
};

function tryWatchFile(event) {
    return new Promise((fulfill, reject) => {
        fs.stat(event, function (err, stat) {
            if (err){
                log.error('Error watching file for copy completion. ERR: ' + err.message);
                log.error('Error file not processed. PATH: ' + event);
                reject(err);
            } else {
                fulfill(setTimeout(checkFileCopyComplete, fileCopyDelaySeconds*1000, event, stat));
            }
        });
    });
}

function checkFileCopyComplete(path, prev) {
    fs.stat(path, function (err, stat) {
        if (err) {
            throw err;
        }
        if (stat.mtime.getTime() === prev.mtime.getTime()) {
            fileindex.add_file(path, fileindex.determine_file_type(path, options), options, publisher, generator)
        }
        else {
            setTimeout(checkFileCopyComplete, fileCopyDelaySeconds*1000, path, stat);
        }
    });
}