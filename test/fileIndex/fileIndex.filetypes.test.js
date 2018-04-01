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
    describe('determine_file_type', () => {
        before(() => {
            fileIndex = new FileIndex(options, fileRecognizer, undefined, undefined, logger, undefined);
        });
        describe('for an .mxf file', () => {
            it('should return \'essence\'', () => {
                assert.equal("essence", fileIndex.determine_file_type('/path/to/file.mxf'));
            })
        });
        describe('for an .wav file', () => {
            it('should return \'essence\'', () => {
                assert.equal("essence", fileIndex.determine_file_type('/path/to/file.wav'));
            })
        });
        describe('for an .xml file', () => {
            it('should return \'sidecar\'', () => {
                assert.equal("sidecar", fileIndex.determine_file_type('/path/to/file.xml'));
            })
        });
        describe('for an .srt file', () => {
            it('should return \'collateral\'', () => {
                assert.equal("collateral", fileIndex.determine_file_type('/path/to/file.srt'));
            })
        });
        describe('for a .part file', () => {
            it('should return \'ignore\'', () => {
                assert.equal("ignore", fileIndex.determine_file_type('/path/to/file.mxf.part'));
            })
        });
        describe('for a .docx file', () => {
            it('should return \'other\'', () => {
                assert.equal("other", fileIndex.determine_file_type('/path/to/file.docx'));
            })
        });
    });
});