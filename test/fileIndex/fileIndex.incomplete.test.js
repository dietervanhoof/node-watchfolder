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
describe('create an incomplete package', () => {
    let clock = {};
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
        options.CHECK_PACKAGE_AMOUNT = 1;
        fileIndex = new FileIndex(options, fileRecognizer, publisher, generator, logger, fileutils);
        clock = sinon.useFakeTimers();
    });
    after(function () {
        clock.restore();
    });
    describe('adding a single essence file', () => {
        it('should return \'incomplete.mxf\'', () => {
            return fileIndex.add_file('/fake/path/incomplete.mxf', 'essence').then((data) => {
                assert.equal('incomplete.mxf', data.files.filter((file) => file.file_type === 'essence')[0].file_name)
            });
        });
        it('should not call \'generate\' on the generator', () => {
            assert(generator.generate.notCalled);
        });
        it('should not call \'publishMessage\' on the publisher', () => {
            assert(publisher.publishMessage.notCalled);
        });
        it('should not have discarded the package after 99ms', () => {
            clock.tick(99);
            fileIndex.check_expired_packages();
            assert(fileutils.moveFile.notCalled);
        })
        it('should discard the package after 100ms', () => {
            clock.tick(100);
            fileIndex.check_expired_packages();
            assert(fileutils.moveFile.called);
        })
    });
});
});