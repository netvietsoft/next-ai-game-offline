var dev_str = 'D\eve\lop\ed b\y G\imCr\aft\.co\m';
class Load extends Phaser.Scene {
	constructor(){
		super('load');
	}
	preload(){
		this.add.sprite(config.width/2, config.height/2, 'background');
		this.add.sprite(360, 250, 'game_title');
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
			this.scene.start('menu');
		}, this);
		//load all game assets
		this.load.image('board','img/board.png');
		this.load.image('bar_score','img/bar_score.png');
		this.load.image('bar_scoregameover','img/bar_scoregameover.png');
		this.load.image('bar_highscore','img/bar_highscore.png');
		this.load.image('bar_highscoremenu','img/bar_highscoremenu.png');
		this.load.image('popup_gameover','img/popup_gameover.png');
		this.load.image('popup_pause','img/popup_pause.png');
		this.load.image('header','img/header.png');
		this.load.image('btn_sound_off','img/btn_sound_off.png');
		this.load.image('btn_sound_on','img/btn_sound_on.png');
		this.load.image('btn_pause','img/btn_pause.png');
		this.load.image('btn_menu','img/btn_menu.png');
		this.load.image('btn_play','img/btn_play.png');
		this.load.image('btn_restart','img/btn_restart.png');
		this.load.image('btn_resume','img/btn_resume.png');
		this.load.image('btn_mode','img/btn_mode.png');
		this.load.image('txt_gameover','img/txt_gameover.png');
		this.load.image('txt_pause','img/txt_pause.png');
		this.load.spritesheet('tile','img/tile.png', {frameWidth: 64, frameHeight: 64});
		this.load.spritesheet('jewels','img/jewels.png', {frameWidth: 80, frameHeight: 80});
		//Load all audio
		this.load.audio('click', 'audio/click.mp3');
		this.load.audio('gameover', 'audio/gameover.mp3');
		this.load.audio('placed', 'audio/placed.mp3');
		this.load.audio('miss', 'audio/miss.mp3');
		this.load.audio('bonus', 'audio/bonus.mp3');
		this.load.audio('clear', 'audio/clear.mp3');
		this.load.audio('spawn1', 'audio/spawn1.mp3');
		this.load.audio('spawn2', 'audio/spawn2.mp3');
		this.load.audio('spawn3', 'audio/spawn3.mp3');
	}
}