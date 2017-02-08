const mv = require("mv");
const path = require("path");

(() => {
    function calcMD5 (file) {
        var fd = fs.openSync (file, 'r');
        var hash = crypto.createHash ('md5');
        var buffer = new Buffer (1024);
        var n = 0;

        while ( nr = fs.readSync (fd, buffer, 0, buffer.length) ) {
            hash.update (buffer.slice (0, nr));
        }
        fs.close(fd);
        return hash.digest ('hex');
    };

    function generatePath(file_path, folder) {
        return (path.dirname(file_path) + '/' + folder + '/' + path.basename(file_path));
    }

    function moveFile(sourcePath, destinationPath, cb) {
        mv(sourcePath, destinationPath, {mkdirp: true}, cb);
    }

    module.exports = {
        calcMD5: calcMD5,
        moveFile: moveFile,
        generatePath: generatePath
    };
}) ();