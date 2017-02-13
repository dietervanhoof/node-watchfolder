const fileUtils = require("./../src/util/fileUtils");
const assert = require('assert');

describe('FileUtils', function() {
    describe('createFullPath', function() {
        it('should return \'/path/to/thisfile.mxf\' for path \'/path/to\' and filename \'thisfile.mxf\'', function() {
            assert.equal('/path/to/thisfile.mxf', fileUtils.createFullPath('/path/to', 'thisfile.mxf'));
        });
        it('should return \'/path/to/thisfile.mxf\' for path \'/path/to/\' and filename \'thisfile.mxf\'', function() {
            assert.equal('/path/to/thisfile.mxf', fileUtils.createFullPath('/path/to/', 'thisfile.mxf'));
        });
    });
    describe('appendFolder', function() {
        it('should return \'/path/to/dir1\' for path \'/path/to\' and directory \'dir1\'', function() {
            assert.equal('/path/to/dir1', fileUtils.appendFolder('/path/to', 'dir1'));
        });
        it('should return \'/path/to/dir1\' for path \'/path/to/\' and directory \'dir1\'', function() {
            assert.equal('/path/to/dir1', fileUtils.appendFolder('/path/to/', 'dir1'));
        });
    });
});