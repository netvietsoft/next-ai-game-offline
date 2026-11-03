
////////////////////////////////////////////////////////////
// GAME v1.2
////////////////////////////////////////////////////////////

/*!
 * 
 * GAME SETTING CUSTOMIZATION START
 * 
 */

var gameSettings = {
	timer:3600000,
	board:{
		row:5,
		column:5,
		size:80
	},
	speed:{
		fade:.5,
		rotate:1,
		highlight:.2,
		mergeIn:.4,
		mergeExpandDelay:.1,
		mergeExpand:.3,
		destroySpeed:.2,
		destroyMainDelay:.2,
		destoryAbsorb:.2,
		destoryExpand:1,
		destoryCollapse:.2,
	},
	score:{
		standard:50,
		bonus:20,
		combo:50,
		ruby:300,
	}
}

//dices arr
var dicesArr = [
	{
		assets:[
			"assets/dice_one.png",
			"assets/dice_two.png",
			"assets/dice_three.png",
			"assets/dice_four.png",
			"assets/dice_five.png",
			"assets/dice_six.png",
			"assets/dice_power.png",
			"assets/dice_white.png",
		],
		regX:40,
		regY:59,
		particles:[
			"assets/item_shine_1.png",
			"assets/item_shine_2.png",
			"assets/item_shine_3.png",
			"assets/item_shine_4.png",
			"assets/item_shine_5.png",
			"assets/item_shine_6.png",
		]
	}
]

//game test display
var textDisplay = {
					intstruction1:"DRAG DICE ON THE BOARD",
					intstruction2:"ROTATE DICE THAT ARE PAIRS",
					intstruction3:"PLACE 3 OR MORE LIKE-NUMBERED\nDICE TO MERGE AND SCORE",
					combo:"COMBOX[NUMBER]",
					timesup:"TIME\'S UP",
					outOfRoom:"OUT OF ROOM",
					score:"[NUMBER]PTS",
					exitTitle:"EXIT GAME",
					exitMessage:'Are you sure\nyou want to\nquit the game?',
					resultTitle:"GAME OVER",
					share:'SHARE YOUR SCORE',
					resultDesc:'[NUMBER]PTS'
				}

//Social share, [SCORE] will replace with game score
var shareEnable = false; //toggle share
var shareTitle = 'Highscore on Merge Dice is [SCORE]PTS';//social share score title
var shareMessage = '[SCORE]PTS is mine new highscore on Merge Dice game! Try it now!'; //social share score message

/*!
 *
 * GAME SETTING CUSTOMIZATION END
 *
 */
$.editor = {enable:false};
var playerData = {score:0};
var gameData = {paused:true, square:[], diceIndex:0, rotate:{x:0, y:0}};
var tweenData = {score:0, tweenScore:0};
var timeData = {enable:false, startDate:null, nowDate:null, timer:0, oldTimer:0};
var protonData = {proton:null, emitter:[]};

/*!
 * 
 * GAME BUTTONS - This is the function that runs to setup button event
 * 
 */
function buildGameButton(){
	$(window).focus(function() {
		if(!buttonSoundOn.visible){
			toggleSoundInMute(false);
		}

		if (typeof buttonMusicOn != "undefined") {
			if(!buttonMusicOn.visible){
				toggleMusicInMute(false);
			}
		}
	});
	
	$(window).blur(function() {
		if(!buttonSoundOn.visible){
			toggleSoundInMute(true);
		}

		if (typeof buttonMusicOn != "undefined") {
			if(!buttonMusicOn.visible){
				toggleMusicInMute(true);
			}
		}
	});

	buttonPlay.cursor = "pointer";
	buttonPlay.addEventListener("click", function(evt) {
		playSound('soundButton');
		goPage('game');
	});

	itemExit.addEventListener("click", function(evt) {
	});
	
	buttonContinue.cursor = "pointer";
	buttonContinue.addEventListener("click", function(evt) {
		playSound('soundButton');
		stopGame();
		goPage('main');
	});
	
	buttonFacebook.cursor = "pointer";
	buttonFacebook.addEventListener("click", function(evt) {
		share('facebook');
	});
	
	buttonTwitter.cursor = "pointer";
	buttonTwitter.addEventListener("click", function(evt) {
		share('twitter');
	});
	buttonWhatsapp.cursor = "pointer";
	buttonWhatsapp.addEventListener("click", function(evt) {
		share('whatsapp');
	});
	
	buttonSoundOff.cursor = "pointer";
	buttonSoundOff.addEventListener("click", function(evt) {
		toggleSoundMute(true);
	});
	
	buttonSoundOn.cursor = "pointer";
	buttonSoundOn.addEventListener("click", function(evt) {
		toggleSoundMute(false);
	});

	if (typeof buttonMusicOff != "undefined") {
		buttonMusicOff.cursor = "pointer";
		buttonMusicOff.addEventListener("click", function(evt) {
			toggleMusicMute(true);
		});
	}
	
	if (typeof buttonMusicOn != "undefined") {
		buttonMusicOn.cursor = "pointer";
		buttonMusicOn.addEventListener("click", function(evt) {
			toggleMusicMute(false);
		});
	}
	
	buttonFullscreen.cursor = "pointer";
	buttonFullscreen.addEventListener("click", function(evt) {
		toggleFullScreen();
	});
	
	buttonExit.cursor = "pointer";
	buttonExit.addEventListener("click", function(evt) {
		togglePop(true);
		toggleOption();
	});
	
	buttonSettings.cursor = "pointer";
	buttonSettings.addEventListener("click", function(evt) {
		toggleOption();
	});
	
	buttonConfirm.cursor = "pointer";
	buttonConfirm.addEventListener("click", function(evt) {
		playSound('soundButton');
		togglePop(false);
		
		stopAudio();
		stopGame();
		goPage('main');
	});
	
	buttonCancel.cursor = "pointer";
	buttonCancel.addEventListener("click", function(evt) {
		playSound('soundButton');
		togglePop(false);
	});
}


/*!
 * 
 * TOGGLE POP - This is the function that runs to toggle popup overlay
 * 
 */
function togglePop(con){
	confirmContainer.visible = con;
}


/*!
 * 
 * DISPLAY PAGES - This is the function that runs to display pages
 * 
 */
var curPage=''
function goPage(page){
	curPage=page;
	
	mainContainer.visible = false;
	gameContainer.visible = false;
	resultContainer.visible = false;
	
	var targetContainer = null;
	switch(page){
		case 'main':
			targetContainer = mainContainer;

			stopMusicLoop("musicGame");
			playMusicLoop("musicMain");
		break;
		
		case 'game':
			targetContainer = gameContainer;
			startGame();

			stopMusicLoop("musicMain");
			playMusicLoop("musicGame");
		break;
		
		case 'result':
			targetContainer = resultContainer;
			togglePop(false);
			playSound('soundResult');

			tweenData.tweenScore = 0;
			TweenMax.to(tweenData, .5, {tweenScore:playerData.score, overwrite:true, onUpdate:function(){
				resultDescTxt.text = resultDescShadowTxt.text = textDisplay.resultDesc.replace('[NUMBER]', addCommas(Math.floor(tweenData.tweenScore)));
			}});

			saveGame(playerData.score);
		break;
	}
	
	if(targetContainer != null){
		targetContainer.visible = true;
		targetContainer.alpha = 0;
		TweenMax.to(targetContainer, .5, {alpha:1, overwrite:true});
	}
	
	resizeCanvas();
}

