var is_ready_to_show_ads_popup = false;
var modeBlockCount = 8;
class Menu extends Phaser.Scene {
	constructor(){
		super('menu');
	}
	create(){
		let self = this;
		this.add.sprite(config.width/2, config.height/2, 'background');
		let title = this.add.sprite(360, 170, 'game_title');
		this.tweens.add({
			targets: title,
			y: title.y+30,
			duration: 1300,
			ease: 'Sine.easeInOut',
			yoyo: true,
			repeat: -1,
		});
		this.add.sprite(350, 470, 'bar_highscoremenu');
		this.add.text(480, 480, bestscore, {fontFamily: 'LilitaOne', fontSize: 45, align: 'right',color: '#ffffff'}).setOrigin(1, 0.5);
		let b_play = createButton(360, 840, 'play', this);
		let btn_mode = createButton(360, 700, 'mode', this);
		let txt_mode = this.add.text(360, 690, "8x8", {fontFamily: 'LilitaOne', fontSize: 50, align: 'right',color: '#ffffff', stroke:"#000",strokeThickness:6}).setOrigin(0.5, 0.5);
		this.input.on('gameobjectdown', (pointer, obj)=>{
			if(obj.isButton){
				playSound('click', this);
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
						else if(obj.name === 'sound'){
							toggleSound(obj);
						}
						else if(obj.name === 'mode'){
							changeMode();
						}
					}
				}, this);
			}
		}, this);
		updateModeButton();

		function updateModeButton(){
			if(modeBlockCount==8){
				txt_mode.text = "8x8";
			}else if (modeBlockCount==10){
				txt_mode.text = "10x10";
			}
		}
		
		function changeMode(){
			if(modeBlockCount==8){
				modeBlockCount = 10;
				txt_mode.text = "10x10";
			}else if (modeBlockCount==10){
				modeBlockCount = 8;
				txt_mode.text = "8x8";
			}

		}
	}
	update(){
		// if(btn_mode!=null){
		// 	txt_mode.scaleX=btn_mode.scaleX;
		// 	txt_mode.scaleY=btn_mode.scaleY;
		// }

	}
}