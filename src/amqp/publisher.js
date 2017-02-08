///RabbitMQ nodejs library
var amqp = require('amqp');

///Create a connection to your RabbitMQ
var connection = amqp.createConnection();

///Connection is ready
connection.on('ready', function() {

    console.log('Server Connected');
    var exchange = conn.exchange('order', {
        type: 'topic', ///This is the type of exchange I want to use
        confirm: true
    }, function() {
        console.log('Exchange connected');
        var i = 0;
        ///Simulating messages being published
        setInterval(function() {
            i++;
            console.log(i)
            exchange.publish('task_queue', 'Hello World! ' + i, {
                durable: true,
            }, function(res) {
                console.log('confirmed ',res);
            });
        }, 1000);
    })
})