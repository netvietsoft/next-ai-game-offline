class RF_Reversi {
	constructor(width, height, array){
		this.width = width;
		this.height = height;
		this.array = array;
	}
	get_legal_moves(turn, custom_array){
		let array;
		if(custom_array){
			array = custom_array;
		} else {
			array = this.array;
		}
		let data = [];
		for(let y=0; y<this.height; y++){
			for(let x=0; x<this.width; x++){
				if(array[y][x] === 0){
					this.check_at(x, y, {x: -1, y: 0}, data, array, turn); //Left
					this.check_at(x, y, {x: 1, y: 0}, data, array, turn); //Right
					this.check_at(x, y, {x: 0, y: -1}, data, array, turn); //Up
					this.check_at(x, y, {x: 0, y: 1}, data, array, turn); //Down
					this.check_at(x, y, {x: 1, y: 1}, data, array, turn); //Down right
					this.check_at(x, y, {x: -1, y: 1}, data, array, turn); //Down left
					this.check_at(x, y, {x: -1, y: -1}, data, array, turn); //Up left
					this.check_at(x, y, {x: 1, y: -1}, data, array, turn); //Up right
				}
			}
		}
		return data;
	}
	check_at(cur_x, cur_y, to, data, array, turn){
		let is_opponent = false;
		let index = 0;
		let opponent = 1;
		if(turn === 1){
			opponent = 2;
		}
		loop:
		for(let y=1; y<this.height; y++){
			for(let x=1; x<this.width; x++){
				let target = {
					x: cur_x + (x*to.x),
					y: cur_y + (y*to.y),
				}
				if(this.inside(target)){
					if(index === 0){
						if(array[target.y][target.x] === opponent){
							is_opponent = true;
						} else {
							break loop;
						}
					} else {
						if(is_opponent && array[target.y][target.x] != opponent){
							if(array[target.y][target.x] === turn){
								data.push({x: cur_x, y: cur_y, dirrection: to, end_point: target});
							}
							break loop;
						}
					}
				} else {
					break loop;
				}
				index++;
				y++;
			}
		}
	}
	inside(val){
		let ret = false;
		if(val.x >= 0 && val.x < this.width && val.y >= 0 && val.y < this.height){
			ret = true;
		}
		return ret;
	}
	get_bot_move(turn){
		let picked = [];
		let qualify = [];
		let min_value = -999;
		let data = this.get_legal_moves(turn);
		let total = data.length;
		if(total > 0){
			//Scoring
			for(let i=0; i<total; i++){
				data[i].score = this.get_score(data[i], turn);
			}
			//Filter by score
			for(let i=0; i<total; i++){
				let a1 = data[i];
				let cur_score = a1.score;
				for(let j=0; j<total; j++){
					let a2 = data[j];
					if(a1.x === a2.x && a1.y === a2.y){
						if(a1.dirrection.x != a2.dirrection.x || a1.dirrection.y != a2.dirrection.y){
							cur_score += a2.score;
						}
					}
				}
				if(cur_score > min_value){
					min_value = cur_score;
					qualify = [];
				}
				if(cur_score >= min_value){
					a1.com_score = cur_score;
					qualify.push(a1);
				}
			}
			//Pick the best one
			let rand = Math.floor(Math.random()*qualify.length);
			let res = qualify[rand];
			//Find all reference
			for(let i=0; i<total; i++){
				if(data[i].x === res.x && data[i].y === res.y){
					picked.push(data[i]);
				}
			}
		} else {
			alert('zero');
		}
		return picked;
	}
	get_score(arr, turn){
		let opponent = 1;
		if(turn === 1){
			opponent = 2;
		}
		let score = 0;
		if(this.opponent_on_edge(arr, turn)){
			score -= 5;
		}
		loop:
		for(let y=1; y<this.height; y++){
			for(let x=1; x<this.width; x++){
				let target = {
					x: arr.x + (x*arr.dirrection.x),
					y: arr.y + (y*arr.dirrection.y),
				}
				if(this.array[target.y][target.x] === opponent){
					score++;
					if(this.on_edge(arr.x, arr.y)){
						score += 10;
					}
				} else {
					break loop;
				}
				y++;
			}
		}
		return score;
	}
	on_edge(x, y){
		if(x === 0 && y === 0){
			return true;
		} else if(x === this.width-1 && y === 0){
			return true;
		} else if(x === this.width-1 && y === this.height-1){
			return true;
		} else if(x === 0 && y === this.height-1){
			return true;
		}
		return false;
	}
	opponent_on_edge(data, turn){
		let opponent = 1;
		if(turn === 1){
			opponent = 2;
		}
		let test_array = JSON.parse(JSON.stringify(this.array));
		this.test_convert(data, turn, test_array);
		let moves = this.get_legal_moves(opponent, test_array);
		let total = moves.length;
		if(total > 0){
			for(let i=0; i<total; i++){
				if(this.on_edge(moves[i].x, moves[i].y)){
					return true;
				}
			}
		} else {
			return false;
		}
	}
	test_convert(data, turn, test_array){ //Bot simulator
		let opponent = 1;
		if(turn === 1){
			opponent = 2;
		}
		let arr = data;
		test_array[arr.y][arr.x] = turn;
		loop:
		for(let y=1; y<this.height; y++){
			for(let x=1; x<this.width; x++){
				let target = {
					x: arr.x + (x*arr.dirrection.x),
					y: arr.y + (y*arr.dirrection.y),
				}
				if(test_array[target.y][target.x] === opponent){
					test_array[target.y][target.x] = turn; //Convert
				} else {
					break loop;
				}
				y++;
			}
		}
	}
}