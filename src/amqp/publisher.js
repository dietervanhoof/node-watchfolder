const Promise = require("bluebird");
const log = require("../services/logger.service");
const util = require("util");
const Buffer = require("buffer").Buffer;
const amqp = require('amqplib');

function Publisher(config) {
    this.config = config;
    return this;
};

Publisher.prototype.publishMessage = function(msg) {
    let conn =  amqp.connect(util.format('amqp://%s:%s@%s:%d/%s',
        this.config.RABBIT_MQ_USER,
        this.config.RABBIT_MQ_PASSWORD,
        this.config.RABBIT_MQ_HOST,
        this.config.RABBIT_MQ_PORT,
        this.config.RABBIT_MQ_VHOST));
    return conn.then( (conn) => {
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
                return this.transmitMessage(ch, msg, this.config)
            })
            .then( (ch) => {
                return this.closeChannel(ch, this.config)
            })
            .finally(function() {

                try {
                    log.warn('About to close connection');
                    conn.close();
                    log.warn('Closed connection');
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
                log.success('Created channel');
                resolve(ch);
            })
            .catch((err) => {
                reject(err);
            });
    });
};

Publisher.prototype.ensureExchange = (ch, config) => {
    return new Promise((resolve, reject) => {
        ch.assertExchange(config.RABBIT_MQ_SUCCESS_QUEUE, config.RABBIT_MQ_TOPIC_TYPE, { durable: true })
            .then(() => {
                log.success('Created exchange');
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
                log.success('Created queue');
                resolve(ch);
            })
            .catch((err) => {
                reject(err);
            });
    });
};

Publisher.prototype.bindQueue = (ch, config) => {
    return new Promise((resolve, reject) => {
        ch.bindQueue(config.RABBIT_MQ_SUCCESS_QUEUE, config.RABBIT_MQ_SUCCESS_QUEUE, '')
            .then(() => {
                log.success('Bound queue');
                resolve(ch);
            })
            .catch((err) => {
                reject(err);
            });
    });
};

Publisher.prototype.transmitMessage = (ch, msg, config) => {
    return new Promise((resolve, reject) => {
        try {
            ch.publish(config.RABBIT_MQ_SUCCESS_QUEUE, '', new Buffer(msg), { persistent: true });
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



/**
amqp.connect('amqp://localhost').then(function(conn) {
    return conn.createChannel().then(function(ch) {

        var ok = ch.assertExchange(ex, 'fanout', {durable: false})

        var message = process.argv.slice(2).join(' ') ||
            'info: Hello World!';

        return ok.then(function() {
            ch.publish(ex, '', new Buffer(message));
            console.log(" [x] Sent '%s'", message);
            return ch.close();
        });
    }).finally(function() { conn.close(); });
}).catch(console.warn);

 **/

module.exports = Publisher;