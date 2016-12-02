'use strict';

const debug = require('debug')('gb-server-core');
const fs = require('fs');
const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL);
const Gameboy = require('node-gameboy');


// Emulator

const gameboy = new Gameboy();

redis.lrange('states', 0, 1, (err, result) => {
    if (err) throw err;
    gameboy.loadCart(fs.readFileSync(process.env.ROM_PATH));
    gameboy.start();

    if (result.length) {
        debug('loading state');
        gameboy.fromJSON(JSON.parse(result[0]));
    }
});

const pub = redis.duplicate();
let i = 0;

gameboy.gpu.on('frame', (canvas) => {
    if (++i % 2) return; // throttle to 30 fps.
    canvas.toDataURL((err, png) => {
        if (!err) pub.publish('frame', png);
        i = 0;
    });
});

const sub = redis.duplicate();
sub.subscribe('keydown', 'keyup');
sub.on('message', (channel, keyCode) => {
    switch (channel) {
        case 'keydown': return gameboy.joypad.keyDown(keyCode);
        case 'keyup': return gameboy.joypad.keyUp(keyCode);
    }
});

// Server

process.on('SIGTERM', () => {
    debug('saving state');
    redis.lpush('states', JSON.stringify(gameboy), (err) => {
        if (err) {
            debug('exited with error: %s', err);
            process.exit(1);
        }
        debug('exited saving state');
        process.exit(0);
    });
});
