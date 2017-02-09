const mv = require("mv");
const path = require("path");

function getFileName(file_path) {
    return path.basename(file_path);
}

function getFolder(file_path) {
    return path.dirname(file_path);
}

function createFullPath(folder, file) {
    return folder.endsWith('/') ? folder + file : folder + '/' + file;
}

function appendFolder(file_path, folder) {
    return file_path.endsWith('/') ? file_path + folder : file_path + '/' + folder;
}

function moveFile(sourcePath, destinationPath, cb) {
    mv(sourcePath, destinationPath, {mkdirp: true}, cb);
}

module.exports = {
    moveFile: moveFile,
    appendFolder: appendFolder,
    createFullPath: createFullPath,
    getFileName: getFileName,
    getFolder: getFolder
};