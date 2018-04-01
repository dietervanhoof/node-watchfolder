const fileUtils = require("./../../src/util/fileUtils");
const assert = require('assert');
const sinon = require('sinon');
const fs = require('fs');

describe('FileUtils', function() {
    describe('createFull path', function() {
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
    describe('createDirectory', function() {
        before(function() {
            sinon
                .stub(fs, 'statSync')
                .returns({
                    "dev": 16777228,
                    "mode": 16877,
                    "nlink": 46,
                    "uid": 501,
                    "gid": 20,
                    "rdev": 0,
                    "blksize": 4194304,
                    "ino": 766626,
                    "size": 1472,
                    "blocks": 0,
                    "atimeMs": 1522578816840.625,
                    "mtimeMs": 1522578816828.8665,
                    "ctimeMs": 1522578816828.8665,
                    "birthtimeMs": 1508604416726.4685,
                    "atime": "2018-04-01T10:33:36.841Z",
                    "mtime": "2018-04-01T10:33:36.829Z",
                    "ctime": "2018-04-01T10:33:36.829Z",
                    "birthtime": "2017-10-21T16:46:56.726Z"
                });
            sinon
                .stub(fs, 'mkdirSync')
                .returns();
            sinon.stub(fs, 'existsSync').returns(false);
            fs.chownSync = sinon.spy();
            process.umask = sinon.spy();
    });
    it('should call mkdirSync', () => {
        const permissions = fileUtils.getPermissions('.');
        fileUtils.createDirectory('./dir', permissions.uid, permissions.gid, permissions.mode);
        assert(fs.mkdirSync.calledOnce);
    });
    it('should call existsSync', () => {
        assert(fs.existsSync.calledOnce);
    });
    it('should call process.umask', () => {
        assert(process.umask.calledOnce);
    });
    it('should call chownsync', () => {
        assert(fs.chownSync.calledOnce);
    });
}) });