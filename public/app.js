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

var renderingAction = document.getElementById('rendering');
var scaleAction = document.getElementById('scale');

renderingAction.addEventListener('click', function () {
    $(canvas).toggleClass('pixelated');
});

var sizes = ['160px', '320px', '640px'];

scaleAction.addEventListener('click', function () {
    var idx = sizes.indexOf(canvas.style.width || '320px');
    canvas.style.width = sizes[++idx % 3];
});

// Joypad

document.addEventListener('keydown', function (e) {
    socket.emit('keydown', e.keyCode);
});
document.addEventListener('keyup', function (e) {
    socket.emit('keyup', e.keyCode);
});
