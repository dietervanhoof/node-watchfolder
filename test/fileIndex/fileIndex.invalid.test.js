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
    });
    describe('adding an invalid file', () => {
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
        describe('creating a refused file', () => {
            it('should return not have added any files', () => {
                return fileIndex.add_file('/fake/path/incomplete.mp4', 'other').then(() => {
                    assert.equal(0, Object.keys(fileIndex.packages).length);
                });
            });
            it('should not call \'generate\' on the generator', () => {
                assert(generator.generate.notCalled);
            });
            it('should not call \'publishMessage\' on the publisher', () => {
                assert(publisher.publishMessage.notCalled);
            });
            it('should move the file', () => {
                assert(fileutils.moveFile.called);
            })
        });
    });
});