/*!
 * 
 * START GAME - This is the function that runs to start game
 * 
 */
function startGame(){
	gameData.paused = false;
	gameData.dragCon = false;
	gameData.ready = false;
	gameData.over = false;
	gameData.animating = false;
	gameData.rotating = false;
	gameData.dice = [];
	gameData.place = [];
	
	statusContainer.alpha = 0;
	timeData.countdown = gameSettings.timer;
	playerData.score = 0;

	gameData.tutorialNum = 0;
	instructionContainer.alpha = 0;

	itemDestroy.alpha = 0;
	playSound('soundStart');
	buildBoard();
	showNextDice(true);
	updateGameScore();
	gameTimerTxt.text = gameTimerRedTxt.text = millisecondsToTimeGame(timeData.countdown);

	TweenMax.to(diceContainer, .5, {overwrite:true, onComplete:function(){
		toggleGameTimer(true);
		gameData.ready = true;
	}});
}

 /*!
 * 
 * STOP GAME - This is the function that runs to stop play game
 * 
 */
function stopGame(){
	TweenMax.killAll(false, true, false);
	toggleGameTimer(false);
	gameData.paused = true;
	destoryProton();
}

function saveGame(score){
	if ( typeof toggleScoreboardSave == 'function' ) { 
		$.scoreData.score = score;
		if(typeof type != 'undefined'){
			$.scoreData.type = type;
		}
		toggleScoreboardSave(true);
	}

	/*$.ajax({
      type: "POST",
      url: 'saveResults.php',
      data: {score:score},
      success: function (result) {
          console.log(result);
      }
    });*/
}

/*!
 * 
 * RESIZE GAME LAYOUT - This is the function that runs for resize game layout
 * 
 */
function resizeGameLayout(){
	statusContainer.x = canvasW/2;
	statusContainer.y = canvasH/2;

	if(viewport.isLandscape){
		boardContainer.x = canvasW/2;
		boardContainer.y = canvasH/2;

		instructionContainer.x = boardContainer.x;
		instructionContainer.y = boardContainer.y + ((gameSettings.board.size * gameSettings.board.row)/1.7);

		scoreDisplayContainer.x = boardContainer.x;
		scoreDisplayContainer.y = boardContainer.y;

		particlesContainer.x = boardContainer.x;
		particlesContainer.y = boardContainer.y;

		diceContainer.x = boardContainer.x;
		diceContainer.y = boardContainer.y;

		rotateContainer.x = boardContainer.x+ (canvasW/100 * 30);
		rotateContainer.y = boardContainer.y;

		scoreContainer.x = offset.x + 30;
		scoreContainer.y = offset.y + 10;

		timerContainer.x = scoreContainer.x;
		timerContainer.y = scoreContainer.y + 70;
	}else{
		boardContainer.x = canvasW/2;
		boardContainer.y = canvasH/100 * 37;

		instructionContainer.x = boardContainer.x;
		instructionContainer.y = boardContainer.y + ((gameSettings.board.size * gameSettings.board.row)/1.7);

		scoreDisplayContainer.x = boardContainer.x;
		scoreDisplayContainer.y = boardContainer.y;

		particlesContainer.x = boardContainer.x;
		particlesContainer.y = boardContainer.y;

		diceContainer.x = boardContainer.x;
		diceContainer.y = boardContainer.y;

		rotateContainer.x = boardContainer.x;
		rotateContainer.y = boardContainer.y + (canvasH/100 * 38);

		scoreContainer.x = offset.x + 30;
		scoreContainer.y = offset.y + 10;

		timerContainer.x = scoreContainer.x;
		timerContainer.y = scoreContainer.y + 70;
	}

	gameData.rotate.x = rotateContainer.x - diceContainer.x;
	gameData.rotate.y = rotateContainer.y - diceContainer.y;

	positionDice(false, false);
}

/*!
 * 
 * BUILD BOARD - This is the function that runs to build game board
 * 
 */
function buildBoard(){
	gameData.board = {
		row:gameSettings.board.row,
		column:gameSettings.board.column,
		size:gameSettings.board.size
	}

	var pos = {x:0, y:0, sx:0, sy:0};
	pos.sx = -(((gameData.board.column-1) * gameData.board.size)/2);
	pos.sy = -(((gameData.board.row-1) * gameData.board.size)/2);
	pos.x = pos.sx;
	pos.y = pos.sy;

	scoreDisplayContainer.removeAllChildren();
	boardContainer.removeAllChildren();
	diceContainer.removeAllChildren();

	var fillArr = [0,0,5,5,0,0,4,0,4,4,7,7,0,3,3];
	var fillIndex = 0;
	fillArr = [];
	
	for(var r=0; r<gameData.board.row; r++){
		for(var c=0; c<gameData.board.column; c++){
			$.board[r+'_'+c] = new createjs.Bitmap(loader.getResult('itemHighlight'));
			centerReg($.board[r+'_'+c]);
			$.board[r+'_'+c].row = r;
			$.board[r+'_'+c].column = c;
			$.board[r+'_'+c].x = pos.x;
			$.board[r+'_'+c].y = pos.y;
			$.board[r+'_'+c].placed = null;
			$.board[r+'_'+c].alpha = 0;
			$.board[r+'_'+c].highlight = false;
			$.board[r+'_'+c].possibleNumber = -1;
			
			pos.x += gameData.board.size;
			boardContainer.addChild($.board[r+'_'+c]);

			if(fillIndex < fillArr.length){
				if(fillArr[fillIndex] != 0){
					var newDice = createDice(false, fillArr[fillIndex], true);
					newDice.x = $.board[r+'_'+c].x;
					newDice.y = $.board[r+'_'+c].y;
					$.board[r+'_'+c].placed = newDice;
				}
				fillIndex++;
			}
		}

		pos.x = pos.sx;
		pos.y += gameData.board.size;
	}

	boardContainer.addChild(itemDestroy, itemBoard);
}

/*!
 * 
 * SHOW NEXT DICE - This is the function that runs to show next dice
 * 
 */
