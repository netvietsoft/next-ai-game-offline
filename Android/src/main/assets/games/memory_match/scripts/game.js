var cur_level = 1;
var default_max_type = 20;
var cur_time = 0;
var _score = 0;
class Game extends Phaser.Scene {
	constructor(){
		super('game');
	}
	create(){
		let self = this;
		let local_cur_time=0;
		if(cur_level>=1){
			if(cur_time>0){
				local_cur_time=cur_time;
			}
		}
		let local_score=0;
		if(cur_level>1){
			if(_score>0){
				local_score=_score;
				_score=0;
			}
		}
		let stage_data = null;
		if(rf_stage.length > cur_level){
			stage_data = rf_stage[cur_level-1];
		} else {
			stage_data = default_stage;
		}
		//
		this.add.sprite(0, 0, 'background').setOrigin(0);
		this.add.sprite(config.width/2, 0, 'header').setOrigin(0.5, 0);
		this.add.sprite(config.width/2, config.height, 'footer').setOrigin(0.5, 1);
		let txt_score = this.add.text(245, 60, local_score, {fontFamily: 'vanilla', fontSize: 33, align: 'right',color: '#FFFFFF'}).setOrigin(1, 0.5);
		let txt_best = this.add.text(510, 60, bestscore, {fontFamily: 'vanilla', fontSize: 33, align: 'right',color: '#FFFFFF'}).setOrigin(1, 0.5);
		update_score();
		//
		let col = stage_data.col;
		let row = stage_data.row;
		let tile_scale = 0.7;
		let space = 135*tile_scale;
		let max_type = (stage_data.max_type ? stage_data.max_type : default_max_type);
		let start_x = (config.width-(space*col))/2+space/2;
		let start_y = (config.height-(space*row))/2+space/2;
		let index = 0;
		let animate_flip_on_start = true; // Reveal tile on start
		let flip_count = 0;
		let max_timer = 360;
		if(cur_time == 0){
			local_cur_time=max_timer;
		}
		let timer_delay = 300; //miliseconds
		let sub_timer = 1;
		let selected = [];
		let tiles = [];
		let arr = [];
		let state = 'wait';
		let popup = this.add.group();
		for(let i=0; i<(row*col)/2; i++){
			let rand = Math.floor(Math.random()*max_type);
			arr.push(rand);
		}
		arr = arr.concat(arr);
		arr = shuffle_array(arr);
		for(let y=0; y<row; y++){
			for(let x=0; x<col; x++){
				let tile = this.add.sprite(start_x+(x*space), start_y+(y*space), 'tiles');
				tile.setInteractive();
				tile.name = 'tile';
				tile.setFrame(arr[index]);
				tile.pos = {
					x: x,
					y: y
				}
				tile.id = index;
				tile.setScale(tile_scale);
				tile.back = this.add.sprite(start_x+(x*space), start_y+(y*space), 'back');
				tile.back.setScale(tile_scale);
				tiles.push(tile);
				index++;
			}
		}
		if(animate_flip_on_start){
			let total = tiles.length;
			index = 0;
			let interval = this.time.addEvent({
				delay: 200,
				repeat: total-1,
				callback: ()=>{
					play_sound('flip', self);
					let tile = get_tile(index);
					flip_tile(tile, 'open');
					this.time.delayedCall(1000, ()=>{
						flip_tile(tile, 'close');
						if(index >= total){
							//state = 'ready';
							selected = [];
						}
					});
					index++;
				}
			});
		} else {
			state = 'play';
		}
		let b_pause = draw_button(615, 60, 'pause', this);
		let progress = this.add.tileSprite(26,1040, 668, 30, 'progress');
		progress.setOrigin(0, 0.5);
		progress.scaleX = local_cur_time/max_timer;
		// Timer
		let timer_interval = this.time.addEvent({
			delay: timer_delay,
			loop: true,
			callback: ()=>{
				if(state == 'play'){
					if(local_cur_time > 0){
						local_cur_time -= sub_timer;
						cur_time=local_cur_time;
						if(local_cur_time < 0){
							local_cur_time = 0;
						}
						progress.scaleX = local_cur_time/max_timer;
					} else {
						gameover();
					}
				}
			}
		});
		this.input.on('gameobjectdown', (pointer, obj)=>{
			if(obj.name == 'tile'){
				if(state == 'play'){
					if(!obj.open){
						play_sound('flip', self);
						flip_tile(obj, 'open');
					}
				}	
			}
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
						if(state === 'play'){
							if(obj.name === 'pause'){
								paused();
							}
						} else {
							if(obj.name === 'resume'){
								state = 'play';
								popup.clear(true, true);
							}
						}
						if(obj.name === 'sound'){
							switch_audio(obj);
						} else if(obj.name === 'restart'){
							cur_level= 1;
							cur_time=0;
							self.scene.restart();
						} else if(obj.name === 'menu') {
							cur_level= 1;
							local_score = 0;
							cur_time=0;
							self.scene.start('menu');
						}
					}
				})
			}
		}, this);
		function flip_tile(obj, type){
			let target1, target2;
			if(type == 'open'){
				target1 = obj.back;
				target2 = obj;
				obj.open = true;
			} else {
				target1 = obj;
				target2 = obj.back;
			}
			target2.scaleX = 0;
			self.tweens.add({
				targets: target1,
				scaleX: 0,
				duration: 100,
				onComplete: ()=>{
					self.tweens.add({
						targets: target2,
						scaleX: tile_scale,
						duration: 100,
						onComplete: ()=>{
							obj.scaleX = tile_scale;
							if(type == 'open'){
								if(state == 'play'){
									selected.push({id: obj.id, frame: obj.frame.name});
									if(selected.length == 2){
										check_match();
									}
								}
							} else {
								obj.open = false;
								if(state == 'wait'){
									flip_count++;
									if(flip_count == tiles.length){
										state = 'play';
									}
								}
							}
						}
					});
				}
			});
		}
		function check_match(){
			if(selected[0].frame == selected[1].frame){
				remove_tile(selected[0]);
				remove_tile(selected[1]);
				//
				play_sound('match', self);
				local_score +=2;
				update_score();
				//
				selected = [];
				if(tiles.length == 0){
					// Completed
					completed();
				}
			} else {
				flip_tile(get_tile(selected[0].id), 'close');
				selected.shift();
			}
		}
		function get_tile(id){
			let total = tiles.length;
			for(let i=0; i<total; i++){
				if(tiles[i].id == id){
					return tiles[i];
				}
			}
		}
		function remove_tile(tile){
			let tile_obj = get_tile(tile.id);
			for(let i=0; i<tiles.length; i++){
				if(tile.id == tiles[i].id){
					animate_match(tile_obj);
					tile_obj.destroy(true, true);
					tiles.splice(i, 1);
					break;
				}
			}
		}
		function shuffle_array(array) {
			for (let i = array.length - 1; i > 0; i--) {
				const j = Math.floor(Math.random() * (i + 1));
				const temp = array[i];
				array[i] = array[j];
				array[j] = temp;
			}
			return array;
		}
		function animate_match(obj){
			let _tile = self.add.sprite(obj.x, obj.y, 'tiles');
			_tile.setFrame(obj.frame.name);
			_tile.setScale(tile_scale);
			self.tweens.add({
				targets: _tile,
				rotation: Phaser.Math.DegToRad(500),
				scaleX: 0,
				scaleY: 0,
				duration: 400,
				onComplete: ()=>{
					_tile.destroy(true, true);
				}
			});
		}
		function paused(){
			state = 'paused';
			let dark = self.add.rectangle(0,0,config.width,config.height,0x000000).setOrigin(0);
			dark.setInteractive();
			dark.alpha = 0;
			self.tweens.add({
				targets: dark,
				alpha: 0.5,
				duration: 200,
			});
			let win = self.add.sprite(360, 570, 'popup');
			let paused = self.add.sprite(360, 285, 'paused');
			let b_resume = draw_button(360, 530, 'resume', self);
			let b_restart = draw_button(240, 740, 'restart', self);
			let b_menu = draw_button(360, 740, 'menu', self);
			let b_sound = draw_button(480, 740, 'sound_on', self);
			check_audio(b_sound);
			popup.addMultiple([dark, win, paused, b_resume, b_restart, b_menu,b_sound]);
		}
		function gameover(){
			play_sound('gameover', self);
			if(local_score >= bestscore){
				save_data(storage_key, bestscore);
			}
			state = 'gameover';
			let dark = self.add.rectangle(0,0, config.width,config.height,0x000000).setOrigin(0);
			dark.setInteractive();
			dark.alpha=0;
			self.tweens.add({
				targets: dark,
				alpha: 0.5,
				duration: 200,
			});
			let win = self.add.sprite(360, 570, 'popup');
			let gameover = self.add.sprite(360, 285, 'gameover');
			let score_bar = self.add.sprite(360, 475, 'score_bar');
			let best_bar = self.add.sprite(347, 625, 'best_bar');
			self.add.text(500, 475, local_score, {fontFamily: 'vanilla', fontSize: 40, align: 'right',color: '#FFFFFF'}).setOrigin(1, 0.5);
			self.add.text(500, 625, bestscore, {fontFamily: 'vanilla', fontSize: 40, align: 'right',color: '#FFFFFF'}).setOrigin(1, 0.5);
			let b_restart = draw_button(240, 760, 'restart', self);
			let b_menu = draw_button(360, 760, 'menu', self);
			let b_sound = draw_button (480, 760, 'sound_on', self);
			check_audio(b_sound);
			local_score = 0;
			Android.showInterstitialInGame("gameover");
			
		}
		function completed(){
			play_sound('completed', self);
			state = 'completed';
			self.time.delayedCall(400, ()=>{
				cur_level++;
				_score=local_score;
				self.scene.restart();
			});
		}
		function update_score(){
			if(local_score > bestscore){
				bestscore = local_score;
				txt_best.setText(bestscore);
			}
			txt_score.setText(local_score);
			if(local_score >= bestscore){
				save_data(storage_key, bestscore);
			}
		}
	}
}

var config = {
	type: Phaser.AUTO,
	width: 720,
	height: 1080,
	scale: {
		mode: Phaser.Scale.FIT,
		parent: 'game_content',
		autoCenter: Phaser.Scale.CENTER_BOTH,
	},
	scene: [Boot, Load, Menu, Game],
}
var game = new Phaser.Game(config);