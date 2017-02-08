const chokidar = require("chokidar");
const log = require("./services/logger.service");
const FileIndex = require("./util/fileindex");
const FileRecognizer = require("./util/file_recognizer");
const options = require("./util/cmdargs").parseArguments();
const Publisher = require("./amqp/publisher");
const Generator = require("./util/message_generator");

const generator = new Generator(options);
const publisher = new Publisher(options);
let fileindex = new FileIndex(options, new FileRecognizer(options), publisher, generator);

publisher.initialize().then(startWatching);

function startWatching() {
    log.success('Watching folder: ' + options.folder);
    chokidar.watch(options.folder, {ignored: (path) => {
        // Ignore sub-folders
        return RegExp(options.folder + '.+/').test(path)
    }}).on('add', (event, path) => {
        fileindex.add_file(event, fileindex.determine_file_type(event, options), options, publisher, generator);
    });
};