function showNextDice(first){
	gameData.nextDice = [];
	gameData.rotateDice = [];
	gameData.rotateNum = 0;

	var availableSlots = 0;
	var maxDiceNumber = 0;
	var maxDice = 1;
	for(var r=0; r<gameData.board.row; r++){
		for(var c=0; c<gameData.board.column; c++){
			if($.board[r+'_'+c].placed != null){
				if($.board[r+'_'+c].placed.number > maxDiceNumber){
					maxDiceNumber = $.board[r+'_'+c].placed.number;
				}
			}else{
				availableSlots++;
				if(maxDice == 1){
					maxDice = checkNearbySlot(r,c);
				}
			}
		}
	}
	
	if(availableSlots == 0){
		playSound('soundError');
		showGameStatus("outofroom");
		endGame();
	}else{
		var possibleArr = [];
		for(var n=0; n<maxDiceNumber; n++){
			possibleArr.push(n+1);
		}

		if(first){
			gameData.nextDice = [1];
		}else{
			if(maxDiceNumber == 1){
				possibleArr = [1,2];
			}

			shuffle(possibleArr);
			if(possibleArr.length > 1 && maxDice == 2){
				var totalRotate = randomBoolean() == true ? 1 : 2;
				for(var n=0; n<totalRotate; n++){
					gameData.nextDice.push(possibleArr[n]);
				}
			}else{
				gameData.nextDice = [possibleArr[0]];
			}
		}
		
		//gameData.nextDice = [7,4];
		for(var n=0; n<gameData.nextDice.length; n++){
			var newDice = createDice(true, gameData.nextDice[n], false);
		}

		positionDice(true, false);
	}

	toggleTutorial();
}

function toggleTutorial(){
	if(gameData.tutorialNum == 0){
		gameInstructionTxt.text = gameInstructionShadowTxt.text = textDisplay.intstruction1;
	}else if(gameData.tutorialNum == 1){
		gameInstructionTxt.text = gameInstructionShadowTxt.text = textDisplay.intstruction2;
	}else if(gameData.tutorialNum == 2){
		gameInstructionTxt.text = gameInstructionShadowTxt.text = textDisplay.intstruction3;
	}

	gameData.tutorialNum++;
	if(gameData.tutorialNum < 4){
		animateTutorial(instructionContainer);
	}else{
		TweenMax.killTweensOf(instructionContainer);
		instructionContainer.alpha = 0;
	}
}

function checkNearbySlot(thisRow, thisColumn){
	var totalSlot = 0;
	var nextRow, nextColumn;

	for(var d=0; d<4; d++){
		nextRow = thisRow;
		nextColumn = thisColumn;

		if(d == 0){
			nextRow--;
			nextRow = nextRow < 0 ? 0 : nextRow;
		}else if(d == 1){
			nextColumn++;
			nextColumn = nextColumn > gameData.board.column-1 ? gameData.board.column-1 : nextColumn;
		}else if(d == 2){
			nextRow++;
			nextRow = nextRow > gameData.board.row-1 ? gameData.board.row-1 : nextRow;
		}else if(d == 3){
			nextColumn--;
			nextColumn = nextColumn < 0 ? 0 : nextColumn;
		}

		if(thisRow != nextRow || thisColumn != nextColumn){
			if($.board[nextRow+'_'+nextColumn].placed == null){
				totalSlot++;
			}
		}
	}

	totalSlot = totalSlot >= 1 ? 2 : totalSlot;
	return totalSlot;
}

/*!
 * 
 * CREATE DICE - This is the function that runs to create dice
 * 
 */
function createDice(con, number, placed){
	var newDice = new createjs.Container();
	var newDiceShape = new createjs.Bitmap(loader.getResult('dice'+gameData.diceIndex+'_'+(number-1)));
	newDiceShape.regX = dicesArr[gameData.diceIndex].regX;
	newDiceShape.regY = dicesArr[gameData.diceIndex].regY;

	var newDiceWhite = new createjs.Bitmap(loader.getResult('dice'+gameData.diceIndex+'_'+7));
	newDiceWhite.regX = dicesArr[gameData.diceIndex].regX;
	newDiceWhite.regY = dicesArr[gameData.diceIndex].regY;
	newDiceWhite.visible = false;

	newDice.white = newDiceWhite;
	newDice.number = number;
	newDice.placed = placed;
	newDice.angle = 0;
	newDice.addChild(newDiceShape, newDiceWhite);
	animateDiceBlink(newDiceWhite);

	diceContainer.addChild(newDice);
	gameData.dice.push(newDice);
	addDiceEvents(newDice);

	if(con){
		gameData.rotateDice.push(newDice);
	}

	return newDice;
}

function positionDice(animate, rotate){
	if(!gameData.ready && !animate){
		return;
	}

	var anglePos = [0,0];

	if(gameData.rotateDice.length > 1){
		if(gameData.rotateNum == 0){
			anglePos[0] = 0;
			anglePos[1] = 180;
		}else if(gameData.rotateNum == 1){
			anglePos[0] = 90;
			anglePos[1] = 270;
		}else if(gameData.rotateNum == 2){
			anglePos[0] = 180;
			anglePos[1] = 360;
		}else if(gameData.rotateNum == 3){
			anglePos[0] = 270;
			anglePos[1] = 450;
		}

		for(var n=0; n<gameData.rotateDice.length; n++){
			var thisDice = gameData.rotateDice[n];
			var angleNum = anglePos[n] - 90;
			if(gameData.rotateNum == 0){
				if(n == 0){
					thisDice.angle = -180;
				}else{
					thisDice.angle = 0;
				}
			}
			if(animate){
				if(n == 0){
					playSound("soundDice");
				}
				fadeInDice(thisDice, angleNum);
			}else{
				rotateDice(thisDice, angleNum, rotate);
			}
		}
	}else{
		for(var n=0; n<gameData.rotateDice.length; n++){
			var thisDice = gameData.rotateDice[n];
			thisDice.x = thisDice.oriX = gameData.rotate.x;
			thisDice.y = thisDice.oriY = gameData.rotate.y;

			if(animate){
				playSound("soundDice");
				fadeInDice(thisDice,-1);
			}
		}
	}
}

function fadeInDice(thisDice,angleNum){
	thisDice.scaleX = thisDice.scaleY = .5;
	thisDice.x = gameData.rotate.x;
	thisDice.y = gameData.rotate.y;
	
	if(angleNum == -1){
		TweenMax.to(thisDice, gameSettings.speed.fade, {scaleX:1, scaleY:1, ease:Back.easeOut, overwrite:true});
	}else{
		thisDice.angle = angleNum;
		var diceSpace = gameData.board.size/2;
		var pos = getAnglePosition(gameData.rotate.x,gameData.rotate.y,diceSpace,angleNum);
		TweenMax.to(thisDice, gameSettings.speed.fade, {scaleX:1, scaleY:1, x:pos.x, y:pos.y, ease:Back.easeOut, overwrite:true});
		thisDice.oriX = pos.x;
		thisDice.oriY = pos.y;
	}
}

