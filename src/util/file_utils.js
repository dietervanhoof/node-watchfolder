const mv = require("mv");
const path = require("path");

const getFileName = (file_path) => {
    return path.basename(file_path);
};

const getFolder = (file_path) => {
    return path.dirname(file_path);
};

const createFullPath = (folder, file) => {
    return folder.endsWith('/') ? folder + file : folder + '/' + file;
};

const appendFolder = (file_path, folder) => {
    return file_path.endsWith('/') ? file_path + folder : file_path + '/' + folder;
};

const moveFile = (sourcePath, destinationPath, cb) => {
    mv(sourcePath, destinationPath, {mkdirp: true}, cb);
};

module.exports = {
    moveFile: moveFile,
    appendFolder: appendFolder,
    createFullPath: createFullPath,
    getFileName: getFileName,
    getFolder: getFolder
};