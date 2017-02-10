const bramqp = require('bramqp');
const net = require('net');
const Promise = require("bluebird");
const log = require("../services/logger.service");


function Publisher(config) {
    this.config = config;
    return this;
};

Publisher.prototype.connectSocket = (host, port) => {
    return new Promise((resolve, reject) => {
        try {
            this.socket = net.connect({
                host: host,
                port: port
            });
        } catch (err) {
            reject(err);
        }
        this.socket.on('connect', () => {
            resolve(this.socket);
        });
        this.socket.on('error', (err) => {
            reject(err);
        });
    });
};

Publisher.prototype.disconnectSocket = (socket) => {
    return socket.destroy();
};

Publisher.prototype.initialize = function () {
    return this.connectSocket(this.config.RABBIT_MQ_HOST, this.config.RABBIT_MQ_PORT)
        .bind(this)
        .then( (socket) => { this.socket = socket; })
        .then(this.attachEventListeners)
        .then(this.initializeSocket)
        .then( (handle) => { return this.keepHandle(handle, this) })
        .then(this.openConnection)
        .then(this.declareExchange)
        .then(this.declareQueue)
        .then(this.bindQueue);
};

Publisher.prototype.attachEventListeners = function () {
    return new Promise((resolve, reject) => {
        this.socket.setTimeout(10000);
        this.socket.on('close', (data) => {
            log.error('Connection was closed.');
            setTimeout(this.tryReconnect.bind(this), 5000);
        });
        this.socket.on('error', (data) => {
            console.log('error', data);
        });
        this.socket.on('timeout', (data) => {
            console.log('timeout', data);
        });
        resolve(this.socket);
    });
};

Publisher.prototype.initializeSocket = function() {
    return new Promise((resolve, reject) => {
        bramqp.initialize(this.socket, 'rabbitmq/full/amqp0-9-1.stripped.extended', (err, handle) => {
            if (err) {
                reject(err)
            } else {
                resolve(handle);
            }
        });
    });
};

Publisher.prototype.tryReconnect = function() {
    this.disconnectSocket(this.socket);
    this.connectSocket(this.config.RABBIT_MQ_HOST, this.config.RABBIT_MQ_PORT)
        .bind(this)
        .then(this.initialize)
        .then( () => {
            log.success('Successfully reconnected.');
        })
        .catch( (err) => {
            log.error('Connection failed with: ' + err);
            setTimeout(this.tryReconnect.bind(this), 5000);
        });
};

Publisher.prototype.keepHandle = function(handle, that) {
    return new Promise((resolve, reject) => {
        this.handle = handle;
        this.handle.on('connection.close', function (channel, method, data) {
            console.log(data);
            log.error('Connection is gone. Trying to reconnnect');
            that.initialize();
        });
        this.handle.on('channel.close', function (channel, method, data) {
            console.log(data);
            log.error('Channel is gone. Trying to reconnnect');
            that.initialize();
        });
        resolve(this.handle);
    });
};

Publisher.prototype.openConnection = function() {
    return new Promise((resolve, reject) => {
        this.handle.openAMQPCommunication(this.config.RABBIT_MQ_USER, this.config.RABBIT_MQ_PASSWORD, true, this.config.RABBIT_MQ_VHOST);
        this.handle.once('1:channel.open-ok', function (channel, method, data) {
            log.success('Successfully connected to RabbitMQ');
            resolve();
        });
        this.handle.once('connection.close', function (channel, method, data) {
            reject(data['reply-text'] + '(' + data['reply-code'] + ')');
        });
    });
};

Publisher.prototype.declareExchange = function() {
    return new Promise((resolve, reject) => {
        try {
            this.handle.exchange.declare(1, this.config.RABBIT_MQ_SUCCESS_QUEUE, this.config.RABBIT_MQ_TOPIC_TYPE, false, true, false, false, false,  (error) => {
                if (error) reject(error);
            });
            this.handle.once('1:exchange.declare-ok', function (channel, method, data) {
                log.success('\t-> Exchange successfully declared');
                resolve(this.handle);
            });
        }
        catch (error) {
            reject(error);
        }
    });
};

Publisher.prototype.declareQueue = function() {
    return new Promise((resolve, reject) => {
        try {
            this.handle.queue.declare(1, this.config.RABBIT_MQ_SUCCESS_QUEUE, false, true, false, false, false, (error) => {
                if (error) reject(error);
            });
            this.handle.once('1:queue.declare-ok', function (channel, method, data) {
                log.success('\t-> Queue successfully declared');
                resolve(this.handle);
            });
        }
        catch (error) {
            reject(error);
        }
    });
};

Publisher.prototype.bindQueue = function() {
    return new Promise((resolve, reject) => {
        try {
            this.handle.queue.bind(1, this.config.RABBIT_MQ_SUCCESS_QUEUE, this.config.RABBIT_MQ_SUCCESS_EXCHANGE, '', false, (error) => {
                if (error) reject(error);
            });
            this.handle.once('1:queue.bind-ok', function (channel, method, data) {
                log.success('\t-> Queue successfully bound to Exchange');
                resolve(this.handle);
            });
        }
        catch (error) {
            reject(error);
        }
    });
};

Publisher.prototype.publishMessage = function(msg) {
    return this.testConnection()
        .then( () => { return this.initiatePublish() })
        .then( () => { return this.publishData(msg) })
        .catch( (err) => { throw err; });
};

Publisher.prototype.testConnection = function() {
    return new Promise((resolve, reject) => {
        this.handle.basic.qos(1, 0, 0, false, (err, data) => {
            if (err) {
                reject(err);
            } else {
                this.handle.once('1:basic.qos-ok', function(channel, method, data) {
                    resolve(this.handle);
                });
            }
        });
    });
};


Publisher.prototype.initiatePublish = function() {
    return new Promise((resolve, reject) => {
        this.handle.basic.publish(1, this.config.RABBIT_MQ_SUCCESS_EXCHANGE, '', false, false, (publisherror) => {
            if (publisherror) {
                reject(publisherror);
            } else {
                resolve(this.handle);
            }
        });
    });
};


Publisher.prototype.publishData = function(msg) {
    return new Promise((resolve, reject) => {
        this.handle.content(1, 'basic', {
            'content-type' : 'application/json',
            'delivery-mode': 2
        }, msg, function(contentError){
            if(contentError){
                reject(contentError);
            }
            else {
                log.success('Successfully published a message');
                resolve(this.handle);
            }
        });
    });
};

module.exports = Publisher;