function rotateDice(thisDice,angleNum,animation){
	var diceSpace = gameData.board.size/2;

	if(animation){
		gameData.rotating = true;
		TweenMax.to(thisDice, gameSettings.speed.rotate, {angle:angleNum, overwrite:true, ease:Elastic.easeOut, onUpdate:function(){
			var pos = getAnglePosition(gameData.rotate.x,gameData.rotate.y,diceSpace,thisDice.angle);
			thisDice.x = thisDice.oriX = pos.x;
			thisDice.y = thisDice.oriY = pos.y;
			updateChildrenIndex();
		}, onComplete:rotateDiceComplete, onCompleteParams:[thisDice]});
	}else{
		TweenMax.killTweensOf(thisDice);
		thisDice.scaleX = thisDice.scaleY = 1;
		thisDice.angle = angleNum;
		var pos = getAnglePosition(gameData.rotate.x,gameData.rotate.y,diceSpace,angleNum);
		thisDice.x = thisDice.oriX = pos.x;
		thisDice.y = thisDice.oriY = pos.y;
	}
}

function rotateDiceComplete(thisDice){
	if(thisDice == gameData.rotateDice[0]){
		gameData.rotating = false;
	}
}

/*!
 * 
 * DICE EVENTS - This is the function that runs to build dice events
 * 
 */
function addDiceEvents(dice){
	dice.cursor = "pointer";
	dice.addEventListener("mousedown", function(evt) {
		toggleDiceDragEvent(evt, 'drag')
	});
	dice.addEventListener("pressmove", function(evt) {
		toggleDiceDragEvent(evt, 'move')
	});
	dice.addEventListener("pressup", function(evt) {
		toggleDiceDragEvent(evt, 'drop')
	});
}

function toggleDiceDragEvent(obj, con){
	if(gameData.paused){
		return;
	}

	if(obj.currentTarget.placed){
		return;
	}

	if(gameData.animating){
		return;
	}

	if(gameData.over){
		return;
	}
	
	switch(con){
		case 'drag':
			if(!gameData.dragCon){
				playSound("soundDiceDrag");
				if(gameData.rotating){
					gameData.rotating = false;
					positionDice(false, false);
				}

				var global = diceContainer.localToGlobal(obj.currentTarget.x, obj.currentTarget.y);
				obj.currentTarget.offset = {x:global.x-(obj.stageX), y:global.y-(obj.stageY)};

				if(gameData.rotateNum == 2){
					for(var n=gameData.rotateDice.length-1; n>=0; n--){
						var thisDice = gameData.rotateDice[n];
						diceContainer.setChildIndex(thisDice, diceContainer.numChildren-1);
					}
				}else{
					for(var n=0; n<gameData.rotateDice.length; n++){
						var thisDice = gameData.rotateDice[n];
						diceContainer.setChildIndex(thisDice, diceContainer.numChildren-1);
					}
				}
				gameData.dragCon = true;
			}
		break;
		
		case 'move':
			if(gameData.dragCon){
				var local = diceContainer.globalToLocal(obj.stageX, obj.stageY);
				var moveX = ((local.x) + obj.currentTarget.offset.x);
				var moveY = ((local.y) + obj.currentTarget.offset.y);
				obj.currentTarget.x = moveX;
				obj.currentTarget.y = moveY;

				gameData.store = [];
				gameData.place = [];
				gameData.highlight = [];
				gameData.possible = [];
				var squareRatio = 2;
				for(var n=0; n<gameData.rotateDice.length; n++){
					var thisDice = gameData.rotateDice[n];
					if(thisDice != obj.currentTarget){
						if(gameData.rotateNum == 0 || gameData.rotateNum == 2){
							thisDice.x = moveX + (obj.currentTarget.oriX - thisDice.oriX);
							thisDice.y = moveY - (obj.currentTarget.oriY - thisDice.oriY);
						}else if(gameData.rotateNum == 1 || gameData.rotateNum == 3){
							thisDice.x = moveX - (obj.currentTarget.oriX - thisDice.oriX);
							thisDice.y = moveY - (obj.currentTarget.oriY - thisDice.oriY);
						}
					}

					for(var r=0; r<gameData.board.row; r++){
						for(var c=0; c<gameData.board.column; c++){
							var thisBoard = $.board[r+'_'+c];
							if(thisBoard.placed == null){
								if(thisDice.x >= thisBoard.x - (gameData.board.size/squareRatio) && thisDice.x <= thisBoard.x + (gameData.board.size/squareRatio)){
									if(thisDice.y >= thisBoard.y - (gameData.board.size/squareRatio) && thisDice.y <= thisBoard.y + (gameData.board.size/squareRatio)){
										thisBoard.possibleNumber = thisDice.number;
										gameData.highlight.push(thisBoard);
										gameData.store.push(thisBoard);
										gameData.place.push(thisBoard);
									}
								}
							}
						}
					}
				}

				highlightDice(true);
				resetHighlight(false);
			}
		break;
		
		case 'drop':
			highlightDice(false);
			if(obj.currentTarget.x == obj.currentTarget.oriX && obj.currentTarget.y == obj.currentTarget.oriY){
				gameData.rotateNum++;
				gameData.rotateNum = gameData.rotateNum > 3 ? 0 : gameData.rotateNum;
				positionDice(false, true);
				playSound("soundDiceRotate");
			}else{
				var foundDropZone = false;
				if(gameData.place.length == gameData.rotateDice.length){
					foundDropZone = true;
					gameData.diceAnimate = gameData.rotateDice.length;
					for(var n=0; n<gameData.rotateDice.length; n++){
						var thisDice = gameData.rotateDice[n];
						thisDice.placed = true;

						var thisBoard = gameData.place[n];
						thisBoard.placed = thisDice;
						animateDice(thisDice, gameData.place[n].x, gameData.place[n].y, true);
					}
				}
	
				if(!foundDropZone && gameData.dragCon){
					gameData.diceAnimate = gameData.rotateDice.length;
					for(var n=0; n<gameData.rotateDice.length; n++){
						var thisDice = gameData.rotateDice[n];
						animateDice(thisDice, thisDice.oriX, thisDice.oriY, false);
					}
				}
			}

			resetHighlight(true);
			gameData.dragCon = false;
		break;
	}
}

/*!
 * 
 * CHECK MERGE - This is the function that runs to check merge
 * 
 */
function checkMergeDice(){
	//order
	if(gameData.place.length > 1){
		if(gameData.place[0].placed != null && gameData.place[1].placed != null){
			var firstDiceNumber = gameData.place[0].placed.number;
			var secondDiceNumber = gameData.place[1].placed.number;
			if(firstDiceNumber > secondDiceNumber){
				var b = gameData.place[0];
				gameData.place[0] = gameData.place[1];
				gameData.place[1] = b;
			}
		}
	}

	gameData.animationDelay = .2;
	gameData.mergeAnimation = [];
	loopMergeAnimation();
}

