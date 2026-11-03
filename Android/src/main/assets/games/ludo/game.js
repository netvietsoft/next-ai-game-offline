var gradle_settings = false;

var c =null;
window.main = {
	sprites: {
		settings_bgs: {
			path: "backgrounds.png",
			w: 63,
			h: 61
		},
		icons_bottom: {
			path: "bottombar.png",
			w: 39,
			h: 42
		},
		icons_menu: {
			path: "hraci.png",
			w: 74,
			h: 56
		},
		die: {
			path: "kocka.png",
			w: 89,
			h: 89
		},
		die_anim: {
			path: "kockaanim.png",
			w: 134,
			h: 134
		},
		die_bg: {
			path: "menovky.png",
			w: 149,
			h: 176
		},
		settings_checkbox: {
			path: "onoff.png",
			w: 63,
			h: 61
		},
		tokens: {
			path: "panaci.png",
			w: 30,
			h: 39
		},
		particles: {
			path: "particle.png",
			w: 22,
			h: 22
		},
		btns_pause: {
			path: "pause.png",
			w: 40,
			h: 38
		},
		trophy_ingame: {
			path: "trophy-ingame.png",
			w: 124,
			h: 131
		},
		trophy_result: {
			path: "trophy-result.png",
			w: 102,
			h: 118
		}
	},
	audio: {
		music: {
			path: "snd/music_calme",
			volume: 1,
			loop: !0,
			type: "music"
		},
		die_throw: {
			path: "snd/dice-throws_f12hyBEO",
			volume: 1,
			loop: !1,
			type: "audio"
		},
		game_start: {
			path: "snd/Game start",
			volume: 1,
			loop: !1,
			type: "audio"
		},
		token_move_1: {
			path: "snd/ChipMove",
			volume: 1,
			loop: !1,
			type: "audio"
		},
		token_move_2: {
			path: "snd/Pohyb po ploche",
			volume: 1,
			loop: !1,
			type: "audio"
		},
		menu_click: {
			path: "snd/menu click",
			volume: 1,
			loop: !1,
			type: "audio"
		},
		player_win: {
			path: "snd/Player wins",
			volume: 1,
			loop: !1,
			type: "audio"
		},
		enter_finish: {
			path: "snd/Vstup do domcek",
			volume: 1,
			loop: !1,
			type: "audio"
		},
		kick: {
			path: "snd/vyhodenie",
			volume: 1,
			loop: !1,
			type: "audio"
		},
		menu_panel: {
			path: "snd/whoosh karta menu",
			volume: 1,
			loop: !1,
			type: "audio"
		}
	},
	managers: {},
	storage: {
		name: "gradle_ludo",
		data: {
			music: !0,
			sounds: !0,
			bg: 0,
			gameName: "gradle_ludo",
			playerTypesCount: [1, 3, 0],
			playerTypesMenu: [0, 1, 1, 1],
			playerNamesMenu: [],
			playerTypesGame: [],
			playerNamesGame: [],
			playerPositions: [],
			playerPlaces: [],
			playerDieNumbers: [],
			tokensPassedStart: [],
			tokenSquares: []
		}
	},
	fonts: {
		preloaderFontSize: "29px Arial",
		menuFontSize: "40px Arial",
		tokenFontSize: "20px Arial",
		playerFontSize: "20px Arial",
		buttonFontSize: "40px Arial",
		dialogFontSize: "35px Arial",
		dialogFontSizeNumber: 35
	},
	menu: {
		activeScreen: -1,
		panelY: 228,
		panelOffset: 10,
		panelRadius: 50,
		panelAnimTime: 500,
		panelGroups: [],
		btnsBottomCount: 3,
		btnsBottomColors: [5224191, 10474564, 16080984],
		btnsBottom: [],
		btnsSprites: ["bm", "by", "bz", "bc", "bs"],
		btnAnimTime: 500,
		tutorialAnimTime: 250,
		btnW: 36,
		btnH: 90,
		btnStartH: 85
	},
	game: {
		splashDelay: 10,
		turnDelay: 500,
		maxPlayers: 4,
		colors: [5224191, 16765504, 10474564, 16080984],
		colors_strings: [gradle.text_color, "#FFD240", "#9FD444", "#000"]
	},
	board: {
		POSITION_FIRST: 0,
		POSITION_SECOND: 1,
		POSITION_THIRD: 2,
		POSITION_FOURTH: 3,
		POSITION_COUNT: 4,
		BOARD_SIZE: 92,
		BOARD_FINISH_SIZE: 6,
		BOARD_PATH_NEAR: 6,
		BOARD_PATH_FAR: 8,
		HOME_SQUARES: [52, 56, 60, 64],
		START_SQUARES: [0, 13, 26, 39],
		SAFE_SQUARES: [8, 21, 34, 47],
		END_SQUARES: [50, 11, 24, 37],
		FINISH_SQUARES: [68, 74, 80, 86],
		BOARD_XS: [13, 12, 11, 10, 9, 8, 8, 8,
			8, 8, 8, 7, 6, 6, 6, 6, 6, 6, 5, 4, 3, 2, 1, 0, 0, 0, 1, 2, 3, 4, 5, 6, 6, 6, 6, 6, 6, 7, 8, 8, 8, 8, 8, 8, 9, 10, 11, 12, 13, 14, 14, 14, 13, 12, 13, 14, 1, 0, 1, 2, 1, 0, 1, 2, 13, 12, 13, 14, 13, 12, 11, 10, 9, 8, 7, 7, 7, 7, 7, 7, 1, 2, 3, 4, 5, 6, 7, 7, 7, 7, 7, 7
		],
		BOARD_YS: [6, 6, 6, 6, 6, 5, 4, 3, 2, 1, 0, 0, 0, 1, 2, 3, 4, 5, 6, 6, 6, 6, 6, 6, 7, 8, 8, 8, 8, 8, 8, 9, 10, 11, 12, 13, 14, 14, 14, 13, 12, 11, 10, 9, 8, 8, 8, 8, 8, 8, 7, 6, 0, 1, 2, 1, 0, 1, 2, 1, 12, 13, 14, 13, 12, 13, 14, 13, 7, 7, 7, 7, 7, 7, 1, 2, 3, 4, 5, 6, 7, 7, 7, 7, 7, 7, 13, 12, 11, 10, 9, 8],
		BOARD_HORIZONTALS: [0, 1, 2, 3, 4, 18, 19, 20, 21, 22, 23, 25, 26, 27, 28, 29, 30, 44, 45, 46, 47, 48, 49, 51],
		BOARD_VERTICALS: [5,
			6, 7, 8, 9, 10, 12, 13, 14, 15, 16, 17, 31, 32, 33, 34, 35, 36, 38, 39, 40, 41, 42, 43
		],
		BG_XS: [8, 0, 0, 7],
		BG_YS: [0, 0, 7, 8],
		BG_WS: [8, 7, 8, 7],
		BG_HS: [7, 8, 7, 8],
		BG_OFFSETS: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		border: 10.5,
		firstTopSquare: 12,
		lastTopSquare: 36,
		dieBgBorder: 15,
		homeW: 144
	},
	token: {
		count: 4,
		moveDelay: 200,
		moveDelayLong: 650,
		offset: 4.5,
		scales: [1, 1, .85, .65],
		jumpHeight: 50
	},
	player: {
		type: {
			human: 0,
			ai: 1,
			off: 2,
			length: 3
		},
		state: {
			wait: 0,
			"throw": 1,
			select: 2
		},
		die: {
			sides: 6,
			rollDelay: 75
		},
		blinkDelay: 500,
		maxNameLength: 8
	},
	dialog: {
		fadeTime: 500,
		visible: !1,
		type: {
			yesNo: 0,
			ok: 1,
			about: 2,
			continuePlaying: 3,
			result: 4
		},
		create: function(a) {
			var b = a.phaserGame,
				c = b.add.image(b.world.centerX, b.world.centerY, "overlay");
			c.tint = 0;
			c.anchor.setTo(.5);
			c.width = b.width;
			c.height = b.height;
			c.alpha = 0;
			a.dialog.overlay = c;
			c = b.add.group();
			c.y = b.height;
			a.dialog.group = c
		},
		show: function(a, b, c, d, e, g, h, f) {
			if (!a.dialog.visible || f) {
				a.dialog.visible = !0;
				a.dialog.overlay.inputEnabled = !0;
				var k = a.phaserGame,
					l = k.world.centerX,
					m = k.world.centerY,
					q = a.menu.panelOffset,
					n = a.menu.btnW,
					r = a.menu.btnH,
					t = k.add.group(),
					p, x = k.height - 3 * q - r;
				p = 0;
				k.add.tween(a.dialog.overlay).to({
					alpha: .5
				}, a.dialog.fadeTime, Phaser.Easing.Linear.None, !0);
				switch (b) {
					case a.dialog.type.yesNo:
					case a.dialog.type.ok:
					case a.dialog.type.continuePlaying:
						t = k.add.text(l, 0, c, {
							font: a.fonts.dialogFontSize,
							fill: "#FFFFFF",
							align: "center",
							wordWrap: !0,
							wordWrapWidth: a.dialog.maxTextWidth
						});
						t.anchor.setTo(.5, 0);
						break;
					case a.dialog.type.about:
						
						break;
					case a.dialog.type.result:
						var z = a.sprites.trophy_result.w,
							w = a.sprites.trophy_result.h,
							u, y = [],
							A;
						p = w / 2;
						for (var v = 0; v < a.game.self.scoreTable.length; v++) {
							c = a.game.self.scoreTable[v];
							u = k.add.image(0, p, "atlas", a.menu.btnsSprites[c.color] + "2.png");
							u.anchor.setTo(.5);
							t.add(u);
							y.push(u);
							u = k.add.text(0, p, c.name, {
								font: a.fonts.menuFontSize,
								fill: "#FFFFFF",
								align: "center"
							});
							u.anchor.setTo(.5);
							t.add(u);
							y.push(u);
							if (0 == v || u.width >
								A) A = u.width;
							u = k.add.image(0, p, "trophy_result", v);
							u.anchor.setTo(.5);
							t.add(u);
							y.push(u);
							p += w + q
						}
						p = (k.width - 6 * q - A - 2 * n - z) / 3;
						c = 0;
						w = [];
						a.dialog.resultItems = y;
						a.dialog.resultItemsParts = w;
						for (v = 0; v < y.length; v += 3) {
							u = y[v];
							u.width = A;
							u.x = 3 * q + p + n + A / 2;
							u.alpha = 0;
							var B = a.dialog.addSideButtonParts(a, u, a.game.self.scoreTable[c++].color, t);
							B.left.alpha = 0;
							B.right.alpha = 0;
							w.push(B.left);
							w.push(B.right);
							y[v + 1].x = u.x;
							y[v + 2].x = u.x + A / 2 + n + p + z / 2;
							y[v + 2].alpha = 0
						}
				}
				for (p = t.height + 4 * q + a.fonts.dialogFontSizeNumber; p > x;) t.fontSize--,
					p = t.height + 4 * q + t.fontSize;
				m -= (p + q + r) / 2;
				
				var r = k.add.image(q+10, m, "atlas", "panel.png");
				r.width  = k.width - 4 * q;
				r.height = p - 2 * q;
				a.dialog.group.add(r);
				a.dialog.group.add(t);
				t.y = m + p / 2 - t.height / 2;
				a.dialog.createButtons(a, b, m, p, d, e);
				f || a.dialog.overlay.bringToTop();
				k.world.bringToTop(a.dialog.group);
				d = (null == h ? m : h) - m;
				var C = k.add.tween(a.dialog.group).to({
					y: d
				}, a.dialog.fadeTime, Phaser.Easing.Exponential.Out, !0);
				null != g ? C.onComplete.add(g) : b == a.dialog.type.result && C.onComplete.add(function() {
					var b = new Particles(k, l, 0, -1, 250);
					b.gravity = 500;
					b.explode(5E3);
					for (var c = 0, d = 0; d < a.dialog.resultItems.length; d++) b = a.dialog.resultItems[d], C = k.add.tween(b).to({
						alpha: 1
					}, 250, Phaser.Easing.Exponential.Out, !0, 250 * Math.floor(d / 3)), 0 == d % 3 && (b = a.dialog.resultItemsParts[c++], k.add.tween(b).to({
						alpha: 1
					}, 250, Phaser.Easing.Exponential.Out, !0, 250 * Math.floor(d / 3)), b = a.dialog.resultItemsParts[c++], k.add.tween(b).to({
						alpha: 1
					}, 250, Phaser.Easing.Exponential.Out, !0, 250 * Math.floor(d / 3)))
				});
				return !0
			}
			return !1
		},
		showContinuePlaying: function(a, b, c) {
			if (!a.dialog.visible) {
				a.dialog.visible = !0;
				a.dialog.overlay.inputEnabled = !0;
				
				var d = a.game.self.scoreTable[0],
					e = a.phaserGame,
					g = a.menu.panelOffset,
					h = a.menu.btnH,
					f = e.world.centerX,
					k = 2 * g + a.fonts.dialogFontSizeNumber / 2,
					l = e.add.group();
				l.y = e.height;
				e.add.tween(a.dialog.overlay).to({
						alpha: .5
					}, a.dialog.fadeTime,
					Phaser.Easing.Linear.None, !0);
				var m = e.add.graphics(0, 0);
				l.add(m);
				var q = e.add.image(f, k, "atlas", "first.png");
				q.anchor.setTo(.5, 0);
				l.add(q);
				var k = k + (q.height + g),
					n = e.add.text(f, k, a.managers.language.get("congratulations"), {
						font: a.fonts.dialogFontSize,
						fill: a.game.colors_strings[d.color],
						align: "center",
						wordWrap: !0,
						wordWrapWidth: a.dialog.maxTextWidth
					});
				n.anchor.setTo(.5, 0);
				l.add(n);
				var k = k + (n.height + g),
					r = e.add.image(f, k, "atlas", a.menu.btnsSprites[d.color] + "2.png");
				r.y += r.height / 2;
				r.anchor.setTo(.5);
				l.add(r);
				f = e.add.text(f, r.y, d.name, {
					font: a.fonts.menuFontSize,
					fill: "#FFFFFF",
					align: "center"
				});
				f.anchor.setTo(.5);
				l.add(f);
				r.width = f.width;
				r = a.dialog.addSideButtonParts(a, r, d.color, l);
				f.bringToTop();
				var t = l.height + 2 * g + a.fonts.dialogFontSizeNumber / 2;
				m.beginFill(16777215, 1);
				m.drawRoundedRect(g, 0, e.width - 2 * g, t, a.menu.panelRadius);
				m.beginFill(a.game.colors[d.color], 1);
				m.drawRoundedRect(2 * g, g, e.width - 4 * g, t - 2 * g, a.menu.panelRadius - g / 2);
				m.beginFill(16777215, 1);
				m.drawRoundedRect(3 * g, 2 * g, e.width - 6 * g, t - 4 * g, a.menu.panelRadius -
					g);
				a.dialog.topWindow = l;
				a.dialog.overlay.bringToTop();
				e.world.bringToTop(l);
				q.scale.setTo(0);
				n.anchor.setTo(0, 0);
				n.x -= n.width / 2;
				n.alpha = 0;
				r.left.alpha = 0;
				r.middle.alpha = 0;
				r.right.alpha = 0;
				var p = e.add.tween(l).to({
					y: e.world.centerY - t / 2
				}, a.dialog.fadeTime, Phaser.Easing.Exponential.Out, !0, 100);
				p.onComplete.add(function() {
					p = e.add.tween(q.scale).to({
						x: 1,
						y: 1
					}, 750, Phaser.Easing.Exponential.Out, !0);
					var d = new Particles(e, q.x, l.y + 2 * g + a.fonts.dialogFontSizeNumber / 2 + q.height / 2, -1, 50);
					d.explode(750);
					p.onComplete.add(function() {
						var f =
							e.add.graphics(0, 0);
						f.drawRect(n.x - n.width, l.y + 3 * g + a.fonts.dialogFontSizeNumber / 2 + q.height, n.width, n.height);
						n.mask = f;
						n.alpha = 1;
						d.x = n.x;
						d.y = l.y + 3 * g + a.fonts.dialogFontSizeNumber / 2 + q.height + n.height / 2;
						p = e.add.tween(f).to({
							x: n.width
						}, 750, Phaser.Easing.Linear.None, !0, 100);
						a.dialog.runCongratsAnimation && (p = e.add.tween(d).to({
							x: n.x + n.width
						}, 750, Phaser.Easing.Linear.None, !0), d.fire(500, 15, 50));
						p.onComplete.add(function() {
							n.mask = null;
							e.add.tween(r.left).to({
								alpha: 1
							}, 750, Phaser.Easing.Linear.None, !0, 100);
							e.add.tween(r.middle).to({
								alpha: 1
							}, 750, Phaser.Easing.Linear.None, !0, 100);
							p = e.add.tween(r.right).to({
								alpha: 1
							}, 750, Phaser.Easing.Linear.None, !0, 100);
							p.onComplete.add(function() {
								var d = a.managers.language.get("continue_text"),
									f = e.add.text(0, 0, d, {
										font: a.fonts.dialogFontSize,
										fill: a.game.colors_strings[0],
										align: "center",
										wordWrap: !0,
										wordWrapWidth: a.dialog.maxTextWidth
									}),
									k = (e.height - (t + f.height + 5 * g + a.fonts.dialogFontSizeNumber + h)) / 3;
								f.destroy();
								e.add.tween(a.dialog.topWindow).to({
									y: k
								}, a.dialog.fadeTime, Phaser.Easing.Exponential.Out, !0, 100);
								a.dialog.show(a, a.dialog.type.continuePlaying, d, b, c, null, 2 * k + t, !0, 100)
							})
						})
					})
				})
			}
		},
		createButtons: function(a, b, c, d, e, g) {
			c = c + d + a.menu.panelOffset + a.menu.btnH / 2;
			d = a.phaserGame;
			var h = new Button(d, d.width / 4, c, "atlas", "btn.png", function() {
					a.managers.audio.playSound("menu_click");
					a.dialog.hide(a, e)
				}),
				f, k;
			b == a.dialog.type.yesNo || b == a.dialog.type.continuePlaying ? (f = a.managers.language.get("yes"), k = a.managers.language.get("no")) : b == a.dialog.type.ok || b == a.dialog.type.about ? f = "OK" : b == a.dialog.type.result &&
				(f = a.managers.language.get("restart"), k = a.managers.language.get("menu"));
				
			f = d.add.text(h.x, h.y, f, {
				font: a.fonts.buttonFontSize,
				fill: "#FFFFFF",
				align: "center"
			});
			f.anchor.setTo(.5);
			a.dialog.btnYes = h;
			a.dialog.group.add(h);
			a.dialog.group.add(f);
			
			if(b == a.dialog.type.ok || b == a.dialog.type.about){
				h.width = f.width, h.x = d.world.centerX, f.x = d.world.centerX, a.dialog.addSideButtonParts(a, h, 0, a.dialog.group), f.bringToTop();
			}
			else{ 
				h = new Button(d, d.width - d.width / 4, c, "atlas", "btn.png", function() {
					a.managers.audio.playSound("menu_click");
					a.dialog.hide(a, g)
				}); 
				
				k = d.add.text(h.x, h.y, k, {
					font: a.fonts.buttonFontSize,
					fill: "#FFFFFF",
					align: "center"
				}); 
				
				k.anchor.setTo(.5);
				h.width = a.dialog.btnYes.width = Math.max(f.width, h.width);
				a.dialog.btnNo = h;
				a.dialog.group.add(h);
				a.dialog.group.add(k);
				//a.dialog.addSideButtonParts(a, a.dialog.btnYes, 0, a.dialog.group);
				//a.dialog.addSideButtonParts(a, h, 0, a.dialog.group);
				k.bringToTop();
			}
		},
		hide: function(a, b) {
			if (a.dialog.visible) {
				var c = a.phaserGame;
				c.add.tween(a.dialog.overlay).to({
					alpha: 0
				}, a.dialog.fadeTime, Phaser.Easing.Linear.None, !0);
				c.add.tween(a.dialog.group).to({
					y: c.height
				}, a.dialog.fadeTime, Phaser.Easing.Exponential.Out, !0).onComplete.add(function() {
					a.dialog.group.removeAll(!0);
					a.dialog.overlay.inputEnabled = !1;
					a.dialog.visible = !1;
					a.dialog.topWindow && (a.dialog.topWindow.removeAll(), a.dialog.topWindow = null);
					null != b && b()
				});
				a.dialog.topWindow && c.add.tween(a.dialog.topWindow).to({
					y: c.height
				}, a.dialog.fadeTime, Phaser.Easing.Exponential.Out, !0)
			}
		},
		addSideButtonParts: function(a, b, c, d) {
			var e = a.phaserGame.add.image(b.x - b.width / 2 +
				1, b.y, "atlas", a.menu.btnsSprites[c] + "1.png");
			e.anchor.setTo(1, .5);
			a = a.phaserGame.add.image(b.x + b.width / 2 - 1, b.y, "atlas", a.menu.btnsSprites[c] + "3.png");
			a.anchor.setTo(0, .5);
			d && (d.add(e), d.add(a));
			return {
				left: e,
				middle: b,
				right: a
			}
		}
	}
};
var SOUNDS_ENABLED = true,
	GAME_OVER = 0,
	GAME_OVER_BY_USER = 1;

