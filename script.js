"use strict";

var editArea = document.getElementById("edit-area")

editArea.addEventListener("keydown", keydown)
editArea.addEventListener("keyup", keyup)

window.AudioContext = window.AudioContext || window.webkitAudioContext;

if (!window.AudioContext) {
    throw new Error("AudioContext not supported!");
}

var dvorak = [
    [9, 0, 188, 190, 80, 89, 70, 71, 67, 82, 76, 222, 160],
    [8, 65, 79, 69, 85, 73, 68, 72, 84, 78, 83, 173, 60, 13],
    [16, 0, 0, 81, 74, 75, 88, 66, 77, 87, 86, 90],
    [17, 18, 224, 32, 224, 18]
]

var KEY_WIDTH = 1
var KEY_HEIGHT = 1

// Create a new audio context.
var ctx = new AudioContext();
ctx.listener.setPosition(0, -5, 0)
var panners = {}
var isDown = {}
var downSound = {}; // TODO: supply and load actual sound
var upSound = {}; // TODO: supply and load actual sound

function createPanners(keymap) {
    panners = {}
    for (var rowI = 0; rowI < keymap.length; rowI++) {
	var row = keymap[rowI]
	var rowY = (keymap.length - rowI) * KEY_HEIGHT
	var offset = -row.length * KEY_WIDTH / 2
	for (var ki = 0; ki < row.length; ki++) {
	    console.log(row[ki])
	    var panner = panners[row[ki]] = ctx.createPanner()
	    panner.setPosition(ki * KEY_WIDTH + offset, rowY, 0)
	    panner.connect(ctx.destination)
	}
    }
}

createPanners(dvorak)

function playSound(pannerId, buffer) {
    var source = ctx.createBufferSource()
    source.buffer = buffer
    source.connect(panners[pannerId])
    source.start()
}

var notImplemented = []

function getData() {
    var request = new XMLHttpRequest();
    request.open('GET', 'media/down.wav', true);
    request.responseType = 'arraybuffer';
    request.onload = function() {
	var audioData = request.response;
	ctx.decodeAudioData(audioData, function(buffer) {
	    downSound = buffer;
	    upSound = buffer;
	}, function(e){"Error with decoding audio data" + e.err});
    }
    request.send();
}
getData()

function keydown(event) {
    if (!panners[event.keyCode]) {
        console.warn("Unknown keycode", event.keyCode)
	if (notImplemented.indexOf(event.keyCode))
	    notImplemented.push(event.keyCode)
        return
    }
    if (isDown[event.keyCode])
	return

    isDown[event.keyCode] = true
    playSound(event.keyCode, downSound)
}

function keyup(event) {
    if (!panners[event.keyCode]) {
        console.warning("Unknown keycode", event.keyCode)
        return
    }

    isDown[event.keyCode] = false
    playSound(event.keyCode, upSound)
}

// Stereo
var channels = 2;
// Create an empty two-second stereo buffer at the
// sample rate of the AudioContext
var frameCount = ctx.sampleRate * 0.02;

// downSound = ctx.createBuffer(2, frameCount, ctx.sampleRate);
upSound = ctx.createBuffer(2, frameCount, ctx.sampleRate);

for (var channel = 0; channel < channels; channel++) {
    // This gives us the actual ArrayBuffer that contains the data
    // var downBuffer = downSound.getChannelData(channel);
    var upBuffer = upSound.getChannelData(channel);
    for (var i = 0; i < frameCount; i++) {
	// Math.random() is in [0; 1.0]
	// audio needs to be in [-1.0; 1.0]
	// downBuffer[i] = Math.random() * 2 - 1;
	upBuffer[i] = Math.random() * 2 - 1;
    }
}
