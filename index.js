'use strict';

const bodyParser = require('body-parser');
const express = require('express');
const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const Gameboy = require('node-gameboy');


// Emulator

const gameboy = new Gameboy();

let i = 0;
gameboy.gpu.on('frame', (canvas) => {
    if (++i % 2) return;
    io.emit('frame', canvas.toDataURL());
    i = 0;
});

// Server

app.use(bodyParser.raw({ limit: '2mb' }));
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/ping', (req, res) => {
    res.send('pong');
});

app.post('/load-cart', (req, res) => {
    if (!req.body.length) return res.sendStatus(400);
    gameboy.loadCart(req.body);
    gameboy.start();
    res.sendStatus(200);
});

let peers = 0;

io.on('connection', (socket) => {
    if (++peers == 1) gameboy.pauseResume();
    socket.on('disconnect', () => {
        if (!--peers) gameboy.pauseResume();
    });

    socket.on('keydown', (keyCode) => gameboy.joypad.keyDown(keyCode));
    socket.on('keyup', (keyCode) => gameboy.joypad.keyUp(keyCode));
});

server.listen(process.env.PORT || 3000);
