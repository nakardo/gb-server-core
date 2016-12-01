# gb-server

An online [node-gameboy](https://github.com/nakardo/node-gameboy) socket stream server

## Config

The following env variables are required:

- `REDIS_URL`: Redis instance where game states are saved.
- `ROM_PATH`: Cart to be loaded by emulator.
