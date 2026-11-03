class Boot extends Phaser.Scene {
	constructor(){
		super('boot');
	}
	preload(){
		//load some initial sprites
		this.load.image('background', 'img/background.webp');
		this.load.image('game_title', 'img/game_title.webp');
		this.load.image('btn_start', 'img/btn_start.webp');
	}
	create(){
		this.scale.stopListeners();
		this.scene.start('load');
	}
}