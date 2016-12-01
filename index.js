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
    gameboy.pauseResume();

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

function saveState (cb = () => {}) {
    debug('saving state');
    redis.lpush('states', JSON.stringify(gameboy), cb);
}

setInterval(saveState, 1000 * 60 * 60 * 24);

// Server

app.use(express.static('public'));
app.get('/ping', (req, res) => res.sendStatus(200));

let peers = 0;

io.on('connection', (socket) => {
    if (++peers == 1) gameboy.pauseResume();
    socket.on('disconnect', () => {
        if (!--peers) gameboy.pauseResume();
    });

    socket.on('keydown', (keyCode) => gameboy.joypad.keyDown(keyCode));
    socket.on('keyup', (keyCode) => gameboy.joypad.keyUp(keyCode));
});

process.on('SIGTERM', () => {
    saveState((err) => {
        if (err) {
            debug('exited with error: %s', err);
            process.exit(1);
        }
        debug('exited saving state');
        process.exit(0);
    });
});

server.listen(process.env.PORT || 3000);
