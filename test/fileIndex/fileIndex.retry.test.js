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
    describe('when encountering connection issues', () => {
        const packagekey = 'thisfile';
        before(() => {
            publisher = {
                publishMessage: sinon.stub()
                    .onCall(0).rejects('Connection error')
                    .onCall(1).rejects('Connection error')
                    .onCall(2).rejects('Connection error')
                    .onCall(3).resolves('OK')
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
            fileIndex.sendCompleteMessage = sinon.spy(fileIndex.sendCompleteMessage);
            return Promise.all([
                fileIndex.add_file('/fake/path/' + packagekey + '.mxf', 'essence'),
                fileIndex.add_file('/fake/path/' + packagekey + '.xml', 'sidecar'),
                fileIndex.add_file('/fake/path/' + packagekey + '.srt', 'collateral')
            ]);
        });
        describe('when retrying', () => {
            it('the package should contain 3 files', () => {
                assert.equal(3, fileIndex.packages[packagekey].files.length);
            });
            it('the package should be marked as complete', () => {
                assert.equal(true, fileIndex.packages[packagekey].isComplete);
            });
            it('the package should be marked as failed', () => {
                assert.equal(true, fileIndex.packages[packagekey].failed);
                assert.equal(1, fileIndex.sendCompleteMessage.callCount);
            });
            it('message sending should be retried', () => {
                fileIndex.retry_failed_packages();
                assert.equal(2, fileIndex.sendCompleteMessage.callCount);
                fileIndex.retry_failed_packages();
                assert.equal(3, fileIndex.sendCompleteMessage.callCount);
            });
            describe('once the connection issue is gone', () => {
                before(() => {
                    fileIndex.retry_failed_packages();
                });
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
            })
        });
    });
});