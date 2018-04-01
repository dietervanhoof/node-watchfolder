const FileRecognizer = require("./../../src/util/fileRecognizer");
const assert = require('assert');


describe('FileRecognizer', () => {
    let fileRecognizer = {};
    before(() => {
        fileRecognizer = new FileRecognizer({
            ESSENCE_FILE_TYPE: [
                '.mxf',
                '.wav'
            ],
            SIDECAR_FILE_TYPE: ['.xml'],
            COLLATERAL_FILE_TYPE: ['.srt']
        });
    });
    describe('is_essence', () => {
        it('should return \'true\' filename \'thisfile.mxf\'', () => {
            assert.equal(true, fileRecognizer.is_essence('thisfile.mxf'));
        });
        it('should return \'true\' filename \'thisfile.wav\'', () => {
            assert.equal(true, fileRecognizer.is_essence('thisfile.wav'));
        });
        it('should return \'false\' filename \'thisfile.xml\'', () => {
            assert.equal(false, fileRecognizer.is_essence('thisfile.xml'));
        });
        it('should return \'false\' filename \'thisfile.mxf.xml\'', () => {
            assert.equal(false, fileRecognizer.is_essence('thisfile.mxf.xml'));
        });
        it('should return \'false\' filename \'thisfile.wav.xml\'', () => {
            assert.equal(false, fileRecognizer.is_essence('thisfile.wav.xml'));
        });
    });
    describe('is_sidecar', () => {
        it('should return \'false\' filename \'thisfile.mxf\'', () => {
            assert.equal(false, fileRecognizer.is_sidecar('thisfile.mxf'));
        });
        it('should return \'true\' filename \'thisfile.xml\'', () => {
            assert.equal(true, fileRecognizer.is_sidecar('thisfile.xml'));
        });
        it('should return \'true\' filename \'thisfile.mxf.xml\'', () => {
            assert.equal(true, fileRecognizer.is_sidecar('thisfile.mxf.xml'));
        });
    });
    describe('is_collateral', () => {
        it('should return \'true\' filename \'thisfile.srt\'', () => {
            assert.equal(true, fileRecognizer.is_collateral('thisfile.srt'));
        });
        it('should return \'false\' filename \'thisfile.xml\'', () => {
            assert.equal(false, fileRecognizer.is_collateral('thisfile.xml'));
        });
        it('should return \'true\' filename \'thisfile.mxf.srt\'', () => {
            assert.equal(true, fileRecognizer.is_collateral('thisfile.mxf.srt'));
        });
    });
});