function first_start(){
	Phaser.Device._initialize();
	var a = !1,
		b = navigator.userAgent || navigator.vendor || window.opera;
	if (b.match(/iPad/i) || b.match(/iPhone/i) || b.match(/iPod/i)) a = !0;
	a || (document.addEventListener("touchstart", function(a) {
		//a.preventDefault()
	}), document.addEventListener("touchmove", function(a) {
		//a.preventDefault()
	}));
	window.game = c = new Phaser.Game(540, 960, Phaser.CANVAS, null, null, true);
	c.state.add("Boot", Boot);
	c.state.add("Preloader", Preloader);
	c.state.add("Intro", Intro);
	c.state.add("Menu", Menu);
	c.state.add("Game", Game);
	main.managers.storage = new StorageManager(c);
	main.managers.language = new Languages(c);
	main.managers.audio = new AudioManager(c);
	main.phaserGame = c;
	c.state.start("Boot");
	window.addEventListener("contextmenu", function(a) {
		//a.preventDefault()
	});
	document.documentElement.style.overflow = "hidden";
	document.body.scroll = "no";
	window.addEventListener("touchend", function() {
		if (null !== c) try {
			"running" !==
			c.sound.context.state && c.sound.context.resume()
		} catch (a) {}
	}, !1)
}
window.GD_OPTIONS = {
	gameId: "gradle.ludo",
	onEvent: function(a) {
		switch (a.name) {
			case "SDK_GAME_START":
				gradle.event('game_start');
				main.phaserGame.paused = !1;
				main.phaserGame.sound.mute = !1;
				break;
			case "SDK_GAME_PAUSE":
				gradle.event('game_pause');
				main.phaserGame.paused = !0, main.phaserGame.sound.mute = !0
		}
	}
};

