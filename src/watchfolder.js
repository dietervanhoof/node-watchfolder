const chokidar = require("chokidar");
const log = require("./services/logger.service");
const FileIndex = require("./util/fileindex");
const FileRecognizer = require("./util/file_recognizer");
const options = require("./util/cmdargs").parseArguments();

let fileindex = new FileIndex(options, new FileRecognizer(options));


log.info('Watching folder: ' + options.folder);
chokidar.watch(options.folder, {ignored: (path) => {
    // Ignore sub-folders
    return RegExp(options.folder + '.+/').test(path)
}}).on('add', (event, path) => {
    log.success('event: ' + event);
    log.success('path: ' + path);
    fileindex.add_file(event, fileindex.determine_file_type(event, options), options);
});
