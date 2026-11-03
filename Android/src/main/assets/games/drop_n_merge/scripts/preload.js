var dev_str = '';
class Load extends Phaser.Scene {
	constructor(){
		super('load');
	}
	preload(){
		this.add.sprite(config.width/2, config.height/2, 'bg_menu');
		this.add.sprite(360, 392, 'game_title');
		this.add.text(360, 1200, dev_str, {fontFamily: 'vanilla', fontSize: 18, align: 'center',color: '#FFFFFF'}).setOrigin(0.5);
		let bar = this.add.rectangle(config.width/2, 900, 600, 20);
		bar.setStrokeStyle(4, 0xffffff);
		bar.alpha = 0.7;
		let progress = this.add.rectangle(config.width/2, 900, 590, 10, 0xffffff);
		progress.alpha = 0.8;
		this.load.on('progress', (value)=>{
			progress.width = 590*value;
		});
		this.load.on('complete', ()=>{
			bar.destroy();
			progress.destroy();
			let b_start = draw_button(360, 900, 'start', this);
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
		this.load.image('bg_game', 'img/bg_game.webp');
		this.load.image('board', 'img/board.webp');
		this.load.image('board_top', 'img/board_top.webp');
		this.load.image('next_tile_bar', 'img/next_tile_bar.webp');
		this.load.image('score_bar', 'img/score_bar.webp');
		this.load.image('best_bar', 'img/best_bar.webp');
		this.load.image('best_bar_large', 'img/best_bar_large.webp');
		this.load.image('blend', 'img/blend.webp');
		this.load.image('hand', 'img/hand.webp');
		this.load.image('popup_gameover', 'img/popup_gameover.webp');
		this.load.image('popup_pause', 'img/popup_pause.webp');
		this.load.image('txt_pause', 'img/txt_pause.webp');
		this.load.image('txt_gameover', 'img/txt_gameover.webp');
		this.load.image('btn_sound_on', 'img/btn_sound_on.webp');
		this.load.image('btn_sound_off', 'img/btn_sound_off.webp');
		this.load.image('btn_menu', 'img/btn_menu.webp');
		this.load.image('btn_resume', 'img/btn_resume.webp');
		this.load.image('btn_restart', 'img/btn_restart.webp');
		this.load.image('btn_pause', 'img/btn_pause.webp');
		this.load.image('btn_play', 'img/btn_play.webp');
		this.load.image('btn_back', 'img/btn_back.webp');
		this.load.image('btn_close', 'img/btn_close.webp');
		this.load.spritesheet('tiles', 'img/tiles.webp', {frameWidth: 124, frameHeight: 124});
		//Load all audio
		this.load.audio('click', 'audio/click.ogg');
		this.load.audio('gameover', 'audio/gameover.ogg');
		this.load.audio('drop', 'audio/drop.ogg');
		this.load.audio('combine', 'audio/combine.ogg');
//		this.load.audio('dragend', 'audio/dragend.ogg');
	}
	create(){
		//this.scene.start('game');
	}
}