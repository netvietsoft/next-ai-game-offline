var dev_str = '';
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
			let b_start = draw_button(360, 800, 'start', this);
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
		//load all game assets
		this.load.image('back', 'img/back.png');
		this.load.image('header', 'img/header.png');
		this.load.image('footer', 'img/footer.png');
		this.load.image('popup', 'img/popup.png');
		this.load.image('progress', 'img/progress.png');
		this.load.image('best_bar_large', 'img/best_bar_large.png');
		this.load.image('btn_pause', 'img/btn_pause.png');
		this.load.image('btn_resume', 'img/btn_resume.png');
		this.load.image('btn_restart', 'img/btn_restart.png');
		this.load.image('btn_menu', 'img/btn_menu.png');
		this.load.image('btn_sound_on', 'img/btn_sound_on.png');
		this.load.image('btn_sound_off', 'img/btn_sound_off.png');
		this.load.image('paused', 'img/paused.png');
		this.load.image('gameover', 'img/gameover.png');
		this.load.image('score_bar', 'img/score_bar.png');
		this.load.image('best_bar', 'img/best_bar.png');
		this.load.spritesheet('tiles', 'img/tiles.png', {frameWidth: 128, frameHeight: 130});
		//Load all audio
		this.load.audio('click', 'audio/click.mp3');
		this.load.audio('completed', 'audio/completed.mp3');
		this.load.audio('gameover', 'audio/gameover.mp3');
		this.load.audio('match', 'audio/match.mp3');
		this.load.audio('flip', 'audio/flip.mp3');
		
	}
	
}