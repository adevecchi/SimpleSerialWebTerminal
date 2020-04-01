const http = require('http');
const express = require('express');

const app = express();
const server = http.createServer(app);
const sio = require('socket.io')(server)
const SerialPort = require('serialport');

let serialport = null;

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
    res.render('index');
});

sio.on('connection', function(socket) {
    console.log('Connected');

    socket.on('open port', function(message) {
        if (message.port.length < 4) {
            socket.emit('received data', 'Port Name not defined.');
            return;
        }
        serialport = new SerialPort(message.port, { 
            autoOpen: false, 
            baudRate: parseInt(message.baudrate),
            parser: SerialPort.parsers.readline('\n')
        });
        serialport.open(function(err) {
            if (err) {
                socket.emit('received data', 'Error ' + err.message)
                return;
            }
            socket.emit('received data', 'Port is opened.');
        });
        serialport.on('data', function(data) {
            socket.emit('received data', data);
        });
    });

    socket.on('close port', function(message) {
        serialport.close(function(err) {
            if (err) {
                socket.emit('received data', 'Error ' + err.message)
                return;
            }
            socket.emit('received data', message);
        });
        if (!serialport.isOpen()) {
            serialport = null;
        }
    });

    socket.on('send data', function(data) {
        if (serialport && serialport.isOpen()) {
            serialport.write(data + '\n');
        } else {
            socket.emit('received data', 'Not sending data, port is closed.');
        }
    });

    socket.on('disconnect', function() {
        console.log('Disconnected');
    });
});

server.listen(3000, function() {
    console.log('Listening on localhost:3000');
});