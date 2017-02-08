let mv = require("mv");

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

    function moveFile(sourcePath, destinationPath, cb) {
        mv(sourcePath, destinationPath, {mkdirp: true}, cb);
    }

    module.exports = {
        calcMD5: calcMD5,
        moveFile: moveFile
    };
}) ();