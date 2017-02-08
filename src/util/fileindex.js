const path = require("path");
const fileutils = require("./file_utils");
const Promise = require("bluebird");
const log = require("../services/logger.service");

function FileIndex (config, filerecognizer) {
    this.config = config;
    this.file_recognizer = filerecognizer;
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
};

FileIndex.prototype.add_file = function (filepath, file_type) {
    let filename = path.basename(filepath);
    log.info('Received a new file: ' + filename);
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
        log.info('PACKAGE ' + lookupKey + ' IS COMPLETE!');
        //acceptPackage(key, this.packages, this.config);
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
            log.info('Package ' + key + ' is too old. Deleting this entry and making it as incomplete.');
            discardPackage(key, this.packages, this.config);
        }
    }
};

function discardPackage(key, packages, config) {
    log.info('Discarding package with key: ' + key);
    Promise
        .bind({
            key: key,
            packages: packages,
            config: config
        })
        .then(moveIncompletePackage)
        .then(deleteEntry)
        .then(sendIncompleteMessage)
        .catch(error => {
            log.error(error);
        });
}

function acceptPackage(key, packages, config) {
    log.info('Accepting package with key: ' + key);
    Promise
        .bind({
            key: key,
            packages: packages,
            config: config
        })
        .then(moveIncompletePackage)
        .then(deleteEntry)
        .then(sendIncompleteMessage)
        .catch(error => {
            log.info(error);
        });
}

function moveIncompletePackage() {
    return new Promise((fulfill, reject) => {
        log.info(this.packages);
        this.packages[this.key].files.forEach((file) => {
            log.info('Trying to move file: ' + file);
            fileutils.moveFile(file.file_path, (path.dirname(file.file_path) + '/' + this.config.INCOMPLETE_FOLDER_NAME + '/' + path.basename(file.file_path)), (err) => {
                if (err) {
                    reject(err);
                }
            });
        });
        fulfill();
    });
}

function deleteEntry() {
    return new Promise((fulfill, reject) => {
        log.info('Deleting entry: ' + this.key);
        delete this.packages[this.key];
        fulfill();
    });
}

function sendIncompleteMessage() {
    return new Promise((fulfill, reject) => {
        log.info('Publishing message on the incomplete queue.');
        fulfill();
    });
}

module.exports = FileIndex;