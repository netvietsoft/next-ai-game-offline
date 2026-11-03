class Load extends Phaser.Scene {
	constructor(){
		super('preload');
	}
	preload(){
		this.add.sprite(360,540,'bg_menu');
		this.add.sprite(0,0,'header').setOrigin(0);
		this.add.sprite(0,config.height,'footer').setOrigin(0,1);
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
		this.load.image('bg_game', 'img/bg_game.webp');
		this.load.image('window_big', 'img/window_big.webp');
		this.load.image('window_small', 'img/window_small.webp');
		this.load.image('coin_bar', 'img/coin_bar.webp');
		this.load.image('level_bar', 'img/level_bar.webp');
		this.load.spritesheet('lamp', 'img/lamp.webp', {frameWidth: 144, frameHeight: 144});
		this.load.spritesheet('guide', 'img/guide.webp', {frameWidth: 124, frameHeight: 280});
		this.load.image('tile0', 'img/tile0.webp');
		this.load.image('tile1', 'img/tile1.webp');
		this.load.image('tile2', 'img/tile2.webp');
		this.load.image('tile3', 'img/tile3.webp');
		this.load.image('btn_hint', 'img/btn_hint.webp');
		this.load.image('btn_next', 'img/btn_next.webp');
		this.load.image('btn_home', 'img/btn_home.webp');
		this.load.image('btn_exit', 'img/btn_exit.webp');
		this.load.image('btn_close', 'img/btn_close.webp');
		this.load.image('btn_play', 'img/btn_play.webp');
		this.load.image('btn_pay_hint', 'img/btn_pay_hint.webp');
		this.load.image('btn_sound_on', 'img/btn_sound_on.webp');
		this.load.image('btn_sound_off', 'img/btn_sound_off.webp');
		this.load.image('btn_close_small', 'img/btn_close_small.webp');
		for(let i=1; i<=15; i++){
			this.load.image(String(i), 'img/'+i+'.webp');
			this.load.image(String(i+'x'), 'img/'+i+'x.webp');
		}
		//Load all levels
		for(let i=1; i<=game_data.total_level; i++){
			this.load.json('level-'+i, 'level/level-'+i+'.json');
		}
		//Load add sounds
		this.load.audio('completed', 'audio/completed.ogg');
		this.load.audio('click', 'audio/click.ogg');
		this.load.audio('fill', 'audio/fill.ogg');
		this.load.audio('hint', 'audio/hint.ogg');
		this.load.audio('pop', 'audio/pop.ogg');
	}
}