const FileIndex = require('./../src/util/fileIndex');
const FileRecognizer = require('./../src/util/fileRecognizer');
const FileUtils = require('./../src/util/fileUtils');
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
            CHECK_PACKAGE_AMOUNT: 1,
            PROCESSING_FOLDER_NAME: 'processing',
            INCOMPLETE_FOLDER_NAME: 'incomplete',
            REFUSED_FOLDER_NAME: 'refused',
            IGNORE_FILE_TYPE: ['.part']
        };
        fileRecognizer = new FileRecognizer(options)
    })
    describe('Create a complete package', () => {
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
            it('should return \'thisfile.mxf\'', () => {
                return fileIndex.add_file('/fake/path/thisfile.mxf', 'essence').then((data) => {
                    assert.equal('thisfile.mxf', data.files.filter((file) => file.file_type === 'essence')[0].file_name)
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
                assert.equal(1, fileIndex.packages['thisfile'].files.length);
            });
        });
        describe('adding a sidecar file', () => {
            it('should return \'thisfile.xml\'', () => {
                return fileIndex.add_file('/fake/path/thisfile.xml', 'sidecar').then((data) => {
                    assert.equal('thisfile.xml', data.files.filter((file) => file.file_type === 'sidecar')[0].file_name)
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
                assert.equal(2, fileIndex.packages['thisfile'].files.length);
            });
        });
        describe('adding a collateral file', () => {
            it('should return \'thisfile.srt\'', () => {
                return fileIndex.add_file('/fake/path/thisfile.srt', 'collateral').then((data) => {
                    assert.equal('thisfile.srt', data.files.filter((file) => file.file_type === 'collateral')[0].file_name)
                });
            });
            it('should call \'generate\' on the generator', () => {
                assert(generator.generate.called);
            });
            it('should call \'publishMessage\' on the publisher', () => {
                assert(publisher.publishMessage.called);
            });
            it('should call \'move\' on the files', () => {
                assert(fileutils.moveFile.called);
            });
            it('should remove the entry from the package list', () => {
                assert.equal(0, Object.keys(fileIndex.packages).length);
            });
        });
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
            it('should not hace discarded the package after 99ms', () => {
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