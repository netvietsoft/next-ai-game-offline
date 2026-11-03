var s_iOffsetX, s_iOffsetY, s_iScaleFactor = 1,
	s_bIsIphone = !1,
	s_bFocus = !0;

function trace(e) {
	console.log(e)
}

function isIOS() {
	for (var e = ["iPad Simulator", "iPhone Simulator", "iPod Simulator", "iPad", "iPhone", "iPod"]; e.length;)
		if (navigator.platform === e.pop()) return s_bIsIphone = !0;
	return s_bIsIphone = !1
}

function isIpad() {
	var e = -1 !== navigator.userAgent.toLowerCase().indexOf("ipad");
	return !!(!e && navigator.userAgent.match(/Mac/) && navigator.maxTouchPoints && 2 < navigator.maxTouchPoints) || e
}

function isMobile() {
	return !!isIpad() || jQuery.browser.mobile
}

function getSize(e) {
	var n, t, o, i = e.toLowerCase(),
		a = window.document,
		s = a.documentElement;
	return void 0 === window["inner" + e] ? n = s["client" + e] : window["inner" + e] != s["client" + e] ? ((t = a.createElement("body")).id = "vpw-test-b", t.style.cssText = "overflow:scroll", (o = a.createElement("div")).id = "vpw-test-d", o.style.cssText = "position:absolute;top:-1000px", o.innerHTML = "<style>@media(" + i + ":" + s["client" + e] + "px){body#vpw-test-b div#vpw-test-d{" + i + ":7px!important}}</style>", t.appendChild(o), s.insertBefore(t, a.head), n = 7 == o["offset" + e] ? s["client" + e] : window["inner" + e], s.removeChild(t)) : n = window["inner" + e], n
}

function onOrientationChange() {
	window.matchMedia("(orientation: portrait)").matches && sizeHandler(), window.matchMedia("(orientation: landscape)").matches && sizeHandler()
}

function getIOSWindowHeight() {
	var e = document.documentElement.clientWidth / window.innerWidth;
	return window.innerHeight * e
}

function getHeightOfIOSToolbars() {
	var e = (0 === window.orientation ? screen.height : screen.width) - getIOSWindowHeight();
	return 1 < e ? e : 0
}

function sizeHandler() {
	var e, n, t, o, i, a, s, r;
	window.scrollTo(0, 1), $("#canvas_game") && (e = null !== platform.name && "safari" === platform.name.toLowerCase() ? getIOSWindowHeight() : getSize("Height"), n = getSize("Width"), s_bFocus && _checkOrientation(n, e), t = Math.min(e / CANVAS_HEIGHT, n / CANVAS_WIDTH), o = Math.round(CANVAS_WIDTH * t), r = 0, (i = Math.round(CANVAS_HEIGHT * t)) < e ? (i += r = e - i, o += r * (CANVAS_WIDTH / CANVAS_HEIGHT)) : o < n && (o += r = n - o, i += r * (CANVAS_HEIGHT / CANVAS_WIDTH)), a = e / 2 - i / 2, ((s = n / 2 - o / 2) * (r = CANVAS_WIDTH / o) < -EDGEBOARD_X || a * r < -EDGEBOARD_Y) && (t = Math.min(e / (CANVAS_HEIGHT - 2 * EDGEBOARD_Y), n / (CANVAS_WIDTH - 2 * EDGEBOARD_X)), o = Math.round(CANVAS_WIDTH * t), a = (e - (i = Math.round(CANVAS_HEIGHT * t))) / 2, s = (n - o) / 2, r = CANVAS_WIDTH / o), s_iOffsetX = -1 * s * r, s_iOffsetY = 0 <= a ? 0 : -1 * a * r, 0 <= s && (s_iOffsetX = 0), null !== s_oGame && s_oGame.refreshButtonPos(), null !== s_oMenu && s_oMenu.refreshButtonPos(), null !== s_oDifficultyMenu && s_oDifficultyMenu.refreshButtonPos(), $("#canvas_game").css("width", o + "px"), $("#canvas_game").css("height", i + "px"), $("#canvas_3d").css("width", o + "px"), $("#canvas_3d").css("height", i + "px"), $("#canvas_upper_3d").css("width", o + "px"), $("#canvas_upper_3d").css("height", i + "px"), a < 0 || (a = (e - i) / 2), $("#canvas_game").css("top", a + "px"), $("#canvas_3d").css("top", a + "px"), $("#canvas_upper_3d").css("top", a + "px"), $("#canvas_game").css("left", s + "px"), $("#canvas_3d").css("left", s + "px"), $("#canvas_upper_3d").css("left", s + "px"), fullscreenHandler())
}
// Слушаем события изменения размера и ориентации
window.addEventListener('resize', sizeHandler);
window.addEventListener('orientationchange', sizeHandler);

