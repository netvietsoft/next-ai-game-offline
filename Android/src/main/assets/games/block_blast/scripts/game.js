class Game extends Phaser.Scene {
	constructor() {
		super('game');
	}


	create(){
		// let modeBlockCount = 10;
		let blockCountLine = 10;
		let tileScale = 1;
		let blockSize = 64;
		let smallBlockScaleOnBoard = 0.8;
		let blockSizeScale = 1;
		let smallBlockScale = 0.7;
		let smallBlockScaleX = 0.57;
		let smallBlockScaleY = 0.75;
		
		let self = this; 
		this.add.sprite(config.width/2, config.height/2, 'background');
		// this.add.sprite(0, 0, 'header').setOrigin(0);
		this.add.sprite(config.width/2, 65, 'bar_score');
		let totalBlockFrames = 8;
		let totalPattern = 28;
		let startX = config.width/2 - ((blockSize*10)/2) + blockSize/2;
		let startY = 232;
		if(modeBlockCount==8){
			blockSize = 80;
			tileScale = 1.25;
			blockCountLine = modeBlockCount;
			smallBlockScaleOnBoard = 1;
			startX += 10;
			startY = 240;
			blockSizeScale = 1;
			smallBlockScale = 0.75
			smallBlockScaleX = smallBlockScale;
			smallBlockScaleY = 1;
		}
		this.add.sprite(config.width/2, 520, 'board');
		let smallBlocks = [];

		let smallBlockSize = blockSize * smallBlockScale * blockSizeScale;
		let smallBlockSpawnPoints = [{x: 360-(smallBlockSize*4), y: 970}, {x: 360, y: 970}, {x: 360+(smallBlockSize*4), y: 970}];
		let smallBlockYPlus = 400;
		let smallBlockIsReadyToMove = false;
		let smallBlockPool = [];
		let dragPos;
		let canDrag = true;
		let selectedBlockIndex = -1;
		let selectedPatternPos;
		let selectedFrame;
		let lastPattern;
		let selectedPatternType = -1;
		let lastDropPos = null;
		let tiles = [];
		let blockPool = [];
		let blocks = []; // Blocks in the board
		let arrPattern;
		let arrBoard = [];
		let state = 'play';
		let popup = this.add.group();

		for(let y=0; y<blockCountLine; y++){
			let arrX = [];
			for(let x=0; x<blockCountLine; x++){
				arrX.push(0);
				let tile = this.add.sprite(startX + (x*blockSize), startY + (y*blockSize), 'tile');
				tile.scale = tileScale;
				tile.pos = {x:x, y:y};
				tile.isTile = true;
				tile.setInteractive();
				tiles.push(tile);
			}
			arrBoard.push(arrX);
		}
		spawnSmallBlocks();
		createButton(655, 65, 'pause', this);
		let score = 0;
		let txt_score = this.add.text(480, 65, score, {fontFamily: 'LilitaOne', fontSize: 45, align: 'right',color: '#ffffff'}).setOrigin(1, 0.5);
		let txt_bonus = this.add.text(config.width/2, 520, '', {fontFamily: 'LilitaOne', fontSize: 55, align: 'center',color: '#ffffff', stroke: '#2c1142', strokeThickness: 10}).setOrigin(0.5);
		txt_bonus.defY = 520;
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
						if(obj.name === 'pause'){
							if(state == 'play'){
								paused();
							}
						} else if(obj.name === 'resume'){
							state = 'play';
							popup.clear(true, true);
						} else if(obj.name === 'restart'){
							self.scene.restart();
						} else if(obj.name === 'sound'){
							toggleSound(obj);
						} else if(obj.name === 'menu'){
							self.scene.start('menu');
						}
					}
				}, this);
			}
		}, this);
		this.input.on('dragstart', function (pointer, gameObject) {
			if(!canDrag || state != 'play') return;
			canDrag = false;
			selectedBlockIndex = gameObject.index;
			selectedPatternPos = gameObject.patternPos;
			selectedPatternType = gameObject.patternType;
			selectedFrame = gameObject.frame.name;
			dragPos = {x: pointer.x, y: pointer.y };
			let scaleRatio = 1 / smallBlockScaleX * smallBlockScaleY;
			let pivotX = gameObject.x;
			let pivotY = gameObject.y;
			for(let block of smallBlocks){
				if(block.index == selectedBlockIndex){
					let deltaX = block.x - pivotX;
					let deltaY = block.y - pivotY - 160;
					this.tweens.add({
						targets: block,
						scaleX: smallBlockScaleY ,
						scaleY: smallBlockScaleY ,
						x: pivotX + deltaX * scaleRatio,
						y: pivotY + deltaY * scaleRatio ,
						duration: 80,
						onComplete: ()=>{
							smallBlockIsReadyToMove = true;
						}
					});
					this.children.bringToTop(block);
				} 
			}
		}, this);

		this.input.on('drag', function (pointer, gameObject, dragX, dragY) {
			if(smallBlockIsReadyToMove){
				let deltaX = pointer.x - dragPos.x;
				let deltaY = pointer.y - dragPos.y;
				for(let block of smallBlocks){
					if(block.index == selectedBlockIndex){
						block.x += deltaX;
						block.y += deltaY;
					} 
				}
				dragPos = {x: pointer.x, y: pointer.y};
			}
		});

		this.input.on('dragend', function () {
			if(selectedBlockIndex == -1) return;
			for(let block of smallBlocks){
				if(block.index == selectedBlockIndex){
					if(canDropped()){
						playSound('placed', self);
						putBlocksAtTheBoard();
						moveDraggedBlocksToPool();
						if(checkLineComplete()){
							removeMatchingBlocks();
							console.log("checkLineComplete");
						} else if(checkGameover()){
							state = 'gameover';
							self.time.delayedCall(3000, gameover);
							console.log("checkGameover");
						}
						cleanUp();
						if(smallBlocks.length == 0){
							console.log("smallBlocks = 0");
							spawnSmallBlocks();
							if(checkGameover()){
								state = 'gameover';
								self.time.delayedCall(3000, gameover);
							}
						}
					} else {
						playSound('miss', self);
						this.tweens.add({
							targets: block,
							x: block.initPos.x,
							y: block.initPos.y,
							scaleX: smallBlockScaleX,
							scaleY: smallBlockScaleX,
							duration: 100,
							ease: 'Sine.easeInOut',
							onComplete: ()=>{
								cleanUp();
							}
						});
					}
				} 
			}
		}, this);
		this.input.on('pointermove', function (pointer) {
			if(selectedBlockIndex == -1) return;
			if(selectedPatternType == -1) return;
			tiles.forEach(tile => {
				if (tile.getBounds().contains(pointer.x, pointer.y-200)) {
					checkPatternToTile(tile);
				}
			});
		});
		function spawnSmallBlocks(){
			let index = 0;
			let tmpArrType = [];
			for(let pos of smallBlockSpawnPoints){
				index++;
				arrPattern = getPattern();
				let centerPos = getCenterPos(arrPattern);
				let smallBlockX = pos.x - centerPos.x;
				let smallBlockY = pos.y - centerPos.y + smallBlockYPlus;
				let blockFrame;
				for(let i=0; i<blockCountLine; i++){
					blockFrame = Math.floor(Math.random()*totalBlockFrames);
					if(!tmpArrType.includes(blockFrame)){
						tmpArrType.push(blockFrame);
						break;
					}
				}
				for(let y=0; y<4; y++){
					for(let x=0; x<4; x++){
						if(arrPattern[y][x] == 1){
							let block = createSmallBlock();
							block.setPosition(smallBlockX+(x*smallBlockSize), smallBlockY+(y*smallBlockSize));
							block.setFrame(blockFrame);
							block.setScale(smallBlockScaleX);
							block.initPos = {x: block.x, y: block.y - smallBlockYPlus};
							block.index = index;
							block.patternType = lastPattern;
							block.patternPos = {x:x, y:y};
							block.setInteractive();
							self.input.setDraggable(block);
							smallBlocks.push(block);
						}
					}
				}
				//self.add.rectangle(pos.x, pos.y, 10, 10, 0xFFFFFF);
			}
			//
			index = 0;
			self.time.addEvent({
				delay: 200,
				callback: ()=>{
					index++;
					for(let block of smallBlocks){
						if(block.index == index){
							playSound('spawn'+index, self);
							self.tweens.add({
								targets: block,
								y: block.y - smallBlockYPlus,
								duration: 600,
								ease: 'Back.easeOut'
							});
						}
					}
				},
				repeat: smallBlockSpawnPoints.length
			});
		}
		function createSmallBlock(){
			if(smallBlockPool.length){
				let block = smallBlockPool[0];
				block.setScale(1);
				block.setVisible(true);
				smallBlockPool.shift();
				return block;
			} else {
				return self.add.sprite(100, 100, 'jewels');
			}
		}
		function createBlock(){
			if(blockPool.length){
				let block = blockPool[0];
				block.setScale(1);
				block.rotation = 0;
				block.setVisible(true);
				blockPool.shift();
				return block;
			} else {
				return self.add.sprite(100, 100, 'jewels');
			}
		}
		function getCenterPos(arr){
			let tmpArrX = [];
			let tmpArrY = [];
			for(let y=0; y<4; y++){
				for(let x=0; x<4; x++){
					if(arrPattern[y][x] == 1){
						if(!tmpArrX.includes(x)){
							tmpArrX.push(x);
						}
						if(!tmpArrY.includes(y)){
							tmpArrY.push(y);
						}
					}
				}
			}
			let resultX = (smallBlockSize/2)*(tmpArrX.length-1);
			let resultY = (smallBlockSize/2)*(tmpArrY.length-1);
			return {x: resultX, y: resultY};
		}
		function cleanUp(){
			canDrag = true;
			selectedBlockIndex = -1;
			selectedPatternType = -1;
			smallBlockIsReadyToMove = false;
			tiles.forEach(tile => {
				tile.setFrame(0);
			});
		}
		function canDropped(patternType = null, offset = null){
			if(lastDropPos === null) return false;
			if(patternType == null){
				patternType = selectedPatternType;
			}
			let pattern = getPattern(patternType);
			if(offset == null){
				offset = {
					x: lastDropPos.x - selectedPatternPos.x,
					y: lastDropPos.y - selectedPatternPos.y
				}
			}
			for(let y=offset.y; y<offset.y+4; y++){
				for(let x=offset.x; x<offset.x+4; x++){
					let _pos = {x: x-offset.x, y: y-offset.y};
					if(pattern[_pos.y][_pos.x]){
						if(x < 0 || y < 0 || x >= blockCountLine || y >= blockCountLine || arrBoard[y][x]){ // arrBoard is already filled
							return false;
						}
					}
				}
			}
			return true;
		}
		function putBlocksAtTheBoard(){
			let pattern = getPattern(selectedPatternType);
			let offset = {
				x: lastDropPos.x - selectedPatternPos.x,
				y: lastDropPos.y - selectedPatternPos.y
			}
			for(let y=offset.y; y<offset.y+4; y++){
				for(let x=offset.x; x<offset.x+4; x++){
					let _pos = {x: x-offset.x, y: y-offset.y};
					if((_pos.y < 4 && _pos.x < 4) && pattern[_pos.y][_pos.x]){
						let tile = getTile(x, y);
						let block = createBlock();
						block.setPosition(tile.x, tile.y);
						block.setFrame(selectedFrame);
						block.scale = smallBlockScaleOnBoard;
						block.pos = {x: x, y: y};
						blocks.push(block);
						arrBoard[y][x] = 1; // Filled
					}
				}
			}
		}
		function moveDraggedBlocksToPool(){
			for(let block of smallBlocks){
				if(block.index == selectedBlockIndex){
					block.setVisible(false);
					block.setPosition(0,0);
					smallBlockPool.push(block);
				}
			}
			for(let i = smallBlocks.length - 1; i >= 0; i--){
				if(smallBlocks[i].index == selectedBlockIndex){
					smallBlocks.splice(i, 1);
				}
			}
		}
		function moveBlockToPool(pos){
			// Used for matching block
			for(let block of blocks){
				if(block.pos.x == pos.x && block.pos.y == pos.y){
					block.setVisible(false);
					block.setPosition(0,0);
					blockPool.push(block);
				}
			}
			for(let i = blocks.length - 1; i >= 0; i--){
				if(blocks[i].pos.x == pos.x && blocks[i].pos.y == pos.y){
					blocks.splice(i, 1);
					break;
				}
			}
		}
		function checkPatternToTile(tileObj){
			lastDropPos = {x: tileObj.pos.x, y: tileObj.pos.y};
			for(let tile of tiles){
				tile.setFrame(0);
			}
			let pattern = getPattern(selectedPatternType);
			let offset = {
				x: tileObj.pos.x - selectedPatternPos.x,
				y: tileObj.pos.y - selectedPatternPos.y
			}

			for(let y=offset.y; y<blockCountLine; y++){
				for(let x=offset.x; x<blockCountLine; x++){
					if(x >= 0 && y >= 0){
						let _pos = {x: x-offset.x, y: y-offset.y};
						if((_pos.y < 4 && _pos.x < 4) && pattern[_pos.y][_pos.x]){
							let tile = getTile(x, y);
							tile.setFrame(1);
						}
					}
				}
			}

		}
		function getTile(x, y){
			for(let tile of tiles){
				if(tile.pos.x == x && tile.pos.y == y){
					return tile;
				}
			}
		}
		function getPattern(patternType = null){
			let arr;
			let type;
			if(patternType == null){
				type = Math.floor(Math.random()*totalPattern);
			} else {
				type = patternType;
			}
			lastPattern = type;
			/*
			arr[y][x]
			*/
			if(type == 0){
				arr = 	[
							[1,1,0,0],
							[0,0,0,0],
							[0,0,0,0],
							[0,0,0,0]
						];
			} else if(type == 1){
				arr = 	[
							[1,0,0,0],
							[1,0,0,0],
							[0,0,0,0],
							[0,0,0,0]
						];
			} else if(type == 2){
				arr = 	[
							[1,0,0,0],
							[1,0,0,0],
							[1,0,0,0],
							[0,0,0,0]
						];
			} else if(type == 3){
				arr = 	[
							[1,1,1,0],
							[0,0,0,0],
							[0,0,0,0],
							[0,0,0,0]
						];
			} else if(type == 4){
				arr = 	[
							[1,1,0,0],
							[1,1,0,0],
							[0,0,0,0],
							[0,0,0,0]
						];
			} else if(type == 5){
				arr = 	[
							[1,0,0,0],
							[1,0,0,0],
							[1,1,0,0],
							[0,0,0,0]
						];
			} else if(type == 6){
				arr = 	[
							[0,1,0,0],
							[0,1,0,0],
							[1,1,0,0],
							[0,0,0,0]
						];
			} else if(type == 7){
				arr = 	[
							[1,1,0,0],
							[0,1,0,0],
							[0,1,0,0],
							[0,0,0,0]
						];
			} else if(type == 8){
				arr = 	[
							[1,1,0,0],
							[1,0,0,0],
							[1,0,0,0],
							[0,0,0,0]
						];
			} else if(type == 9){
				arr = 	[
							[1,1,1,0],
							[1,0,0,0],
							[0,0,0,0],
							[0,0,0,0]
						];
			} else if(type == 10){
				arr = 	[
							[1,1,1,0],
							[0,0,1,0],
							[0,0,0,0],
							[0,0,0,0]
						];
			} else if(type == 11){
				arr = 	[
							[1,1,1,0],
							[0,1,0,0],
							[0,0,0,0],
							[0,0,0,0]
						];
			} else if(type == 12){
				arr = 	[
							[0,1,0,0],
							[1,1,1,0],
							[0,0,0,0],
							[0,0,0,0]
						];
			} else if(type == 13){
				arr = 	[
							[0,1,0,0],
							[1,1,0,0],
							[0,1,0,0],
							[0,0,0,0]
						];
			} else if(type == 14){
				arr = 	[
							[1,0,0,0],
							[1,1,0,0],
							[1,0,0,0],
							[0,0,0,0]
						];
			} else if(type == 15){
				arr = 	[
							[1,1,1,0],
							[1,0,0,0],
							[1,0,0,0],
							[0,0,0,0]
						];
			} else if(type == 16){
				arr = 	[
							[1,1,1,0],
							[0,0,1,0],
							[0,0,1,0],
							[0,0,0,0]
						];
			} else if(type == 17){
				arr = 	[
							[1,0,0,0],
							[1,0,0,0],
							[1,1,1,0],
							[0,0,0,0]
						];
			} else if(type == 18){
				arr = 	[
							[1,1,1,0],
							[1,0,0,0],
							[1,0,0,0],
							[0,0,0,0]
						];
			} else if(type == 19){
				arr = 	[
							[1,1,0,0],
							[0,1,1,0],
							[0,0,0,0],
							[0,0,0,0]
						];
			} else if(type == 20){
				arr = 	[
							[0,1,1,0],
							[1,1,0,0],
							[0,0,0,0],
							[0,0,0,0]
						];
			} else if(type == 21){
				arr = 	[
							[0,1,0,0],
							[1,1,0,0],
							[1,0,0,0],
							[0,0,0,0]
						];
			} else if(type == 22){
				arr = 	[
							[1,0,0,0],
							[1,1,0,0],
							[0,1,0,0],
							[0,0,0,0]
						];
			} else if(type == 23){
				arr = 	[
							[1,0,0,0],
							[1,1,0,0],
							[0,0,0,0],
							[0,0,0,0]
						];
			} else if(type == 24){
				arr = 	[
							[1,1,0,0],
							[0,1,0,0],
							[0,0,0,0],
							[0,0,0,0]
						];
			} else if(type == 25){
				arr = 	[
							[1,0,0,0],
							[1,1,0,0],
							[0,0,0,0],
							[0,0,0,0]
						];
			} else if(type == 26){
				arr = 	[
							[0,1,0,0],
							[1,1,0,0],
							[0,0,0,0],
							[0,0,0,0]
						];
			} else if(type == 27){
				arr = 	[
							[1,0,0,0],
							[0,0,0,0],
							[0,0,0,0],
							[0,0,0,0]
						];
			}
			return arr;
		}
		function checkLineComplete(){
			// Check if there is a full line (horizontal / vertical)
			// Horizontal
			for(let y=0; y<blockCountLine; y++){
				let isLineFull = true;
				for(let x=0; x<blockCountLine; x++){
					if(!arrBoard[y][x]){
						isLineFull = false;
					}
				}
				if(isLineFull){
					return true;
				}
			}
			// Vertical
			for(let x=0; x<blockCountLine; x++){
				let isLineFull = true;
				for(let y=0; y<blockCountLine; y++){
					if(!arrBoard[y][x]){
						isLineFull = false;
					}
				}
				if(isLineFull){
					return true;
				}
			}
			return false;

		}
		function removeMatchingBlocks(){
			let totalLine = 0;
			let arrMatchHorizontal = [];
			let arrMatchVertical = [];
			let executedCells = [];
			// Horizontal
			for(let y=0; y<blockCountLine; y++){
				let isLineFull = true;
				for(let x=0; x<blockCountLine; x++){
					if(!arrBoard[y][x]){
						isLineFull = false;
					}
				}
				if(isLineFull){
					for(let x=0; x<blockCountLine; x++){
						executedCells.push({x:x, y:y});
					}
					totalLine++;
					arrMatchHorizontal.push(y);
				}
			}
			// Vertical
			for(let x=0; x<blockCountLine; x++){
				let isLineFull = true;
				for(let y=0; y<blockCountLine; y++){
					if(!arrBoard[y][x]){
						isLineFull = false;
					}
				}
				if(isLineFull){
					for(let y=0; y<blockCountLine; y++){
						executedCells.push({x:x, y:y});
					}
					totalLine++;
					arrMatchVertical.push(x);
				}
			}
			if(executedCells.length){
				for(let cell of executedCells){
					arrBoard[cell.y][cell.x] = 0;
				}
			}	
			if(arrMatchHorizontal.length){
				// There is a matching in horizontal line
				for(let y of arrMatchHorizontal){
					let x = 0;
					self.time.addEvent({
						delay: 50,
						callback: ()=>{
							for(let block of blocks){
								if(block.pos.x == x && block.pos.y == y){
									self.tweens.add({
										targets: block,
										scaleX: 0,
										scaleY: 0,
										rotation: 5,
										duration: 300,
										ease: 'Sine.easeIn',
										onComplete: ()=>{
											moveBlockToPool(block.pos);
										}
									});
								}
							}
							x++;
						},
						repeat: 10
					});
				}
			}
			if(arrMatchVertical.length){
				// There is a matching in vertical line
				for(let x of arrMatchVertical){
					let y = 0;
					self.time.addEvent({
						delay: 50,
						callback: ()=>{
							for(let block of blocks){
								if(block.pos.x == x && block.pos.y == y){
									self.tweens.add({
										targets: block,
										scaleX: 0,
										scaleY: 0,
										rotation: 5,
										duration: 300,
										ease: 'Sine.easeIn',
										onComplete: ()=>{
											moveBlockToPool(block.pos);
										}
									});
								}
							}
							y++;
						},
						repeat: 10
					});
				}
			}
			if(totalLine > 0){
				addScore(totalLine*10);
				if(totalLine > 1){
					// Get bonus combo
					let bonusAmount = totalLine*5;
					addScore(bonusAmount);
					showBonus(bonusAmount);
				}
				self.time.delayedCall(200, ()=>{
					playSound('clear', self);
					checkIsReadyToShowAdsPopup();
				});
			}
		}
		function addScore(num){
			score += num;
			txt_score.setText(score);
		}
		function showBonus(num){
			txt_bonus.alpha = 0;
			txt_bonus.y = txt_bonus.defY;
			txt_bonus.setText('+'+num);
			self.children.bringToTop(txt_bonus);
			self.tweens.add({
				targets: txt_bonus,
				alpha: 1,
				duration: 400,
				ease: 'Sine.easeOut',
				onComplete: ()=>{
					playSound('bonus', self);
					self.tweens.add({
						targets: txt_bonus,
						alpha: 0,
						duration: 400,
						ease: 'Sine.easeIn',
						delay: 500
					});
				}
			});
		}
		function checkGameover(){
			let availableBlockTypes = [];
			for(let block of smallBlocks){
				if(!availableBlockTypes.includes(block.patternType)){
					availableBlockTypes.push(block.patternType);
				}
			}
			if(availableBlockTypes.length){
				for(let type of availableBlockTypes){
					for(let y=0; y<blockCountLine; y++){
						for(let x=0; x<blockCountLine; x++){
							if(canDropped(type, {x:x, y:y})){
								return false;
							}
						}
					}
				}
			} else {
				return false;
			}
			return true;
		}
		function gameover(){
			playSound('gameover', self);
			if(score > bestscore){
				bestscore = score;
				saveData(storageKey, score);
			}
			state = 'gameover';
			let dark = self.add.rectangle(0,0,config.width,config.height,0x000000).setOrigin(0);
			dark.setInteractive();
			dark.alpha = 0;
			self.tweens.add({
				targets: dark,
				alpha: 0.5,
				duration: 200,
			});
			let win = self.add.sprite(360, 570, 'popup_gameover');
			let title = self.add.sprite(360, 240, 'txt_gameover');
			self.add.sprite(config.width/2, 400, 'bar_scoregameover');
			self.add.text(320, 400, score, {fontFamily: 'LilitaOne', fontSize: 45, align: 'left',color: '#ffffff'}).setOrigin(0, 0.5);
			self.add.sprite(config.width/2, 500, 'bar_highscore');
			self.add.text(320, 500+8, bestscore, {fontFamily: 'LilitaOne', fontSize: 45, align: 'left',color: '#ffffff'}).setOrigin(0, 0.5);
			let b_restart = createButton(360, 640, 'restart', self);
			let b_menu = createButton(360, 760, 'menu', self);
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
			let win = self.add.sprite(360, 570, 'popup_pause');
			let title = self.add.sprite(360, 240, 'txt_pause');
			let b_resume = createButton(360, 420, 'resume', self);
			let b_restart = createButton(360, 540, 'restart', self);
			let b_sound = createButton(360, 660, 'sound_on', self);
			let b_menu = createButton(360, 780, 'menu', self);
			setSoundButton(b_sound);
			popup.addMultiple([dark, win, title, b_resume, b_restart, b_menu,b_sound]);
		}

		function showAdsPopup(){
			state = 'paused';
			let dark = self.add.rectangle(0,0,config.width,config.height,0x000000).setOrigin(0);
			dark.alpha = 0;
			let txt_congrad = self.add.text(360, -100, "Congradulations!", {fontFamily: 'sans-serif', fontStyle: 'bold', fontSize: 64, align: 'center',color: '#f3d40c'}).setOrigin(0.5, 0.5);
			let txt_yourScore = self.add.text(360, -100, "Your score:", {fontFamily: 'sans-serif', fontStyle: 'bold', fontSize: 38, align: 'center',color: '#ffffff'}).setOrigin(0.5, 0.5);
			let txt_score = self.add.text(360, -100, score, {fontFamily: 'sans-serif', fontStyle: 'bold', fontSize: 64, align: 'center',color: '#ffffff'}).setOrigin(0.5, 0.5);
			let txt_tapToMoveOn = self.add.text(360, 980, "tap to move on", {fontFamily: 'sans-serif', fontStyle: 'bold', fontSize: 36, align: 'center',color: '#ffffff'}).setOrigin(0.5, 0.5);
			txt_congrad.rotation= 70;
			txt_yourScore.rotation= 70;
			txt_score.rotation= 70;

			self.tweens.add({targets: dark,alpha: 0.7,duration: 200,});
			self.tweens.add({targets: txt_tapToMoveOn,alpha: 0.0,duration: 700,yoyo: true,repeat: 1000,ease: 'Cubic.easeInOut'});
			self.tweens.add({targets: txt_congrad,duration: 500,y: 260,angle:0,ease: 'Cubic.easeOut'});
			self.tweens.add({targets: txt_yourScore,duration: 500,y: 460,angle:0,ease: 'Cubic.easeOut'});
			self.tweens.add({targets: txt_score,duration: 500,y: 530,angle:0,ease: 'Cubic.easeOut'});

			dark.setInteractive().on('pointerdown', () => {
				self.tweens.add({targets: dark,alpha: 0.0,duration: 500,});
				self.tweens.add({targets: txt_tapToMoveOn,alpha: 0.0,duration: 500,ease: 'Cubic.easeIn'});
				self.tweens.add({targets: txt_congrad,duration: 500,y: -100,angle:7,ease: 'Cubic.easeIn'});
				self.tweens.add({targets: txt_yourScore,duration: 500,y: -100,angle:70,ease: 'Cubic.easeIn'});
				self.tweens.add({targets: txt_score,duration: 500,y: -100,angle:70,ease: 'Cubic.easeIn',
					onComplete: ()=>{adsPopupClose();}
				});
			});
			popup.addMultiple([dark,txt_congrad,txt_score,txt_tapToMoveOn,txt_yourScore]);
		}

		function checkIsReadyToShowAdsPopup(){
			if(is_ready_to_show_ads_popup){
				showAdsPopup();
				is_ready_to_show_ads_popup = false;
			} 
		}
		
		function adsPopupClose(){
			popup.clear(true, true);
			state = 'play';
		}
		
	}
	setReadyToShowAds(){
		is_ready_to_show_ads_popup = true;
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
	 physics: {
		default: 'arcade',
		arcade: {
			debug: true,
		}
	},
	scene: [Boot, Load, Menu, Game],
}
var game = new Phaser.Game(config);