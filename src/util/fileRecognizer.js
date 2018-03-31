const path = require("path");

function FileRecognizer(config) {
    this.config = config;
    return this;
}

FileRecognizer.prototype.is_essence = function(file_name) {
    return match_types(path.extname(file_name), this.config['ESSENCE_FILE_TYPE'])
};

FileRecognizer.prototype.is_sidecar = function(file_name) {
    return match_types(path.extname(file_name), this.config['SIDECAR_FILE_TYPE'])
};

FileRecognizer.prototype.is_collateral = function (file_name) {
    return match_types(path.extname(file_name), this.config['COLLATERAL_FILE_TYPE'])
};

FileRecognizer.prototype.is_ignored = function (file_name) {
    return match_types(path.extname(file_name), this.config['IGNORE_FILE_TYPE'])
};

function match_types (extension, file_types) {
    return file_types.some((filetype) => {
        if (filetype.toLowerCase() == extension.toLowerCase()) {
            return true;
        } else {
            return false;
        }
    });
}

module.exports = FileRecognizer;