var AudioManager = function(a) {
	this.game = a
};
AudioManager.prototype = {
	music: [],
	sounds: [],
	actualMusic: null,
	addMusic: function(a, b, c) {
		this.music[a] = this.game.add.audio(a, b, c);
		null == this.actualMusic && (this.actualMusic = a)
	},
	addSound: function(a, b, c) {
		this.sounds[a] = this.game.add.audio(a, b, c)
	},
	playMusic: function(a, b) {
		if (a != this.actualMusic || b) main.storage.data.music && SOUNDS_ENABLED && (this.stopMusic(), this.music[a].play()), this.actualMusic = a;
		try {
			this.game.sound.context.resume()
		} catch (c) {}
	},
	playSound: function(a) {
		main.storage.data.sounds && SOUNDS_ENABLED &&
			this.sounds[a].play();
		try {
			this.game.sound.context.resume()
		} catch (b) {}
	},
	pauseMusic: function() {
		null != this.actualMusic && main.storage.data.music && this.music[this.actualMusic].pause()
	},
	resumeMusic: function() {
		null != this.actualMusic && main.storage.data.music && this.music[this.actualMusic].resume();
		try {
			game.sound.context.resume()
		} catch (a) {}
	},
	stopMusic: function() {
		null != this.actualMusic && this.music[this.actualMusic].stop()
	},
	toggleMusic: function() {
		SOUNDS_ENABLED && (main.storage.data.music = !main.storage.data.music,
			main.storage.data.music && null != this.actualMusic ? this.playMusic(this.actualMusic, !0) : this.stopMusic())
	},
	toggleSounds: function() {
		if (SOUNDS_ENABLED && (main.storage.data.sounds = !main.storage.data.sounds, !main.storage.data.sounds))
			for (var a in this.sounds) this.sounds.hasOwnProperty(a) && this.sounds[a].stop()
	}
};
var Button = function(a, b, c, d, e, g, h) {
	Phaser.Button.call(this, a, b, c, d, function() {
		g(this)
	}, this);
	this.anchor.setTo(.5);
	this.properties = {};
	h ? this.animations.frame = e : this.frameName = e;
	a.add.existing(this)
};
Button.prototype = Object.create(Phaser.Button.prototype);
Button.constructor = Button;
var Languages = function(a) {
	this.game = a
};
Languages.prototype = {
	load: function() {
		for (var a = "en de es fr it pt".split(" "), b = a[0], c = this.game.cache.getText("lang_strings"), c = JSON.parse(c).stringresources.strings.string, d = [], e, g = 0; g < c.length; g++) {
			e = c[g]["-id"];
			null == d[e] && (d[e] = []);
			for (var h = 0; h < a.length; h++) d[e][a[h]] = c[g][a[h]]
		}
		main.managers.language.texts = d;
		this.languages = a;
		this.selectedLanguage = b
	},
	setLanguage: function(a) {
		-1 < this.languages.indexOf(a) && (this.selectedLanguage = a)
	},
	get: function(a) {
		a = main.managers.language.texts[a];
		return void 0 !=
			a ? (a = a[this.selectedLanguage], void 0 == a ? NaN : a) : NaN
	}
};
var Particles = function(a, b, c, d, e) {
	Phaser.Particles.Arcade.Emitter.call(this, a, b, c, e);
	b = [];
	if (-1 == d)
		for (c = 0; 16 > c; c++) b.push(c);
	else
		for (c = 0; 12 > c; c += 4) b.push(d + c);
	this.makeParticles("particles", b);
	this.minParticleSpeed.setTo(-500, -500);
	this.maxParticleSpeed.setTo(500, 500);
	this.explode = function(b) {
		this.start(!1, b, 0, e, !0);
		this.forEachAlive(function(c) {
			a.add.tween(c).to({
				alpha: 0
			}, b, Phaser.Easing.Linear.None, !0)
		})
	};
	this.fire = function(a, b, c) {
		this.start(!1, a, b, c)
	};
	a.add.existing(this);
	return this
};
Particles.prototype = Object.create(Phaser.Particles.Arcade.Emitter.prototype);
Particles.constructor = Particles;
var Utils;
(function(a) {
	var b = function() {
		return function() {}
	}();
	a.ScreenMetrics = b;
	(function(a) {
		a[a.PORTRAIT = 0] = "PORTRAIT";
		a[a.LANDSCAPE = 1] = "LANDSCAPE"
	})(a.Orientation || (a.Orientation = {}));
	var c = function() {
		function a() {}
		a.calculateScreenMetrics = function(a, c, d, f, k) {
			var l = window.innerWidth,
				m = window.innerHeight;
			if (l < m && 1 === d || m < l && 0 === d) var q = l,
				l = m,
				m = q;
			if ("undefined" === typeof f || "undefined" === typeof k) 1 === d ? (f = Math.round(1420 * a / 1280), k = Math.round(960 * c / 800)) : (f = Math.round(960 * a / 800), k = Math.round(1420 * c / 1280));
			var n =
				l / m,
				r = q = 0,
				t = 0,
				p = 0;
			n > (1 === d ? 1.6 : .625) ? (p = c, t = 2 * Math.ceil(p * n / 2), t = Math.min(t, f), q = (t - a) / 2, r = 0) : (t = a, p = 2 * Math.ceil(t / n / 2), p = Math.min(p, k), q = 0, r = (p - c) / 2);
			var n = l / t,
				x = m / p;
			this.screenMetrics = new b;
			this.screenMetrics.windowWidth = l;
			this.screenMetrics.windowHeight = m;
			this.screenMetrics.defaultGameWidth = a;
			this.screenMetrics.defaultGameHeight = c;
			this.screenMetrics.maxGameWidth = f;
			this.screenMetrics.maxGameHeight = k;
			this.screenMetrics.gameWidth = t;
			this.screenMetrics.gameHeight = p;
			this.screenMetrics.scaleX = n;
			this.screenMetrics.scaleY =
				x;
			this.screenMetrics.offsetX = q;
			this.screenMetrics.offsetY = r;
			this.screenMetrics.orientation = d;
			return this.screenMetrics
		};
		return a
	}();
	a.ScreenUtils = c
})(Utils || (Utils = {}));
var StorageManager = function(a) {};
StorageManager.prototype = {
	save: function() {
		try {
			localStorage.setItem(main.storage.name, JSON.stringify(main.storage.data))
		} catch (a) {}
	},
	load: function() {
		try {
			var a = JSON.parse(localStorage.getItem(main.storage.name));
			null != a && (main.storage.data = a)
		} catch (b) {}
	}
};
var Boot = function(a) {};
Boot.prototype = {
	preload: function() {},
	create: function() {
		this._create()
	},
	_create: function() {
		this.input.maxPointers = 1;
		this.stage.disableVisibilityChange = !1;
		this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		this.scale.pageAlignHorizontally = !0;
		this.scale.pageAlignVertically = !1;
		if (!this.game.device.desktop) {
			var a = navigator.userAgent || navigator.vendor || window.opera,
				b = a.match(/iPad/i) || a.match(/iPhone/i) || a.match(/iPod/i),
				c = this;
			window.onresize = function() {
				c.checkOrientation(b)
			};
			this.checkOrientation(b)
		}
		this.game.canvas.oncontextmenu = function(a) {
			a.preventDefault()
		};
		window.addEventListener("touchend", function() {
			try {
				"running" !== main.phaserGame.sound.context.state && main.phaserGame.sound.context.resume()
			} catch (a) {}
		}, !1);
		this.game.state.start("Preloader")
	},
	checkOrientation: function(a) {
		(a ? document.documentElement.clientWidth : window.innerWidth) > (a ? document.documentElement.clientHeight : window.innerHeight) ? (main.phaserGame.paused = !0, document.getElementById("turn").style.display = "block") : (main.phaserGame.paused = !1, document.getElementById("turn").style.display = "none")
	}
};
var Game = function() {};
Game.prototype = {
	create: function() {
		main.game.self = this;
		this.board = new Board(this.game, this);
		btn_pause = new Button(this.game, this.game.world.centerX + gradle.btn_pause.x,  30+gradle.btn_pause.y, "btns_pause", main.storage.data.bg, this.pauseBtnClicked, !0);
		btn_pause.width = gradle.btn_pause.width;
		btn_pause.height = gradle.btn_pause.height;
		btn_pause.properties.gameManager = this;
		
		this.play(main.game.continueGame);
		main.dialog.create(main);
		
		setTimeout(function(){gradle.event('button_play');},150);
	},
	pauseBtnClicked: function() {
		gradle.event('button_pause');
		main.managers.audio.playSound("menu_click");
		main.dialog.show(main, main.dialog.type.yesNo, main.managers.language.get("quit_to_menu_text"), null,
			null,
			function() {
				main.phaserGame.paused = !0;
				main.phaserGame.input.onDown.add(main.game.self.unpause, main.game.self)
			});
		"undefined" !== typeof gdsdk && "undefined" !== gdsdk.showBanner && gdsdk.showBanner()
	},
	unpause: function() {
		var a = main.dialog.btnYes.getBounds().contains(main.phaserGame.input.x, main.phaserGame.input.y),
			b = main.dialog.btnNo.getBounds().contains(main.phaserGame.input.x, main.phaserGame.input.y);
		if (a || b) main.managers.audio.playSound("menu_click"), main.phaserGame.input.onDown.remove(main.game.self.unpause,
			main.game.self), main.phaserGame.paused = !1, a ? main.dialog.hide(main, function() {
			main.game.self.exitToMenu()
		}) : b && main.dialog.hide(main)
	},
	exitToMenu: function() {
		main.game.self.activePlayer.state == main.player.state["throw"] || main.game.self.activePlayer.type == main.player.type.human ? (main.game.self.saveGame(), main.game.self.game.state.start("Menu")) : main.game.self.savePending = !0;
		this.onGameOver(GAME_OVER_BY_USER);
		"undefined" !== typeof gdsdk && "undefined" !== gdsdk.showBanner && gdsdk.showBanner()
	},
	tokenClicked: function(a, b) {
		a === this.activePlayer && b.selectable && (a.setState(main.player.state.wait), a.advanceToken(b))
	},
	turnDelayClk: function() {
		this.activePlayer.state == main.player.state["throw"] ? this.activePlayer.rollDie() : this.performTurn(!1)
	},
	play: function(a) {
		var b, c = main.storage.data;
		main.game.players = [];
		this.scoreTable = [];
		if (a) {
			this.activePlayerID = c.activePlayerID;
			this.numPlayers = c.numPlayers;
			this.gameTimer = c.gameTimer;
			for (var d = 0; d < main.game.maxPlayers; d++)
				if (0 == c.playerPositions[d]) {
					this.board.setup(d);
					break
				}
			for (d =
				0; d < main.game.maxPlayers; d++) {
				a = new Player(this.game, this, this.board, c.playerTypesGame[d], c.playerNamesGame[d], d);
				a.enterGame(c.playerPositions[d]);
				a.setPlace(c.playerPlaces[d], !1);
				a.type != main.player.type.off && (a.dieNumber = c.playerDieNumbers[d], a.die.animations.frame = a.dieNumber - 1); - 1 != a.place && (this.scoreTable[a.place] = a);
				for (var e = 0; e < a.tokens.length; e++) b = a.tokens[e], b.skipTo(c.tokenSquares[d * main.token.count + e], !1), b.passedStart = c.tokensPassedStart[d * main.token.count + e];
				main.game.players.push(a);
				
			}
			for (d =
				0; d < main.game.maxPlayers; d++) main.game.players[d].type != main.player.type.off && main.game.players[d].consolideTokens();
			for (d = 0; d < main.board.HOME_SQUARES[main.board.POSITION_FIRST]; d++) this.board.isSafeSquare(d) && this.board.alignTokens(d)
		} else {
			b = -1;
			for (d = 0; d < main.game.maxPlayers; d++) a = new Player(this.game, this, this.board, c.playerTypesMenu[d], c.playerNamesMenu[d], d), -1 == b && (a.type == main.player.type.human || 0 == main.storage.data.playerTypesCount[main.player.type.human] && a.type == main.player.type.ai) && (this.activePlayerID =
				b = d, this.board.setup(b)), main.game.players.push(a);
			for (d = 0; d < main.game.maxPlayers; d++) main.game.players[b].enterGame(d), ++b == main.game.maxPlayers && (b = 0);
			this.numPlayers = main.game.maxPlayers - main.storage.data.playerTypesCount[main.player.type.off];
			this.gameTimer = 0;
			c.gameSaved = !1;
			main.managers.storage.save()
		}
		this.activePlayer = main.game.players[this.activePlayerID];
		this.activePlayer.setState(main.player.state["throw"]);
		this.activePlayer.blinkStart();
		this.activePlayer.type == main.player.type.ai && this.game.time.events.add(main.game.turnDelay,
			this.turnDelayClk, this);
		main.managers.audio.playSound("game_start")
	},
	saveGame: function() {
		var a, b, c = main.storage.data;
		c.activePlayerID = this.activePlayerID;
		c.numPlayers = this.numPlayers;
		c.gameTimer = this.gameTimer;
		for (var d = 0; d < main.game.players.length; d++) {
			a = main.game.players[d];
			c.playerTypesGame[d] = a.type;
			c.playerNamesGame[d] = a.name;
			c.playerPositions[d] = a.position;
			c.playerPlaces[d] = a.place;
			c.playerDieNumbers[d] = a.dieNumber;
			for (var e = 0; e < a.tokens.length; e++) b = a.tokens[e], c.tokensPassedStart[d * main.token.count +
				e] = b.passedStart, c.tokenSquares[d * main.token.count + e] = b.square
		}
		c.gameSaved = !0;
		main.managers.storage.save();
		main.game.self.savePending = !1
	},
	playerWin: function(a) {
		gradle.event('player_win');
		a.setPlace(this.scoreTable.length, !0);
		this.scoreTable.push(a);
		this.savePending = !1;
		main.managers.audio.playSound("player_win");
		if (this.scoreTable.length == this.numPlayers - 1) {
			for (var b = 0; b < main.game.maxPlayers; b++)
				if (a = main.game.players[b], a.type != main.player.type.off && -1 == a.place) {
					a.setPlace(this.scoreTable.length, !0);
					this.scoreTable.push(a);
					break
				}
			this.gameOver()
		} else 1 == this.scoreTable.length ? this.continuePlaying() : this.turnDone(!0)
	},
	continuePlaying: function() {
		main.dialog.showContinuePlaying(main, function() {
			main.game.self.turnDone(!0)
		}, function() {
			main.storage.data.gameSaved = !1;
			main.managers.storage.save();
			main.game.self.game.state.start("Menu")
		})
	},
	gameOver: function() {
		gradle.event('game_end');
		main.dialog.show(main, main.dialog.type.result, null, function() {
			main.game.self.play(!1)
		}, function() {
			main.storage.data.gameSaved = !1;
			main.managers.storage.save();
			main.game.self.game.state.start("Menu")
		});
		this.onGameOver(GAME_OVER)
	},
	onGameOver: function(a) {
		this.showAdwert()
	},
	showAdwert: function() {},
	turnDone: function(a) {
		if (a)
			for (var b = 0; b < main.game.maxPlayers - 1; b++)
				if (this.activePlayerID++, this.activePlayerID == main.game.maxPlayers && (this.activePlayerID = 0), a = main.game.players[this.activePlayerID], a.type != main.player.type.off && -1 == a.place) {
					this.activePlayer.blinkStop();
					this.activePlayer = a;
					this.activePlayer.blinkStart();
					break
				}
		this.savePending ? (this.saveGame(), this.game.state.start("Menu")) : (this.activePlayer.state =
			main.player.state["throw"], this.activePlayer.type == main.player.type.ai && this.game.time.events.add(main.game.turnDelay, this.turnDelayClk, this))
	},
	performTurn: function(a) {
		if (a) this.activePlayer.state = main.player.state.wait, this.game.time.events.add(main.game.turnDelay, this.turnDelayClk, this);
		else if (this.activePlayer.selectTokens(), a = this.activePlayer.selectableTokens, 0 == a.length) this.turnDone(!0);
		else if (1 == a.length) this.activePlayer.advanceToken(a[0]);
		else if (this.activePlayer.type == main.player.type.human) this.activePlayer.setState(main.player.state.select);
		else {
			for (var b = !0, c = !0, d = !0, e = !1, g = !1, h, f, k, l, m, q = 0, n = 0, r, t = null, p = null, x = null, z = null, w = this.activePlayer.getUnsafeTokens(), u = 0; u < a.length; u++) {
				r = a[u];
				m = this.board.getSquare(r, this.activePlayer.dieNumber);
				l = this.board.isSafeSquare(r.square);
				if (this.board.isSafeSquare(m) && b) m == main.board.FINISH_SQUARES[r.player.position] + main.board.BOARD_FINISH_SIZE - 1 ? (p = r, b = !1) : r.square < main.board.HOME_SQUARES[main.board.POSITION_FIRST] && (!e || !l) && (m = r.getDistanceToFinish(), null == p || m < q || !e && !l) && (q = m, p = r, l || (e = !0));
				else if (this.board.isSafeSquare(m) || !this.board.squareContainsOpponent(m, this.activePlayer) || null != t && l) {
					h = f = !0;
					k = !1;
					for (m = 0; m < main.player.die.sides; m++) this.board.squareContainsOpponent(this.board.getSquare(r, -m - 1), this.activePlayer) && (f = !1), this.board.squareContainsOpponent(this.board.getSquare(r, this.activePlayer.dieNumber - m - 1), this.activePlayer) && (h = !1), this.board.squareContainsOpponent(this.board.getSquare(r, this.activePlayer.dieNumber + m + 1), this.activePlayer) && (k = !0);
					if (!l && !f && (h || c) || h && f &&
						(l && (null == x || this.board.isSafeSquare(x.square)) || !l && c && !g)) h ? l || f || (c = !1) : g = !0, x = r;
					k && (!l && (!f || d) || l && f && (null == z || this.board.isSafeSquare(z.square))) && (f || l || (d = !1), z = r)
				} else t = r;
				r.isAtHome() || n++;
				if (u == a.length - 1 && this.activePlayer.dieNumber == main.player.die.sides && (null == p || 1 >= n)) {
					l = [];
					for (m = 0; m < a.length; m++) r = a[m], r.isAtHome() && l.push(r);
					0 < l.length && (p = l[this.game.rnd.integerInRange(0, l.length - 1)])
				}
			}
			if (null != t) this.activePlayer.advanceToken(t);
			else if (null != p) this.activePlayer.advanceToken(p);
			else if (null != x) this.activePlayer.advanceToken(x);
			else if (null != z) this.activePlayer.advanceToken(z);
			else if (0 < w.length) this.activePlayer.advanceToken(w[this.game.rnd.integerInRange(0, w.length - 1)]);
			else {
				b = null;
				for (u = 0; u < a.length; u++)
					if (r = a[u], m = r.getDistanceToFinish(), null == b || m > q) q = m, b = r;
				this.activePlayer.advanceToken(b)
			}
		}
	}
};
var Intro = function(a) {};
Intro.prototype = {
	preload: function() {
		
	},
	create: function() {
		gradle.event('game_loaded');
		this.game.state.start("Menu")
	},
	update: function() {}
};
var Menu = function(a) {};
Menu.prototype = {
	create: function() {
		gradle.event('page_menu');
		main.menu.self = this;
		main.menu.activeScreen = -1;
		main.menu.panelGroups = [];
		main.menu.btnsBottom = [];
		var a = this.game.add.image(this.game.world.centerX, this.game.world.centerY, "bg_1");
		a.anchor.setTo(.5);
		var b = Math.max(this.game.width - a.width, this.game.height - a.height);
		0 < b && (a.width += b, a.height += b);
		var c = main.menu.panelOffset,
			d = main.sprites.icons_bottom.h + 2 * c,
			e, g = this.game.height - main.menu.panelY,
			h, a = this.game.add.group(),
			b = this.game.add.group();
		main.menu.panelH = g;
		main.menu.group =
			b;
		e = this.game.add.image(this.game.world.centerX, main.menu.panelY / 2, "logo");
		e.anchor.setTo(.5);
		this.game.add.tween(e.scale).to({
			x: 1.025,
			y: 1.025
		}, 500, Phaser.Easing.Linear.None, !0, 0, -1, !0);
		
		for (var f = 0; f < main.menu.btnsBottomCount; f++){
			 h = this.game.add.group();
			 h.add(e), b.add(h), main.menu.panelGroups.push(h);
		}
		var k;
		e = (this.game.width - (2 + main.menu.btnsBottomCount + 1) * c) / main.menu.btnsBottomCount;
		for (f = 0; f < 2; f++){ 
			k = 2 * c + f * (e + c);
			h = this.game.height - d;
			(g = new Button(this.game, k + e / 2, 863, null, 0, this.btnBottomPressed, !0), g.properties.btn = f);
			g.width = 130;
			g.height = 65;
			if(f==1){
				g.width = 1;
				g.height = 1;
			}
			
			main.menu.btnsBottom.push(g);
			if(f==0){
				k = this.game.add.image(35, 830 , "atlas", "sounda.png");
				k.width = 130;
				k.height = 65;
				//k = this.game.add.image(g.x, g.y - c , "icons_bottom", f);
				//k.anchor.setTo(.5);
				a.add(g);a.add(k);
			}
				
			
		}
		e = main.menu.btnW;
		var l = main.menu.btnH,
			g = this.game.width - 6 * c,
			d = this.game.height - d - main.menu.panelY - 4 * c,
			m, q = 3 * c + main.sprites.settings_checkbox.w + 20,
			n = this.game.width - 3 * c - 1.5 * main.sprites.settings_checkbox.w - 20;
		main.dialog.maxTextWidth = g - 2 * c;
		m = (d - 4 * main.sprites.settings_checkbox.h - l) / 5;
		h = this.game.height + 2 * c + m + main.sprites.settings_checkbox.h / 2;
		SOUNDS_ENABLED && (f = this.game.add.text(q, h, main.managers.language.get("music"), {
				font: main.fonts.menuFontSize,
				fill: main.game.colors_strings[0],
				align: "center"
			}), f.anchor.setTo(0, .5), main.menu.panelGroups[0].add(f),
			k = new Button(this.game, n, h, "settings_checkbox", main.storage.data.music ? 1 : 0, this.btnSettingsPressed, !0), k.properties.btn = 0, main.menu.panelGroups[0].add(k), h += m + main.sprites.settings_checkbox.h, f = this.game.add.text(q, h, main.managers.language.get("sounds"), {
				font: main.fonts.menuFontSize,
				fill: main.game.colors_strings[0],
				align: "center"
			}), f.anchor.setTo(0, .5), main.menu.panelGroups[0].add(f), k = new Button(this.game, n, h, "settings_checkbox", main.storage.data.sounds ? 1 : 0, this.btnSettingsPressed, !0), k.properties.btn =
			1, main.menu.panelGroups[0].add(k), h += m + main.sprites.settings_checkbox.h);
		m = main.menu.btnStartH;
		n = (d - (4 * l + m)) / 6;
		q = g -
			5 * e - 3 * n;
		k = 3 * c + n;
		h = this.game.height + 2 * c + n;
		f = -this.game.height + main.menu.panelY;
		main.menu.self.tutorialDialogOffset = h + l + c + f;
		main.menu.self.tutorialBtns = {
			typeX: k + 1.5 * e,
			typeY: h + l / 2 + f,
			nameX: k + 4 * e + q / 2 + n,
			nameY: h + l / 2 + f,
			nameW: q
		};
		for (f = 0; f < main.game.maxPlayers; f++) main.menu.self.createTypeBtn(k + 1.5 * e, h + l / 2, main.storage.data.playerTypesMenu[f], f, main.menu.panelGroups[1], this.btnTypePressed), main.menu.self.createNameBtn(k + 4 * e + q / 2 + n, h + l / 2, q, f, main.storage.data.playerNamesMenu[f], main.menu.panelGroups[1], this.btnNamePressed),
			h += l + n;
		k = new Button(this.game, this.game.world.centerX +100, h + m / 2 + 60, "atlas", 2 < main.storage.data.playerTypesCount[main.player.type.off] && !main.storage.data.gameSaved ? "start2.png" : "start.png", this.btnStartPressed);
		f = this.game.add.text(k.x-20, k.y, main.managers.language.get("start"), {
			font: main.fonts.menuFontSize,
			fill: "#FFFFFF",
			align: "center"
		});
		f.anchor.setTo(-1, 0.5);
		e = this.game.add.image(this.game.world.centerX, h + m / 2, "atlas", "nastartgombik.png");
		e.anchor.setTo(1, .5);
		h = f.width + c + e.width;
		f.x = this.game.world.centerX -
			h / 2;
		e.x = this.game.world.centerX + h / 2;
		k.width = Math.max(k.width, f.width + 7 * c + e.width);
		main.menu.panelGroups[1].add(k);
		main.menu.panelGroups[1].add(f);
		//main.menu.panelGroups[1].add(e);
		this.startBtn = k;
		
		f = this.game.add.text(this.game.world.centerX, 0, main.managers.language.get("quit_text"), {
			font: main.fonts.menuFontSize,
			fill: main.game.colors_strings[3],
			align: "center",
			wordWrap: !0,
			wordWrapWidth: g
		});
		f.anchor.setTo(.5);
		f.y = this.game.height + 2 * c + d / 2 - f.height;
		main.menu.panelGroups[2].add(f);
		h = this.game.height + 2 * c +
			d / 2;
		c = this.game.add.text(0, 0, main.managers.language.get("yes"), {
			font: main.fonts.menuFontSize,
			fill: "#FFFFFF",
			align: "center"
		});
		d = this.game.add.text(0, 0, main.managers.language.get("no"), {
			font: main.fonts.menuFontSize,
			fill: "#FFFFFF",
			align: "center"
		});
		e = Math.max(c.width, d.width);
		k = new Button(this.game, this.game.world.centerX - g / 4, h + c.height, "atlas", "bc2.png", this.btnQuitPressed);
		k.width = e;
		k.properties.quit = !0;
		main.menu.panelGroups[2].add(k);
		main.dialog.addSideButtonParts(main, k, 3, main.menu.panelGroups[2]);
		c.anchor.setTo(.5);
		c.x = k.x;
		c.y = k.y;
		c.bringToTop();
		main.menu.panelGroups[2].add(c);
		k = new Button(this.game, this.game.world.centerX + g / 4, h + c.height, "atlas", "bc2.png", this.btnQuitPressed);
		k.width = e;
		k.properties.quit = !1;
		main.menu.panelGroups[2].add(k);
		main.dialog.addSideButtonParts(main, k, 3, main.menu.panelGroups[2]);
		d.anchor.setTo(.5);
		d.x = k.x;
		d.y = k.y;
		d.bringToTop();
		main.menu.panelGroups[2].add(d);
		b.add(a);
		this.panelUp(main.menu.btnsBottom[1]);
		main.dialog.create(main);
		gradle.log('>> play music...');
		main.managers.audio.playMusic(main.managers.audio.actualMusic, !0);
	},
	btnBottomPressed: function(a) {
		if(-1 != main.menu.activeScreen ){
			main.managers.audio.playSound("menu_click");
			if(gradle_settings){
				main.menu.self.panelDown(main.menu.btnsBottom[1]);
			}
			else{
				gradle.event('page_settings');
				main.menu.self.panelDown(main.menu.btnsBottom[0]);
			}
			gradle_settings = !gradle_settings;
			
		} 
	},
	btnSettingsPressed: function(a) {
		switch (a.properties.btn) {
			case 0:
				main.managers.audio.toggleMusic();
				a.animations.frame = main.storage.data.music ? 1 : 0;
				break;
			case 1:
				main.managers.audio.toggleSounds();
				a.animations.frame = main.storage.data.sounds ? 1 : 0;
				break;
			case 2:
				main.storage.data.bg = 0;
				a.animations.frame = 1;
				a.properties.other.animations.frame = 0;
				break;
			case 3:
				main.storage.data.bg = 1;
				a.animations.frame = 1;
				a.properties.other.animations.frame = 0;
				break;
			case 4:
				main.dialog.show(main, main.dialog.type.ok, main.managers.language.get("instructions_text") + "\n" + main.managers.language.get("controls"));
				break;
			case 5:
				main.dialog.show(main, main.dialog.type.about)
		}
		main.managers.storage.save();
		main.managers.audio.playSound("menu_click")
	},
	btnTypePressed: function(a) {
		var b = main.storage.data.playerTypesMenu,
			c = main.storage.data.playerTypesCount,
			d = a.properties.color,
			e = b[d];
		++b[d] == main.player.type.length && (b[d] = 0);
		c[e]--;
		c[b[d]]++;
		a.properties.setType(b[d]);
		main.menu.self.startBtn.frameName = 2 < c[main.player.type.off] && !main.storage.data.gameSaved ? "start2.png" : "start.png";
		main.managers.storage.save();
		main.managers.audio.playSound("menu_click")
	},
	btnNamePressed: function(a) {
		var b = a.properties.color,
			c = main.storage.data.playerNamesMenu,
			d = main.managers.language.get("enter_name").replace("x", c[b]),
			d = prompt(d, "");
		null != d && "" != d.trim() && (c[b] = d.trim().substring(0, main.player.maxNameLength).toUpperCase(),
			a.properties.text.setText(c[b]), main.managers.storage.save());
		main.managers.audio.playSound("menu_click")
	},
	btnStartPressed: function() {
		if(main.storage.data.gameSaved){
		    main.dialog.show(
                main,
                main.dialog.type.yesNo,
                main.managers.language.get("continue_saved_text"),
                main.menu.self.newGame,
                main.menu.self.continueGame
            );
            main.managers.audio.playSound("menu_click");
		}
		else{
		    main.menu.self.newGame();
		}

	},
	newGame: function() {
	    3 > main.storage.data.playerTypesCount[main.player.type.off] &&
			(main.game.continueGame = !1, main.menu.self.game.state.start("Game"))
	},
	continueGame: function() {
	    main.game.continueGame = !0;
		main.menu.self.game.state.start("Game")
	},
	btnQuitPressed: function(a) {
		gradle.event('button_quit');
		main.managers.audio.playSound("menu_click");
		a.properties.quit ? navigator.app.exitApp() : main.menu.self.btnBottomPressed(main.menu.btnsBottom[1])
	},
	panelDown: function(a) {
		var b = main.menu.self.game,
			c = main.menu.btnsBottom[main.menu.activeScreen],
			d = main.menu.panelGroups[main.menu.activeScreen];
		b.add.tween(c).to({
				y: c.y + main.menu.panelOffset
			},
			main.menu.btnAnimTime, Phaser.Easing.Exponential.Out, !0);
		b.add.tween(d).to({
			y: d.y + main.menu.panelH
		}, main.menu.panelAnimTime, Phaser.Easing.Exponential.Out, !0).onComplete.add(function() {
			main.menu.self.panelUp(a)
		});
		main.menu.activeScreen = -1;
		main.managers.audio.playSound("menu_panel")
	},
	panelUp: function(a) {
		var b = main.menu.panelGroups[a.properties.btn];
		main.menu.self.game.add.tween(a).to({
			y: a.y - main.menu.panelOffset
		}, main.menu.btnAnimTime, Phaser.Easing.Exponential.Out, !0);
		main.phaserGame.add.tween(b).to({
			y: b.y -
				main.menu.panelH
		}, main.menu.panelAnimTime, Phaser.Easing.Exponential.Out, !0).onComplete.add(function() {
			main.menu.activeScreen = a.properties.btn;
			//main.storage.data.tutorialPlayed || 1 != main.menu.activeScreen || main.menu.self.startTutorial(1)
		});
		main.managers.audio.playSound("menu_panel")
	},
	startTutorial: function(a) {
		var b = main.menu.self,
			c = main.menu.self.tutorialBtns;
		1 == a ? main.dialog.show(main, main.dialog.type.ok, main.managers.language.get("tutorial_type"), function() {
				b.startTutorial(2)
			}, null, function() {
				b.tutorialButton =
					b.createTypeBtn(c.typeX, c.typeY, 0, 0);
				var a = main.phaserGame.add.image(c.typeX + 1.5 * main.menu.btnW + main.menu.panelOffset, c.typeY, "atlas", "sipka.png");
				a.anchor.setTo(.5);
				a.x += a.width / 2;
				b.tutorialArrow = a;
				main.phaserGame.add.tween(a).to({
					x: a.x + main.menu.panelOffset
				}, main.menu.tutorialAnimTime, Phaser.Easing.Linear.None, !0, 0, -1, !0);
				var e = 0;
				b.tutorialTimer = main.phaserGame.time.events.loop(2 * main.menu.tutorialAnimTime, function() {
					++e == main.player.type.length && (e = 0);
					b.tutorialButton.setType(e)
				}, this)
			}, main.menu.self.tutorialDialogOffset) :
			main.dialog.show(main, main.dialog.type.ok, main.managers.language.get("tutorial_name"), function() {
				main.phaserGame.time.events.remove(b.tutorialTimer);
				b.tutorialButton.remove();
				b.tutorialArrow.destroy();
				main.storage.data.tutorialPlayed = !0;
				main.managers.storage.save()
			}, null, function() {
				var a = main.storage.data.playerNamesMenu[0];
				main.phaserGame.time.events.remove(b.tutorialTimer);
				b.tutorialButton.remove();
				b.tutorialButton = b.createNameBtn(c.nameX, c.nameY, c.nameW, 0, a);
				main.menu.self.tutorialArrow.x = c.nameX -
					c.nameW / 2 - main.menu.btnW - 2 * main.menu.panelOffset - main.menu.self.tutorialArrow.width / 2;
				main.menu.self.tutorialArrow.angle = 180;
				main.menu.self.tutorialArrow.bringToTop();
				var e = "",
					g = 0;
				b.tutorialTimer = main.phaserGame.time.events.loop(1.5 * main.menu.tutorialAnimTime, function() {
					e.length == a.length ? (e = "", g = 0) : e += a[g++];
					b.tutorialButton.text.setText(e)
				}, this)
			}, main.menu.self.tutorialDialogOffset)
	},
	createTypeBtn: function(a, b, c, d, e, g) {
		var h = c == main.player.type.off ? main.game.maxPlayers : d,
			f = new Button(main.phaserGame,
				a, b, "atlas", main.menu.btnsSprites[h] + "2.png", g ? g : function() {});
		f.anchor.setTo(.5);
		var k = main.dialog.addSideButtonParts(main, f, h, e),
			l = main.phaserGame.add.image(a, b, "icons_menu", c);
		l.anchor.setTo(.5);
		e && (e.add(f), e.add(l));
		f.properties = {
			button: f,
			color: d,
			setType: function(a) {
				var b = a == main.player.type.off ? main.game.maxPlayers : d;
				f.frameName = main.menu.btnsSprites[b] + "2.png";
				k.left.frameName = main.menu.btnsSprites[b] + "1.png";
				k.right.frameName = main.menu.btnsSprites[b] + "3.png";
				l.animations.frame = a
			},
			remove: function() {
				f.destroy();
				k.left.destroy();
				k.right.destroy();
				l.destroy()
			}
		};
		return f.properties
	},
	createNameBtn: function(a, b, c, d, e, g, h) {
		var f = new Button(main.phaserGame, a, b, "atlas", main.menu.btnsSprites[d] + "2.png", h ? h : function() {});
		f.width = c;
		f.anchor.setTo(.5);
		var k = main.dialog.addSideButtonParts(main, f, d, g),
			l = this.game.add.image(a, b - f.height / 2, "atlas", "ciarky.png");
		l.anchor.setTo(.5, 0);
		var m = main.phaserGame.add.text(a, b, e, {
			font: main.fonts.menuFontSize,
			fill: "#FFFFFF",
			align: "center"
		});
		m.anchor.setTo(.5);
		g && (g.add(f), g.add(l),
			g.add(m));
		f.properties = {
			button: f,
			color: d,
			text: m,
			remove: function() {
				f.destroy();
				k.left.destroy();
				k.right.destroy();
				l.destroy();
				m.destroy()
			}
		};
		return f.properties
	}
};
var Preloader = function() {};
Preloader.prototype = {
	preload: function() {
		if(typeof cordova!='undefined') cordova.exec(null, null, "SplashScreen", "show", []);
		main.dialog.runCongratsAnimation = !1;
		this.game.load.text("lang_strings", "texts.json");
		this.game.load.image("overlay", "img/overlay.png");
		this.game.load.image("bg_1", "img/bg_trans.png");
		this.game.load.image("logo", "img/logo.png");
		this.game.load.image("board", "img/plocha.png");
		this.game.load.atlasJSONHash("atlas", "img/atlas.png", "img/atlas.json");
		var a, b;
		for (b in main.sprites) main.sprites.hasOwnProperty(b) && (a = main.sprites[b], this.game.load.spritesheet(b, "img/" + a.path, a.w, a.h));
		for (b in main.audio) main.audio.hasOwnProperty(b) && (a = main.audio[b], this.game.load.audio(b, [a.path + ".ogg", a.path + ".mp3"]));
		this.game.load.onLoadStart.add(this.loadingStarted, this);
		this.game.load.onFileComplete.add(this.loadingFileCompleted, this);
		this.game.load.onLoadComplete.add(this.loadingFinished, this);
		this.game.load.start();
		this.game.device.desktop && this.game.input.mspointer.stop();
		gradle.event('game_preload');
	},
	loadingStarted: function() {
		this.progress = this.game.add.text(this.game.width - 10, 10, "0%", {
			font: main.fonts.preloaderFontSize,
			fill: "#6891DD",
			align: "center"
		});
		this.progress.anchor.setTo(1, 0)
	},
	loadingFileCompleted: function(a, b) {
		this.progress.setText(a + "%");
		
	},
	loadingFinished: function() {
		var a, b;
		for (b in main.audio) main.audio.hasOwnProperty(b) && (a = main.audio[b], "music" == a.type ? main.managers.audio.addMusic(b, a.volume, a.loop) : main.managers.audio.addSound(b, a.volume, a.loop));
		a = navigator.userLanguage || navigator.language;
		main.managers.language.load();
		main.managers.language.setLanguage(a.substring(0, 2));
		
		for (a = 0; a < main.game.maxPlayers; a++) main.storage.data.playerNamesMenu.push(main.managers.language.get("player") +
			" " + (a + 1));
		main.managers.storage.load();
		b = "PLAYER ;SPIELER;JUGADOR;JOUEUR ;GIOCAT.;JOGADOR".split(";");
		var c, d;
		for (a = 0; a < main.game.maxPlayers; a++) c = main.storage.data.playerNamesMenu[a], d = main.storage.data.playerNamesGame[a], -1 < b.indexOf(c.substring(0, 7)) && (main.storage.data.playerNamesMenu[a] = main.managers.language.get("player") + " " + (a + 1)), d && -1 < b.indexOf(d.substring(0, 7)) && (main.storage.data.playerNamesGame[a] = main.managers.language.get("player") + " " + (a + 1));
		this.game.time.events.add(main.game.splashDelay,
			function() {
				this.game.state.start("Intro")
			}, this)
	}
};
var Board = function(a, b) {
	this.game = a;
	this.gameManager = b;
	this.create()
};
Board.prototype = {
	create: function() {
		var a = this.game.add.image(this.game.world.centerX, this.game.world.centerY, "bg_" + (main.storage.data.bg + 1));
		a.anchor.setTo(.5);
		var b = Math.max(this.game.width - a.width, this.game.height - a.height);
		0 < b && (a.width += b, a.height += b);
		b = this.game.add.image(this.game.world.centerX, this.game.world.centerY, "board");
		b.anchor.setTo(.5);
		this.board = b;
		var c = b.width - 2 * main.board.border,
			a = b.x - c / 2,
			b = b.y - c / 2,
			c = c / 15,
			d = main.board.homeW,
			e = [];
		e[0] = e[1] = a + 5 * c / 2 - d / 2;
		e[2] = e[3] = a + 15 * c - 5 * c / 2 - d / 2;
		var g = [];
		g[0] = g[3] = b + 15 * c - 5 * c / 2 - d / 2;
		g[1] = g[2] = b + 5 * c / 2 - d / 2;
		var h = [];
		h[0] = h[1] = d / 3;
		h[2] = h[3] = d / 3 * 2;
		var f = [];
		f[0] = f[3] = d / 3 * 2;
		f[1] = f[2] = d / 3;
		main.board.x = a;
		main.board.y = b;
		main.board.squareSize = c;
		main.board.HOME_XS = e;
		main.board.HOME_YS = g;
		main.board.HOME_SQUARES_XS = h;
		main.board.HOME_SQUARES_YS = f
	},
	setup: function(a) {
		for (var b = this.game.add.graphics(0, 0), c, d, e, g, h = 0; h < main.game.maxPlayers; h++) c = main.board.x + main.board.BG_YS[h] * main.board.squareSize + main.board.BG_OFFSETS[h], d = main.board.y + main.board.BG_XS[h] *
			main.board.squareSize + main.board.BG_OFFSETS[4 + h], e = main.board.BG_WS[h] * main.board.squareSize + main.board.BG_OFFSETS[8 + h], g = main.board.BG_HS[h] * main.board.squareSize + main.board.BG_OFFSETS[12 + h], b.beginFill(main.game.colors[a], 1), b.drawRoundedRect(c, d, e, g, 20), this.game.add.image(main.board.HOME_XS[h], main.board.HOME_YS[h], "atlas", "home.png"), ++a == main.game.maxPlayers && (a = 0);
		b = this.game.add.image(this.game.world.centerX, this.game.world.centerY, "atlas", "stred.png");
		b.anchor.setTo(.5);
		b.angle = [90, 0, 270,
			180
		][a];
		this.board.bringToTop()
	},
	squareContainsOpponent: function(a, b) {
		for (var c, d = 0; d < main.game.maxPlayers; d++)
			if (c = main.game.players[d], c !== b && c.hasTokenOnSquare(a)) return !0;
		return !1
	},
	isSafeSquare: function(a) {
		if (a >= main.board.HOME_SQUARES[main.board.POSITION_FIRST]) return !0;
		for (var b = 0; b < main.board.START_SQUARES.length; b++)
			if (a == main.board.START_SQUARES[b]) return !0;
		for (b = 0; b < main.board.SAFE_SQUARES.length; b++)
			if (a == main.board.SAFE_SQUARES[b]) return !0;
		return !1
	},
	isHome: function(a) {
		return a >= main.board.HOME_SQUARES[main.board.POSITION_FIRST] &&
			a < main.board.HOME_SQUARES[main.board.POSITION_FOURTH] + main.token.count
	},
	isFinish: function(a) {
		for (var b = 0; b < main.board.FINISH_SQUARES.length; b++)
			if (a == main.board.FINISH_SQUARES[b] + main.board.BOARD_FINISH_SIZE - 1) return !0;
		return !1
	},
	getSquare: function(a, b) {
		var c = a.player.position,
			d = a.square + b;
		return 0 <= b ? a.isAtHome() ? main.board.START_SQUARES[c] : !a.passedStart || d <= main.board.END_SQUARES[c] ? d >= main.board.HOME_SQUARES[main.board.POSITION_FIRST] ? d - main.board.HOME_SQUARES[main.board.POSITION_FIRST] : d : a.square <
			main.board.FINISH_SQUARES[c] ? main.board.FINISH_SQUARES[c] + b - (main.board.END_SQUARES[c] - a.square) - 1 : d : 0 > d ? d + main.board.HOME_SQUARES[main.board.POSITION_FIRST] : d
	},
	getSquareCenterX: function(a) {
		var b = main.board.BOARD_YS[a],
			c = main.board.squareSize / 2;
		this.isSquareHorizontal(a) && (c = b == main.board.BOARD_PATH_NEAR ? 0 : main.board.squareSize);
		if (this.isHome(a))
			for (c = 0; c < main.board.HOME_SQUARES.length; c++) {
				if (b = main.board.HOME_SQUARES[c] + main.token.count, a < b) return main.board.HOME_XS[c] + main.board.HOME_SQUARES_XS[main.token.count -
					(b - a)]
			} else return main.board.x + b * main.board.squareSize + c;
		return 0
	},
	getSquareCenterY: function(a) {
		var b = main.board.BOARD_XS[a],
			c = main.board.squareSize / 2;
		this.isSquareVertical(a) && (c = b == main.board.BOARD_PATH_NEAR ? 0 : main.board.squareSize);
		if (this.isHome(a))
			for (c = 0; c < main.board.HOME_SQUARES.length; c++) {
				if (b = main.board.HOME_SQUARES[c] + main.token.count, a < b) return main.board.HOME_YS[c] + main.board.HOME_SQUARES_YS[main.token.count - (b - a)]
			} else return main.board.y + b * main.board.squareSize + c;
		return 0
	},
	isSquareHorizontal: function(a) {
		for (var b =
				0; b < main.board.BOARD_HORIZONTALS.length; b++)
			if (main.board.BOARD_HORIZONTALS[b] == a) return !0;
		return !1
	},
	isSquareVertical: function(a) {
		for (var b = 0; b < main.board.BOARD_VERTICALS.length; b++)
			if (main.board.BOARD_VERTICALS[b] == a) return !0;
		return !1
	},
	commitToken: function(a) {
		var b = a.player;
		
		if (this.isFinish(a.square)) {
			for (var c = !0, d = b.tokens, e = 0; e < d.length; e++)
				if (d[e].square != a.square) {
					c = !1;
					break
				}
			c ? this.gameManager.playerWin(b) : this.gameManager.turnDone(!1);
			main.managers.audio.playSound("enter_finish");
			for (e = 0; e <
				b.tokens.length; e++)
				if (a = b.tokens[e], this.isFinish(a.square) && a.img.visible) {
					a.particles.explode(750);
					break
				}
		} else if (a.isAtHome()) this.gameManager.turnDone(!1);
		else {
			c = [];
			if (!this.isSafeSquare(a.square))
				for (var g, e = 0; e < main.game.maxPlayers; e++)
					if (g = main.game.players[e], g !== b && g.hasTokenOnSquare(a.square)) {
						d = g.tokens;
						for (e = 0; e < d.length; e++) d[e].square == a.square && c.push(d[e]);
						g.kickTokens(c, a);
						break
					}
			0 == c.length && (this.alignTokens(a.square), this.gameManager.turnDone(b.dieNumber != main.player.die.sides))
		}
	},
	alignTokens: function(a) {
		if (a < main.board.HOME_SQUARES[main.board.POSITION_FIRST] && this.isSafeSquare(a)) {
			for (var b, c = 0, d = 1, e, g, h = 0; h < main.game.maxPlayers; h++) b = main.game.players[h], b.hasTokenOnSquare(a) && c++;
			for (h = 0; h < main.game.maxPlayers; h++) {
				b = main.game.players[h];
				g = b.tokens;
				b = !1;
				for (var f = 0; f < g.length; f++)
					if (e = g[f], e.square == a) {
						var k = main.token.scales[c - 1];
						e.isAligned = 1 < c;
						e.tweenTo(e.getTargetPosition(a, d, c, !0, k), !1);
						b = !0;
						main.phaserGame.add.tween(e.img.scale).to({
							x: k,
							y: k
						}, e.moveDelay, Phaser.Easing.Quadratic.InOut, !0)
					}
				b && d++
			}
		}
	}
};
var Player = function(a, b, c, d, e, g) {
	this.game = a;
	this.gameManager = b;
	this.board = c;
	this.tokensToKick = [];
	this.type = d;
	this.color = g;
	this.name = e;
	this.tokens = []; 
	this.selectableTokens = [];
	this.minDieValue = 1;
	this.type != main.player.type.off && (this.dieBg = this.game.add.image(0, 0, "die_bg"), this.dieBg.anchor.setTo(.5), this.underDie = this.game.add.image(0, 0, "atlas", "podkocku.png"), this.underDie.anchor.setTo(.5), this.type == main.player.type.human ? (this.die = new Button(this.game, 0, 0, "die", 0, this.dieClicked, !0), this.die.properties.player =
		this) : this.type == main.player.type.ai && (this.die = this.game.add.image(0, 0, "die"), this.die.anchor.setTo(.5)), this.nameLabel = this.game.add.text(0, 0, this.name, {
		font: main.fonts.playerFontSize,
		fill: "#FFFFFF",
		align: "center"
	}), this.nameLabel.anchor.setTo(.5), 
	this.dieAnim = this.game.add.image(0, 0, "die_anim"), 
	this.dieAnim.anchor.setTo(.5), 
	this.dieAnim.visible = !1, 
	this.dieTimer = this.game.time.create(!1), 
	this.blinkTimer = this.game.time.create(!1), 
	this.setDieNumber())
};
Player.prototype = {
	dieClicked: function(a) {
		var b = a.properties.player;
		b.type == main.player.type.human && b.state == main.player.state["throw"] && b === b.gameManager.activePlayer && a.properties.player.rollDie();
		"undefined" !== typeof gdsdk && "undefined" !== gdsdk.showBanner && gdsdk.showBanner()
	},
	rollDie: function() {
		this.state = main.player.state.wait;
		this.die.visible = !1;
		this.dieAnim.visible = !0;
		this.dieTimer.loop(main.player.die.rollDelay, this.dieRolled, this);
		this.dieTimer.start();
		main.managers.audio.playSound("die_throw")
	},
	dieRolled: function() {
		this.dieAnim.animations.frame == this.dieAnim.animations.frameTotal - 1 || this.gameManager.savePending ? (this.dieAnim.animations.frame = 0, this.dieAnim.visible = !1, this.die.visible = !0, this.setDieNumber(), this.dieTimer.stop(), this.gameManager.performTurn(this.type != main.player.type.human && !this.gameManager.savePending)) : this.dieAnim.animations.frame++
	},
	blinkStart: function() {
		this.blinkTimer.loop(main.player.blinkDelay, this.blinkClk, this);
		this.blinkTimer.start()
	},
	blinkStop: function() {
		this.blinkTimer.stop();
		this.dieBg.animations.frame = this.color
	},
	blinkClk: function() {
		this.dieBg.animations.frame = this.dieBg.animations.frame == this.color ? this.color + 4 : this.color
	},
	setDieNumber: function() {
		this.dieNumber = this.game.rnd.integerInRange(this.minDieValue, main.player.die.sides);
		this.die.animations.frame = this.dieNumber - 1;
		!this.enteredGame && this.minDieValue < main.player.die.sides && this.minDieValue++
	},
	setState: function(a) {
		this.state = a;
		if (a == main.player.state.select)
			for (a = 0; a < this.selectableTokens.length; a++) this.selectableTokens[a].startBlinking(this.selectableTokens[a])
	},
	setPlace: function(a, b) {
		this.place = a;
		if (-1 < a && 2 > a) {
			this.die.visible = !1;
			this.underDie.visible = !1;
			var c = this,
				d = main.phaserGame.add.image(this.die.x, this.die.y, "trophy_ingame", a);
			d.anchor.setTo(.5);
			b && (d.scale.setTo(2), main.phaserGame.add.tween(d.scale).to({
				x: 1,
				y: 1
			}, 500, Phaser.Easing.Exponential.In, !0).onComplete.add(function() {
				(new Particles(main.phaserGame, c.die.x, c.die.y, -1, 50)).explode(750)
			}))
		}
	},
	enterGame: function(a) {
		this.position = a;
		this.state = main.player.state.wait;
		this.place = -1;
		for (var b = this.tokensInFinish =
				0; b < main.token.count; b++) a = new Token(this.game, this.gameManager, this, this.board), a.skipTo(main.board.HOME_SQUARES[this.position] + b, !1), this.tokens.push(a);
		this.type != main.player.type.off && this.setDiePosition()
	},
	selectTokens: function() {
		for (var a, b, c = 0; c < this.tokens.length; c++)
			if (b = this.tokens[c], b.canAdvance(this.dieNumber)) {
				a = !1;
				for (var d = 0; d < this.selectableTokens.length; d++) b.square == this.selectableTokens[d].square && (a = !0);
				a || (b.selectable = !0, this.selectableTokens.push(b))
			}
	},
	deselectTokens: function() {
		for (var a =
				0; a < this.selectableTokens.length; a++) this.selectableTokens[a].selectable = !1;
		this.selectableTokens = []
	},
	getUnsafeTokens: function() {
		for (var a, b = [], c = 0; c < this.selectableTokens.length; c++) a = this.selectableTokens[c], this.board.isSafeSquare(a.square) || b.push(a);
		return b
	},
	advanceToken: function(a) {
		this.deselectTokens();
		if (a.isAtHome()) this.gameManager.savePending ? a.skipTo(main.board.START_SQUARES[this.position], !0) : a.moveTo(main.board.START_SQUARES[this.position]);
		else if (this.gameManager.savePending) a.skipTo(this.board.getSquare(a,
			this.dieNumber), !0);
		else {
			var b = a.square;
			a.advance(this.dieNumber);
			this.board.alignTokens(b);
			this.consolideTokens()
		}
		this.enteredGame || (this.enteredGame = !0, this.minDieValue = 1)
	},
	kickTokens: function(a, b) {
		this.tokensToKick = a;
		this.tokenToKickIndex = a.length;
		this.kickingToken = b;
		this.resetToken(b)
	},
	moveDone: function(a) {
		0 < this.tokenToKickIndex ? this.resetToken(this.kickingToken) : (this.consolideTokens(), this.board.commitToken(a))
	},
	hasTokenOnSquare: function(a) {
		for (var b = 0; b < this.tokens.length; b++)
			if (this.tokens[b].square ==
				a) return !0;
		return !1
	},
	consolideTokens: function() {
		for (var a, b, c, d = [], e = 0; e < this.tokens.length; e++) {
			b = this.tokens[e];
			a = !0;
			if (b.moving) b.isAligned = !1;
			else
				for (var g = 0; g < d.length; g++) c = d[g], c.moving || b.square != c.square || (b.setVisible(!1), c.setSameSquareCount(c.sameSquareCount + 1), a = !1);
			a && (d.push(b), b.setVisible(!0), b.setSameSquareCount(1))
		}
	},
	alignTokensInFinish: function() {},
	setDiePosition: function() {
		var a = this.board.board.width / 2,
			b = this.board.board.x - a + this.dieBg.width / 2,
			a = (this.board.board.y - a) / 2;
		switch (this.position) {
			case main.board.POSITION_FIRST:
				this.dieBg.x =
					b;
				this.dieBg.y = this.game.height - a;
				break;
			case main.board.POSITION_SECOND:
				this.dieBg.x = b;
				this.dieBg.y = a;
				break;
			case main.board.POSITION_THIRD:
				this.dieBg.x = this.game.width - b;
				this.dieBg.y = a;
				break;
			case main.board.POSITION_FOURTH:
				this.dieBg.x = this.game.width - b, this.dieBg.y = this.game.height - a
		}
		b = (this.dieBg.height - 2 * main.board.dieBgBorder - (this.nameLabel.height + this.die.height)) / 3;
		this.dieBg.animations.frame = this.color;
		this.nameLabel.x = this.dieBg.x;
		this.nameLabel.y = this.dieBg.y - this.dieBg.height / 2 + main.board.dieBgBorder +
			b + this.nameLabel.height / 2;
		this.underDie.x = this.dieBg.x;
		this.underDie.y = this.nameLabel.y + this.nameLabel.height / 2 + b + this.die.height / 2;
		this.die.x = this.dieBg.x;
		this.die.y = this.nameLabel.y + this.nameLabel.height / 2 + b + this.die.height / 2;
		this.dieAnim.x = this.dieBg.x;
		this.dieAnim.y = this.die.y
	},
	resetToken: function(a) {
		for (var b, c = 0, d = [], e = 0; e < this.tokens.length; e++) {
			c = main.board.HOME_SQUARES[this.position] + e;
			b = !0;
			for (var g = 0; g < this.tokens.length; g++)
				if (this.tokens[g].square == c) {
					b = !1;
					break
				}
			b && d.push(c)
		}
		var h = this.tokensToKick[--this.tokenToKickIndex];
		if (this.gameManager.savePending) h.skipTo(d[this.game.rnd.integerInRange(0, d.length - 1)], !0);
		else {
			var f = this;
			main.dialog.visible || a.img.bringToTop();
			f.game.add.tween(a.img.scale).to({
				x: 1.5,
				y: 1.5
			}, 300, Phaser.Easing.Exponential.Out, !0, 200, 0, !0);
			var k = f.game.add.tween(a.img).to({
				y: a.img.y - main.token.jumpHeight
			}, 150, Phaser.Easing.Exponential.Out, !0, 200);
			k.onComplete.add(function() {
				k = f.game.add.tween(a.img).to({
					y: a.img.y + main.token.jumpHeight
				}, 150, Phaser.Easing.Exponential.In, !0);
				k.onComplete.add(function() {
					main.managers.audio.playSound("kick");
					a.particles.explode(750);
					h.moveTo(d[f.game.rnd.integerInRange(0, d.length - 1)]);
					f.consolideTokens()
				})
			})
		}
	}
};
var Token = function(a, b, c, d) {
	this.game = a;
	this.gameManager = b;
	this.player = c;
	this.board = d;
	this.passedStart = !1;
	this.player.type == main.player.type.human ? (b = new Button(this.game, 0, 0, "tokens", this.player.color, this.tokenClicked, !0), b.properties.player = this.player, b.properties.token = this, b.properties.gameManager = this.gameManager) : (b = this.game.add.image(0, 0, "tokens", this.player.color), b.anchor.setTo(.5));
	this.countText = a.add.text(0, 0, "", {
		font: main.fonts.tokenFontSize,
		fill: 1 == c.color ? "#000000" : "#FFFFFF",
		align: "center"
	});
	this.countText.anchor.setTo(.5);
	b.addChild(this.countText);
	this.w = b.width;
	this.h = b.height;
	this.img = b;
	a = new Particles(this.game, 0, 0, c.color, 50);
	b.addChild(a);
	this.particles = a;
	this.setSameSquareCount(1);
	this.player.type == main.player.type.off && this.setVisible(!1)
};
Token.prototype = {
	setSameSquareCount: function(a) {
		this.sameSquareCount = a;
		1 < a ? (this.countText.setText(a), this.countText.visible = !0) : this.countText.visible = !1
	},
	tokenClicked: function(a) {
		a.properties.gameManager.tokenClicked(a.properties.player, a.properties.token)
	},
	setPosition: function(a) {
		this.img.x = a.x;
		this.img.y = a.y
	},
	setVisible: function(a) {
		this.img.visible = a
	},
	skipTo: function(a, b) {
		this.setPosition(this.getTargetPosition(a, 1, 1, !1));
		b ? (this.setSquare(a), this.player.moveDone(this)) : this.square = a
	},
	tweenTo: function(a,
		b) {
		main.dialog.visible || this.img.bringToTop();
		if (b) {
			var c = this,
				d = (a.x + this.img.x) / 2,
				e = (a.y > this.img.y ? this.img.y : a.y) - this.img.height / 2,
				g = this.game.add.tween(this.img.scale).to({
					x: [1.25, 1],
					y: [1.25, 1]
				}, this.moveDelay);
			g.interpolation(function(a, b) {
				return Phaser.Math.bezierInterpolation(a, b)
			});
			g.start();
			g = this.game.add.tween(this.img).to({
				x: [d, a.x],
				y: [e, a.y]
			}, this.moveDelay);
			g.interpolation(function(a, b) {
				return Phaser.Math.bezierInterpolation(a, b)
			});
			g.onComplete.add(function() {
				c.moveDone();
				main.managers.audio.playSound("token_move_1")
			});
			g.start()
		} else g = this.game.add.tween(this.img).to({
			x: a.x,
			y: a.y
		}, this.moveDelay, Phaser.Easing.Quadratic.InOut, !0)
	},
	moveTo: function(a) {
		this.advanceCount = 0;
		this.moveDelay = this.isAtHome() || this.board.isHome(a) ? main.token.moveDelayLong : main.token.moveDelay;
		this.moving = !0;
		this.tweenTo(this.getTargetPosition(a, 1, 1, !1), !0);
		this.setSquare(a)
	},
	advance: function(a) {
		this.advanceCount = a;
		this.moveDelay = main.token.moveDelay;
		this.moving = !0;
		this.moveByOne()
	},
	moveByOne: function() {
		var a = this.board.getSquare(this, 1);
		this.advanceCount--;
		this.tweenTo(this.getTargetPosition(a, 1, 1, !1), !0);
		this.setSquare(a)
	},
	moveDone: function() {
		0 < this.advanceCount ? this.moveByOne() : (this.moving = !1, this.player.moveDone(this))
	},
	setSquare: function(a) {
		if (this.player.position == main.board.POSITION_FIRST || !this.isAtHome() && a < this.square) this.passedStart = !0;
		this.square = a;
		this.isAtHome() && (this.passedStart = !1)
	},
	canAdvance: function(a) {
		return this.isAtHome() ? a == main.player.die.sides : !this.passedStart || this.board.getSquare(this, a) < main.board.FINISH_SQUARES[this.player.position] +
			main.board.BOARD_FINISH_SIZE
	},
	isAtHome: function() {
		return this.board.isHome(this.square)
	},
	getDistanceToFinish: function() {
		var a = main.board.END_SQUARES[this.player.position] - (this.isAtHome() ? main.board.START_SQUARES[this.player.position] : this.square);
		0 > a && (a += main.board.HOME_SQUARES[main.board.POSITION_FIRST]);
		return a
	},
	getTargetPosition: function(a, b, c, d, e) {
		void 0 == e && (e = this.img.scale.x);
		var g = this.player.tokens;
		if (0 == this.advanceCount && !d)
			for (var h = 0; h < g.length; h++)
				if (d = g[h], d.square == a) return {
					x: d.img.x,
					y: d.img.y
				};
		g = this.board.isSquareHorizontal(a);
		h = d = 0;
		d = this.w * e;
		e *= this.w;
		g ? (e = this.board.getSquareCenterX(a), a = this.board.getSquareCenterY(a)) : (d = e, e = this.board.getSquareCenterY(a), a = this.board.getSquareCenterX(a));
		1 == c || 2 == b && 3 == c ? d = e : 1 == b && 3 <= c ? d = e - main.board.squareSize + d / 2 : 2 == c ? d = e + (1 == b ? -1 : 1) * main.board.squareSize / 2 : b == c ? d = e + main.board.squareSize - d / 2 : (c = d / 2.5, d = e + (2 == b ? -c : c));
		h = a;
		return g ? {
			x: d,
			y: h
		} : {
			x: h,
			y: d
		}
	},
	startBlinking: function(a) {
		var b = a.img.scale.x;
		main.phaserGame.add.tween(a.img.scale).to({
			x: b +
				.12,
			y: b + .12
		}, 250, Phaser.Easing.Exponential.Out, !0, 0, 0, !0).onComplete.add(function() {
			a.selectable && a.startBlinking(a)
		})
	}
};first_start();