function loopPlace(){
	var possibleArr = [];
	var boardArr = [];
	var tryArr = [];

	var thisBoard = gameData.place[0];
	if(thisBoard.placed != null){
		var diceNum = thisBoard.placed.number;
		tryArr.push({r:thisBoard.row, c:thisBoard.column});
		boardArr.push({r:thisBoard.row, c:thisBoard.column});
		possibleArr.push(thisBoard.row+"_"+thisBoard.column);

		var totalTry = gameData.board.row * gameData.board.column;
		for(var t=0; t<totalTry; t++){
			if(tryArr.length > 0){
				var matchArr = checkNextBoard(tryArr[0].r, tryArr[0].c, diceNum);
				tryArr.splice(0,1);

				for(var m=0; m<matchArr.length; m++){
					var matchBoard = matchArr[m].r+"_"+matchArr[m].c;
					if(possibleArr.indexOf(matchBoard) == -1){
						possibleArr.push(matchBoard);
						tryArr.push({r:matchArr[m].r, c:matchArr[m].c});
						boardArr.push({r:matchArr[m].r, c:matchArr[m].c});
					}
				}
			}else{
				t = totalTry;
			}
		}

		if(boardArr.length > 2){
			var originalBoard = $.board[thisBoard.row+'_'+thisBoard.column];
			gameData.mergeAnimation.push({board:originalBoard, boardArr:boardArr});
		}
	}

	gameData.place.splice(0,1);
}

function loopMergeAnimation(){
	if(gameData.place.length > 0){
		loopPlace();
	}

	gameData.animating = true;
	if(gameData.mergeAnimation.length > 0){
		TweenMax.to(diceContainer, gameData.animationDelay, {overwrite:true, onComplete:function(){
			gameData.animationDelay = 0;

			var originalBoard = gameData.mergeAnimation[0].board;
			if(originalBoard.placed != null){
				var boardArr = gameData.mergeAnimation[0].boardArr;
				var diceNumber = originalBoard.placed.number;
				var destroyAnimation = false;
				for(var b=0; b<boardArr.length; b++){
					var possibleBoard = $.board[boardArr[b].r+'_'+boardArr[b].c];
					var thisDice = possibleBoard.placed;
					possibleBoard.placed = null;

					if(b == 0){
						setFocusChildIndex(thisDice);
						if(diceNumber == 7){
							playSound("soundDestroy");
							destroyAnimation = true;
							createParticles(originalBoard, "explode");
							animateDestroy(originalBoard, thisDice, gameSettings.speed.destroyMainDelay);
						}else{
							playSound("soundScore");
							createParticles(originalBoard, "score");
							animateMerge(originalBoard, thisDice, gameSettings.speed.mergeExpand, gameSettings.speed.mergeExpandDelay, true, diceNumber, boardArr.length);
						}
					}else{
						var speedNum = gameSettings.speed.mergeIn;
						speedNum = destroyAnimation == true ? gameSettings.speed.destoryAbsorb : speedNum;
						animateMerge(originalBoard, thisDice, speedNum, 0, false);
					}
				}
			}else{
				gameData.mergeAnimation.splice(0,1);
				loopMergeAnimation();
			}
		}});
	}else{
		if(gameData.place.length > 0){
			loopMergeAnimation();
		}else if(gameData.afterMerge > 0){
			gameData.afterMerge--;
			for(var n=0; n<gameData.store.length; n++){
				gameData.place.push(gameData.store[n]);
			}
			checkMergeDice();
		}else{
			gameData.animating = false;
			showNextDice(false);
			resetHighlight(true);
		}
	}

	updateChildrenIndex();
}

function checkNextBoard(thisRow, thisColumn, diceNum){
	var matchArr = [];
	var nextRow, nextColumn;

	for(var d=0; d<4; d++){
		nextRow = thisRow;
		nextColumn = thisColumn;

		if(d == 0){
			nextRow--;
			nextRow = nextRow < 0 ? 0 : nextRow;
		}else if(d == 1){
			nextColumn++;
			nextColumn = nextColumn > gameData.board.column-1 ? gameData.board.column-1 : nextColumn;
		}else if(d == 2){
			nextRow++;
			nextRow = nextRow > gameData.board.row-1 ? gameData.board.row-1 : nextRow;
		}else if(d == 3){
			nextColumn--;
			nextColumn = nextColumn < 0 ? 0 : nextColumn;
		}

		if(thisRow != nextRow || thisColumn != nextColumn){
			if($.board[nextRow+'_'+nextColumn].placed != null){
				if($.board[nextRow+'_'+nextColumn].placed.number == diceNum){
					matchArr.push({r:nextRow, c:nextColumn});
				}
			}
		}
	}

	return matchArr;
}

/*!
 * 
 * ANIMATION - This is the function that runs for animation
 * 
 */
function animateTutorial(obj){
	obj.alpha = 1;
	TweenMax.to(obj, .3, {alpha:.5, overwrite:true, onComplete:function(){
		TweenMax.to(obj, .3, {alpha:1, overwrite:true, onComplete:animateTutorial, onCompleteParams:[obj]});
	}});
}

function animateDiceBlink(obj){
	obj.alpha = 0;
	TweenMax.to(obj, .3, {alpha:.2, overwrite:true, onComplete:function(){
		TweenMax.to(obj, .3, {alpha:0, overwrite:true, onComplete:animateDiceBlink, onCompleteParams:[obj]});
	}});
}

function animateDice(thisDice,x,y,check){
	gameData.animating = true;
	TweenMax.to(thisDice, .2, {x:x, y:y, overwrite:true, onComplete:animateDiceComplete, onCompleteParams:[check]});
}

function animateDiceComplete(check){
	gameData.diceAnimate--;
	if(gameData.diceAnimate == 0){
		gameData.animating = false;
		if(check){
			playSound("soundDiceDrop");
			gameData.combo = 0;
			gameData.afterMerge = 3;
			checkMergeDice();
		}else{
			playSound("soundDiceRevert");
		}
	}
}

function animateMerge(toBoard, dice, speed, delay, con, number, merge){
	if(con){
		gameData.scoreNum = gameSettings.score.standard;
		if(merge > 3){
			gameData.scoreNum += (gameSettings.score.bonus * (merge-3));
		}
		if(gameData.combo > 0){
			gameData.scoreNum += (gameSettings.score.combo * gameData.combo);
			createScoreDisplay(toBoard, "combo", gameData.scoreNum, gameData.combo);
		}else{
			createScoreDisplay(toBoard, "score", gameData.scoreNum);
		}
		gameData.combo++;

		var scaleNum = 2;
		TweenMax.to(dice, speed, {delay:delay, scaleX:scaleNum, scaleY:scaleNum, ease:Back.easeIn, overwrite:true, onComplete:function(){
			playSound("soundDiceAbsorb");

			var newDice = createDice(false, number+1, true);
			newDice.x = toBoard.x;
			newDice.y = toBoard.y;
			toBoard.placed = newDice;
			newDice.alpha = 0;
			newDice.scaleX = newDice.scaleY = 0;
			TweenMax.to(newDice, speed, {scaleX:1, scaleY:1, alpha:1, ease:Back.easeOut, overwrite:true});
			TweenMax.to(dice, speed, {scaleX:1, scaleY:1, alpha:0, ease:Back.easeOut, overwrite:true, onComplete:function(){
				diceContainer.removeChild(dice);
				playerData.score += gameData.scoreNum;
				Android.scoreInGame(playerData.score);
				updateGameScore();

				gameData.mergeAnimation.splice(0,1);
				loopMergeAnimation();
			}});
		}});
	}else{
		TweenMax.to(dice, speed, {delay:delay, x:toBoard.x, y:toBoard.y, ease:Back.easeIn, overwrite:true, onUpdate:function(){
			updateChildrenIndex();
		}, onComplete:function(){
			diceContainer.removeChild(dice);
		}});
	}
}

