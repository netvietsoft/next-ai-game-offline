class Boot extends Phaser.Scene {
	constructor(){
		super('boot');
	}
	preload(){
		this.load.image('bg_menu', 'img/bg_menu.webp');
		this.load.image('game_title', 'img/game_title.webp');
		this.load.image('header', 'img/header.webp');
		this.load.image('footer', 'img/footer.webp');
		this.load.image('btn_start', 'img/btn_start.webp');
	}
	create(){
		this.scale.stopListeners();
		this.scene.start('preload');
	}
}