class Menu extends Phaser.Scene {
	constructor(){
		super('menu');
	}
	create(){
		let self = this;
		this.add.sprite(360,540, 'bg_menu');
		this.add.sprite(360,380, 'game_title');
		let b_single = draw_button(360, 580, 'single', this);
		let b_multi = draw_button(360, 700, 'multi', this);
		this.input.on('gameobjectdown', function(pointer, obj){
			if(obj.button){
				play_sound('click', self);
				self.tweens.add({
					targets: obj,
					scaleX: 0.95,
					scaleY: 0.95,
					yoyo: true,
					duration: 100,
					ease: 'Linear',
					onComplete: function(){
						if(obj.name === 'single'){
							game_mode = obj.name;
							self.scene.start('game');
						} else if(obj.name === 'multi'){
							game_mode = obj.name;
							self.scene.start('game');
						}
					}
				});
			}
		});
		//this.scene.start('game');
	}
}