function animateDestroy(toBoard, dice, delay){
	var mainRange = 5;
	var nearbyRange = 3;
	var nearbyDicesArr = [];

	itemDestroy.x = toBoard.x;
	itemDestroy.y = toBoard.y;
	TweenMax.to(itemDestroy, gameSettings.speed.destoryExpand, {delay:delay, alpha:1, overwrite:true});

	gameData.scoreNum = gameSettings.score.ruby;
	
	playSound("soundDiceAbsorb");
	var scaleNum = 2;
	TweenMax.to(dice, gameSettings.speed.destoryExpand, {delay:delay, scaleX:scaleNum, scaleY:scaleNum, overwrite:true, onStart:function(){
		nearbyDicesArr = getNearbyDices(toBoard.row, toBoard.column);
	}, onUpdate:function(){
		var randomX = randomIntFromInterval(-mainRange,mainRange);
		var randomY = randomIntFromInterval(-mainRange,mainRange);

		dice.x = toBoard.x + randomX;
		dice.y = toBoard.y + randomY;

		for(var n=0; n<nearbyDicesArr.length; n++){
			var randomX = randomIntFromInterval(-nearbyRange,nearbyRange);
			var randomY = randomIntFromInterval(-nearbyRange,nearbyRange);
			var thisDice = nearbyDicesArr[n];

			thisDice.x = thisDice.oriX + randomX;
			thisDice.y = thisDice.oriY + randomY;
			TweenMax.killTweensOf(thisDice.white);
			thisDice.white.visible = true;
			thisDice.white.alpha = 1-(2-dice.scaleX);
		}
	}, onComplete:function(){
		createScoreDisplay(toBoard, "score", gameData.scoreNum);
		playSound("soundDiceDestroy");
		animateDestroyDice(dice,0,true);
		TweenMax.to(itemDestroy, gameSettings.speed.destoryCollapse, {alpha:0, overwrite:true});
		for(var n=0; n<nearbyDicesArr.length; n++){
			var thisDice = nearbyDicesArr[n];
			animateDestroyDice(thisDice, 0, false);
		}
	}});
}

function getNearbyDices(thisRow,thisColumn){
	var matchArr = [];
	var nextRow, nextColumn;
	for(var d=0; d<8; d++){
		nextRow = thisRow;
		nextColumn = thisColumn;

		if(d == 0){
			nextRow--;
			nextRow = nextRow < 0 ? 0 : nextRow;
		}else if(d == 1){
			nextColumn++;
			nextColumn = nextColumn > gameData.board.column-1 ? gameData.board.column-1 : nextColumn;
		}else if(d == 2){
			nextRow++;
			nextRow = nextRow > gameData.board.row-1 ? gameData.board.row-1 : nextRow;
		}else if(d == 3){
			nextColumn--;
			nextColumn = nextColumn < 0 ? 0 : nextColumn;
		}else if(d == 4){
			nextRow--;
			nextRow = nextRow < 0 ? 0 : nextRow;
			nextColumn--;
			nextColumn = nextColumn < 0 ? 0 : nextColumn;
		}else if(d == 5){
			nextRow--;
			nextRow = nextRow < 0 ? 0 : nextRow;
			nextColumn++;
			nextColumn = nextColumn > gameData.board.column-1 ? gameData.board.column-1 : nextColumn;
		}else if(d == 6){
			nextRow++;
			nextRow = nextRow > gameData.board.row-1 ? gameData.board.row-1 : nextRow;
			nextColumn--;
			nextColumn = nextColumn < 0 ? 0 : nextColumn;
		}else if(d == 7){
			nextRow++;
			nextRow = nextRow > gameData.board.row-1 ? gameData.board.row-1 : nextRow;
			nextColumn++;
			nextColumn = nextColumn > gameData.board.column-1 ? gameData.board.column-1 : nextColumn;
		}

		if(thisRow != nextRow || thisColumn != nextColumn){
			if($.board[nextRow+'_'+nextColumn].placed != null){
				var thisDice = $.board[nextRow+'_'+nextColumn].placed;
				$.board[nextRow+'_'+nextColumn].placed = null;

				thisDice.oriX = $.board[nextRow+'_'+nextColumn].x;
				thisDice.oriY = $.board[nextRow+'_'+nextColumn].y;
				matchArr.push(thisDice);
			}
		}
	}

	return matchArr;
}

function animateDestroyDice(obj, delay, con){
	TweenMax.to(obj, gameSettings.speed.destoryCollapse, {delay:delay, scaleX:0, scaleY:0, ease:Back.easeIn, overwrite:true, onComplete:function(){
		diceContainer.removeChild(obj);
		if(con){
			playerData.score += gameData.scoreNum;
			updateGameScore();
			Android.scoreInGame(playerData.score);
			gameData.mergeAnimation.splice(0,1);
			loopMergeAnimation();
		}
	}});
}

function animateHighlight(obj){
	obj.alpha = 1;
	obj.visible = true;
	TweenMax.to(obj, gameSettings.speed.highlight, {alpha:.5, overwrite:true, onComplete:function(){
		TweenMax.to(obj, gameSettings.speed.highlight, {alpha:1, overwrite:true, onComplete:animateHighlight, onCompleteParams:[obj]});
	}});
}

function resetHighlight(con){
	if(con){
		gameData.highlight = [];
	}
	
	for(var r=0; r<gameData.board.row; r++){
		for(var c=0; c<gameData.board.column; c++){
			var thisBoard = $.board[r+'_'+c];
			var resetBoard = true;
			if(thisBoard.placed == null){
				if(gameData.highlight.indexOf(thisBoard) != -1){
					resetBoard = false;
					if(!thisBoard.highlight){
						thisBoard.highlight = true;
						animateHighlight(thisBoard);
					}
				}
			}

			if(resetBoard){
				thisBoard.visible = false;
				TweenMax.killTweensOf(thisBoard);
				thisBoard.highlight = false;
			}
		}
	}
}

