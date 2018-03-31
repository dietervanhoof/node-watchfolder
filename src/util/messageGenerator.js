const fileutils = require("./fileUtils");

function MessageGenerator(config) {
    this.config = config;
    return this;
}

MessageGenerator.prototype.generate = function (completedPackage, completion_folder) {
    const result = {
        cp_name: this.config.CP,
        flow_id: this.config.FLOW_ID,
        server: this.config.FTP_SERVER,
        username: this.config.FTP_USERNAME,
        password: this.config.FTP_PASSWORD,
        timestamp: new Date(),
        sip_package: JSON.parse(JSON.stringify(completedPackage.files)) // Clone the package to not make changes to the original one
    };

    result.sip_package.forEach((file) => {
        file.file_path = fileutils.appendFolder(file.file_path, completion_folder);
    });

    return JSON.stringify(result);
};

module.exports = MessageGenerator;