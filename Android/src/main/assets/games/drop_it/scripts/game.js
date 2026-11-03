class Game extends Phaser.Scene {
	constructor(){
		super('game');
	}
	create(){
		let self = this;
		let state = 'wait';
		let can_move = true;
		let score = 0;
		let fill_rate = 5;
		this.add.sprite(config.width/2, config.height/2, 'background');
		this.add.sprite(config.width/2, 0, 'header').setOrigin(0.5, 0);
		this.add.sprite(config.width/2, 720, 'board');
		let eye = this.add.sprite(360, 271, 'eye');
		eye.alpha = 0;
		let txt_score = this.add.text(257, 92, score, {fontFamily: 'norwester', fontSize: 32, align: 'center',color: '#FFFFFF'});
		txt_score.setOrigin(0.5);
		let txt_best = this.add.text(527, 92, bestscore, {fontFamily: 'norwester', fontSize: 32, align: 'center',color: '#FFFFFF'});
		txt_best.setOrigin(0.5);
		let b_sound = draw_button(48, 54, 'sound_on', this);
		b_sound.name = 'sound';
		check_audio(b_sound);
		let b_pause = draw_button(671, 54, 'pause', this);
		let popup = this.add.group();
		let start_x = 64;
		let start_y = 436;
		let b_width = 8;
		let b_height = 10;
		let tile_size = 74;
		let max_x = null;
		let min_x = null;
		let tiles = [];
		let board = [];
		let prev = {};
		let rect = this.add.rectangle(start_x,start_y,tile_size,tile_size*b_height,0xFFFFFF);
		rect.setOrigin(0);
		rect.alpha = 0.3;
		rect.setVisible(false);
		for(let y=0; y<b_height; y++){
			board[y] = [];
			for(let x=0; x<b_width; x++){
				board[y][x] = {type: 0, uid: 0};
				//let obj = this.add.sprite(start_x+(tile_size*x),start_y+(tile_size*y),'a1');
				//obj.setOrigin(0);
			}
		}
		for(let y=b_height-3; y<b_height; y++){
			for(let x=0; x<b_width; x++){
				add_random(x, y);
			}
		}
		this.time.delayedCall(500, ()=>{
			if(drop_it(true)){
				drop_it();
			} else {
				state = 'play';
			}
		});
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
							self.scene.restart();
						} else if(obj.name === 'menu'){
							self.scene.start('menu');
						}
					}
				}, this);
			}
		});
		this.input.on('dragstart', (pointer, obj, dragX, dragY)=>{
			max_x = null;
			min_x = null;
			can_move = false;
			if(state === 'play' || state === 'drag'){
				play_sound('drag', self);
				state = 'drag';
				rect.width = tile_size*obj.type;
				snap_move(obj);
				rect.setVisible(true);
				let empty_cell = 0;
				let s_i = obj.pos.x+obj.type;
				if(s_i < b_width){
					for(let i=s_i; i<b_width; i++){ //To right
						if(board[obj.pos.y][i].type){
							max_x = start_x+(tile_size*(i-obj.type));
							break;
						} else {
							empty_cell++;
						}
					}
				}
				if(obj.pos.x > 0){
					for(let i=obj.pos.x-1; i>=0; i--){ //To left
						if(board[obj.pos.y][i].type){
							min_x = start_x+(tile_size*(i+1));
							break;
						} else {
							empty_cell++;
						}
					}
				}
				if(empty_cell){
					can_move = true;
				}
				if(!max_x){
					max_x = (start_x+(tile_size*b_width))-(tile_size*obj.type);
				}
				if(!min_x){
					min_x = start_x;
				}
			}
				
		});
		this.input.on('drag', (pointer, obj, dragX, dragY)=>{
			if(state === 'drag'){
				if(can_move){
					if(dragX >= min_x && dragX < max_x){
						obj.x = dragX;
					} else {
						if(dragX < min_x){
							obj.x = min_x;
						}
						if(dragX >= max_x){
							obj.x = max_x;
						}
					}
					snap_move(obj);
				}
			}
		});
		this.input.on('dragend', (pointer, obj, dragX, dragY)=>{
			if(min_x){
				max_x = null;
				min_x = null;
				play_sound('dragend', self);
				snap(obj);
			} else {
				if(state === 'drag'){
					state = 'play';
				}
			}
		});
		let txts = [];
		this.input.keyboard.on('keydown', (key)=>{
			//
		});
		function add_random(x, y){
			if(Math.round(Math.random()*10 < fill_rate)){
				if(board[y][x].type === 0){
					let colors = ['a', 'b', 'c', 'd'];
					let types = [1,1,2,2,3,4];
					let rand = Math.floor(Math.random()*types.length);
					let rand_color = Math.floor(Math.random()*colors.length);
					if(x+types[rand] >= b_width){
						return false;
					} else {
						let uid = Math.floor(Math.random()*4000);
						let obj = self.add.sprite(start_x+(tile_size*x),start_y+(tile_size*y), colors[rand_color]+types[rand]);
						obj.setOrigin(0);
						obj.setInteractive();
						obj.type = types[rand];
						obj.pos = {x:x, y:y};
						obj.uid = uid;
						self.input.setDraggable(obj);
						tiles.push(obj);
						for(let i=x; i<x+types[rand]; i++){
							board[y][i].type = 'a'+types[rand];
							board[y][i].uid = uid;
						}
					}
				}
			}
		}
		function push_at_bottom(){
			play_sound('push', self);
			state = 'push';
			let is_full = false;
			for(let x=0; x<b_width; x++){
				if(board[0][x].type){
					is_full = true;
					break;
				}
			}
			if(is_full){
				pre_gameover();
				return false;
			} else {
				for(let y=1; y<b_height; y++){
					for(let x=0; x<b_width; x++){
						board[y-1][x] = Object.assign({}, board[y][x]);
						board[y][x] = {type: 0, uid: 0};
					}
				}
			}
			let total = tiles.length;
			for(let i=0; i<total; i++){
				let tile = tiles[i];
				tile.pos.y -= 1;
				self.tweens.add({
					targets: tile,
					y: start_y+(tile_size*tile.pos.y),
					duration: 200,
					ease: 'Sine.easeOut',
				});
			}
			//Add at bottom
			for(let x=0; x<b_width; x++){
				add_random(x, b_height-1);
			}
			//Tween new tiles
			total = tiles.length;
			for(let i=0; i<total; i++){
				let tile = tiles[i];
				if(tile.pos.y === b_height-1){
					tile.y += tile_size;
					tile.alpha = 0;
					self.tweens.add({
						targets: tile,
						y: start_y+(tile_size*tile.pos.y),
						alpha: 1,
						duration: 200,
						ease: 'Sine.easeOut',
					});
				}
			}
			self.time.delayedCall(250, ()=>{
				if(drop_it(true)){
					drop_it();
				} else {
					state = 'play';
				}
			})
		}
		function move_board_x(obj){
			let value = Object.assign({}, board[prev.y][prev.x]);
			for(let x=prev.x; x<prev.x+obj.type; x++){
				board[obj.pos.y][x] = {type: 0, uid: 0};
			}
			for(let x=obj.pos.x; x<obj.pos.x+obj.type; x++){
				board[obj.pos.y][x] = Object.assign({}, value);
			}
		}
		function move_board_y(obj){
			let value = Object.assign({}, board[obj.pos.y][obj.pos.x]);
			for(let x=obj.pos.x; x<obj.pos.x+obj.type; x++){
				board[obj.pos.y][x] = {type: 0, uid: 0};
			}
			let target_y = null;
			loop:
			for(let y=obj.pos.y+1; y<b_height; y++){
				for(let x=obj.pos.x; x<obj.pos.x+obj.type; x++){
					if(board[y][x].type){
						break loop;
					}
				}
				target_y = y;
			}
			for(let x=obj.pos.x; x<obj.pos.x+obj.type; x++){
				board[target_y][x] = Object.assign({}, value);
			}
			obj.drop = target_y-obj.pos.y;
			obj.pos.y = target_y;
		}
		function snap(obj){
			let xx = [];
			for(let x=0; x<b_width+1; x++){
				xx.push(start_x+(tile_size*x)-30);
			}
			for(let i=0; i<xx.length-1; i++){
				if(obj.x >= xx[i] && obj.x < xx[i+1]){
					prev = {x: obj.pos.x, y: obj.pos.y};
					obj.pos.x = i;
					obj.x = start_x+(tile_size*i);
					rect.setVisible(false);
					move_board_x(obj);
					if(drop_it(true)){
						drop_it(false, true);
					} else {
						if(obj.pos.x != prev.x){
							push_at_bottom();
						}
					}
					break;
				}
			}
		}
		function snap_move(obj){
			let xx = [];
			for(let x=0; x<b_width+1; x++){
				xx.push(start_x+(tile_size*x)-30);
			}
			for(let i=0; i<xx.length-1; i++){
				if(obj.x >= xx[i] && obj.x < xx[i+1]){
					rect.x = start_x+(tile_size*i);
					break;
				}
			}
		}
		function drop_it(only_check, push_it){
			let total = tiles.length;
			let count = 0;
			for(let y=b_height-2; y>=0; y--){
				for(let i=0; i<total; i++){
					let tile = tiles[i];
					if(tile.pos.y === y){
						let drop = true;
						for(let x=tile.pos.x; x<tile.pos.x+tile.type; x++){
							if(board[y+1][x].type){
								drop = false;
							}
						}
						if(drop){
							if(only_check){
								return true;
							}
							count++;
							move_board_y(tile);
						}
					}
				}
			}
			if(only_check){
				return false;
			} else if(count){
				state = 'drop';
			}
			for(let i=0; i<total; i++){
				let tile = tiles[i];
				if(tile.drop){
					self.tweens.add({
						targets: tile,
						y: start_y+(tile.pos.y*tile_size)+5,
						duration: 200+(tile.drop*50),
						ease: 'Sine.easeOut',
						onComplete: ()=>{
							play_sound('drop', self);
							self.tweens.add({
								targets: tile,
								y: tile.y-10,
								duration: 100,
								onComplete: ()=>{
									self.tweens.add({
										targets: tile,
										y: start_y+(tile.pos.y*tile_size)+3,
										duration: 100,
										onComplete: ()=>{
											self.tweens.add({
												targets: tile,
												y: start_y+(tile.pos.y*tile_size),
												duration: 80,
												onComplete: ()=>{
													count--;
													if(count === 0){
														//check_line();
														if(check_line(true)){
															check_line();
														} else {
															if(push_it){
																push_at_bottom();
															} else {
																state = 'play';
																check_board_y();
															}
														}
													}
												}
											});
										}
									});
								}
							});
							tile.drop = false;
						}
					})
				}
			}
		}
		function clear_at(y){
			for(let x=0; x<b_width; x++){
				board[y][x] = {type: 0, uid: 0};
			}
			let total = tiles.length;
			for(let i=total-1; i>=0; i--){
				let tile = tiles[i];
				if(tile.pos.y === y){
					tile.destroy(true, true);
					tiles.splice(i, 1);
				}
			}
		}
		function check_board_y(){
			/* Check the whole board if there is only 2 or less line (row), then push it to avoid potential issues (Blank board) */
			let row_count = 0;
			for(let y=b_height-1; y>=0; y--){
				let exist = false;
				for(let x=0; x<b_width; x++){
					if(board[y][x].type){
						exist = true;
					}
				}
				if(exist){
					row_count++;
				}
				if(row_count > 2){
					//Stop the script
					return true;
				}
			}
			push_at_bottom();

		}
		function check_line(only_check){
			/* Check the whole board if there is a full filled row, then remove it */
			let matches = [];
			for(let y=b_height-1; y>=0; y--){
				let full = true;
				for(let x=0; x<b_width; x++){
					if(!board[y][x].type){
						full = false;
						break;
					}
				}
				if(full){
					if(only_check){
						return true;
					}
					matches.push(y);
				}
			}
			if(only_check){
				return false;
			}
			if(matches.length){
				play_sound('remove', self);
				state = 'remove';
				let pre_score = b_width*matches.length;
				if(matches.length > 1){
					pre_score = Math.round(pre_score*(matches.length*0.7));
				}
				score += pre_score*2;
				for(let i=0; i<matches.length; i++){
					show_blend(matches[i]);
				}
				self.time.delayedCall(500, ()=>{
					if(drop_it(true)){
						drop_it();
					} else {
						state = 'play';
						//check_board_y();
						push_at_bottom();
					}
					update_score();
					if(score > 400 && fill_rate === 5){
						fill_rate = 7;
					}
				});
				let index = 2;
				self.time.addEvent({
					delay: 200,
					callback: ()=>{
						if(index % 2){
							eye.alpha = 1;
						} else {
							eye.alpha = 0;
						}
						index++;
					},
					repeat: 8
				});
			} else {
				state = 'play';
			}
		}
		function show_blend(y){
			let blend = self.add.sprite(config.width/2-50, start_y+(tile_size*y)+(tile_size/2), 'blend');
			blend.setBlendMode(Phaser.BlendModes.ADD);
			blend.setOrigin(0.7, 0.5);
			self.tweens.add({
				targets: blend,
				scaleX: 5,
				duration: 300,
				ease: 'Sine.easeInOut',
				onComplete: ()=>{
					self.tweens.add({
						targets: blend,
						scaleX: 2,
						alpha: 0,
						duration: 100,
						onComplete: ()=>{
							blend.destroy(true, true);
						}
					});
				}
			});
			let blend2 = self.add.sprite(config.width/2+50, start_y+(tile_size*y)+(tile_size/2), 'blend');
			blend2.setBlendMode(Phaser.BlendModes.ADD);
			blend2.setOrigin(0.3, 0.5);
			self.tweens.add({
				targets: blend2,
				scaleX: 5,
				duration: 300,
				ease: 'Sine.easeInOut',
				onComplete: ()=>{
					clear_at(y);
					self.tweens.add({
						targets: blend2,
						scaleX: 2,
						alpha: 0,
						duration: 100,
						onComplete: ()=>{
							blend2.destroy(true, true);
						}
					});
				}
			});
		}
		function update_score(){
			if(score > bestscore){
				bestscore = score;
				txt_best.setText(bestscore);
			}
			txt_score.setText(score);
		}
		function paused(){
			state = 'paused';
			let dark = self.add.rectangle(0,0,config.width,config.height,0x000000).setOrigin(0);
			dark.setInteractive();
			dark.alpha = 0.5;
			let win = self.add.sprite(360, 670, 'popup_pause');
			let title = self.add.sprite(360, 423, 'txt_pause');
			let b_resume = draw_button(360, 608, 'resume', self);
			let b_restart = draw_button(360, 720, 'restart', self);
			let b_menu = draw_button(360, 832, 'menu', self);
			popup.addMultiple([dark, win, title, b_resume, b_restart, b_menu]);
		}
		function pre_gameover(){
			state = 'gameover';
			self.time.delayedCall(1000, gameover);
		}
		function gameover(){
			play_sound('gameover', self);
			localStorage.setItem('rf.drop_it', bestscore);
			let dark = self.add.rectangle(0,0,config.width,config.height,0x000000).setOrigin(0);
			dark.setInteractive();
			dark.alpha = 0.5;
			let win = self.add.sprite(360, 640, 'popup_gameover');
			let title = self.add.sprite(360, 424, 'txt_gameover');
			let b_restart = draw_button(360, 805, 'restart', self);
			let b_menu = draw_button(360, 915, 'menu', self);
			self.add.text(390, 578, score, {fontFamily: 'norwester', fontSize: 35, align: 'center',color: '#FFFFFF'}).setOrigin(0.5);
			self.add.text(390, 696, bestscore, {fontFamily: 'norwester', fontSize: 35, align: 'center',color: '#FFFFFF'}).setOrigin(0.5);
		}
	}
}
function play_sound(id, scope){
	if(game_data.sound){
		scope.sound.play(id);
	}
}
function switch_audio(obj){
	if(game_data[obj.name]){
		game_data[obj.name] = false;
		obj.setTexture('btn_sound_off');
	} else {
		game_data[obj.name] = true;
		obj.setTexture('btn_sound_on');
	}
}
function check_audio(obj){
	if(game_data[obj.name]){
		obj.setTexture('btn_sound_on');
	} else {
		obj.setTexture('btn_sound_off');
	}
}
function draw_button(x, y, id, scope){
	var o = scope.add.sprite(x, y, 'btn_'+id).setInteractive();
	o.button = true;
	o.name = id;
	return o;
}
var config = {
	type: Phaser.WEBGL,
	width: 720,
	height: 1280,
	scale: {
		mode: Phaser.Scale.FIT,
		parent: 'game_content',
		autoCenter: Phaser.Scale.CENTER_BOTH,
	},
	scene: [Boot, Load, Menu, Game],
}
var game = new Phaser.Game(config);