function highlightDice(con){
	for(var r=0; r<gameData.board.row; r++){
		for(var c=0; c<gameData.board.column; c++){
			if($.board[r+'_'+c].placed != null){
				$.board[r+'_'+c].placed.white.visible = false;
				animateDiceBlink($.board[r+'_'+c].placed.white);
			}
		}
	}

	if(con){
		for(var n=0; n<gameData.highlight.length; n++){
			var thisBoard = gameData.highlight[n];

			var possibleArr = [];
			var boardArr = [];
			var tryArr = [];

			var diceNum = thisBoard.possibleNumber;
			tryArr.push({r:thisBoard.row, c:thisBoard.column});
			boardArr.push({r:thisBoard.row, c:thisBoard.column});
			possibleArr.push(thisBoard.row+"_"+thisBoard.column);

			var totalTry = gameData.board.row * gameData.board.column;
			for(var t=0; t<totalTry; t++){
				if(tryArr.length > 0){
					var matchArr = checkNextBoard(tryArr[0].r, tryArr[0].c, diceNum);
					tryArr.splice(0,1);

					for(var m=0; m<matchArr.length; m++){
						var matchBoard = matchArr[m].r+"_"+matchArr[m].c;
						if(possibleArr.indexOf(matchBoard) == -1){
							possibleArr.push(matchBoard);
							tryArr.push({r:matchArr[m].r, c:matchArr[m].c});
							boardArr.push({r:matchArr[m].r, c:matchArr[m].c});
						}
					}
				}else{
					t = totalTry;
				}
			}

			if(boardArr.length > 2){
				for(var b=0; b<boardArr.length; b++){
					var thisDice = $.board[boardArr[b].r+'_'+boardArr[b].c].placed;
					if(thisDice != null){
						thisDice.white.visible = true;
					}
				}
			}
		}
	}
}

function animateTimer(){
	gameTimerRedTxt.alpha = 1;
	TweenMax.to(gameTimerRedTxt, .5, {alpha:0, overwrite:true});
}

/*!
 * 
 * CREATE PROTON - This is the function that runs to create proton particles
 * 
 */
function createParticles(originalBoard, type) {
	if(protonData.proton == null){
		protonData.proton = new Proton();

		var renderer = new Proton.EaselRenderer(particlesContainer);
		protonData.proton.addRenderer(renderer);
	}

	var newProton = new Proton.Emitter();
	newProton.rate = new Proton.Rate(new Proton.Span(5, 10), new Proton.Span(.01, .015));
	
	var textures = new createjs.Shape();
	textures.graphics.beginFill("#fff").drawCircle(0, 0, 5);
	var textures = [];
	for(var p = 0; p<dicesArr[gameData.diceIndex].particles.length; p++){
		var newParticle = new createjs.Bitmap(loader.getResult('particle'+gameData.diceIndex+'_'+p));
		centerReg(newParticle);
		textures.push(newParticle);
	}

	newProton.addInitialize(new Proton.Mass(1));
	newProton.addInitialize(new Proton.Life(0, 1));
	newProton.addInitialize(new Proton.Body(textures));
	newProton.addInitialize(new Proton.Velocity(new Proton.Span(1, 2), new Proton.Span(0, 20, true), 'polar'));
	
	newProton.addBehaviour(new Proton.Alpha(1, 0));
	newProton.addBehaviour(new Proton.Scale(.5, 1));
	newProton.addBehaviour(new Proton.RandomDrift(5, 0, .15));
	newProton.addBehaviour(new Proton.Rotate(new Proton.Span(0, 360), new Proton.Span([-10, -5, 5, 15, 10]), 'add'));

	newProton.emit(5);
	protonData.proton.addEmitter(newProton);

	var thisEmitter = newProton.p;
	thisEmitter.x = originalBoard.x;
	thisEmitter.y = originalBoard.y;

	var destroySpeed = 5;
	if(type == "score"){
		var size = gameSettings.board.size/2;
		var path = [
			{x:originalBoard.x, y:originalBoard.y-size},
			{x:originalBoard.x+size, y:originalBoard.y},
			{x:originalBoard.x, y:originalBoard.y+size},
			{x:originalBoard.x-size, y:originalBoard.y}
		];
		TweenMax.to(thisEmitter, gameSettings.speed.mergeExpand, {bezier:{curviness:1.5, values:path}, ease:Linear.easeNone, overwrite:true, onComplete:function(){
			var pt = diceContainer.globalToLocal(scoreContainer.x, scoreContainer.y);
			TweenMax.to(thisEmitter, .5, {x:pt.x+100, y:pt.y+50, overwrite:true, onComplete:function(){
				playSound("soundGlass");
				newProton.addInitialize(new Proton.Life(0, 0));
				TweenMax.to(thisEmitter, destroySpeed, {overwrite:true, onComplete:function(){
					newProton.destroy();
				}})
			}})
		}})
	}else{
		var size = gameSettings.board.size * 1.3;
		var path = [
			{x:originalBoard.x, y:originalBoard.y-size},
			{x:originalBoard.x+size, y:originalBoard.y},
			{x:originalBoard.x, y:originalBoard.y+size},
			{x:originalBoard.x-size, y:originalBoard.y},
			{x:originalBoard.x, y:originalBoard.y-size},
		];
		thisEmitter.x = path[0].x;
		thisEmitter.y = path[0].y;
		TweenMax.to(thisEmitter, .6, {repeat:1, bezier:{curviness:1.5, values:path}, ease:Linear.easeNone, overwrite:true, onComplete:function(){
			thisEmitter.x = originalBoard.x;
			thisEmitter.y = originalBoard.y;
			var pt = diceContainer.globalToLocal(scoreContainer.x, scoreContainer.y);
			TweenMax.to(thisEmitter, .5, {x:pt.x+100, y:pt.y+50, overwrite:true, onComplete:function(){
				playSound("soundGlass");
				newProton.addInitialize(new Proton.Life(0, 0));
				TweenMax.to(thisEmitter, destroySpeed, {overwrite:true, onComplete:function(){
					newProton.destroy();
				}})
			}})
		}})
	}
}

function destoryProton(){
	if(protonData.proton){
		protonData.proton.destroy();
	}
	particlesContainer.removeAllChildren();
}

function loopParticles(){
	if (protonData.proton) {
		protonData.proton.update();
	}
}

/*!
 * 
 * GAME TIMER - This is the function that runs for game timer
 * 
 */
function toggleGameTimer(con){	
	if(con){
		timeData.oldTimer = -1;
		timeData.startDate = new Date();
		gameTimerRedTxt.alpha = 0;
	}else{
		
	}
	timeData.enable = con;
}

/*!
 * 
 * UPDATE GAME - This is the function that runs to loop game update
 * 
 */
function updateGame(event){
	if(!gameData.paused){
		if(timeData.enable){
			timeData.nowDate = new Date();
			timeData.elapsedTime = Math.floor((timeData.nowDate.getTime() - timeData.startDate.getTime()));
			timeData.timer = Math.floor((timeData.countdown) - (timeData.elapsedTime));

			if(timeData.oldTimer == -1){
				timeData.oldTimer = timeData.timer;
			}
		
			if(timeData.timer <= 1000){
				//stop
				animateTimer();
				playSound('soundTimerEnd');
				showGameStatus("timesup");
				endGame();
			}else{
				if((timeData.oldTimer - timeData.timer) > 1000){
					if(timeData.timer < 6000){
						animateTimer()
						playSound('soundTimer');
					}
					timeData.oldTimer = timeData.timer;
				}
			}
			gameTimerTxt.text = gameTimerRedTxt.text = millisecondsToTimeGame(timeData.timer);
		}

		loopParticles();
	}
}

