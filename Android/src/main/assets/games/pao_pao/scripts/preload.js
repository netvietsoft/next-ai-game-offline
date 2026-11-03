class Load extends Phaser.Scene {
	constructor(){
		super('load');
	}
	preload(){
		this.add.sprite(360,540,'background');
		this.add.sprite(360,320,'game_title');
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
		this.load.image('btn_shuffle_big', 'img/btn_shuffle_big.webp');
		this.load.image('btn_continue_rewarded', 'img/btn_continue_rewarded.webp');
		this.load.image('btn_end_game', 'img/btn_end_game.webp');
		this.load.image('btn_play_video', 'img/btn_play_video.webp');
		this.load.image('shadow', 'img/shadow.webp');
		this.load.image('sign', 'img/sign.webp');
		this.load.image('header', 'img/header.webp');
		this.load.image('footer', 'img/footer.webp');
		this.load.image('btn_home', 'img/btn_home.webp');
		this.load.image('btn_shuffle', 'img/btn_shuffle.webp');
		this.load.image('btn_hint', 'img/btn_hint.webp');
		this.load.image('btn_play', 'img/btn_play.webp');
		this.load.image('btn_next', 'img/btn_next.webp');
		this.load.image('btn_new', 'img/btn_new.webp');
		this.load.image('btn_sound_on', 'img/btn_sound_on.webp');
		this.load.image('btn_sound_off', 'img/btn_sound_off.webp');
		this.load.image('btn_restart', 'img/btn_restart.webp');
		this.load.image('btn_menu', 'img/btn_menu.webp');
		this.load.image('btn_start', 'img/btn_start.webp');
		this.load.image('circle', 'img/circle.webp');
		this.load.image('arrow', 'img/arrow.webp');
		this.load.image('shuffle_icon', 'img/shuffle_icon.webp');
		this.load.image('hint_icon', 'img/hint_icon.webp');
		this.load.image('score_bar', 'img/score_bar.webp');
		this.load.spritesheet('lines', 'img/lines.webp', {frameWidth: 90, frameHeight: 90});
		for(let i=1; i<=22; i++){
			this.load.image('obj'+i, 'img/obj'+i+'.webp');
		}
		//Load all audio
		this.load.audio('click', 'audio/click.ogg');
		this.load.audio('connected', 'audio/connected.ogg');
		this.load.audio('itemclick', 'audio/itemclick.ogg');
		this.load.audio('gameover', 'audio/gameover.ogg');
		this.load.audio('nomatch', 'audio/nomatch.ogg');
		this.load.audio('completed', 'audio/completed.ogg');
		this.load.audio('hint', 'audio/hint.ogg');
		this.load.audio('shuffle', 'audio/shuffle.ogg');
	}
	create(){
		//this.scene.start('menu');
	}
}