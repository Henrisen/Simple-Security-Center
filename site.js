var thePIN = prompt("Enter PIN");
var autoSkipTimeInSeconds = 2 * 60; 


var $motionBox = $('.motion-box');
var $turret = $('img');

var scale = 10;	// capture resolution over motion resolution
var isActivated = false;
var isTimedOut = false;
var isTargetInSight = false;
var pinCorrect = false;
var lostTimeout;
var isAlert = false;
var autoCancel;

if (navigator.language.search("de")>=0) {
	pw.placeholder = "Passwort";
}
if (navigator.language.search("en")>=0) {
	pw.placeholder = "Password";
}

document.getElementById('pw').style.display="none";

function initSuccess() {
	DiffCamEngine.start();
}

function initError() {
	alert('Something went wrong.');
}

function startComplete() {
	setTimeout(activate, 500);
}

function activate() {
	isActivated = true;
}

function capture(payload) {
	if (!isActivated) {
		return;
	}

	var box = payload.motionBox;
	if (box) {
		// video is flipped, so we're positioning from right instead of left
		var right = box.x.min * scale + 1;
		var top = box.y.min * scale + 1;
		var width = (box.x.max - box.x.min) * scale;
		var height = (box.y.max - box.y.min) * scale;

		$motionBox.css({
			display: 'block',
			right: right,
			top: top,
			width: width,
			height: height
		});

		if (!isTargetInSight) {
			isTargetInSight = true;
		} else if (!isTimedOut) {
			play('fire');
		}

		clearTimeout(lostTimeout);
		lostTimeout = setTimeout(declareLost, 2000);
	}
}

function declareLost() {
	isTargetInSight = false;
	autoCancel = setTimeout(() => {
		pw.value = "";
		pinCorrect = true;
		document.getElementById("audio-fire").pause();
		document.getElementById("audio-fire").currentTime == 0;
		document.getElementById('pw').style.display="none";
		document.body.style.backgroundColor = "#000"
		isTimedOut = true;
		setTimeout(() => {
			isTimedOut = false;
		}, 2500)
	}, autoSkipTimeInSeconds * 1000);
}

pw.addEventListener('keyup', () => {
	if (pw.value == thePIN) {
		pw.value = "";
		pinCorrect = true;
		document.getElementById("audio-fire").pause();
		document.getElementById("audio-fire").currentTime == 0;
		document.getElementById('pw').style.display="none";
		document.body.style.backgroundColor = "#000"
		isTimedOut = true;
		setTimeout(() => {
			isTimedOut = false;
		}, 2500)
	}
})

function bgalert(skip) {
	if (!isAlert || skip) {
		if (pw.value != thePIN) {
			if (document.getElementById("audio-fire").currentTime >= 23.49) {
				play("fire");
			}
		}
		isAlert = true;
		document.body.style.backgroundColor = "#f00"
		setTimeout(() => {	document.body.style.backgroundColor = "#000" }, 200)
		if (!pinCorrect) {
			setTimeout(() => { bgalert(true) }, 400)
		}else {
			isAlert = false;
		}
	}
}

function play(audioId) {
	pinCorrect = false;
	clearTimeout(autoCancel);
	document.getElementById('pw').style.display="block";
	pw.focus();
	bgalert(false);
	$('#audio-' + audioId)[0].play();
}

DiffCamEngine.init({
	video: document.getElementById('video'),
	captureIntervalTime: 50,
	includeMotionBox: true,
	includeMotionPixels: true,
	initSuccessCallback: initSuccess,
	initErrorCallback: initError,
	startCompleteCallback: startComplete,
	captureCallback: capture
});
