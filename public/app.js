var canvas = document.getElementById('frame');
var ctx = canvas.getContext('2d');

var socket = io.connect();

// Render
// From: https://github.com/rauchg/weplay-web/blob/master/client/app.js

var image = new Image;
var lastImage;

socket.on('frame', function (data) {
    if (lastImage && 'undefined' != typeof URL) {
        URL.revokeObjectURL(lastImage);
    }
    requestAnimationFrame(function () {
        image.onload = function () { ctx.drawImage(image, 0, 0); };
        image.src = data;
    });
});

// Buttons

function fullscreen () {
    (
        canvas.requestFullscreen ||
        canvas.mozRequestFullScreen ||
        canvas.webkitRequestFullscreen ||
        canvas.msRequestFullscreen
    )
    .call(canvas);
}

var button = document.getElementById('fullscreen');
button.addEventListener('click', fullscreen);

// Joypad

document.addEventListener('keydown', function (e) {
    socket.emit('keydown', e.keyCode);
});
document.addEventListener('keyup', function (e) {
    socket.emit('keyup', e.keyCode);
});
