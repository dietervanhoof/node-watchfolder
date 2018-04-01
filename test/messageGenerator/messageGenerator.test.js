const Generator = require("./../../src/util/messageGenerator");
const assert = require('assert');

describe('messageGenerator', () => {
    let generator = {};
    let file_package = {};
    let result = {};
    beforeEach(() => {
        generator = new Generator({
            CP: 'sample_CP',
            FLOW_ID: 'sample_FLOW_ID',
            FTP_SERVER: 'sample_FTP_SERVER',
            FTP_USERNAME: 'sample_FTP_USERNAME',
            FTP_PASSWORD: 'sample_FTP_PASSWORD'
        });
        file_package = {
            files: [
                {
                    file_type: 'essence',
                    file_path: '/path/to',
                    file_name: 'thisfile.mxf',
                    timestamp: new Date()
                },
                {
                    file_type: 'sidecar',
                    file_path: '/path/to',
                    file_name: 'thisfile.xml',
                    timestamp: new Date()
                }
            ]
        };
        result = JSON.parse(generator.generate(file_package, 'completed'));
    });
    describe('when generating a message', () => {
        it('should contain a timestamp', () => {
            assert.ok(result.timestamp);
        });
        it('should contain a sip_package', () => {
            assert.ok(result.sip_package);
        });
        it('should have a sip_package size of 2', () => {
            assert.equal(2, result.sip_package.length);
        });
        it('should have \'/path/to/completed\' as path for file', () => {
            result.sip_package.forEach((file) => {
                assert.equal('/path/to/completed', file.file_path);
            });
        });
        it('should have cp_name set to \'sample_CP\'', () => {
            assert.equal('sample_CP', result.cp_name);
        });
        it('should have flow_id set to \'sample_FLOW_ID\'', () => {
            assert.equal('sample_FLOW_ID', result.flow_id);
        });
        it('should have server set to \'sample_FTP_SERVER\'', () => {
            assert.equal('sample_FTP_SERVER', result.server);
        });
        it('should have username set to \'sample_FTP_USERNAME\'', () => {
            assert.equal('sample_FTP_USERNAME', result.username);
        });
        it('should have password set to \'sample_FTP_PASSWORD\'', () => {
            assert.equal('sample_FTP_PASSWORD', result.password);
        });
    });
});