'use strict';

const debug = require('debug')('gb-server');
const fs = require('fs');
const express = require('express');
const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const Redis = require('ioredis');
const Gameboy = require('node-gameboy');


// Emulator

const gameboy = new Gameboy();
const redis = new Redis(process.env.REDIS_URL);

redis.lrange('states', 0, 1, (err, result) => {
    if (err) throw err;
    gameboy.loadCart(fs.readFileSync(process.env.ROM_PATH));
    gameboy.start();

    if (result.length) {
        debug('loading state');
        gameboy.fromJSON(JSON.parse(result[0]));
    }
});

let i = 0;
gameboy.gpu.on('frame', (canvas) => {
    if (++i % 2) return; // throttle to 30 fps.
    canvas.toDataURL((err, png) => io.emit('frame', png));
    i = 0;
});

// Server

app.use(express.static('public'));
app.get('/ping', (req, res) => res.sendStatus(200));

io.on('connection', (socket) => {
    socket.on('keydown', (keyCode) => gameboy.joypad.keyDown(keyCode));
    socket.on('keyup', (keyCode) => gameboy.joypad.keyUp(keyCode));
});

process.on('SIGINT', () => {
    try {
        redis.lpush('states', JSON.stringify(gameboy), (err) => {
            if (err) process.exit(1);
            debug('exited saving state');
            process.exit(0);
        });
    } catch (e) {
        debug('exited with error: %s', e);
        process.exit(1);
    }
});

server.listen(process.env.PORT || 3000);
