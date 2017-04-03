const path = require("path");
const fileutils = require("./fileUtils");
const Promise = require("bluebird");
const log = require("../services/logger.service");

function FileIndex (config, filerecognizer, publisher, generator) {
    this.config = config;
    this.file_recognizer = filerecognizer;
    this.publisher = publisher;
    this.generator = generator;
    this.packages = {};
    setInterval(this.check_expired_packages.bind(this), config.CHECK_PACKAGE_INTERVAL);
    setInterval(this.retry_failed_packages.bind(this), config.RETRY_PACKAGE_INTERVAL);
};

FileIndex.prototype.determine_file_type = function(filepath) {
    const filename = path.basename(filepath);
    if (this.file_recognizer.is_essence(filename)) {
        return "essence";
    } else if (this.config['SIDECAR_FILE_TYPE'] && this.file_recognizer.is_sidecar(filename)){
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
    return new Promise((resolve, reject) => {
        const filename = path.basename(filepath);
        const currentTime = new Date();
        const currentTimeMillis = currentTime.getTime();
        if (file_type !== 'other') {
            const lookupKey = filename.replace(/\.[^/.]+$/, "");
            if (this.packages[lookupKey]) {
                log.info('Accepted file for existing package: ' + filename);
                this.packages[lookupKey].files.push(
                    {
                        file_type: file_type,
                        file_path: fileutils.getFolder(filepath),
                        file_name: fileutils.getFileName(filepath),
                        timestamp: currentTime

                    });
            } else {
                log.info('Accepted file for new package: ' + filename);
                this.packages[lookupKey] = {
                    files: [
                        {
                            file_type: file_type,
                            file_path: fileutils.getFolder(filepath),
                            file_name: fileutils.getFileName(filepath),
                            timestamp: currentTime
                        }
                    ]
                }
            }
            this.packages[lookupKey].lastModificationDate = currentTimeMillis;
            if (this.is_package_complete(lookupKey)) {
                // Avoid discarding once complete
                this.packages[lookupKey].isComplete = true;
                this.acceptPackage(lookupKey, this);
            }
        } else {
            log.info('Refused file for package handling: ' + filename);
            this.refuseFile(filepath);
        }
        resolve();
    });
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
        return has_essence && has_sidecar && has_collateral;
    } else {
        if (this.config['SIDECAR_FILE_TYPE']) {
            return has_essence && has_sidecar;
        }
        else {
            return has_essence;
        }
    }
};

FileIndex.prototype.check_expired_packages = function() {
    const currentTime = new Date().getTime();
    for (let key in this.packages) {
        if (!this.packages[key].isComplete && this.packages[key].lastModificationDate + (this.config.CHECK_PACKAGE_INTERVAL * this.config.CHECK_PACKAGE_AMOUNT) < currentTime) {
            log.warn('Package ' + key + ' is too old. Deleting this entry and making it as incomplete.');
            this.discardPackage(key);
        }
    }
};

FileIndex.prototype.retry_failed_packages = function() {
    const currentTime = new Date().getTime();
    for (let key in this.packages) {
        if (this.packages[key].isComplete && this.packages[key].failed) {
            log.warn('Package ' + key + ' failed. Trying to publish message again.');
            this.sendCompleteMessage(key)
                .bind(this)
                .then(() => this.movePackage(key, this.config.PROCESSING_FOLDER_NAME))
                .then( () => { return this.deleteEntry(key) })
                .catch(error => {
                    this.packages[key].failed = true;
                    log.error(error + ' - Keeping package in memory');
                });
        }
    }
};

/** Package is incomplete **/
FileIndex.prototype.discardPackage = function(key) {
    log.info('Discarding package with key: ' + key);
    this.movePackage(key, this.config.INCOMPLETE_FOLDER_NAME)
        .then( () => { this.deleteEntry(key) })
        .catch(error => {
            log.error(error);
        });
};

/** Package is complete **/
FileIndex.prototype.acceptPackage = function(key) {
    log.info('Package ' + key + ' is complete.');
    this.movePackage(key, this.config.PROCESSING_FOLDER_NAME)
        .then( () => { return this.sendCompleteMessage(key) })
        .then( () => { return this.deleteEntry(key) })
        .catch(error => {
            this.packages[key].failed = true;
            log.error(error + ' - Keeping package in memory');
        });
};

FileIndex.prototype.refuseFile = function (path) {
    fileutils.moveFile(path, fileutils.createFullPath(fileutils.appendFolder(
        fileutils.getFolder(path), this.config.REFUSED_FOLDER_NAME), fileutils.getFileName(path)), (err) => {
        if (err) {
            reject(err);
        }
    });
};

FileIndex.prototype.movePackage = function(key, folder) {
    return new Promise((resolve, reject) => {
        this.packages[key].files.forEach((file) => {
            fileutils.moveFile(fileutils.createFullPath(file.file_path, file.file_name),
                fileutils.createFullPath(fileutils.appendFolder(
                    file.file_path, folder), file.file_name), (err) => {
                    if (err) {
                        reject(err);
                    }
                });
        });
        resolve();
    });
};

FileIndex.prototype.deleteEntry = function(key) {
    return new Promise((resolve, reject) => {
        try {
            log.info('Deleting entry: ' + key);
            delete this.packages[key];
            resolve();
        } catch (error) {
            reject(error);
        }
    });
};

FileIndex.prototype.sendCompleteMessage = function(key) {
    return this.publisher.publishMessage(this.generator.generate(this.packages[key], this.config.PROCESSING_FOLDER_NAME), key);
};

module.exports = FileIndex;