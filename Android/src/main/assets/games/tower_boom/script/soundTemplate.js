function Sound(s){
	if (windoW.listSound[s]) {
		windoW.listSound[s].pause();
	}
	windoW.listSound[s] = createSound(s);
	windoW.listSound[s].play();
}

function StopSound(){
	if (windoW.listSound["backsound"]) windoW.listSound["backsound"].pause();
	if (windoW.listSound["rolldrum"]) windoW.listSound["rolldrum"].pause();
}

function SoundLoop(vol){
	var s = "backsound";
	if (windoW.listSound[s]) {
		windoW.listSound[s].pause();
	}
	windoW.listSound[s] = createSound(s);
	windoW.listSound[s].volume = vol;
	windoW.listSound[s].play();
	windoW.listSound[s].addEventListener("ended",function(e){
		windoW.listSound[s].currentTime = 1;
		windoW.listSound[s].volume = vol;
		windoW.listSound[s].play();
	});
}

function createSound(s){
	var a = document.createElement('audio');
	a.innerHTML = ""
	a.innerHTML += '<source src="assets/audio/'+s+'.ogg" type="audio/ogg">';
	//a.innerHTML += '<source src="assets/audio/'+s+'.aac" type="audio/mpeg">';
	return a;
}

function addOnBlurListener(onBlurCallback, onFocusCallback) {
  var hidden, visibilityState, visibilityChange; // check the visiblility of the page

  if (typeof document.hidden !== "undefined") {
    hidden = "hidden"; visibilityChange = "visibilitychange"; visibilityState = "visibilityState";
  } else if (typeof document.mozHidden !== "undefined") {
    hidden = "mozHidden"; visibilityChange = "mozvisibilitychange"; visibilityState = "mozVisibilityState";
  } else if (typeof document.msHidden !== "undefined") {
    hidden = "msHidden"; visibilityChange = "msvisibilitychange"; visibilityState = "msVisibilityState";
  } else if (typeof document.webkitHidden !== "undefined") {
    hidden = "webkitHidden"; visibilityChange = "webkitvisibilitychange"; visibilityState = "webkitVisibilityState";
  }


  if (typeof document.addEventListener === "undefined" || typeof hidden === "undefined") {
    // not supported
  } else {
    document.addEventListener(visibilityChange, function() {
		//console.log("thiese")
      switch (document[visibilityState]) {
        case "visible":
          if (onFocusCallback) onFocusCallback();
          break;
        case "hidden":
          if (onBlurCallback) onBlurCallback();
          break;
      }
    }, false);
  }
}

function muteAudio() {
  console.log('mute all audios...');
  for (var i in windoW.listSound){
	windoW.listSound[i].muted = true;
  }
}

function unMuteAudio() {
  console.log('un mute all audios...');
  for (var i in windoW.listSound){
	windoW.listSound[i].muted = false;
  }
}

addOnBlurListener(muteAudio, unMuteAudio);