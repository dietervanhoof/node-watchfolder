const chokidar = require("chokidar");
const log = require("./services/logger.service");
const FileIndex = require("./util/fileIndex");
const FileUtils = require('./util/fileUtils');
const FileRecognizer = require("./util/fileRecognizer");
const options = require("./util/cmdargs").parseArguments();
const Publisher = require("./amqp/publisher");
const Generator = require("./util/messageGenerator");
const path = require('path');

const generator = new Generator(options);
const publisher = new Publisher(options);
const fileindex = new FileIndex(options, new FileRecognizer(options), publisher, generator);

// Make sure the folder to watch exists with the correct permissions (parent folder)
let parentFolderStat = FileUtils.getPermissions(path.dirname(options.folder));
FileUtils.createDirectory(options.folder, parentFolderStat.uid, parentFolderStat.gid, parentFolderStat.mode);

parentFolderStat = FileUtils.getPermissions(options.folder);

// Create the PROCESSING, INCOMPLETE and REFUSED folders
FileUtils.createDirectory(FileUtils.createFullPath(options.folder, options.PROCESSING_FOLDER_NAME), parentFolderStat.uid, parentFolderStat.gid, parentFolderStat.mode);
FileUtils.createDirectory(FileUtils.createFullPath(options.folder, options.INCOMPLETE_FOLDER_NAME), parentFolderStat.uid, parentFolderStat.gid, parentFolderStat.mode);
FileUtils.createDirectory(FileUtils.createFullPath(options.folder, options.REFUSED_FOLDER_NAME), parentFolderStat.uid, parentFolderStat.gid, parentFolderStat.mode);

chokidar.watch(
    options.folder,
    {
        ignored: (path) => {
            // Ignore sub-folders
            return RegExp(options.folder + '.+/').test(path)
        },
        usePolling: false,
        alwaysStat: false,
        awaitWriteFinish: true
    })
    .on('add', (path) => {
        fileindex.add_file(path, fileindex.determine_file_type(path, options), options, publisher, generator);
    }
);
log.success('Watching folder: ' + options.folder);