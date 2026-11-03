class Load extends Phaser.Scene {
	constructor(){
		super('load');
	}
	preload(){this.add.sprite(360,540,'bg_menu');
		this.add.sprite(360,315,'game_title');
		let bar = this.add.rectangle(config.width/2, 600, 600, 20);
		bar.setStrokeStyle(4, 0xffffff);
		bar.alpha = 0.7;
		let progress = this.add.rectangle(config.width/2, 600, 590, 10, 0xffffff);
		progress.alpha = 0.8;
		this.load.on('progress', (value)=>{
			progress.width = 590*value;
		});
		this.load.on('complete', ()=>{
			bar.destroy();
			progress.destroy();
			let b_start = draw_button(360, 700, 'start', this);
			this.tweens.add({
				targets: b_start,
				alpha: 0.5,
				yoyo: true,
				duration: 300,
				loop: -1,
			});
		}, this);
		this.input.on('gameobjectdown', ()=>{
			this.scene.start('menu');
		}, this);
		//
		//load all game assets
		this.load.image('bg_game', 'img/bg_game.png');
		this.load.image('header', 'img/header.png');
		this.load.image('piece1', 'img/piece1.png');
		this.load.image('piece2', 'img/piece2.png');
		this.load.image('tile1', 'img/tile1.png');
		this.load.image('tile2', 'img/tile2.png');
		this.load.image('hint', 'img/hint.png');
		this.load.image('star', 'img/star.png');
		this.load.image('board', 'img/board.png');
		this.load.image('alert', 'img/alert.png');
		this.load.image('window_red', 'img/window_red.png');
		this.load.image('window_green', 'img/window_green.png');
		this.load.image('trophy', 'img/trophy.png');
		this.load.image('btn_sound_on', 'img/btn_sound_on.png');
		this.load.image('btn_sound_off', 'img/btn_sound_off.png');
		this.load.image('btn_home', 'img/btn_home.png');
		this.load.image('btn_restart', 'img/btn_restart.png');
		this.load.image('btn_restart2', 'img/btn_restart2.png');
		this.load.image('btn_single', 'img/btn_single.png');
		this.load.image('btn_multi', 'img/btn_multi.png');
		this.load.spritesheet('turn_frame', 'img/turn_frame.png', {frameWidth: 250, frameHeight: 100});
		this.load.spritesheet('pieces', 'img/pieces.png', {frameWidth: 75, frameHeight: 75});
		//Load audio
		this.load.audio('click', 'audio/click.mp3');
		this.load.audio('win', 'audio/win.mp3');
		this.load.audio('lose', 'audio/lose.mp3');
		this.load.audio('flip1', 'audio/flip1.mp3');
		this.load.audio('flip2', 'audio/flip2.mp3');
		this.load.audio('alert', 'audio/alert.mp3');
	}
	create(){
		//this.scene.start('menu');
	}
}