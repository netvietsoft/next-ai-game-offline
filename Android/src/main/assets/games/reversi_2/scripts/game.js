var game_data = {
	sound: true,
}
var game_mode = 'single';
class Game extends Phaser.Scene {
	constructor(){
		super('game');
	}
	create(){
		let self = this;
		let tiles = this.add.group();
		let pieces = this.add.group();
		let hints = this.add.group();
		let popup = this.add.group();
		let turn = 1;
		let line = new Phaser.Geom.Line(0, 0, 0, 0);
		let no_moves_count = 0;
		let counter = [0,0];
		let state = 'play';
		this.anims.create({
		    key: 'convert',
		    frames: this.anims.generateFrameNumbers('pieces'),
		    frameRate: 14,
		});
		//this.anims.reverse('convert_1');
		this.add.sprite(360,540, 'bg_game');
		this.add.sprite(0,0, 'header').setOrigin(0);
		this.add.sprite(70,60,'piece1');
		this.add.sprite(650,60,'piece2');
		let turn_frame = [0,0];
		turn_frame[0] = this.add.sprite(140,60,'turn_frame');
		turn_frame[1] = this.add.sprite(580,60,'turn_frame');
		turn_frame[1].setFrame(1);
		let txt_counter = [0,0];
		txt_counter[0] = this.add.text(130, 60, '0', {fontFamily: 'robotomono', fontSize: 55, align: 'right', color: '#fff'}).setOrigin(0,0.5);
		txt_counter[1] = this.add.text(590, 60, '0', {fontFamily: 'robotomono', fontSize: 55, align: 'left', color: '#fff'}).setOrigin(1,0.5);
		turn_frame[1].setVisible(false);
		let b_home = draw_button(360, 940, 'home', this);
		let b_sound = draw_button(360-180, 940, 'sound_on', this);
		b_sound.name = 'sound';
		let b_restart = draw_button(360+180, 940, 'restart', this);
		check_audio(b_sound);
		//Board config
		let width = 8;
		let height = 8;
		let size = 75;
		let board_x = (config.width-(size*width))/2+(size/2);
		let board_y = 280;
		let array = new Array(height);
		//End
		for(let y=0; y<height; y++){ //Generate
			array[y] = [];
			for(let x=0; x<width; x++){
				array[y].push(0);
				let type = 1;
				if(y%2 === 0){
					if(x%2 === 0){
						type = 2;
					}
				} else {
					if(x%2 === 1){
						type = 2;
					}
				}
				let tile = this.add.sprite(board_x+(x*size), board_y+(y*size), 'tile'+type);
				//tile.setInteractive();
				//tile.board = true;
				//tile.type = type;
				tile.pos = {x: x, y: y};
				tiles.add(tile);
				let hint = this.add.sprite(board_x+(x*size), board_y+(y*size), 'hint');
				hint.setInteractive();
				hint.hint = true;
				hint.pos = {x: x, y: y};
				hint.cur_data = [];
				hint.setVisible(false);
				hints.add(hint);
				this.tweens.add({
					targets: hint,
					//scaleX: 1.2,
					//scaleY: 1.2,
					alpha: 0.3,
					duration: 300,
					ease: 'Sine.easeInOut',
					yoyo: true,
					repeat: -1,
				})
				//this.add.text(tile.x, tile.y, String(x+', '+y), {fontFamily: 'Arial', fontSize: 20, align: 'left',color: '#00000'}).setOrigin(0.5);
			}
		}
		this.add.sprite(360, board_y+((height/2)*size)-(size/2)-1, 'board');
		let reversi = new RF_Reversi(width, height, array);
		//Add initial sprite
		add_at(3,3,1); //P 1
		add_at(4,4,1); //P 1
		add_at(4,3,2); //P 2
		add_at(3,4,2); //P 2
		//End
		get_moves();
		this.input.on('gameobjectdown', function(pointer, obj){
			if(obj.hint){
				if(state === 'play'){
					show_line(obj.cur_data);
					convert(obj.cur_data);
					change_turn();
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
						if(obj.name === 'sound'){
							switch_audio(obj);
						} else if(obj.name === 'home'){
							self.scene.start('menu');
						} else if(obj.name === 'restart' || obj.name === 'restart2'){
							self.scene.start('game');
						}
					}
				});
			}
		});
		function add_at(x,y,type){
			if(array[y][x] === 0){
				array[y][x] = type;
				let piece = self.add.sprite(board_x+(x*size), board_y+(y*size), 'piece'+type);
				piece.pos = {x: x, y: y};
				pieces.add(piece);
			}
		}
		function get_moves(){
			let data = reversi.get_legal_moves(turn);
			if(data.length > 0){
				if(no_moves_count > 0){
					no_moves_count = 0;
				}
				if(game_mode === 'single'){
					if(turn === 1){
						show_hints(data);
					}
				} else {
					show_hints(data);
				}
			} else {
				if(state != 'gameover'){
					check_gameover();
				}
			}
		}
		function show_hints(data){
			let total = hints.getLength();
			let child = hints.getChildren();
			for(let i=0; i<total; i++){
				let p = child[i];
				for(let j=0; j<data.length; j++){
					if(p.pos.x === data[j].x && p.pos.y === data[j].y){
						p.setVisible(true);
						p.cur_data.push(data[j]);
					}
				}
			}
		}
		function hide_hints(){
			let total = hints.getLength();
			let child = hints.getChildren();
			for(let i=0; i<total; i++){
				let p = child[i];
				if(p.visible){
					p.cur_data = [];
					p.setVisible(false);
				}
			}
		}
		function convert(data){
			play_sound('flip'+turn, self);
			let opponent = 1;
			if(turn === 1){
				opponent = 2;
			}
			for(let i=0; i<data.length; i++){
				let arr = data[i];
				add_at(arr.x, arr.y, turn);
				loop:
				for(let y=1; y<height; y++){
					for(let x=1; x<width; x++){
						let target = {
							x: arr.x + (x*arr.dirrection.x),
							y: arr.y + (y*arr.dirrection.y),
						}
						if(array[target.y][target.x] === opponent){
							convert_at(target.x, target.y);
						} else {
							break loop;
						}
						y++;
					}
				}
			}
			//hide_hints();
		}
		function convert_at(x, y){
			array[y][x] = turn;
			let total = pieces.getLength();
			let child = pieces.getChildren();
			for(let i=0; i<total; i++){
				let p = child[i];
				if(p.pos.x === x && p.pos.y === y){
					p.setTexture('piece'+turn);
					// /p.play('convert');
					if(turn === 2){
						p.anims.playReverse('convert');
					} else {
						p.play('convert');
					}
					break;
				}
			}
		}
		function change_turn(){
			hide_hints();
			turn_frame[turn-1].setVisible(false);
			if(turn === 1){
				turn = 2;
			} else {
				turn = 1;
			}
			turn_frame[turn-1].setVisible(true);
			get_counter();
			get_moves();
			if(turn === 2 && state != 'gameover'){
				if(game_mode === 'single'){
					setTimeout(bot_move, 1000);
				}
			}
		}
		function get_counter(){
			counter = [0,0];
			for(let y=0; y<height; y++){
				for(let x=0; x<width; x++){
					if(array[y][x] > 0){
						counter[array[y][x]-1]++;
					}
				}
			}
			txt_counter[0].setText(counter[0]);
			txt_counter[1].setText(counter[1]);
		}
		function show_line(data){
			for(let i=0; i<data.length; i++){
				let arr = data[i];
				let start = {
					x: board_x+(arr.x*size),
					y: board_y+(arr.y*size),
				}
				let end = {
					x: board_x+(arr.end_point.x*size),
					y: board_y+(arr.end_point.y*size),
				}
				line.setTo(start.x, start.y, end.x, end.y);
				let particles = self.add.particles('star');
				let pemitter = particles.createEmitter({
				    lifespan: 600,
				    speed: { min: 10, max: 20 },
				    scale: { start: 1, end: 0 },
				    quantity: 1,
				    emitZone: { type: 'edge', source: line, quantity: 30 },
				    blendMode: 'ADD',
				});
				particles.setDepth(1);
				self.time.delayedCall(700, function(){
					//particles.destroy();
					pemitter.on = false;
					self.time.delayedCall(500, function(){
						particles.destroy();
					});
				});
			}
		}
		function bot_move(){
			let data = reversi.get_bot_move(turn);
			if(data.length > 0){
				show_line(data);
				convert(data);
			} else {
				if(state != 'gameover'){
					check_gameover();
				}
			}
			self.time.delayedCall(500, function(){
				change_turn();
			});
		}
		function check_gameover(){
			let is_over = true;
			let counter = [0,0];
			loop:
			for(let y=0; y<height; y++){
				for(let x=0; x<width; x++){
					if(array[y][x] === 0){
						is_over = false;
						break loop;
					} else {
						counter[array[y][x]-1]++;
					}
				}
			}
			if(!is_over){
				if(no_moves_count >= 2){
					is_over = true;
					for(let y=0; y<height; y++){
						for(let x=0; x<width; x++){
							if(array[y][x] != 0){
								counter[array[y][x]-1]++;
							}
						}
					}
				} else {
					play_sound('alert', self);
					show_alert('Player '+(turn)+' no moves!');
					no_moves_count++;
					change_turn();
				}
			}
			if(is_over){
				let over_delay = 2000;
				state = 'gameover';
				if(counter[0] < counter[1]){
					setTimeout(()=>{
						if(game_mode === 'single'){
							show_window('lose');
						} else {
							show_window('win', 'Player 2 win!');
						}
					}, over_delay);
				}
				if(counter[0] === counter[1]){
					setTimeout(()=>{
						show_window('tie');
					}, over_delay);
				}
				if(counter[0] > counter[1]){
					setTimeout(()=>{
						if(game_mode === 'single'){
							show_window('win');
						} else {
							show_window('win', 'Player 1 win!');
						}
					}, over_delay);
				}
			}
		}
		function show_alert(str){
			let win = self.add.sprite(360, 540, 'alert');
			let txt_shadow = self.add.text(360, 547, str, {fontFamily: 'robotomono-italic', fontSize: 40, align: 'center', color: '#00000'}).setOrigin(0.5);
			txt_shadow.alpha = 0.3;
			let txt = self.add.text(360, 540, str, {fontFamily: 'robotomono-italic', fontSize: 40, align: 'center', color: '#fff'}).setOrigin(0.5);
			popup.addMultiple([win, txt, txt_shadow]);
			setTimeout(()=>{
				popup.clear(true, true);
			}, 1500);
		}
		function show_window(e, str){
			let key;
			let label;
			if(e === 'lose'){
				play_sound('lose', self);
				key = 'red';
				label = 'YOU LOSE!';
			} else if(e === 'win'){
				play_sound('win', self);
				key = 'green';
				label = 'YOU WIN!';
			} else if(e === 'tie'){
				play_sound('win', self);
				key = 'green';
				label = 'TIE!';
			}
			if(str){
				label = str;
			}
			let dark = self.add.rectangle(0,0,720,1080,0x00000, 0.5).setOrigin(0);
			let win = self.add.sprite(360, 540, 'window_'+key);
			let b_restart = draw_button(270, 650, 'restart2', self);
			let b_home = draw_button(450, 650, 'home', self);
			let txt_shadow = self.add.text(360, 507, label, {fontFamily: 'robotomono-italic', fontSize: 55, align: 'center', color: '#00000'}).setOrigin(0.5);
			txt_shadow.alpha = 0.3;
			let txt = self.add.text(360, 500, label, {fontFamily: 'robotomono-italic', fontSize: 55, align: 'center', color: '#fff'}).setOrigin(0.5);
			popup.addMultiple([dark, win, b_restart, b_home, txt, txt_shadow]);
			if(e === 'win'){
				let trophy = self.add.sprite(360, 320, 'trophy');
				popup.add(trophy);			}
		}
	}
}
function draw_button(x, y, id, scope){
	var o = scope.add.sprite(x, y, 'btn_'+id).setInteractive();
	o.button = true;
	o.name = id;
	return o;
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