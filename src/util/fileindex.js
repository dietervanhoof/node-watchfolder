const path = require("path");
const fileutils = require("./file_utils");
const Promise = require("bluebird");
const log = require("../services/logger.service");

function FileIndex (config, filerecognizer, publisher) {
    this.config = config;
    this.file_recognizer = filerecognizer;
    this.publisher = publisher;
    this.packages = {};
    setInterval(this.check_expired_packages.bind(this), config.CHECK_PACKAGE_INTERVAL);
};

FileIndex.prototype.determine_file_type = function(filepath) {
    let filename = path.basename(filepath);
    if (this.file_recognizer.is_essence(filename)) {
        return "essence";
    } else if (this.file_recognizer.is_sidecar(filename)){
        return "sidecar";
    }
    if (this.config['COLLATERAL_FILE_TYPE']) {
        if (this.file_recognizer.is_collateral(filename)) {
            return "collateral";
        }
    }
    return "other";
};

FileIndex.prototype.add_file = function (filepath, file_type) {
    const filename = path.basename(filepath);
    if (file_type !== 'other') {
        log.info('Accepted file for package handling: ' + filename);
        let lookupKey = filename.replace(/\.[^/.]+$/, "");
        if (this.packages[lookupKey]) {
            this.packages[lookupKey].files.push(
                {
                    file_type: file_type,
                    file_path: filepath
                });
        } else {
            log.info('This is a new package. Create one.');
            this.packages[lookupKey] = {
                files: [
                    {
                        file_type: file_type,
                        file_path: filepath
                    }
                ]
            }
        }
        this.packages[lookupKey].lastModificationDate = new Date().getTime();
        if (this.is_package_complete(lookupKey)) {
            // Avoid discarding once complete
            this.packages[lookupKey].isComplete = true;
            log.success('PACKAGE ' + lookupKey + ' IS COMPLETE!');
            //acceptPackage(key);
        }
    } else {
        log.info('Refused file for package handling: ' + filename);
        this.refuseFile(filepath);
    }
};

FileIndex.prototype.is_package_complete = function(key) {
    let has_essence = false;
    let has_sidecar = false;
    let has_collateral = false;

    this.packages[key].files.forEach((file) => {
        if (file.file_type == 'essence') has_essence = true;
        if (file.file_type == 'sidecar') has_sidecar = true;
        if (file.file_type == 'collateral') has_collateral = true;
    });

    if (this.config['COLLATERAL_FILE_TYPE']) {
        return has_essence && has_sidecar && has_collateral
    } else {
        return has_essence && has_sidecar
    }
};

FileIndex.prototype.check_expired_packages = function() {
    let currentTime = new Date().getTime();
    for (var key in this.packages) {
        if (!this.packages[key].isComplete && this.packages[key].lastModificationDate + (this.config.CHECK_PACKAGE_INTERVAL * this.config.CHECK_PACKAGE_AMOUNT) < currentTime) {
            log.warn('Package ' + key + ' is too old. Deleting this entry and making it as incomplete.');
            this.discardPackage(key);
        }
    }
};

FileIndex.prototype.refuseFile = function (path) {
    fileutils.moveFile(path, fileutils.generatePath(path, this.config.REFUSED_FOLDER_NAME), (err) => {
        if (err) {
            reject(err);
        }
    });
};

/** Package is incomplete **/
FileIndex.prototype.discardPackage = function(key) {
    log.info('Discarding package with key: ' + key);
    this.moveIncompletePackage(key)
        .then( () => { this.deleteEntry(key) })
        .then( () => { this.sendIncompleteMessage(key) })
        .catch(error => {
            log.error(error);
        });
};
/** Package is complete **/
FileIndex.prototype.acceptPackage = function(key) {
    log.info('Accepting package with key: ' + key);
    this.moveIncompletePackage(key)
        .then( () => { this.sendIncompleteMessage(key) })
        .then( () => { this.deleteEntry(key) })
        .catch(error => {
            log.info(error);
        });
};

FileIndex.prototype.moveIncompletePackage = function(key) {
    return new Promise((fulfill, reject) => {
        log.info(this.packages);
        this.packages[key].files.forEach((file) => {
            log.info('Trying to move file: ' + file);
            fileutils.moveFile(file.file_path, fileutils.generatePath(file.file_path, this.config.INCOMPLETE_FOLDER_NAME), (err) => {
                if (err) {
                    reject(err);
                }
            });
        });
        fulfill();
    });
};

FileIndex.prototype.deleteEntry = function(key) {
    return new Promise((fulfill, reject) => {
        try {
            log.info('Deleting entry: ' + this.key);
            delete this.packages[key];
        } catch (error) {
            reject(error);
        }
        fulfill();
    });
};

FileIndex.prototype.sendIncompleteMessage = function() {
    return new Promise((fulfill, reject) => {
        log.info('Publishing message on the incomplete queue.');
        fulfill();
    });
};

module.exports = FileIndex;