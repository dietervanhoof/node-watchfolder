const bramqp = require('bramqp');
const net = require('net');
const Promise = require("bluebird");
const log = require("../services/logger.service");


function Publisher(config) {
    this.config = config;
    this.socket = net.connect({
        host: this.config.RABBIT_MQ_HOST,
        port: this.config.RABBIT_MQ_PORT
    });
};

Publisher.prototype.initialize = function () {
    return new Promise((fulfill, reject) => {
        this.initializeSocket()
            .bind(this)
            .then(this.keepHandle)
            .then(this.openConnection)
            .then(this.declareExchange)
            .then(this.declareQueue)
            .then(this.bindQueue)
            .then( () => fulfill(this))
            .catch( (err) => {
                reject(err);
            });
    });
};

Publisher.prototype.initializeSocket = function() {
    return new Promise((fulfill, reject) => {
        bramqp.initialize(this.socket, 'rabbitmq/full/amqp0-9-1.stripped.extended', (err, handle) => {
            if (err) reject(err);
            fulfill(handle);
        });
    })
};

Publisher.prototype.keepHandle = function(handle) {
    return new Promise((fulfill, reject) => {
        this.handle = handle;
        fulfill(this.handle);
    });
};

Publisher.prototype.openConnection = function() {
    return new Promise((fulfill, reject) => {
        try {
            this.handle.openAMQPCommunication(this.config.RABBIT_MQ_USER, this.config.RABBIT_MQ_PASSWORD, true, this.config.RABBIT_MQ_VHOST, fulfill);
        }
        catch (error) {
            reject(error);
        }
    });
};

Publisher.prototype.declareExchange = function() {
    return new Promise((fulfill, reject) => {
        try {
            this.handle.exchange.declare(1, this.config.RABBIT_MQ_SUCCESS_QUEUE, this.config.RABBIT_MQ_TOPIC_TYPE);
            this.handle.once('1:exchange.declare-ok', function (channel, method, data) {
                log.success('\t-> Exchange successfully declared');
                fulfill(this.handle);
            });
        }
        catch (error) {
            reject(error);
        }
    });
};

Publisher.prototype.declareQueue = function() {
    return new Promise((fulfill, reject) => {
        try {
            this.handle.queue.declare(1, this.config.RABBIT_MQ_SUCCESS_QUEUE, false, true, false, false, false);
            this.handle.once('1:queue.declare-ok', function (channel, method, data) {
                log.success('\t-> Queue successfully declared');
                fulfill(this.handle);
            });
        }
        catch (error) {
            reject(error);
        }
    });
};

Publisher.prototype.bindQueue = function() {
    return new Promise((fulfill, reject) => {
        try {
            this.handle.queue.bind(1, this.config.RABBIT_MQ_SUCCESS_QUEUE, this.config.RABBIT_MQ_SUCCESS_EXCHANGE, '', false);
            this.handle.once('1:queue.bind-ok', function (channel, method, data) {
                log.success('\t-> Queue successfully bound to Exchange');
                fulfill(this.handle);
            });
        }
        catch (error) {
            reject(error);
        }
    });
};

Publisher.prototype.publishMessage = function(msg) {
    log.success('Gunna publish!');
};

module.exports = Publisher;