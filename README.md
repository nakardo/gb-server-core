# gb-server

An online [node-gameboy](https://github.com/nakardo/node-gameboy) socket stream server

## Loading Roms

```bash
$ curl -i -X POST <host>/load-cart -H "Content-Type: application/octet-stream" --data-binary "@<file>"
```
