'use strict';

const fs = require('fs');
const express = require('express');
const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const Gameboy = require('node-gameboy');


// Server

app.use(express.static('public'))
server.listen(3000);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
    socket.on('keydown', (keyCode) => gameboy.joypad.keyDown(keyCode));
    socket.on('keyup', (keyCode) => gameboy.joypad.keyUp(keyCode));
});

// Emulator

const gameboy = new Gameboy();
gameboy.loadCart(fs.readFileSync('./roms/zelda.gb'));
gameboy.start();

let i = 0;
gameboy.gpu.on('frame', (canvas) => {
    if (++i % 2) return;
    io.emit('frame', canvas.toDataURL());
});
