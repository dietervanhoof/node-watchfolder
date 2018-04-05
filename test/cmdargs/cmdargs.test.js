const assert = require('assert');
const cmdargs = require('./../../src/util/cmdargs');

describe('cmdargs', () => {
    let argv = [
        'node',
        'file.js',
        '--CP=TEST',
        '--FLOW_ID=TEST',
        '--RABBIT_MQ_HOST=hostname',
        '--RABBIT_MQ_PORT=5672',
        '--RABBIT_MQ_VHOST=/',
        '--RABBIT_MQ_SUCCESS_EXCHANGE=TEST',
        '--RABBIT_MQ_SUCCESS_QUEUE=TEST',
        '--RABBIT_MQ_ERROR_EXCHANGE=TEST',
        '--RABBIT_MQ_ERROR_QUEUE=TEST',
        '--RABBIT_MQ_TOPIC_TYPE=TEST',
        '--RABBIT_MQ_USER=username',
        '--RABBIT_MQ_PASSWORD=password',
        '--FTP_SERVER=TEST',
        '--FTP_USERNAME=TEST',
        '--FTP_PASSWORD=TEST',
        '--PROCESSING_FOLDER_NAME=TEST',
        '--INCOMPLETE_FOLDER_NAME=TEST',
        '--REFUSED_FOLDER_NAME=TEST',
        '--FOLDER_TO_WATCH=/watch/this/folder',
        '--CHECK_PACKAGE_INTERVAL=5000',
        '--CHECK_PACKAGE_AMOUNT=50'
    ];
    describe('parseArguments', () => {
        describe('should throw an error when', () => {
            it('a required argument is not passed', () => {
                process.argv = [
                    'node',
                    'file.js',
                    '--CP=TEST'
                ];
                assert.throws(cmdargs.parseArguments, Error, "Argument FLOW_ID was missing but is required.");
            })
        });
        describe('should set derived argument', () => {
            it('broker correctly', () => {
                process.argv = JSON.parse(JSON.stringify(argv));
                process.argv.push('--ESSENCE_FILE_TYPE=.mxf,.mp4');
                const options = cmdargs.parseArguments();
                assert.equal('amqp://username:password@hostname:5672//', options.broker);
            });
            it('folder correctly', () => {
                process.argv = JSON.parse(JSON.stringify(argv));
                process.argv.push('--ESSENCE_FILE_TYPE=.mxf,.mp4');
                const options = cmdargs.parseArguments();
                assert.equal('/watch/this/folder', options.folder);
            });
        });
        describe('should parse', () => {
            it('file types separated by spaces correctly', () => {
                process.argv = JSON.parse(JSON.stringify(argv));
                process.argv.push('--ESSENCE_FILE_TYPE=.mxf, .mp4');
                const options = cmdargs.parseArguments();
                assert.notEqual(-1, options.ESSENCE_FILE_TYPE.indexOf('.mxf'));
                assert.notEqual(-1, options.ESSENCE_FILE_TYPE.indexOf('.mp4'));
                assert.equal(2, options.ESSENCE_FILE_TYPE.length);
            });
            it('file types separated without spaces correctly', () => {
                process.argv = JSON.parse(JSON.stringify(argv));
                process.argv.push('--ESSENCE_FILE_TYPE=.mxf,.mp4');
                const options = cmdargs.parseArguments();
                assert.notEqual(-1, options.ESSENCE_FILE_TYPE.indexOf('.mxf'));
                assert.notEqual(-1, options.ESSENCE_FILE_TYPE.indexOf('.mp4'));
                assert.equal(2, options.ESSENCE_FILE_TYPE.length);
            });
        });
    })
});
