"use strict";

var editArea = document.getElementById("edit-area")

editArea.addEventListener("keydown", keydown)
editArea.addEventListener("keyup", keyup)

if (localStorage.text)
    editArea.innerHTML = localStorage.text
window.addEventListener("beforeunload", function(e) {
    localStorage.text = editArea.innerHTML
})

window.AudioContext = window.AudioContext || window.webkitAudioContext

if (!window.AudioContext) {
    throw new Error("AudioContext not supported!")
}

// Create a new audio context.
var ctx = new AudioContext()
ctx.listener.setPosition(0, -5, 0)
var panners = {}
var isDown = {}
var downSound
var upSound

var dvorak = [
    [9, 0, 188, 190, 80, 89, 70, 71, 67, 82, 76, 222, 160],
    [8, 65, 79, 69, 85, 73, 68, 72, 84, 78, 83, 173, 60, 13],
    [16, 0, 0, 81, 74, 75, 88, 66, 77, 87, 86, 90],
    [17, 18, 224, 32, 224, 18]
]

var qwerty = [
    [9, 81, 87, 69, 82, 84, 89, 85, 73, 79, 80, 0, 160],
    [8, 65, 83, 68, 70, 71, 72, 74, 75, 76, 0, 0, 222, 13],
    [16, 60, 90, 88, 67, 86, 66, 78, 77, 188, 190, 173],
    [17, 18, 224, 32, 224, 18]
]

var KEY_WIDTH = 1
var KEY_HEIGHT = 1

function createPanners(keymap) {
    panners = {}
    for (var rowI = 0; rowI < keymap.length; rowI++) {
	var row = keymap[rowI]
	var rowY = (keymap.length - rowI) * KEY_HEIGHT
	var offset = -row.length * KEY_WIDTH / 2
	for (var ki = 0; ki < row.length; ki++) {
	    var panner = panners[row[ki]] = ctx.createPanner()
	    panner.setPosition(ki * KEY_WIDTH + offset, rowY, 0)
	    panner.connect(ctx.destination)
	}
    }
}

// createPanners(dvorak)
createPanners(qwerty)

function playSound(pannerId, buffer) {
    var source = ctx.createBufferSource()
    source.buffer = buffer
    source.connect(panners[pannerId])
    source.start()
}

var notImplemented = []

function getData() {
    var request = new XMLHttpRequest()
    request.open('GET', 'media/down.wav', true)
    request.responseType = 'arraybuffer'
    request.onload = function() {
	var audioData = request.response
	ctx.decodeAudioData(audioData, function(buffer) {
	    downSound = buffer
	}, function(e){"Error with decoding audio data" + e.err})
    }
    request.send()

    var request2 = new XMLHttpRequest()
    request2.open('GET', 'media/up.wav', true)
    request2.responseType = 'arraybuffer'
    request2.onload = function() {
	var audioData = request2.response
	ctx.decodeAudioData(audioData, function(buffer) {
	    upSound = buffer
	}, function(e){"Error with decoding audio data" + e.err})
    }
    request2.send()
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