// Вызываем функцию сразу после загрузки
document.addEventListener('DOMContentLoaded', sizeHandler);

function _checkOrientation(e, n) {
	s_bMobile && ENABLE_CHECK_ORIENTATION && (n < e ? "landscape" === $(".orientation-msg-container").attr("data-orientation") ? ($(".orientation-msg-container").css("display", "none"), s_oMain.startUpdate()) : ($(".orientation-msg-container").css("display", "block"), s_oMain.stopUpdate()) : "portrait" === $(".orientation-msg-container").attr("data-orientation") ? ($(".orientation-msg-container").css("display", "none"), s_oMain.startUpdate()) : ($(".orientation-msg-container").css("display", "block"), s_oMain.stopUpdate()))
}

function createBitmap(e, n, t) {
	var o = new createjs.Bitmap(e),
		i = new createjs.Shape;
	return n && t ? i.graphics.beginFill("#fff").drawRect(0, 0, n, t) : i.graphics.beginFill("#ff0").drawRect(0, 0, e.width, e.height), o.hitArea = i, o
}

function createSprite(e, n, t, o, i, a) {
	n = null !== n ? new createjs.Sprite(e, n) : new createjs.Sprite(e);
	e = new createjs.Shape;
	return e.graphics.beginFill("#000000").drawRect(-t, -o, i, a), n.hitArea = e, n
}

function randomFloatBetween(e, n, t = 2) {
	return parseFloat(Math.min(e + Math.random() * (n - e), n).toFixed(t))
}

function shuffle(e) {
	for (var n, t, o = e.length; 0 !== o;) t = Math.floor(Math.random() * o), n = e[--o], e[o] = e[t], e[t] = n;
	return e
}

function formatTime(e) {
	e /= 1e3;
	var n = Math.floor(e / 60),
		t = e - 60 * n,
		e = "";
	return e += n < 10 ? "0" + n + ":" : n + ":", e += (t = parseFloat(t).toFixed(1)) < 10 ? "0" + t : t
}

function NoClickDelay(e) {
	this.element = e, window.Touch && this.element.addEventListener("touchstart", this, !1)
}

function shuffle(e) {
	for (var n, t, o = e.length; 0 < o;) t = Math.floor(Math.random() * o), n = e[--o], e[o] = e[t], e[t] = n;
	return e
}

function ctlArcadeResume() {
	null !== s_oMain && s_oMain.startUpdate()
}

function ctlArcadePause() {
	null !== s_oMain && s_oMain.stopUpdate()
}

function getParamValue(e) {
	for (var n = window.location.search.substring(1).split("&"), t = 0; t < n.length; t++) {
		var o = n[t].split("=");
		if (o[0] == e) return o[1]
	}
}

function playSound(e, n, t) {
	return !1 === DISABLE_SOUND_MOBILE || !1 === s_bMobile ? (s_aSounds[e].play(), s_aSounds[e].volume(n), s_aSounds[e].loop(t), s_aSounds[e]) : null
}

function stopSound(e) {
	!1 !== DISABLE_SOUND_MOBILE && !1 !== s_bMobile || s_aSounds[e].stop()
}

function setVolume(e, n) {
	!1 !== DISABLE_SOUND_MOBILE && !1 !== s_bMobile || s_aSounds[e].volume(n)
}

function setMute(e, n) {
	!1 !== DISABLE_SOUND_MOBILE && !1 !== s_bMobile || s_aSounds[e].mute(n)
}

function tweenVolume(e, n, t, o = createjs.Ease.linear, i, a) {
	var s;
	!1 !== DISABLE_SOUND_MOBILE && !1 !== s_bMobile || (s = {
		from: s_aSounds[e].volume(),
		to: n
	}, createjs.Tween.get(s, {
		override: !0
	}).to({
		from: s.to
	}, t, o).on("change", function() {
		s_aSounds[e].volume(s.from)
	}).call(function(e) {
		e.target.removeAllEventListeners(), void 0 !== i && i.call(a)
	}))
}

function isSoundPlaying(e) {
	return s_aSounds[e].playing()
}

function radiantsToDegrees(e) {
	return e * (180 / Math.PI)
}

function degreesToRadiants(e) {
	return e * (Math.PI / 180)
}

