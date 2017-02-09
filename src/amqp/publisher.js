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
            if (err) {
                reject(err)
            } else {
                fulfill(handle);
            }
        });
    });
};

Publisher.prototype.keepHandle = function(handle) {
    return new Promise((fulfill, reject) => {
        this.handle = handle;
        fulfill(this.handle);
    });
};

Publisher.prototype.openConnection = function() {
    return new Promise((fulfill, reject) => {
        this.handle.openAMQPCommunication(this.config.RABBIT_MQ_USER, this.config.RABBIT_MQ_PASSWORD, true, this.config.RABBIT_MQ_VHOST);
        this.handle.once('1:channel.open-ok', function (channel, method, data) {
            log.success('Successfully connected to RabbitMQ');
            fulfill();
        });
        this.handle.once('connection.close', function (channel, method, data) {
            reject(data['reply-text'] + '(' + data['reply-code'] + ')');
        });
    });
};

Publisher.prototype.declareExchange = function() {
    return new Promise((fulfill, reject) => {
        try {
            this.handle.exchange.declare(1, this.config.RABBIT_MQ_SUCCESS_QUEUE, this.config.RABBIT_MQ_TOPIC_TYPE, (error) => {
                if (error) reject(error);
            });
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
            this.handle.queue.declare(1, this.config.RABBIT_MQ_SUCCESS_QUEUE, false, true, false, false, false, (error) => {
                if (error) reject(error);
            });
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
            this.handle.queue.bind(1, this.config.RABBIT_MQ_SUCCESS_QUEUE, this.config.RABBIT_MQ_SUCCESS_EXCHANGE, '', false, (error) => {
                if (error) reject(error);
            });
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

Publisher.prototype.handleErrors = function() {
    return new Promise((fulfill, reject) => {
        if (this.errorCode) {
            reject('The '+ this.type + ' was forcefully closed with error: ' + this.errorMessage + '(' + this.errorCode + ')');
        }
        else {
            fulfill();
        }
    });
};

Publisher.prototype.publishMessage = function(msg) {
    return new Promise((fulfill, reject) => {
        this.initiatePublish()
            .then( () => { this.publishData(msg) })
            .catch(reject)
        fulfill();
    });
};

Publisher.prototype.initiatePublish = function() {
    return new Promise((fulfill, reject) => {
        this.handle.basic.publish(1, this.config.RABBIT_MQ_SUCCESS_EXCHANGE, '', false, false, (publisherror) => {
            if (publisherror) reject(publisherror);
            fulfill(this.handle);
        });
    });
};


Publisher.prototype.publishData = function(msg) {
    return new Promise((fulfill, reject) => {
        return new Promise((fulfill, reject) => {
            this.handle.content(1, 'basic', {
                'content-type' : 'application/json'
            }, msg, function(contentError){
                if(contentError){
                    reject(contentError);
                }
                else {
                    fulfill();
                }
            });
        });
    });
};

module.exports = Publisher;