function updateChildrenIndex(){
	diceContainer.sortChildren(sortFunction);
}

function setFocusChildIndex(dice){
	var sameRowArr = [];
	for (var n= 0; n<diceContainer.numChildren; n++) {
		var thisDice = diceContainer.getChildAt(n);
		if(thisDice.y == dice.y){
			sameRowArr.push(thisDice);
		}
	}

	var index = diceContainer.getChildIndex(sameRowArr[sameRowArr.length-1]);
	diceContainer.setChildIndex(dice, index);
}

var sortFunction = function(obj1, obj2, options) {
	if (obj1.y > obj2.y) { return 1; }
	if (obj1.y < obj2.y) { return -1; }
	return 0;
}

/*!
 * 
 * GAME STATUS - This is the function that runs for game status
 * 
 */
function showGameStatus(status){
	var textStatus = "";
	if(status == "outofroom"){
		textStatus = textDisplay.outOfRoom;
	}else if(status == "timesup"){
		textStatus = textDisplay.timesup;
	}

	gameStatusTxt.text = textStatus;
	TweenMax.to(statusContainer, .5, {alpha:1, overwrite:true});
}

/*!
 * 
 * GAME SCORE - This is the function that runs for game score
 * 
 */
function createScoreDisplay(toBoard, type, score, combo){
	var textSize = 30;
	var lineHeight = 30;
	var newScoreDisplay = new createjs.Container();
	var newScoreDisplayTxt = new createjs.Text();
	newScoreDisplayTxt.font = textSize + "px fignoregular";
	newScoreDisplayTxt.color = "#fff";
	newScoreDisplayTxt.textAlign = "center";
	newScoreDisplayTxt.textBaseline='alphabetic';
	newScoreDisplayTxt.lineHeight = lineHeight;

	var newScoreDisplayShadowTxt = new createjs.Text();
	newScoreDisplayShadowTxt.font = textSize + "px fignoregular";
	newScoreDisplayShadowTxt.color = "#000";
	newScoreDisplayShadowTxt.textAlign = "center";
	newScoreDisplayShadowTxt.textBaseline='alphabetic';
	newScoreDisplayShadowTxt.y = 3;
	newScoreDisplayShadowTxt.lineHeight = lineHeight;

	if(type == "score"){
		newScoreDisplayTxt.text = newScoreDisplayShadowTxt.text = textDisplay.score.replace("[NUMBER]", score);
	}else if(type == "combo"){
		newScoreDisplayTxt.text = newScoreDisplayShadowTxt.text = textDisplay.combo.replace("[NUMBER]", combo)+'\n'+textDisplay.score.replace("[NUMBER]", score);
	}
	
	newScoreDisplay.addChild(newScoreDisplayShadowTxt, newScoreDisplayTxt);
	scoreDisplayContainer.addChild(newScoreDisplay);

	newScoreDisplay.x = toBoard.x;
	newScoreDisplay.y = toBoard.y;
	newScoreDisplay.alpha = 0;

	TweenMax.to(newScoreDisplay, .5, {alpha:1, y:toBoard.y-40, scaleX:1.3, scaleY:1.3, ease:Sine.easeIn, overwrite:true, onComplete:function(){
		TweenMax.to(newScoreDisplay, 1, {y:toBoard.y-70, alpha:0, scaleX:1, scaleY:1, ease:Sine.easeOut, overwrite:true, onComplete:function(){
		
		}});
	}});
}

function updateGameScore(){
	TweenMax.to(tweenData, .5, {tweenScore:playerData.score, overwrite:true, onUpdate:function(){
		gameScoreTxt.text = textDisplay.score.replace("[NUMBER]", addCommas(Math.floor(tweenData.tweenScore)));
	}});
}

/*!
 * 
 * END GAME - This is the function that runs for game end
 * 
 */
function endGame(){
	gameData.over = true;
	toggleGameTimer(false);

	TweenMax.to(gameContainer, 3, {overwrite:true, onComplete:function(){
		goPage('result')
	}});
}

/*!
 * 
 * MILLISECONDS CONVERT - This is the function that runs to convert milliseconds to time
 * 
 */
function millisecondsToTimeGame(milli) {
	var milliseconds = milli % 1000;
	var seconds = Math.floor((milli / 1000) % 60);
	var minutes = Math.floor((milli / (60 * 1000)) % 60);
	
	if(seconds<10){
		seconds = '0'+seconds;  
	}
	
	if(minutes<10){
		minutes = '0'+minutes;  
	}
	
	return minutes+':'+seconds;
}

/*!
 * 
 * OPTIONS - This is the function that runs to toggle options
 * 
 */

function toggleOption(){
	if(optionsContainer.visible){
		optionsContainer.visible = false;
	}else{
		optionsContainer.visible = true;
	}
}


/*!
 * 
 * OPTIONS - This is the function that runs to mute and fullscreen
 * 
 */
function toggleSoundMute(con){
	buttonSoundOff.visible = false;
	buttonSoundOn.visible = false;
	toggleSoundInMute(con);
	if(con){
		buttonSoundOn.visible = true;
	}else{
		buttonSoundOff.visible = true;	
	}
}

function toggleMusicMute(con){
	buttonMusicOff.visible = false;
	buttonMusicOn.visible = false;
	toggleMusicInMute(con);
	if(con){
		buttonMusicOn.visible = true;
	}else{
		buttonMusicOff.visible = true;	
	}
}

function toggleFullScreen() {
  if (!document.fullscreenElement &&    // alternative standard method
      !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement ) {  // current working methods
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    } else if (document.documentElement.msRequestFullscreen) {
      document.documentElement.msRequestFullscreen();
    } else if (document.documentElement.mozRequestFullScreen) {
      document.documentElement.mozRequestFullScreen();
    } else if (document.documentElement.webkitRequestFullscreen) {
      document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  }
}

/*!
 * 
 * SHARE - This is the function that runs to open share url
 * 
 */
function share(action){
	
	var loc = location.href
	loc = loc.substring(0, loc.lastIndexOf("/") + 1);
	
	var title = '';
	var text = '';
	
	title = shareTitle.replace("[SCORE]", addCommas(playerData.score));
	text = shareMessage.replace("[SCORE]", addCommas(playerData.score));
	
	var shareurl = '';
	
	if( action == 'twitter' ) {
		shareurl = 'https://twitter.com/intent/tweet?url='+loc+'&text='+text;
	}else if( action == 'facebook' ){
		shareurl = 'https://www.facebook.com/sharer/sharer.php?u='+encodeURIComponent(loc+'share.php?desc='+text+'&title='+title+'&url='+loc+'&thumb='+loc+'share.jpg&width=590&height=300');
	}else if( action == 'google' ){
		shareurl = 'https://plus.google.com/share?url='+loc;
	}else if( action == 'whatsapp' ){
		shareurl = "whatsapp://send?text=" + encodeURIComponent(text) + " - " + encodeURIComponent(loc);
	}
}