function saveItem(e, n) {
	s_bStorageAvailable && localStorage.setItem(e, n)
}

function getItem(e) {
	return s_bStorageAvailable ? localStorage.getItem(e) : null
}

function sortByKey(e, t) {
	return e.sort(function(e, n) {
		e = e[t], n = n[t];
		return e < n ? -1 : n < e ? 1 : 0
	})
}

function createGraphicCircle(e, n, t, o) {
	var i = new createjs.Shape;
	return i.graphics.beginFill(o).drawCircle(e.x, e.y, n), null !== t && createjs.Tween.get(i).to({
		alpha: 0,
		visible: !1
	}, t), i
}

function createGraphicLine(e, n, t, o, i) {
	var a = new createjs.Shape;
	return a.graphics.setStrokeStyle(t, "round", "round"), a.graphics.beginStroke(i).moveTo(e.x, e.y).lineTo(n.x, n.y), null !== o && createjs.Tween.get(a).to({
		alpha: 0,
		visible: !1
	}, o), a
}

function linearFunction(e, n, t, o, i) {
	return (e - n) * (i - o) / (t - n) + o
}

function fullscreenHandler() {
	ENABLE_FULLSCREEN && !1 !== screenfull.isEnabled && (s_bFullscreen = screenfull.isFullscreen, null !== s_oInterface && s_oInterface.resetFullscreenBut(), null !== s_oMenu && s_oMenu.resetFullscreenBut(), null !== s_oDifficultyMenu && s_oDifficultyMenu.resetFullscreenBut())
}! function(e) {
	(jQuery.browser = jQuery.browser || {}).mobile = /android|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(ad|hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|symbian|tablet|treo|up\.(browser|link)|vodafone|wap|webos|windows (ce|phone)|xda|xiino/i.test(e) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|e\-|e\/|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(di|rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|xda(\-|2|g)|yas\-|your|zeto|zte\-/i.test(e.substr(0, 4))
}(navigator.userAgent || navigator.vendor || window.opera), $(window).resize(function() {
		sizeHandler()
	}), window.addEventListener("orientationchange", onOrientationChange), this.tweenValue = function(e, n, t) {
		return e + t * (n - e)
	}, NoClickDelay.prototype = {
		handleEvent: function(e) {
			switch (e.type) {
				case "touchstart":
					this.onTouchStart(e);
					break;
				case "touchmove":
					this.onTouchMove(e);
					break;
				case "touchend":
					this.onTouchEnd(e)
			}
		},
		onTouchStart: function(e) {
			e.preventDefault(), this.moved = !1, this.element.addEventListener("touchmove", this, !1), this.element.addEventListener("touchend", this, !1)
		},
		onTouchMove: function(e) {
			this.moved = !0
		},
		onTouchEnd: function(e) {
			var n;
			this.element.removeEventListener("touchmove", this, !1), this.element.removeEventListener("touchend", this, !1), this.moved || (3 == (n = document.elementFromPoint(e.changedTouches[0].clientX, e.changedTouches[0].clientY)).nodeType && (n = n.parentNode), (e = document.createEvent("MouseEvents")).initEvent("click", !0, !0), n.dispatchEvent(e))
		}
	},
	function() {
		var o = "hidden";

		function e(e) {
			var n = "visible",
				t = "hidden",
				t = {
					focus: n,
					focusin: n,
					pageshow: n,
					blur: t,
					focusout: t,
					pagehide: t
				};
			(e = e || window.event).type in t ? document.body.className = t[e.type] : (document.body.className = this[o] ? "hidden" : "visible", s_bFocus = "hidden" === document.body.className ? (s_oMain.stopUpdate(), !1) : (s_oMain.startUpdate(), !0))
		}
		o in document ? document.addEventListener("visibilitychange", e) : (o = "mozHidden") in document ? document.addEventListener("mozvisibilitychange", e) : (o = "webkitHidden") in document ? document.addEventListener("webkitvisibilitychange", e) : (o = "msHidden") in document ? document.addEventListener("msvisibilitychange", e) : "onfocusin" in document ? document.onfocusin = document.onfocusout = e : window.onpageshow = window.onpagehide = window.onfocus = window.onblur = e
	}(), screenfull.isEnabled && screenfull.on("change", function() {
		s_bFullscreen = screenfull.isFullscreen, null !== s_oInterface && s_oInterface.resetFullscreenBut(), null !== s_oMenu && s_oMenu.resetFullscreenBut(), null !== s_oDifficultyMenu && s_oDifficultyMenu.resetFullscreenBut()
	});