const FileIndex = require('./../../src/util/fileIndex');
const FileRecognizer = require('./../../src/util/fileRecognizer');
const FileUtils = require('./../../src/util/fileUtils');
const assert = require('assert');
const sinon = require('sinon');

describe('fileIndex', () => {
    let logger = {};
    let options = {};
    let fileIndex = {};
    let publisher = {};
    let generator = {};
    let fileutils = {};
    let fileRecognizer = {};
    before(() => {
        logger = {
            info: () => { return undefined },
            warn: () => { return undefined },
            error: () => { return undefined }
        }
        options = {
            CP: 'TEST',
            FLOW_ID: 'TEST_ID',
            ESSENCE_FILE_TYPE: [
                '.mxf',
                '.wav'
            ],
            SIDECAR_FILE_TYPE: ['.xml'],
            COLLATERAL_FILE_TYPE: ['.srt'],
            NR_OF_COLLATERALS: 1,
            CHECK_PACKAGE_INTERVAL: 100,
            CHECK_PACKAGE_AMOUNT: 5,
            RETRY_PACKAGE_INTERVAL: 200,
            PROCESSING_FOLDER_NAME: 'processing',
            INCOMPLETE_FOLDER_NAME: 'incomplete',
            REFUSED_FOLDER_NAME: 'refused',
            IGNORE_FILE_TYPE: ['.part']
        };
        fileRecognizer = new FileRecognizer(options)
    })
    describe('create a complete package', () => {
        const packagekey = 'thisfile';
        before(() => {
            publisher = {
                publishMessage: sinon.spy()
            };
            fileutils = {
                moveFile: sinon.spy(),
                createFullPath: FileUtils.createFullPath,
                appendFolder: FileUtils.appendFolder,
                getFileName: FileUtils.getFileName,
                getFolder: FileUtils.getFolder
            };
            generator = {
                generate: sinon.spy()
            };
            fileIndex = new FileIndex(options, fileRecognizer, publisher, generator, logger, fileutils);
        });
        describe('adding an essence file', () => {
            it('should return \'' + packagekey + '.mxf\'', () => {
                return fileIndex.add_file('/fake/path/' + packagekey + '.mxf', 'essence').then((data) => {
                    assert.equal(packagekey + '.mxf', data.files.filter((file) => file.file_type === 'essence')[0].file_name)
                });
            });
            it('should not call \'generate\' on the generator', () => {
                assert(generator.generate.notCalled);
            });
            it('should not call \'publishMessage\' on the publisher', () => {
                assert(publisher.publishMessage.notCalled);
            });
            it('should have 1 entry in the package list', () => {
                assert.equal(1, Object.keys(fileIndex.packages).length);
            });
            it('should have 1 file in the package', () => {
                assert.equal(1, fileIndex.packages[packagekey].files.length);
            });
        });
        describe('adding a sidecar file', () => {
            it('should return \'' + packagekey + '.xml\'', () => {
                return fileIndex.add_file('/fake/path/' + packagekey + '.xml', 'sidecar').then((data) => {
                    assert.equal(packagekey + '.xml', data.files.filter((file) => file.file_type === 'sidecar')[0].file_name)
                });
            });
            it('should not call \'generate\' on the generator', () => {
                assert(generator.generate.notCalled);
            });
            it('should not call \'publishMessage\' on the publisher', () => {
                assert(publisher.publishMessage.notCalled);
            });
            it('should have 1 entry in the package list', () => {
                assert.equal(1, Object.keys(fileIndex.packages).length);
            });
            it('should have 2 files in the package', () => {
                assert.equal(2, fileIndex.packages[packagekey].files.length);
            });
        });
        describe('adding a non related file', () => {
            it('should return not have added any files', () => {
                return fileIndex.add_file('/fake/path/incomplete.mp4.part', 'ignore').then(() => {
                    assert.equal(2, fileIndex.packages[packagekey].files.length);
                });
            });
            it('should not call \'generate\' on the generator', () => {
                assert(generator.generate.notCalled);
            });
            it('should not call \'publishMessage\' on the publisher', () => {
                assert(publisher.publishMessage.notCalled);
            });
            it('should have 1 entry in the package list', () => {
                assert.equal(1, Object.keys(fileIndex.packages).length);
            });
        });
        describe('adding a collateral file', () => {
            it('should return \'' + packagekey + '.srt\'', () => {
                return fileIndex.add_file('/fake/path/' + packagekey + '.srt', 'collateral').then((data) => {
                    assert.equal(packagekey + '.srt', data.files.filter((file) => file.file_type === 'collateral')[0].file_name)
                });
            });
        });
        describe('completing a package', () => {
            it('should call \'generate\' on the generator', () => {
                assert(generator.generate.called);
            });
            it('should call \'publishMessage\' on the publisher', () => {
                assert(publisher.publishMessage.called);
            });
            it('should call \'move\' on the files', () => {
                assert.equal(3, fileutils.moveFile.callCount);
            });
            it('should remove the entry from the package list', () => {
                assert.equal(0, Object.keys(fileIndex.packages).length);
            });
        });
    });
});