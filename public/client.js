var canvas = document.getElementById('frame');
var ctx = canvas.getContext('2d');

var socket = io.connect();

var image = new Image;
var lastImage;

// From: https://github.com/rauchg/weplay-web/blob/master/client/app.js

socket.on('frame', function (data) {
    if (lastImage && 'undefined' != typeof URL) {
        URL.revokeObjectURL(lastImage);
    }
    image.onload = function () { ctx.drawImage(image, 0, 0); };
    image.src = data;
});

document.addEventListener('keydown', function (e) {
    socket.emit('keydown', e.keyCode);
});
document.addEventListener('keyup', function (e) {
    socket.emit('keyup', e.keyCode);
});
