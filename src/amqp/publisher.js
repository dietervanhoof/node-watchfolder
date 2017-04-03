const Promise = require("bluebird");
const log = require("../services/logger.service");
const Buffer = require("buffer").Buffer;
const amqp = Promise.promisifyAll(require('amqplib'));

function Publisher(config) {
    this.config = config;
    return this;
}

Publisher.prototype.publishMessage = function(msg, id) {
    let conn =  amqp.connect(this.config.broker);
    return conn.then((conn) => {
        this.createChannel(conn)
            .bind(this)
            .then((ch) => {
                return this.ensureExchange(ch, this.config)
            })
            .then( (ch) => {
                return this.ensureQueue(ch, this.config)
            })
            .then( (ch) => {
                return this.bindQueue(ch, this.config)
            })
            .then( (ch) => {
                return this.transmitMessage(ch, msg, id, this.config)
            })
            .then( (ch) => {
                return this.closeChannel(ch, this.config)
            })
            .finally(function() {
                try {
                    conn.close();
                } catch (err) {
                    log.error(err);
                }
            });
    });
};

Publisher.prototype.createChannel = (conn) => {
    return new Promise((resolve, reject) => {
        conn.createChannel()
            .then((ch) => {
                resolve(ch);
            })
            .catch((err) => {
                reject(err);
            });
    });
};

Publisher.prototype.ensureExchange = (ch, config) => {
    return new Promise((resolve, reject) => {
        ch.assertExchange(config.RABBIT_MQ_SUCCESS_EXCHANGE, config.RABBIT_MQ_TOPIC_TYPE, { durable: true })
            .then(() => {
                resolve(ch);
            })
            .catch((err) => {
                reject(err);
            });
    });
};

Publisher.prototype.ensureQueue = (ch, config) => {
    return new Promise((resolve, reject) => {
        ch.assertQueue(config.RABBIT_MQ_SUCCESS_QUEUE, { durable: true })
            .then(() => {
                resolve(ch);
            })
            .catch((err) => {
                reject(err);
            });
    });
};

Publisher.prototype.bindQueue = (ch, config) => {
    return new Promise((resolve, reject) => {
        ch.bindQueue(config.RABBIT_MQ_SUCCESS_QUEUE, config.RABBIT_MQ_SUCCESS_QUEUE, config.FLOW_ID)
            .then(() => {
                resolve(ch);
            })
            .catch((err) => {
                reject(err);
            });
    });
};

Publisher.prototype.transmitMessage = (ch, msg, id, config) => {
    return new Promise((resolve, reject) => {
        try {
            log.success('Successfully published message for package ' + id);
            ch.publish(config.RABBIT_MQ_SUCCESS_QUEUE, config.FLOW_ID, new Buffer(msg), { persistent: true });
            resolve(ch);
        }
        catch (err) {
            reject(err);
        }
    });
};

Publisher.prototype.closeChannel = (ch) => {
    return new Promise((resolve, reject) => {
        ch.close()
            .then(() => {
                resolve(ch);
            })
            .catch((err) => {
                reject(err);
            });
    });
};

module.exports = Publisher;