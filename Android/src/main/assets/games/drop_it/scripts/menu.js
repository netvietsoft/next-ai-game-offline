var bestscore = 0;
var game_data = {
	sound: true
}

//localStorage.removeItem('rf.drop_it');
load_data();
function load_data(){
	let local_data = localStorage.getItem('rf.drop_it');
	if(local_data){ //Load existing game data
		bestscore = local_data;
	}
}
class Menu extends Phaser.Scene {
	constructor(){
		super('menu');
	}
	create(){
		var self = this;
		this.add.sprite(config.width/2, config.height/2, 'bg_menu');
		let title = this.add.sprite(360, 392, 'game_title');
		this.tweens.add({
			targets: title,
			y: title.y+30,
			duration: 1300,
			ease: 'Sine.easeInOut',
			yoyo: true,
			repeat: -1,
		});
		this.add.sprite(352, 800, 'best_bar');
		this.add.text(395, 805, bestscore, {fontFamily: 'norwester', fontSize: 43, align: 'center',color: '#FFFFFF'}).setOrigin(0.5);
		let b_play = draw_button(360, 960, 'play', this);
		this.input.on('gameobjectdown', (pointer, obj)=>{
			if(obj.button){
				play_sound('click', this);
				this.tweens.add({
					targets: obj,
					scaleX: 0.9,
					scaleY: 0.9,
					yoyo: true,
					ease: 'Linear',
					duration: 100,
					onComplete: function(){
						if(obj.name === 'play'){
							self.scene.start('game');
						}
					}
				}, this);
			}
		}, this);
		this.add.text(360, 1230, dev_str, {fontFamily: 'norwester', fontSize: 26, align: 'center',color: '#FFFFFF'}).setOrigin(0.5);
	}
}