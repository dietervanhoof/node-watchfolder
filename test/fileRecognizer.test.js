const FileRecognizer = require("./../src/util/fileRecognizer");
const assert = require('assert');


describe('FileRecognizer', function() {
    let fileRecognizer = {};
    before(function() {
        fileRecognizer = new FileRecognizer({
            ESSENCE_FILE_TYPE: ['.mxf', '.wav'],
            SIDECAR_FILE_TYPE: ['.xml'],
            COLLATERAL_FILE_TYPE: ['.srt']
        });
    });
    
    describe('is_essence', function() {
        it('should return \'true\' filename \'thisfile.mxf\'', function() {
            assert.equal(true, fileRecognizer.is_essence('thisfile.mxf'));
        });
        it('should return \'true\' filename \'thisfile.wav\'', function() {
            assert.equal(true, fileRecognizer.is_essence('thisfile.wav'));
        });
        it('should return \'false\' filename \'thisfile.xml\'', function() {
            assert.equal(false, fileRecognizer.is_essence('thisfile.xml'));
        });
        it('should return \'false\' filename \'thisfile.mxf.xml\'', function() {
            assert.equal(false, fileRecognizer.is_essence('thisfile.mxf.xml'));
        });
        it('should return \'false\' filename \'thisfile.wav.xml\'', function() {
            assert.equal(false, fileRecognizer.is_essence('thisfile.wav.xml'));
        });
    });
    describe('is_sidecar', function() {
        it('should return \'false\' filename \'thisfile.mxf\'', function() {
            assert.equal(false, fileRecognizer.is_sidecar('thisfile.mxf'));
        });
        it('should return \'true\' filename \'thisfile.xml\'', function() {
            assert.equal(true, fileRecognizer.is_sidecar('thisfile.xml'));
        });
        it('should return \'true\' filename \'thisfile.mxf.xml\'', function() {
            assert.equal(true, fileRecognizer.is_sidecar('thisfile.mxf.xml'));
        });
    });
    describe('is_collateral', function() {
        it('should return \'true\' filename \'thisfile.srt\'', function() {
            assert.equal(true, fileRecognizer.is_collateral('thisfile.srt'));
        });
        it('should return \'false\' filename \'thisfile.xml\'', function() {
            assert.equal(false, fileRecognizer.is_collateral('thisfile.xml'));
        });
        it('should return \'true\' filename \'thisfile.mxf.srt\'', function() {
            assert.equal(true, fileRecognizer.is_collateral('thisfile.mxf.srt'));
        });
    });
});