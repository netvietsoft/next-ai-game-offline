////////////////////////////////////////////////////////////
// GAME v1.0
////////////////////////////////////////////////////////////

/*!
 * 
 * GAME SETTING CUSTOMIZATION START
 * 
 */

//themes
var themes_arr = [
	{
		bg:{
			front:"assets/theme_bg_01.png",
			back:"assets/theme_cover_01.png",
			pos:[
				{x:-25,y:0},
				{x:25,y:0},
			]
		},
		highlight:{
			image:"assets/theme_highlight_01.png"
		},
		shadow:{
			image:"assets/theme_shadow_01.png"
		},
		numbers:{
			image:"assets/theme_numbers_01.png",
			width:45,
			height:45
		}
	},
	{
		bg:{
			front:"assets/theme_bg_02.png",
			back:"assets/theme_cover_02.png",
			pos:[
				{x:-25,y:0},
				{x:25,y:0},
			]
		},
		highlight:{
			image:"assets/theme_highlight_02.png"
		},
		shadow:{
			image:"assets/theme_shadow_02.png"
		},
		numbers:{
			image:"assets/theme_numbers_02.png",
			width:45,
			height:45
		}
	},
	{
		bg:{
			front:"assets/theme_bg_03.png",
			back:"assets/theme_cover_03.png",
			pos:[
				{x:-25,y:0},
				{x:25,y:0},
			]
		},
		highlight:{
			image:"assets/theme_highlight_03.png"
		},
		shadow:{
			image:"assets/theme_shadow_01.png"
		},
		numbers:{
			image:"assets/theme_numbers_03.png",
			width:45,
			height:45
		}
	},
	{
		bg:{
			front:"assets/theme_bg_04.png",
			back:"assets/theme_cover_04.png",
			pos:[
				{x:-25,y:0},
				{x:25,y:0},
			]
		},
		highlight:{
			image:"assets/theme_highlight_04.png"
		},
		shadow:{
			image:"assets/theme_shadow_01.png"
		},
		numbers:{
			image:"assets/theme_numbers_04.png",
			width:45,
			height:45
		}
	},
	{
		bg:{
			front:"assets/theme_bg_05.png",
			back:"assets/theme_cover_05.png",
			pos:[
				{x:-25,y:0},
				{x:25,y:0},
			]
		},
		highlight:{
			image:"assets/theme_highlight_05.png"
		},
		shadow:{
			image:"assets/theme_shadow_01.png"
		},
		numbers:{
			image:"assets/theme_numbers_05.png",
			width:45,
			height:45
		}
	},
];

//tiles
var tiles_arr = [
	[0,0],[0,1],[0,2],[0,3],[0,4],[0,5],[0,6],
	[1,1],[1,2],[1,3],[1,4],[1,5],[1,6],[2,2],
	[2,3],[2,4],[2,5],[2,6],[3,3],[3,4],[3,5],
	[3,6],[4,4],[4,5],[4,6],[5,5],[5,6],[6,6],
]

//game settings
var gameSettings = {
	tileSpace:10,
	tilePlacedSpace:2,
	tileShadowSpace:5,
	tileMoveSpeed:.5,
	tileDealSpeed:.4,
	aiThinkSpeed:1.5,
	aiDrawSpeed:1,
	dragToMove:true, //drag tile to move, false for click to move
	autoMove:false, //auto move when one tile or signle movement
	points:[100,150,200], //score points option
	playerTotalTiles:[ //total tiles for players
		{players:2, tiles:7},
		{players:3, tiles:5},
		{players:4, tiles:5},
	]
};

//game text display
var textDisplay = {
					optionsTitle:'OPTIONS',
					totalPlayers:"[NUMBER] PLAYERS",
					goalPoint:"GOAL [NUMBER]PTS",
					typeDraw:"DRAW DOMINOES",
					typeBlock:"BLOCK DOMINOES",
					playerName:'PLAYER [NUMBER]',
					playerScore:'[NUMBER]PTS',
					highestToStart:"HIGHEST TO START",
					playerNoMove:"NO POSSIBLE MOVES",
					playerCantMove:"CAN'T MOVE",
					playerBlocked:"LOCKED",
					userPickDomino:"PICK A DOMINO",
					playerPickDomino:"[NAME] IS PICKING A DOMINO",
					playerDomino:"DOMINO!",
					playerRoundWin:"YOU WIN THIS ROUND",
					playerRoundLose:"YOU LOSE THIS ROUND",
					roundEnd:"ROUND END",
					goalPointTitle:"GOAL POINT ([NUMBER]PTS)",
					playerScoreAdd:" (+[NUMBER]PTS)",
					userWin:"YOU WIN THE GAME",
					playerWin:"[NAME] WIN THE GAME",
					exitTitle:'EXIT GAME',
					exitMessage:'Are you sure you want\nto quit game?',
					share:'SHARE YOUR SCORE:',
					resultTitle:"GAME OVER",
					resultDesc:'[NUMBER]PTS',
				}

//Social share, [SCORE] will replace with game score
var shareEnable = false; //toggle share
var shareTitle = 'Highscore on Play Dominoes is [SCORE]PTS';//social share score title
var shareMessage = '[SCORE]PTS is mine new highscore on Play Dominoes game! Try it now!'; //social share score message

/*!
 *
 * GAME SETTING CUSTOMIZATION END
 *
 */
$.editor = {enable:false};
var playerData = {score:0, scores:[]};
var gameData = {paused:true, moving:false, player:0, players:0, pointIndex:0, themeIndex:0, drawing:false, ai:true, complete:false, names:[]};
var tweenData = {score:0, tweenScore:0};

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
		if ( typeof initSocket == 'function' && multiplayerSettings.enable) {
			if(multiplayerSettings.localPlay){
				toggleMainButton('local');
			}else{
				checkQuickGameMode();
			}
		}else{
			goPage("options");
		}
	});

	buttonLocal.cursor = "pointer";
	buttonLocal.addEventListener("click", function(evt) {
		playSound('soundButton');
		socketData.online = false;
		goPage("options");
	});

	buttonOnline.cursor = "pointer";
	buttonOnline.addEventListener("click", function(evt) {
		playSound('soundButton');
		checkQuickGameMode();
	});

	buttonPlayersL.cursor = "pointer";
	buttonPlayersL.addEventListener("click", function(evt) {
		playSound('soundButton');
		toggleTotalPlayers(false);
	});

	buttonPlayersR.cursor = "pointer";
	buttonPlayersR.addEventListener("click", function(evt) {
		playSound('soundButton');
		toggleTotalPlayers(true);
	});

	buttonPointsL.cursor = "pointer";
	buttonPointsL.addEventListener("click", function(evt) {
		playSound('soundButton');
		togglePoints(false);
	});

	buttonPointsR.cursor = "pointer";
	buttonPointsR.addEventListener("click", function(evt) {
		playSound('soundButton');
		togglePoints(true);
	});

	buttonTypeL.cursor = "pointer";
	buttonTypeL.addEventListener("click", function(evt) {
		playSound('soundButton');
		toggleGameType(false);
	});

	buttonTypeR.cursor = "pointer";
	buttonTypeR.addEventListener("click", function(evt) {
		playSound('soundButton');
		toggleGameType(true);
	});

	buttonThemeL.cursor = "pointer";
	buttonThemeL.addEventListener("click", function(evt) {
		playSound('soundButton');
		toggleTheme(false);
	});

	buttonThemeR.cursor = "pointer";
	buttonThemeR.addEventListener("click", function(evt) {
		playSound('soundButton');
		toggleTheme(true);
	});

	buttonNext.cursor = "pointer";
	buttonNext.addEventListener("click", function(evt) {
		playSound('soundButton');
		toggleDominoOptions(false);
	});

	buttonStart.cursor = "pointer";
	buttonStart.addEventListener("click", function(evt) {
		playSound('soundButton');
		if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
			postSocketUpdate('start');
		}else{
			goPage("game");
		}
	});
	
	itemExit.addEventListener("click", function(evt) {
	});
	
	buttonContinue.cursor = "pointer";
	buttonContinue.addEventListener("click", function(evt) {
		playSound('soundButton');
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

		if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
			exitSocketRoom();
		}
	});
	
	buttonCancel.cursor = "pointer";
	buttonCancel.addEventListener("click", function(evt) {
		playSound('soundButton');
		togglePop(false);
	});

	// itemDrawBg.addEventListener("click", function(evt) {
	// });

	gameData.domino = {
		draw:false,
		point:20,
	};
	
	gameData.maxPlayers = 4;
	gameData.minPlayers = 2;
	gameData.players = gameData.minPlayers;
	gameData.pointIndex = 0;
	gameData.themeIndex = 0;
	gameData.lastThemeIndex = -1;
	gameData.optionsFirst = true;

	displayDominoOptions();
}

/*!
 * 
 * TOGGLE GAME TYPE - This is the function that runs to toggle game type
 * 
 */
function toggleMainButton(con){
	if ( typeof initSocket == 'function' && multiplayerSettings.enable) {
		gameLogsTxt.visible = true;
		gameLogsTxt.text = '';
	}

	buttonPlay.visible = false;
	buttonLocalContainer.visible = false;

	if(con == 'default'){
		buttonPlay.visible = true;
	}else if(con == 'local'){
		buttonLocalContainer.visible = true;
	}
}

function checkQuickGameMode(){
	socketData.online = true;
	if(!multiplayerSettings.enterName){
		buttonPlay.visible = false;
		buttonLocalContainer.visible = false;

		addSocketRandomUser();
	}else{
		goPage('name');
	}
}

function toggleTotalPlayers(con){
	if(con){
		gameData.players++;
		gameData.players = gameData.players > gameData.maxPlayers ? gameData.maxPlayers : gameData.players;
	}else{
		gameData.players--;
		gameData.players = gameData.players < gameData.minPlayers ? gameData.minPlayers : gameData.players;
	}

	displayDominoOptions();
	if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
		if(socketData.host){
			postSocketUpdate('updateoptions', {pointIndex:gameData.pointIndex, draw:gameData.domino.draw, themeIndex:gameData.themeIndex, options:gameData.optionsFirst}, true);
		}
	}
}

function togglePoints(con){
	if(con){
		gameData.pointIndex++;
		gameData.pointIndex = gameData.pointIndex > gameSettings.points.length-1 ? gameSettings.points.length-1 : gameData.pointIndex;
	}else{
		gameData.pointIndex--;
		gameData.pointIndex = gameData.pointIndex < 0 ? 0 : gameData.pointIndex;
	}

	displayDominoOptions();
	if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
		if(socketData.host){
			postSocketUpdate('updateoptions', {pointIndex:gameData.pointIndex, draw:gameData.domino.draw, themeIndex:gameData.themeIndex, options:gameData.optionsFirst}, true);
		}
	}
}

function toggleGameType(con){
	gameData.domino.draw = con;

	displayDominoOptions();
	if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
		if(socketData.host){
			postSocketUpdate('updateoptions', {pointIndex:gameData.pointIndex, draw:gameData.domino.draw, themeIndex:gameData.themeIndex, options:gameData.optionsFirst}, true);
		}
	}
}

function toggleTheme(con){
	if(con){
		gameData.themeIndex++;
		gameData.themeIndex = gameData.themeIndex > themes_arr.length-1 ? themes_arr.length-1 : gameData.themeIndex;
	}else{
		gameData.themeIndex--;
		gameData.themeIndex = gameData.themeIndex < 0 ? 0 : gameData.themeIndex;
	}

	displayDominoOptions();
	if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
		if(socketData.host){
			postSocketUpdate('updateoptions', {pointIndex:gameData.pointIndex, draw:gameData.domino.draw, themeIndex:gameData.themeIndex, options:gameData.optionsFirst}, true);
		}
	}
}

function displayDominoOptions(){
	totalPlayersTxt.text = textDisplay.totalPlayers.replace("[NUMBER]", gameData.players);
	pointsTxt.text = textDisplay.goalPoint.replace("[NUMBER]", gameSettings.points[gameData.pointIndex]);
	typeTxt.text = gameData.domino.draw == true ? textDisplay.typeDraw : textDisplay.typeBlock;

	gameData.domino.point = gameSettings.points[gameData.pointIndex];

	//theme
	if(gameData.lastThemeIndex != gameData.themeIndex){
		gameData.lastThemeIndex = gameData.themeIndex;

		themeContainer.removeAllChildren();
		var newDomino = new createjs.Container();

		var newBgFront = new createjs.Bitmap(loader.getResult('themeBgFront'+gameData.themeIndex));
		centerReg(newBgFront);
		newDomino.addChild(newBgFront);

		var _frameW = themes_arr[gameData.themeIndex].numbers.width;
		var _frameH = themes_arr[gameData.themeIndex].numbers.height;
		var _frame = {"regX": _frameW/2, "regY": _frameW/2, "count": 7, "width": _frameW, "height": _frameH};
		var _animations = {animate:{frames: [0,1,2,3,4,5,6], speed:1}};
		
		var numbersData = new createjs.SpriteSheet({
			"images": [loader.getResult('themeNumbers'+gameData.themeIndex).src],
			"frames": _frame,
			"animations": _animations
		});
		
		var numbersAnimate = new createjs.Sprite(numbersData, "animate");
		numbersAnimate.framerate = 20;
		
		var randomTile = Math.floor(Math.random() * tiles_arr.length);
		for(var p=0; p<themes_arr[gameData.themeIndex].bg.pos.length; p++){
			var newNumbers = numbersAnimate.clone(true);
			newNumbers.x = themes_arr[gameData.themeIndex].bg.pos[p].x;
			newNumbers.y = themes_arr[gameData.themeIndex].bg.pos[p].y;
			newNumbers.gotoAndStop(tiles_arr[randomTile][p]);
			newDomino.addChild(newNumbers);
		}

		newDomino.scaleX = newDomino.scaleY = 1.2;
		themeContainer.addChild(newDomino);
	}
}

function toggleDominoOptions(con){
	gameData.optionsFirst = con;

	itemPlayerNumbers.visible = false;
	totalPlayersTxt.visible = false;
	buttonPlayersL.visible = false;
	buttonPlayersR.visible = false;

	itemPoints.visible = false;
	pointsTxt.visible = false;
	buttonPointsL.visible = false;
	buttonPointsR.visible = false;

	itemType.visible = false;
	typeTxt.visible = false;
	buttonTypeL.visible = false;
	buttonTypeR.visible = false;

	themeContainer.visible = false;
	buttonThemeL.visible = false;
	buttonThemeR.visible = false;

	buttonNext.visible = false;
	buttonStart.visible = false;
		
	if(con){
		itemPoints.visible = true;
		pointsTxt.visible = true;
		buttonPointsL.visible = true;
		buttonPointsR.visible = true;

		itemType.visible = true;
		typeTxt.visible = true;
		buttonTypeL.visible = true;
		buttonTypeR.visible = true;

		buttonNext.visible = true;

		if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
			if(!socketData.host){
				buttonPointsL.visible = false;
				buttonPointsR.visible = false;
				buttonTypeL.visible = false;
				buttonTypeR.visible = false;
				buttonNext.visible = false;
			}
		}
	}else{
		itemPlayerNumbers.visible = true;
		totalPlayersTxt.visible = true;
		buttonPlayersL.visible = true;
		buttonPlayersR.visible = true;

		themeContainer.visible = true;
		buttonThemeL.visible = true;
		buttonThemeR.visible = true;

		buttonStart.visible = true;

		if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
			itemPlayerNumbers.visible = false;
			totalPlayersTxt.visible = false;
			buttonPlayersL.visible = false;
			buttonPlayersR.visible = false;
			
			if(!socketData.host){
				buttonPointsL.visible = false;
				buttonPointsR.visible = false;
				buttonThemeL.visible = false;
				buttonThemeR.visible = false;
				buttonStart.visible = false;
			}
		}
	}

	displayDominoOptions();
	if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
		if(socketData.host){
			postSocketUpdate('updateoptions', {pointIndex:gameData.pointIndex, draw:gameData.domino.draw, themeIndex:gameData.themeIndex, options:gameData.optionsFirst}, true);
		}
	}
	resizeGameLayout();
}

function resizeSocketLog(){
	if(curPage == 'main'){
		if(viewport.isLandscape){
			gameLogsTxt.x = canvasW/2;
			gameLogsTxt.y = canvasH/100 * 75;
		}else{
			gameLogsTxt.x = canvasW/2;
			gameLogsTxt.y = canvasH/100 * 75;
		}
	}else if(curPage == 'options'){
		if(viewport.isLandscape){
			gameLogsTxt.x = canvasW/2;
			gameLogsTxt.y = canvasH/100 * 67;
		}else{
			gameLogsTxt.x = canvasW/2;
			gameLogsTxt.y = canvasH/100 * 65;
		}
	}
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
	
	$('#roomWrapper').hide();
	$('#roomWrapper .innerContent').hide();
	gameLogsTxt.visible = false;

	mainContainer.visible = false;
	nameContainer.visible = false;
	roomContainer.visible = false;
	dominoOptionsContainer.visible = false;
	gameContainer.visible = false;
	resultContainer.visible = false;
	
	var targetContainer = null;
	switch(page){
		case 'main':
			targetContainer = mainContainer;

			if ( typeof initSocket == 'function' && multiplayerSettings.enable) {
				socketData.online = false;
			}
			toggleMainButton('default');
			playMusicLoop("musicMain");
		break;

		case 'name':
			targetContainer = nameContainer;
			$('#roomWrapper').show();
			$('#roomWrapper .nameContent').show();
			$('#roomWrapper .fontNameError').html('');
			$('#enterName').show();
		break;
			
		case 'room':
			targetContainer = roomContainer;
			$('#roomWrapper').show();
			$('#roomWrapper .roomContent').show();
			switchSocketRoomContent('lists');
		break;

		case 'options':
			targetContainer = dominoOptionsContainer;
			toggleDominoOptions(true);
		break;
		
		case 'game':
			targetContainer = gameContainer;
			playMusicLoop("musicGame");
			stopMusicLoop("musicMain");
			startGame();
		break;
		
		case 'result':
			targetContainer = resultContainer;
			stopGame();
			togglePop(false);
			
			playMusicLoop("musicMain");
			stopMusicLoop("musicGame");
			playSound('soundResult');
			tweenData.tweenScore = 0;

			if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
				playerData.score = playerData.scores[socketData.gameIndex];
				
				if(socketData.host){
					postSocketCloseRoom();
				}
			}else{
				playerData.score = playerData.scores[0];
			}

			tweenData.tweenScore = 0;
			TweenMax.to(tweenData, .5, {tweenScore:playerData.score, overwrite:true, onUpdate:function(){
				resultDescTxt.text = textDisplay.resultDesc.replace('[NUMBER]', addCommas(Math.floor(tweenData.tweenScore)));
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
	//gameData.players = 4;

	playerData.scores = [];
	for(var n=0; n<gameData.players; n++){
		playerData.scores.push(0);
	}

	startDomino();
}

function startDomino(){
	statusContainer.alpha = 0;
	toggleRoundScore(false);

	prepareDomino();
	if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
		gameData.ai = false;
		postSocketUpdate('ready', socketData.gameIndex);
	}else{
		gameData.ai = true;
		preparePlayers();
	}
}

/*!
 * 
 * STOP GAME - This is the function that runs to stop play game
 * 
 */
function stopGame(){
	gameData.paused = true;
	TweenMax.killAll(false, true, false);
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
 * PREPARE DOMINO - This is the function that runs to prepare domino
 * 
 */
function prepareDomino(){
	gameData.drawing = false;
	gameData.tile = {
		width:0,
		height:0,
	}
	gameData.placed = [];
	gameData.tiles = [];
	gameData.draw = [];
	gameData.seq = [];
	gameData.deal = {
		status:false,
		animation:false,
		count:0,
		total:0,
		delay:0,
	}
	gameData.tileSelected = -1;
	gameData.tilesIndex = 0;
	gameData.prepared = false;
	gameData.complete = false;

	if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
		var startCount = socketData.gameIndex;
		for(var n=0; n<gameData.players; n++){
			gameData.seq.push(startCount);
			startCount++;
			startCount = startCount > gameData.players-1 ? 0 : startCount;
		}
	}else{
		for(var n=0; n<gameData.players; n++){
			gameData.seq.push(n);
		}
	}

	playSound("soundShuffleIn");
	boardTileContainer.removeAllChildren();
	boardHighlightContainer.removeAllChildren();

	for(var n=0; n<tiles_arr.length; n++){
		$.domino[n] = new createjs.Container();
		$.domino[n].frontContainer = new createjs.Container();
		$.domino[n].frontContainer.visible = false;

		var newHighlight = new createjs.Bitmap(loader.getResult('themeHighlight'+gameData.themeIndex));
		centerReg(newHighlight);
		newHighlight.visible = false;
		$.domino[n].addChild(newHighlight);
		$.domino[n].highlight = newHighlight;

		var newBgFront = new createjs.Bitmap(loader.getResult('themeBgFront'+gameData.themeIndex));
		centerReg(newBgFront);
		gameData.tile.width = newBgFront.image.naturalWidth;
		gameData.tile.height = newBgFront.image.naturalHeight;
		$.domino[n].frontContainer.addChild(newBgFront);

		var _frameW = themes_arr[gameData.themeIndex].numbers.width;
		var _frameH = themes_arr[gameData.themeIndex].numbers.height;
		var _frame = {"regX": _frameW/2, "regY": _frameW/2, "count": 7, "width": _frameW, "height": _frameH};
		var _animations = {animate:{frames: [0,1,2,3,4,5,6], speed:1}};
		
		var numbersData = new createjs.SpriteSheet({
			"images": [loader.getResult('themeNumbers'+gameData.themeIndex).src],
			"frames": _frame,
			"animations": _animations
		});
		
		var numbersAnimate = new createjs.Sprite(numbersData, "animate");
		numbersAnimate.framerate = 20;
		
		for(var p=0; p<themes_arr[gameData.themeIndex].bg.pos.length; p++){
			var newNumbers = numbersAnimate.clone(true);
			newNumbers.x = themes_arr[gameData.themeIndex].bg.pos[p].x;
			newNumbers.y = themes_arr[gameData.themeIndex].bg.pos[p].y;
			newNumbers.gotoAndStop(tiles_arr[n][p]);
			$.domino[n].frontContainer.addChild(newNumbers);
		}

		var newBgBack = new createjs.Bitmap(loader.getResult('themeBgBack'+gameData.themeIndex));
		centerReg(newBgBack);
		$.domino[n].addChild(newBgBack, $.domino[n].frontContainer);

		var randomX = randomIntFromInterval(-250,250);
		var randomY = randomIntFromInterval(-150,150);
		var randomRotate = randomIntFromInterval(0,360);

		$.domino[n].numbers = tiles_arr[n].slice();
		$.domino[n].dragging = false;
		$.domino[n].tileIndex = n;
		$.domino[n].sameNumbers = false;
		$.domino[n].moveX = 0;
		$.domino[n].moveY = 0;
		$.domino[n].rotationNum = 0;

		TweenMax.to($.domino[n], gameSettings.tileDealSpeed, {x:randomX, y:randomY, rotation:randomRotate, overwrite:true});
		if($.domino[n].numbers[0] == $.domino[n].numbers[1]){
			$.domino[n].sameNumbers = true;
		}

		$.domino[n].cursor = "pointer";
		$.domino[n].addEventListener("click", function(evt) {
			var proceedClick = false;
			if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
				if(gameData.player == socketData.gameIndex){
					proceedClick = true;
				}
			}else{
				if(gameData.player == 0){
					proceedClick = true;
				}
			}

			if(proceedClick){
				if(gameData.drawing){
					if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
						postSocketUpdate('drawpile', evt.currentTarget.tileIndex);
					}else{
						getDrawPile(evt.currentTarget.tileIndex);
					}
				}else if(!gameSettings.dragToMove){
					selectPlayerTile(evt.currentTarget.tileIndex);
				}
			}
		});

		if(gameSettings.dragToMove){
			$.domino[n].addEventListener("mousedown", function(evt) {
				toggleIconDragEvent(evt, 'drag')
			});
			$.domino[n].addEventListener("pressmove", function(evt) {
				toggleIconDragEvent(evt, 'move')
			});
			$.domino[n].addEventListener("pressup", function(evt) {
				toggleIconDragEvent(evt, 'drop')
			});
		}
		
		$.domino["shadow"+n] = new createjs.Bitmap(loader.getResult('themeShadow'+gameData.themeIndex));
		centerReg($.domino["shadow"+n]);
		$.domino[n].shadow = $.domino["shadow"+n];
		boardTileContainer.addChild($.domino["shadow"+n], $.domino[n]);
		gameData.tiles.push($.domino[n]);
	}
	shuffle(gameData.tiles);
}

/*!
 * 
 * PREPARE PLAYERS - This is the function that runs to prepare players
 * 
 */
function preparePlayers(){
	boardPlayersContainer.removeAllChildren();

	//find total tiles
	var playerTotalTiles = 0;
	for(var n=0; n<gameSettings.playerTotalTiles.length; n++){
		if(gameData.players == gameSettings.playerTotalTiles[n].players){
			playerTotalTiles = gameSettings.playerTotalTiles[n].tiles;
		}
	}

	for(var n=0; n<gameData.players; n++){
		$.players[n] = new createjs.Container();
		$.players[n].tiles = [];
		$.players[n].score = 0;
		$.players[n].playerIndex = n;

		for(var p=0; p<playerTotalTiles; p++){
			var tileIndex = gameData.tiles[gameData.tilesIndex].tileIndex;
			$.players[n].tiles.push(tileIndex);
			gameData.tilesIndex++;
		}

		$.players["stats" + n] = new createjs.Container();
		var newPlayerStats = new createjs.Bitmap(loader.getResult('itemPlayerStats'));
		centerReg(newPlayerStats);
		var newPlayerStatsHighlight = new createjs.Bitmap(loader.getResult('itemPlayerStatsHighlight'));
		centerReg(newPlayerStatsHighlight);
		newPlayerStatsHighlight.visible = false;

		var newPlayerName = new createjs.Text();
		newPlayerName.font = "18px bpreplaybold";
		newPlayerName.color = "#fff";
		newPlayerName.textAlign = "center";
		newPlayerName.textBaseline='alphabetic';
		newPlayerName.text = textDisplay.playerName.replace("[NUMBER]", n+1);
		newPlayerName.y = 24;

		if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
			newPlayerName.text = gameData.names[n];
		}

		var newPlayerScore = new createjs.Text();
		newPlayerScore.font = "22px bpreplaybold";
		newPlayerScore.color = "#fff";
		newPlayerScore.textAlign = "center";
		newPlayerScore.textBaseline='alphabetic';
		newPlayerScore.text = textDisplay.playerScore.replace("[NUMBER]", playerData.scores[n]);
		newPlayerScore.y = -7;

		$.players["stats" + n].playerStats = newPlayerStats;
		$.players["stats" + n].newPlayerStatsHighlight = newPlayerStatsHighlight;
		$.players["stats" + n].playerName = newPlayerName;
		$.players["stats" + n].playerScore = newPlayerScore;
		$.players["stats" + n].visible = false;
		$.players["stats" + n].addChild(newPlayerStats, newPlayerStatsHighlight, newPlayerName, newPlayerScore);

		boardPlayersContainer.addChild($.players[n], $.players["stats" + n]);
	}

	for(var n=gameData.tilesIndex; n<gameData.tiles.length; n++){
		var tileIndex = gameData.tiles[n].tileIndex;
		gameData.draw.push(tileIndex);
	}

	//gameData.draw.length = 3;

	//$.players[0].tiles = [6,7,8,9,10,16,17,18,19,20,24,25,26,27];
	//$.players[1].tiles = [0,1,2,3,4,5,11,12,13,14,15,21,22,23];

	//$.players[0].tiles = [11, 24, 18, 16, 12, 8, 22];
	//$.players[1].tiles = [9, 1, 21, 14, 5, 26, 13];

	gameData.prepared = true;
	resizeGameLayout();
	TweenMax.to(boardContainer, .5, {overwrite:true, onComplete:function(){
		gameData.deal.status = true;
		gameData.deal.animation = true;
		checkPlayerTilesAnimation();
	}});

	/*$.players[0].tiles = [];
	$.players[1].tiles = [];
	$.players[0].visible = false;
	gameData.placed.push({tileIndex:25, dir:"", rotation:90});
	gameData.placed.push({tileIndex:11, dir:"left", rotation:0});
	gameData.placed.push({tileIndex:7, dir:"left", rotation:90});
	gameData.placed.push({tileIndex:12, dir:"left", rotation:180});
	gameData.placed.push({tileIndex:24, dir:"left", rotation:0});
	gameData.placed.push({tileIndex:10, dir:"left", rotation:0});
	gameData.placed.push({tileIndex:8, dir:"left", rotation:180});
	gameData.placed.push({tileIndex:13, dir:"left", rotation:90});
	gameData.placed.push({tileIndex:14, dir:"left", rotation:180});
	gameData.placed.push({tileIndex:21, dir:"left", rotation:180});
	gameData.placed.push({tileIndex:26, dir:"left", rotation:0});

	gameData.placed = [];
	gameData.placed.push({tileIndex:25, dir:"", rotation:90});
	gameData.placed.push({tileIndex:11, dir:"right", rotation:180});
	gameData.placed.push({tileIndex:7, dir:"right", rotation:90});
	gameData.placed.push({tileIndex:12, dir:"right", rotation:0});
	gameData.placed.push({tileIndex:24, dir:"right", rotation:180});
	gameData.placed.push({tileIndex:10, dir:"right", rotation:180});
	gameData.placed.push({tileIndex:8, dir:"right", rotation:0});
	gameData.placed.push({tileIndex:13, dir:"right", rotation:90});
	gameData.placed.push({tileIndex:14, dir:"right", rotation:0});
	gameData.placed.push({tileIndex:21, dir:"right", rotation:0});
	gameData.placed.push({tileIndex:26, dir:"right", rotation:180});

	gameData.placed = [];
	gameData.placed.push({tileIndex:27, dir:"", rotation:90});
	gameData.placed.push({tileIndex:21, dir:"right", rotation:180});
	gameData.placed.push({tileIndex:6, dir:"left", rotation:0});
	gameData.placed.push({tileIndex:14, dir:"right", rotation:180});
	gameData.placed.push({tileIndex:17, dir:"right", rotation:0});
	gameData.placed.push({tileIndex:12, dir:"right", rotation:180});
	gameData.placed.push({tileIndex:10, dir:"right", rotation:0});
	gameData.placed.push({tileIndex:22, dir:"right", rotation:90});
	gameData.placed.push({tileIndex:24, dir:"right", rotation:0});
	gameData.placed.push({tileIndex:5, dir:"left", rotation:180});*/

	//checkpositionPlacedTiles();
}

function resizeGameLayout(){
	if(curPage == "options"){
		if(viewport.isLandscape){			
			itemPlayerNumbers.x = canvasW/2;
			itemPlayerNumbers.y = canvasH/100 * 45;
			totalPlayersTxt.x = itemPlayerNumbers.x;
			totalPlayersTxt.y = itemPlayerNumbers.y + 10;
			buttonPlayersL.x = canvasW/2 - 200;
			buttonPlayersR.x = canvasW/2 + 200;
			buttonPlayersL.y = buttonPlayersR.y = itemPlayerNumbers.y;
	
			themeContainer.x = canvasW/2;
			themeContainer.y = canvasH/100 * 56;
			buttonThemeL.x = canvasW/2 - 200;
			buttonThemeR.x = canvasW/2 + 200;
			buttonThemeL.y = buttonThemeR.y = themeContainer.y;
	
			if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
				if(itemPlayerNumbers.visible == false){
					themeContainer.x = canvasW/2;
					themeContainer.y = canvasH/100 * 50;
					buttonThemeL.x = canvasW/2 - 200;
					buttonThemeR.x = canvasW/2 + 200;
					buttonThemeL.y = buttonThemeR.y = themeContainer.y;
				}
			}
		}else{			
			itemPlayerNumbers.x = canvasW/2;
			itemPlayerNumbers.y = canvasH/100 * 46;
			totalPlayersTxt.x = itemPlayerNumbers.x;
			totalPlayersTxt.y = itemPlayerNumbers.y + 10;
			buttonPlayersL.x = canvasW/2 - 200;
			buttonPlayersR.x = canvasW/2 + 200;
			buttonPlayersL.y = buttonPlayersR.y = itemPlayerNumbers.y;
	
			themeContainer.x = canvasW/2;
			themeContainer.y = canvasH/100 * 54;
			buttonThemeL.x = canvasW/2 - 200;
			buttonThemeR.x = canvasW/2 + 200;
			buttonThemeL.y = buttonThemeR.y = themeContainer.y;
	
			if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
				if(itemPlayerNumbers.visible == false){
					themeContainer.x = canvasW/2;
					themeContainer.y = canvasH/100 * 50;
					buttonThemeL.x = canvasW/2 - 200;
					buttonThemeR.x = canvasW/2 + 200;
					buttonThemeL.y = buttonThemeR.y = themeContainer.y;
				}
			}
		}
	}else if(curPage == "game"){
		statusContainer.x = boardScoreContainer.x = canvasW/2;
		statusContainer.y = boardScoreContainer.y = canvasH/2;
		
		drawTitleTxt.y = -(canvasH/100 * 18);
		drawTitleTxt.font = "35px bpreplaybold";

		if(!viewport.isLandscape){
			drawTitleTxt.font = "25px bpreplaybold";
			drawTitleTxt.y = -(canvasH/100 * 19);
		}

		if(!gameData.prepared){
			return;
		}

		var positionLayout = [
			{
				x:canvasW/2,
				y:canvasH/100 * 82,
				horizontal:true,
				dir:"bottom"
			},
			{
				x:canvasW/2,
				y:canvasH/100 * 18,
				horizontal:true,
				dir:"top"
			},
			{
				x:canvasW/100 * 14,
				y:canvasH/2,
				horizontal:false,
				dir:"left"
			},
			{
				x:canvasW/100 * 86,
				y:canvasH/2,
				horizontal:false,
				dir:"right"
			}
		];

		if(!viewport.isLandscape){
			positionLayout = [
				{
					x:canvasW/2,
					y:canvasH/100 * 84,
					horizontal:true,
					dir:"bottom"
				},
				{
					x:canvasW/2,
					y:canvasH/100 * 16,
					horizontal:true,
					dir:"top"
				},
				{
					x:canvasW/100 * 17,
					y:canvasH/2,
					horizontal:false,
					dir:"left"
				},
				{
					x:canvasW/100 * 83,
					y:canvasH/2,
					horizontal:false,
					dir:"right"
				}
			];
		}

		var positionArr = [];
		if(gameData.players == 2){
			positionArr = [0,1];
		}else{
			positionArr = [0,2,1,3];
		}
		
		for(var n=0; n<gameData.players; n++){
			var seqIndex =  gameData.seq[n];
			$.players[seqIndex].x = positionLayout[positionArr[n]].x;
			$.players[seqIndex].y = positionLayout[positionArr[n]].y;
			$.players[seqIndex].dir = positionLayout[positionArr[n]].dir;
			$.players[seqIndex].horizontal = positionLayout[positionArr[n]].horizontal;
		}

		checkPlayerTilesAnimation();
	}
}

function checkPlayerTilesAnimation(){
	if(gameData.deal.animation){
		gameData.deal.count = 0;
		gameData.deal.total = 0;
		gameData.deal.delay = 0;
	}

	for(var n=0; n<gameData.players; n++){
		positionPlayerTiles(n, gameData.deal.status);
	}

	if(gameData.drawing){
		toggleDrawPiles(true);
	}
}

/*!
 * 
 * POSITION TILES - This is the function that runs to position tiles
 * 
 */
function positionPlayerTiles(index, animation){
	var horizontal = $.players[index].horizontal;
	var pt = boardTileContainer.globalToLocal($.players[index].x, $.players[index].y);

	var pos = {x:0, y:0, startX:0, startY:0, w:0, h:0, maxW:500, maxH:500, gap:0, tileW:gameData.tile.width, tileH:gameData.tile.height, tileSpace:gameSettings.tileSpace};
	if(!viewport.isLandscape){
		pos.maxW = 300;
		pos.maxH = 500;
	}

	if(horizontal){
		pos.w = ($.players[index].tiles.length-1) * pos.tileH;
		pos.w += ($.players[index].tiles.length-1) * pos.tileSpace;
		pos.gap = ((pos.tileW/2) + (pos.tileSpace));

		if(pos.w > pos.maxW){
			pos.w = pos.maxW;
			pos.gap = pos.maxW/($.players[index].tiles.length-1);
		}

		pos.x = pos.startX = pt.x - (pos.w/2);
		pos.y = pos.startY = pt.y;
	}else{
		pos.h = ($.players[index].tiles.length-1) * pos.tileH;
		pos.h += ($.players[index].tiles.length-1) * pos.tileSpace;
		pos.gap = ((pos.tileW/2) + (pos.tileSpace));

		if(pos.h > pos.maxH){
			pos.h = pos.maxH;
			pos.gap = pos.maxH/($.players[index].tiles.length-1);
		}

		pos.x = pos.startX = pt.x;
		pos.y = pos.startY = pt.y - (pos.h/2);
	}
	
	var dealyNum = 0;
	for(var p=0; p<$.players[index].tiles.length; p++){
		var thisTile = $.domino[$.players[index].tiles[p]];
		boardTileContainer.setChildIndex(thisTile.shadow, boardTileContainer.numChildren-1);
		boardTileContainer.setChildIndex(thisTile, boardTileContainer.numChildren-1);

		thisTile.oriX = pos.x;
		thisTile.oriY = pos.y;

		if(horizontal){
			var rotationNum = 90;
			pos.x += pos.gap;
		}else{
			var rotationNum = 0;
			pos.y += pos.gap;
		}

		if(!thisTile.dragging && animation){
			if(gameData.deal.animation){
				gameData.deal.total++;
				gameData.deal.delay += gameSettings.tileDealSpeed/2;
				dealyNum = gameData.deal.delay;
			}
			thisTile.visible = true;
			var tileSpeed = gameData.deal.animation == true ? gameSettings.tileDealSpeed : gameSettings.tileMoveSpeed;
			TweenMax.to(thisTile, tileSpeed, {delay:dealyNum, x:thisTile.oriX, y:thisTile.oriY, rotation:rotationNum, scaleX:1, scaleY:1, overwrite:true, onStart:function(){
				var randomSound = Math.floor(Math.random()*3)+1;
				playSound("soundDomino" + randomSound);
			},onComplete:dealAnimationComplete});
		}
	}

	pos.x -= pos.gap/2;
	pos.y -= pos.gap/2;

	var gapX = 0
	var gapY = 0;
	if($.players[index].tiles.length > 0 && animation){
		gapX = pos.x + ($.players["stats" + index].playerStats.image.naturalWidth/2);
		gapY = pos.y + ($.players["stats" + index].playerStats.image.naturalHeight/2);
	}

	if($.players[index].dir == "bottom"){
		$.players["stats" + index].x = $.players[index].x + gapX;
		$.players["stats" + index].y = $.players[index].y;
	}else if($.players[index].dir == "top"){
		$.players["stats" + index].x = $.players[index].x - gapX;
		$.players["stats" + index].y = $.players[index].y;
	}else{
		$.players["stats" + index].x = $.players[index].x;
		$.players["stats" + index].y = $.players[index].y + gapY;
	}
}

function dealAnimationComplete(){
	if(gameData.deal.animation){
		gameData.deal.count++;
		if(gameData.deal.count == gameData.deal.total){
			gameData.deal.animation = false;

			for(var n=0; n<gameData.players; n++){
				$.players["stats" + n].visible = true;
				var showTilesNumbers = false;

				if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
					if(n == socketData.gameIndex){
						showTilesNumbers = true;
					}
				}else{
					if(n == 0){
						showTilesNumbers = true;
					}
				}

				if(showTilesNumbers){
					for(var p=0; p<$.players[n].tiles.length; p++){
						$.domino[$.players[n].tiles[p]].frontContainer.visible = true;
					}
				}
			}

			playSound("soundShuffleOut");
			for(var n=0; n<gameData.draw.length; n++){
				hideTile($.domino[gameData.draw[n]]);
			}

			displayPlayerTurn();
		}
	}
}

function hideTile(obj){
	TweenMax.to(obj, gameSettings.tileDealSpeed, {x:0, y:0, rotation:0, overwrite:true, onComplete:function(){
		obj.visible = false;
	}});
}

function checkpositionPlacedTiles(){
	gameData.mask = {
		width:700,
		height:300,
		scale:1,
		startX:0,
		startY:0,
		endX:0,
		endY:0,
		tileW:0,
		tileH:0,
	};

	if(!viewport.isLandscape){
		gameData.mask.width = 250;
		gameData.mask.height = 400;
	}

	
	var totalLoop = 5;
	for(var n=0; n<totalLoop; n++){
		positionPlacedTiles(false);

		gameData.mask.tileW = gameData.mask.endX - gameData.mask.startX;
		gameData.mask.tileH = gameData.mask.endY - gameData.mask.startY;

		var scaleXNum = 1;
		var scaleYNum = 1;
		var newScaleNum = 1;
		if(gameData.mask.tileW >= gameData.mask.width){
			scaleXNum = gameData.mask.width/gameData.mask.tileW;
		}
		if(gameData.mask.tileH >= gameData.mask.height){
			scaleYNum = gameData.mask.height/gameData.mask.tileH;
		}

		newScaleNum = scaleXNum < scaleYNum ? scaleXNum : scaleYNum;
		newScaleNum = newScaleNum.toFixed(1);
		if(gameData.mask.scale == newScaleNum){
			positionPlacedTiles(true);
			n = totalLoop;
		}else{
			gameData.mask.scale = newScaleNum;
		}
	}
}

function positionPlacedTiles(pos){
	var firstTile = null;
	var leftTile = null;
	var rightTile = null;
	var targetTile = null;

	var leftDir = ["left","top","right","top"];
	var leftDirIndex = 0;
	var leftFirstDir = "left";
	var rightDir = ["right","bottom","left","bottom"];
	var rightDirIndex = 0;
	var rightFirstDir = "right";

	var leftCalMax = [gameData.tile.height*5, gameData.tile.height/4, gameData.tile.height*10];
	var leftCalMaxIndex = 0;
	var leftCal = 0;

	var rightCalMax = [gameData.tile.height*5, gameData.tile.height/4, gameData.tile.height*10];
	var rightCalMaxIndex = 0;
	var rightCal = 0;

	if(!viewport.isLandscape){
		leftCalMax = [gameData.tile.height, gameData.tile.height, gameData.tile.height*3];
		rightCalMax = [gameData.tile.height, gameData.tile.height, gameData.tile.height*3];
	}

	var scaleNum = gameData.mask.scale;

	for(var n=0; n<gameData.placed.length; n++){
		var thisTile = $.domino[gameData.placed[n].tileIndex];
		thisTile.rotationNum = gameData.placed[n].rotation;
		thisTile.visible = true;
		
		if(n == 0){
			if(!pos){
				thisTile.moveX = 0;
				thisTile.moveY = 0;
			}else{
				var centerPos = getCenterPosition(gameData.mask.startX, gameData.mask.startY, gameData.mask.endX, gameData.mask.endY);
				thisTile.moveX = -((centerPos.x) * gameData.mask.scale);
				thisTile.moveY = -((centerPos.y) * gameData.mask.scale);
			};

			firstTile = thisTile;
			thisTile.nextDir = "";
		}else if(gameData.placed[n].dir == "left"){
			targetTile = leftTile == null ? firstTile : leftTile;
			var targetGapX = targetTile.sameNumbers == true ? (gameData.tile.height/2) + gameSettings.tilePlacedSpace : (gameData.tile.width/2) + gameSettings.tilePlacedSpace;
			var targetGapY = 0;
			var tileGapX = thisTile.sameNumbers == true ? (gameData.tile.height/2) + gameSettings.tilePlacedSpace : (gameData.tile.width/2) + gameSettings.tilePlacedSpace;
			var tileGapY = 0;

			if(leftDir[leftDirIndex] == "left"){
				if(leftFirstDir == "top"){
					targetGapX = targetTile.sameNumbers == true ? (gameData.tile.width/2) + gameSettings.tilePlacedSpace : (gameData.tile.height/2) + gameSettings.tilePlacedSpace;
					targetGapY = targetTile.sameNumbers == true ? 0 : (gameData.tile.height/2) + gameSettings.tilePlacedSpace;
					if(targetTile.sameNumbers){
						targetGapX -= (gameData.tile.width/2) + gameSettings.tilePlacedSpace;
						targetGapY = gameData.tile.height + gameSettings.tilePlacedSpace;
					}
				}

				thisTile.moveX = targetTile.moveX - ((targetGapX + tileGapX) * scaleNum);
				thisTile.moveY = targetTile.moveY - (targetGapY * scaleNum);
				leftCal += targetGapX + tileGapX;
			}else if(leftDir[leftDirIndex] == "top"){
				if(leftFirstDir == "left"){
					targetGapX = targetTile.sameNumbers == true ? 0 : -((gameData.tile.height/2));
					targetGapY = targetTile.sameNumbers == true ? (gameData.tile.width/2) + gameSettings.tilePlacedSpace : (gameData.tile.height/2) + gameSettings.tilePlacedSpace;
				}else if(leftFirstDir == "right"){
					targetGapX = targetTile.sameNumbers == true ? 0 : (gameData.tile.height/2);
					targetGapY = targetTile.sameNumbers == true ? (gameData.tile.width/2) + gameSettings.tilePlacedSpace : (gameData.tile.height/2) + gameSettings.tilePlacedSpace;
				}else{
					targetGapX = 0;
					targetGapY = targetTile.sameNumbers == true ? (gameData.tile.height/2) + gameSettings.tilePlacedSpace : (gameData.tile.width/2) + gameSettings.tilePlacedSpace;
				}
				tileGapY = thisTile.sameNumbers == true ? (gameData.tile.height/2) + gameSettings.tilePlacedSpace : (gameData.tile.width/2) + gameSettings.tilePlacedSpace;
				thisTile.moveX = targetTile.moveX + (targetGapX * scaleNum);
				thisTile.moveY = targetTile.moveY - ((targetGapY + tileGapY) * scaleNum);
				thisTile.rotationNum += 90;
				leftCal += targetGapX + tileGapX;
			}else if(leftDir[leftDirIndex] == "right"){
				if(leftFirstDir == "top"){
					targetGapX = targetTile.sameNumbers == true ? (gameData.tile.width/2) + gameSettings.tilePlacedSpace : (gameData.tile.height/2) + gameSettings.tilePlacedSpace;
					targetGapY = targetTile.sameNumbers == true ? 0 : (gameData.tile.height/2);
				}
				thisTile.moveX = targetTile.moveX + ((targetGapX + tileGapX) * scaleNum);
				thisTile.moveY = targetTile.moveY - (targetGapY * scaleNum);
				thisTile.rotationNum += 180;
				leftCal += targetGapX + tileGapX;
			}
			
			leftFirstDir = leftDir[leftDirIndex];
			if(leftCal >= leftCalMax[leftCalMaxIndex]){
				leftCal = 0;
				leftCalMaxIndex++;
				leftCalMaxIndex = leftCalMaxIndex > leftCalMax.length-1 ? 1 : leftCalMaxIndex;
				leftDirIndex++;
				leftDirIndex = leftDirIndex > leftDir.length-1 ? 0 : leftDirIndex;
			}
			leftTile = thisTile;
			thisTile.nextDir = leftDir[leftDirIndex];
		}else if(gameData.placed[n].dir == "right"){
			targetTile = rightTile == null ? firstTile : rightTile;
			var targetGapX = targetTile.sameNumbers == true ? (gameData.tile.height/2) + gameSettings.tilePlacedSpace : (gameData.tile.width/2) + gameSettings.tilePlacedSpace;
			var targetGapY = 0;
			var tileGapX = thisTile.sameNumbers == true ? (gameData.tile.height/2) + gameSettings.tilePlacedSpace : (gameData.tile.width/2) + gameSettings.tilePlacedSpace;
			var tileGapY = 0;

			if(rightDir[rightDirIndex] == "right"){
				if(rightFirstDir == "bottom"){
					targetGapX = targetTile.sameNumbers == true ? (gameData.tile.width/2) + gameSettings.tilePlacedSpace : (gameData.tile.height/2) + gameSettings.tilePlacedSpace;
					targetGapY = targetTile.sameNumbers == true ? 0 : (gameData.tile.height/2) + gameSettings.tilePlacedSpace;
					if(targetTile.sameNumbers){
						targetGapX -= (gameData.tile.width/2) + gameSettings.tilePlacedSpace;
						targetGapY = gameData.tile.height + gameSettings.tilePlacedSpace;
					}
				}

				thisTile.moveX = targetTile.moveX + ((targetGapX + tileGapX) * scaleNum);
				thisTile.moveY = targetTile.moveY + (targetGapY * scaleNum);
				rightCal += targetGapX + tileGapX;
			}else if(rightDir[rightDirIndex] == "bottom"){
				if(rightFirstDir == "right"){
					targetGapX = targetTile.sameNumbers == true ? 0 : -(gameData.tile.height/2);
					targetGapY = targetTile.sameNumbers == true ? (gameData.tile.width/2) + gameSettings.tilePlacedSpace : (gameData.tile.height/2) + gameSettings.tilePlacedSpace;
				}else if(rightFirstDir == "left"){
					targetGapX = targetTile.sameNumbers == true ? 0 : (gameData.tile.height/2);
					targetGapY = targetTile.sameNumbers == true ? (gameData.tile.width/2) + gameSettings.tilePlacedSpace : (gameData.tile.height/2) + gameSettings.tilePlacedSpace;
				}else{
					targetGapX = 0;
					targetGapY = targetTile.sameNumbers == true ? (gameData.tile.height/2) + gameSettings.tilePlacedSpace : (gameData.tile.width/2) + gameSettings.tilePlacedSpace;
				}
				tileGapY = thisTile.sameNumbers == true ? (gameData.tile.height/2) + gameSettings.tilePlacedSpace : (gameData.tile.width/2) + gameSettings.tilePlacedSpace;
				thisTile.moveX = targetTile.moveX - (targetGapX * scaleNum);
				thisTile.moveY = targetTile.moveY + ((targetGapY + tileGapY) * scaleNum);
				thisTile.rotationNum += 90;
				rightCal += targetGapX + tileGapX;
			}else if(rightDir[rightDirIndex] == "left"){
				if(rightFirstDir == "bottom"){
					targetGapX = targetTile.sameNumbers == true ? (gameData.tile.width/2) + gameSettings.tilePlacedSpace : (gameData.tile.height/2) + gameSettings.tilePlacedSpace;
					targetGapY = targetTile.sameNumbers == true ? 0 : (gameData.tile.height/2);
				}
				thisTile.moveX = targetTile.moveX - ((targetGapX + tileGapX) * scaleNum);
				thisTile.moveY = targetTile.moveY + (targetGapY * scaleNum);
				thisTile.rotationNum += 180;
				rightCal += targetGapX + tileGapX;
			}
			
			rightFirstDir = rightDir[rightDirIndex];
			if(rightCal >= rightCalMax[rightCalMaxIndex]){
				rightCal = 0;
				rightCalMaxIndex++;
				rightCalMaxIndex = rightCalMaxIndex > rightCalMax.length-1 ? 1 : rightCalMaxIndex;
				rightDirIndex++;
				rightDirIndex = rightDirIndex > rightDir.length-1 ? 0 : rightDirIndex;
			}
			rightTile = thisTile;
			thisTile.nextDir = rightDir[rightDirIndex];
		}

		var startX = thisTile.moveX;
		var endX = thisTile.moveX;
		var startY = thisTile.moveY;
		var endY = thisTile.moveY;

		gameData.mask.startX = startX < gameData.mask.startX ? startX : gameData.mask.startX;
		gameData.mask.endX = endX > gameData.mask.endX ? endX : gameData.mask.endX;
		gameData.mask.startY = startY < gameData.mask.startY ? startY : gameData.mask.startY;
		gameData.mask.endY = endY > gameData.mask.endY ? endY : gameData.mask.endY;

		if(pos){
			TweenMax.to(thisTile, gameSettings.tileMoveSpeed, {x:thisTile.moveX, y:thisTile.moveY, rotation:thisTile.rotationNum, scaleX:scaleNum, scaleY:scaleNum, overwrite:true});
		}
	}
}

/*!
 * 
 * CONNECT TILES - This is the function that runs to connect tiles
 * 
 */
function connectTiles(thisTile, targetTile, dir){
	var targetIndex = -1;
	var thisIndex = -1;
	var fromDir = dir == "left" ? "right" : "left";
	if(dir == "none"){
		fromDir = dir;
	}

	if(fromDir == "right"){
		if(targetTile.rotationNum == 0){
			targetIndex = 0;
		}else{
			targetIndex = 1;
		}
	}else if(fromDir == "left"){
		if(targetTile.rotationNum == 0){
			targetIndex = 1;
		}else{
			targetIndex = 0;
		}
	}

	if(dir == "none"){
		if(thisTile.sameNumbers){
			thisTile.rotationNum = 90;
		}else{
			thisTile.rotationNum = 0;
		}
	}else if(dir == "left"){
		if(targetTile.numbers.length == 1){
			if(thisTile.numbers[1] == targetTile.numbers[0]){
				thisIndex = 1;
				thisTile.rotationNum = 0;
			}else if(thisTile.numbers[0] == targetTile.numbers[0]){
				thisIndex = 0;
				thisTile.rotationNum = 180;
			}
		}else if(thisTile.numbers[1] == targetTile.numbers[targetIndex]){
			thisIndex = 1;
			thisTile.rotationNum = 0;
		}else if(thisTile.numbers[0] == targetTile.numbers[targetIndex]){
			thisIndex = 0;
			thisTile.rotationNum = 180;
		}

		if(thisTile.sameNumbers){
			thisTile.rotationNum = 90;
		}

		thisTile.numbers.splice(thisIndex, 1);
		targetTile.numbers.splice(targetIndex, 1);
	}else if(dir == "right"){
		if(targetTile.numbers.length == 1){
			if(thisTile.numbers[1] == targetTile.numbers[0]){
				thisIndex = 1;
				thisTile.rotationNum = 180;
			}else if(thisTile.numbers[0] == targetTile.numbers[0]){
				thisIndex = 0;
				thisTile.rotationNum = 0;
			}
		}else if(thisTile.numbers[1] == targetTile.numbers[targetIndex]){
			thisIndex = 1;
			thisTile.rotationNum = 180;
		}else if(thisTile.numbers[0] == targetTile.numbers[targetIndex]){
			thisIndex = 0;
			thisTile.rotationNum = 0;
		}

		if(thisTile.sameNumbers){
			thisTile.rotationNum = 90;
		}

		thisTile.numbers.splice(thisIndex, 1);
		targetTile.numbers.splice(targetIndex, 1);
	}
}

/*!
 * 
 * TOGGLE DRAW TILES - This is the function that runs to toggle draw tiles
 * 
 */
function toggleDrawPiles(show){
	if(show){
		gameData.drawing = true;
		boardTileContainer.addChild(boardDrawContainer);
		// itemDrawBg.visible = true;
		itemDrawBgP.visible = false;

		var pos = {startX:0, startY:0, x:0, y:0, width:0, height:0, maxColumn:7, spaceX:0, spaceY:0};
		var totalRow = gameData.draw.length/pos.maxColumn;
		totalRow = Number.isInteger(totalRow) ? totalRow : Math.floor(totalRow+1);
		if(!viewport.isLandscape){
			pos.maxColumn = 5;
			// itemDrawBg.visible = false;
			itemDrawBgP.visible = true;
		}

		pos.spaceX = gameData.tile.height + gameSettings.tileSpace;
		pos.spaceY = gameData.tile.width + gameSettings.tileSpace;
		pos.width = (pos.maxColumn-1) * gameData.tile.height;
		pos.width += (pos.maxColumn-1) * gameSettings.tileSpace;
		pos.height = (totalRow-1) * gameData.tile.width;
		pos.height += (totalRow-1) * gameSettings.tileSpace;
		pos.startX = -(pos.width/2);
		pos.startY = -(pos.height/2);
		pos.x = pos.startX;
		pos.y = pos.startY;

		var calColumn = 0;
		for(var n=0; n<gameData.draw.length; n++){
			var thisTile = $.domino[gameData.draw[n]];
			boardTileContainer.setChildIndex(thisTile.shadow, boardTileContainer.numChildren-1);
			boardTileContainer.setChildIndex(thisTile, boardTileContainer.numChildren-1);
			killAnimateBlink(thisTile.highlight);

			if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
				if(gameData.player == socketData.gameIndex){
					animateBlink(thisTile.highlight);
				}
			}else{
				if(gameData.player == 0){
					animateBlink(thisTile.highlight);
				}
			}

			thisTile.rotation = 90;
			thisTile.visible = true;
			thisTile.x = pos.x;
			thisTile.y = pos.y;

			pos.x += pos.spaceX;
			calColumn++;
			if(calColumn >= pos.maxColumn){
				calColumn = 0;
				pos.x = pos.startX;
				pos.y += pos.spaceY;
			}
		}
	}else{
		gameData.drawing = false;
		boardTileContainer.removeChild(boardDrawContainer);
		for(var n=0; n<gameData.draw.length; n++){
			var thisTile = $.domino[gameData.draw[n]];
			thisTile.visible = false;
		}
	}
}

function getDrawPile(tileIndex){
	var thisTile = $.domino[tileIndex];
	killAnimateBlink(thisTile.highlight);

	if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
		if($.players[gameData.player].playerIndex == socketData.gameIndex){
			thisTile.frontContainer.visible = true;
		}
	}else{
		if($.players[gameData.player].playerIndex == 0){
			thisTile.frontContainer.visible = true;
		}
	}
	
	var drawIndex = gameData.draw.indexOf(tileIndex);
	gameData.draw.splice(drawIndex, 1);
	
	$.players[gameData.player].tiles.push(tileIndex);
	positionPlayerTiles(gameData.player, true);

	var possibleTileArr = checkPossibleMove(gameData.player);
	if(possibleTileArr.length != 0){
		toggleDrawPiles(false);
		displayPlayerTurn();
	}else{
		if(gameData.draw.length == 0){
			toggleDrawPiles(false);
			showGameStatus("cantmove");
		}else{
			tryFirstMove();
		}
	}
}

/*!
 * 
 * DRAG EVENT - This is the function that runs to build drag event
 * 
 */
function toggleIconDragEvent(obj, con){
	if(gameData.drawing){
		return;
	}

	if(!obj.currentTarget.highlight.visible){
		return;
	}

	switch(con){
		case 'drag':
			var global = boardTileContainer.localToGlobal(obj.currentTarget.x, obj.currentTarget.y);
			obj.currentTarget.offset = {x:global.x-(obj.stageX), y:global.y-(obj.stageY)};
			obj.currentTarget.dragging = true;
			boardTileContainer.setChildIndex(obj.currentTarget.shadow, boardTileContainer.numChildren-1);
			boardTileContainer.setChildIndex(obj.currentTarget, boardTileContainer.numChildren-1);

			highlightPlacelable(obj.currentTarget.numbers);
		break;
		
		case 'move':
			if(obj.currentTarget.dragging){
				var local = boardTileContainer.globalToLocal(obj.stageX, obj.stageY);
				var moveX = ((local.x) + obj.currentTarget.offset.x);
				var moveY = ((local.y) + obj.currentTarget.offset.y);
				obj.currentTarget.x = moveX;
				obj.currentTarget.y = moveY;
			}
		break;
		
		case 'drop':
			if(obj.currentTarget.dragging){
				obj.currentTarget.dragging = false;

				var placeTitleCon = false;
				var thisHighlight = {tileIndex:-1, dir:''};
				if(gameData.placed.length == 0 || gameData.highlight.length == 1){
					if($.players[gameData.player].dir == "bottom"){
						if(obj.currentTarget.y < obj.currentTarget.oriY){
							placeTitleCon = true;
						}
					}else if($.players[gameData.player].dir == "top"){
						if(obj.currentTarget.y > obj.currentTarget.oriY){
							placeTitleCon = true;
						}
					}else if($.players[gameData.player].dir == "left"){
						if(obj.currentTarget.x > obj.currentTarget.oriX){
							placeTitleCon = true;
						}
					}else if($.players[gameData.player].dir == "right"){
						if(obj.currentTarget.x < obj.currentTarget.oriX){
							placeTitleCon = true;
						}
					}

					if(gameData.highlight.length > 0 && placeTitleCon){
						thisHighlight = gameData.highlight[0];
					}
				}else{
					for(var n=0; n<gameData.highlight.length; n++){
						var thisHighlight = gameData.highlight[n];
						var tileDistance = getDistance(obj.currentTarget.x, obj.currentTarget.y, thisHighlight.x, thisHighlight.y);
						if(tileDistance <= gameData.tile.width){
							thisHighlight = gameData.highlight[n];
							placeTitleCon = true;
							n = gameData.highlight.length;
						}
					}

				}

				if(placeTitleCon){
					playerMove(obj.currentTarget.tileIndex, thisHighlight.tileIndex, thisHighlight.dir);
				}else{
					positionPlayerTiles(gameData.player, true);
				}
				highlightPlacelable();
			}
		break;
	}
}

function selectPlayerTile(index){
	if(gameData.drawing){
		return;
	}

	if(!$.domino[index].highlight.visible){
		return;
	}

	var thisTile = $.domino[index];
	var newY = thisTile.oriY;

	if(gameData.placed.length == 0){
		playerMove($.domino[index].tileIndex);
	}else{
		playSound("soundDominoPick");
		if(gameData.tileSelected == index){
			gameData.tileSelected = -1;
			highlightPlacelable();
		}else{
			if(gameData.tileSelected != index && gameData.tileSelected != -1){
				var lastTile = $.domino[gameData.tileSelected];
				TweenMax.to(lastTile, gameSettings.tileMoveSpeed/2, {y:lastTile.oriY, overwrite:true});
				highlightPlacelable();
			}
	
	
			gameData.tileSelected = index;
			boardTileContainer.setChildIndex(thisTile.shadow, boardTileContainer.numChildren-1);
			boardTileContainer.setChildIndex(thisTile, boardTileContainer.numChildren-1);
			highlightPlacelable(thisTile.numbers);
			newY -= gameData.tile.height;
		}
		
		TweenMax.to(thisTile, gameSettings.tileMoveSpeed/2, {y:newY, overwrite:true});
	}
}

/*!
 * 
 * PLACE TILE - This is the function that runs to place tile
 * 
 */
function playerMove(tileIndex, highlightTileIndex, dir){
	if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
		if(gameData.player == socketData.gameIndex){
			postSocketUpdate('playermove', {tileIndex:tileIndex, highlightTileIndex:highlightTileIndex, dir:dir});
		}
	}else{
		placeTitle(tileIndex, highlightTileIndex, dir);
	}
}

function placeTitle(tileIndex, highlightTileIndex, dir){
	var randomSound = Math.floor(Math.random()*3)+1;
	playSound("soundDomino" + randomSound);
	highlightTitles([]);

	var thisTile = $.domino[tileIndex];
	boardTileContainer.setChildIndex(thisTile.shadow, boardTileContainer.numChildren-1);
	boardTileContainer.setChildIndex(thisTile, boardTileContainer.numChildren-1);
	thisTile.frontContainer.visible = true;

	if(gameData.placed.length == 0){
		connectTiles(thisTile, "", "none");
		gameData.placed.push({tileIndex:tileIndex, dir:"", rotation:thisTile.rotationNum});
	}else{
		connectTiles(thisTile, $.domino[highlightTileIndex], dir);
		gameData.placed.push({tileIndex:tileIndex, dir:dir, rotation:thisTile.rotationNum});
	}

	gameData.leftTile = null;
	gameData.rightTile = null;

	for(var n=0; n<2; n++){
		for(var p=gameData.placed.length-1; p>0; p--){
			if(n == 0 && gameData.placed[p].dir == "left"){
				gameData.leftTile = $.domino[gameData.placed[p].tileIndex];
				p = -1;
			}else if(n == 1 && gameData.placed[p].dir == "right"){
				gameData.rightTile = $.domino[gameData.placed[p].tileIndex];
				p = -1;
			}
		}

		if(n == 0 && gameData.leftTile == null){
			gameData.leftTile = $.domino[gameData.placed[0].tileIndex];
		}else if(n == 1 && gameData.rightTile == null){
			gameData.rightTile = $.domino[gameData.placed[0].tileIndex];
		}
	}

	//remove tile from player
	for(var n=0; n<$.players[gameData.player].tiles.length; n++){
		if($.players[gameData.player].tiles[n] == tileIndex){
			$.players[gameData.player].tiles.splice(n, 1);
		}
	}

	gameData.nextCount = 0;
	checkpositionPlacedTiles();
	positionPlayerTiles(gameData.player, true);
	checkRoundEnd();
}

function checkRoundEnd(){
	if($.players[gameData.player].tiles.length == 0){
		highlightPlayer(false);
		showGameStatus("domino");
	}else{
		nextPlayerTurn();
	}
}

/*!
 * 
 * DISPLAY PLAYER TURN - This is the function that runs to display player turn
 * 
 */
function displayPlayerTurn(){
	var possibleTileArr = checkPossibleMove(gameData.player);

	highlightTitles(possibleTileArr);
	highlightPlayer(true);
	gameData.tileSelected = -1;
	
	if(possibleTileArr.length > 0){
		if(gameData.placed.length == 0){
			showGameStatus("first");
		}
		tryFirstMove(possibleTileArr);
	}else{
		if(gameData.domino.draw){
			if(gameData.draw.length > 0){
				showGameStatus("nomove");
			}else{
				showGameStatus("cantmove");
			}
		}else{
			showGameStatus("block");
		}
	}
}

/*!
 * 
 * POSSIBLE MOVES - This is the function that runs to check possible moves
 * 
 */
function checkPossibleMove(index){
	var possibleTileArr = [];

	if(gameData.placed.length == 0){
		//find highest same numbers
		var highestSameArr = [];
		var highestSingleArr = [];
		for(var n=0; n<gameData.players; n++){
			for(var p=0; p<$.players[n].tiles.length; p++){
				var thisTile = $.domino[$.players[n].tiles[p]];
				if(thisTile.sameNumbers){
					var totalNumbers = thisTile.numbers[0];
					highestSameArr.push({total:totalNumbers, player:n, tile:thisTile});
				}else{
					var totalNumbers = thisTile.numbers[0] + thisTile.numbers[1];
					highestSingleArr.push({total:totalNumbers, player:n, tile:thisTile});
				}
			}
		}

		sortOnObject(highestSameArr, "total", true);
		sortOnObject(highestSingleArr, "total", true);

		if(highestSameArr.length > 0){
			gameData.player = highestSameArr[0].player;
			possibleTileArr.push(highestSameArr[0].tile);
		}else{
			gameData.player = highestSingleArr[0].player;
			for(var n=0; n<$.players[gameData.player].tiles.length; n++){
				possibleTileArr.push($.domino[$.players[gameData.player].tiles[n]]);
			}
		}
	}else{
		if(gameData.placed.length == 1){
			var centerTile = $.domino[gameData.placed[0].tileIndex];
			for(var n=0; n<$.players[index].tiles.length; n++){
				var thisTile = $.domino[$.players[index].tiles[n]];

				for(var c=0; c<centerTile.numbers.length; c++){
					if(thisTile.numbers.indexOf(centerTile.numbers[c]) != -1){
						possibleTileArr.push(thisTile);
					}
				}
			}
		}else{
			var leftTile = gameData.leftTile;
			var rightTile = gameData.rightTile;
			
			for(var n=0; n<$.players[index].tiles.length; n++){
				var thisTile = $.domino[$.players[index].tiles[n]];

				for(var c=0; c<leftTile.numbers.length; c++){
					if(thisTile.numbers.indexOf(leftTile.numbers[c]) != -1){
						possibleTileArr.push(thisTile);
					}
				}

				for(var c=0; c<rightTile.numbers.length; c++){
					if(thisTile.numbers.indexOf(rightTile.numbers[c]) != -1){
						possibleTileArr.push(thisTile);
					}
				}
			}
		}
	}

	return possibleTileArr;
}

/*!
 * 
 * HIGHLIGHT PLAYER - This is the function that runs to highlight player
 * 
 */
function highlightPlayer(con){
	for(var n=0; n<gameData.players; n++){
		TweenMax.killTweensOf($.players["stats" + n].newPlayerStatsHighlight);
		$.players["stats" + n].newPlayerStatsHighlight.visible = false;
	}

	if(con){
		aniamtePlayerFocus($.players["stats" + gameData.player]);
		animateBlink($.players["stats" + gameData.player].newPlayerStatsHighlight);
	}
}

function aniamtePlayerFocus(obj){
	TweenMax.to(obj, .2, {delay:.5, scaleX:1.3, scaleY:1.3, ease:Sine.easeIn,  overwrite:true, onComplete:function(){
		TweenMax.to(obj, .2, {scaleX:1, scaleY:1, ease:Sine.easeOut, overwrite:true});	
	}});
}

function animateBlink(obj, alpha){
	var alphaNum = alpha == undefined ? .5 : alpha;
	obj.visible = true;
	obj.alpha = alphaNum;
	TweenMax.to(obj, .3, {alpha:1, overwrite:true, onComplete:function(){
		TweenMax.to(obj, .3, {alpha:alphaNum, overwrite:true, onComplete:animateBlink, onCompleteParams:[obj, alpha]});	
	}});
}

function killAnimateBlink(obj){
	obj.visible = false;
	TweenMax.killTweensOf(obj);
}

/*!
 * 
 * NEXT PLAYER - This is the function that runs to next player
 * 
 */
function nextPlayerTurn(){
	gameData.player++;
	gameData.player = gameData.player > gameData.players-1 ? 0 : gameData.player;

	var playersPossibleMove = false;
	for(var n=0; n<gameData.players; n++){
		var possibleTileArr = checkPossibleMove(n);
		if(possibleTileArr.length > 0){
			playersPossibleMove = true;
		}
	}

	var roundEnd = true;
	if(gameData.domino.draw){
		if(playersPossibleMove){
			roundEnd = false;
		}else if(gameData.draw.length > 0){
			roundEnd = false;
		}
	}else{
		if(playersPossibleMove){
			roundEnd = false;
		}
	}

	gameData.complete = roundEnd;
	if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
		postSocketUpdate('movecomplete', socketData.gameIndex);
	}else{
		checkGameEnd();
	}
}

function checkGameEnd(){
	if(gameData.complete){
		highlightPlayer(false);
		showGameStatus("roundend");
	}else{
		displayPlayerTurn();
	}
}

/*!
 * 
 * AI AUTO MOVE - This is the function that runs to auto move
 * 
 */
function tryFirstMove(possibleTileArr){
	if(gameData.ai && $.players[gameData.player].playerIndex != 0){
		highlightTitles([]);

		var aiSpeed = gameData.drawing == true ? gameSettings.aiDrawSpeed : gameSettings.aiThinkSpeed;
		TweenMax.to(boardContainer, aiSpeed, {overwrite:true, onComplete:function(){
			if(gameData.drawing){
				var randomIndex = Math.floor(Math.random() * gameData.draw.length);
				getDrawPile($.domino[gameData.draw[randomIndex]].tileIndex);
			}else{
				//find highest same numbers
				var highestSameArr = [];
				var highestSingleArr = [];
				for(var p=0; p<possibleTileArr.length; p++){
					var thisTile = possibleTileArr[p];
					if(thisTile.sameNumbers){
						var totalNumbers = thisTile.numbers[0];
						highestSameArr.push({total:totalNumbers, tile:thisTile});
					}else{
						var totalNumbers = thisTile.numbers[0] + thisTile.numbers[1];
						highestSingleArr.push({total:totalNumbers, tile:thisTile});
					}
				}

				sortOnObject(highestSameArr, "total", true);
				sortOnObject(highestSingleArr, "total", true);

				var thisTile;
				if(highestSameArr.length > 0){
					var randomIndex = Math.floor(Math.random() * highestSameArr.length);
					thisTile = highestSameArr[randomIndex].tile;
				}else{
					var randomIndex = Math.floor(Math.random() * highestSingleArr.length);
					thisTile = highestSingleArr[randomIndex].tile;
				}

				highlightPlacelable(thisTile.numbers);

				/*var randomIndex = Math.floor(Math.random() * possibleTileArr.length);
				var thisTile = possibleTileArr[randomIndex];
				highlightPlacelable(thisTile.numbers);*/
				
				if(gameData.highlight.length > 0){
					var randomHighlightIndex = Math.floor(Math.random() * gameData.highlight.length);
					placeTitle(thisTile.tileIndex, gameData.highlight[randomHighlightIndex].tileIndex, gameData.highlight[randomHighlightIndex].dir);
				}else{
					placeTitle(thisTile.tileIndex, "", "none");
				}
				highlightPlacelable();
			}
		}});
	}else if(gameSettings.autoMove && !gameData.drawing){
		var proceedAuto = false;

		if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
			if($.players[gameData.player].playerIndex == socketData.gameIndex){
				proceedAuto = true;
			}
		}else{
			if($.players[gameData.player].playerIndex == 0){
				proceedAuto = true;
			}
		}

		if(proceedAuto){
			TweenMax.to(boardContainer, .5, {overwrite:true, onComplete:function(){
				var possibleTileArr = checkPossibleMove(gameData.player);
				if(gameData.placed.length == 0){
					if(possibleTileArr.length == 1){
						playerMove(possibleTileArr[0].tileIndex);
						highlightPlacelable();
					}
				}else{
					highlightPlacelable(possibleTileArr[0].numbers);
					if(possibleTileArr.length == 1 && gameData.highlight.length == 1){
						playerMove(possibleTileArr[0].tileIndex, gameData.highlight[0].tileIndex, gameData.highlight[0].dir);
					}
					highlightPlacelable();
				}
			}});
		}
	}
}

/*!
 * 
 * HIGHTLIGHT TILES - This is the function that runs to highlight tiles
 * 
 */
function highlightTitles(possibleTileArr){
	for(var n=0; n<gameData.tiles.length; n++){
		killAnimateBlink($.domino[n].highlight);
	}
	
	if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
		if(gameData.player != socketData.gameIndex){
			return;
		}
	}

	for(var n=0; n<possibleTileArr.length; n++){
		animateBlink(possibleTileArr[n].highlight);
	}
}

function highlightPlacelable(numbers){
	var numbers = numbers == undefined ? [] : numbers;
	gameData.highlight = [];
	boardHighlightContainer.removeAllChildren();

	if(gameData.placed.length != 0){
		var leftNumber = gameData.leftTile.rotationNum == 0 ? gameData.leftTile.numbers[0] : gameData.leftTile.numbers[1];
		var rightNumber = gameData.rightTile.rotationNum == 0 ? gameData.rightTile.numbers[1] : gameData.leftTile.numbers[0];

		if(gameData.leftTile.numbers.length == 1){
			leftNumber = gameData.leftTile.numbers[0];
		}

		if(gameData.rightTile.numbers.length == 1){
			rightNumber = gameData.rightTile.numbers[0];
		}

		var limitCount = 2;
		if(numbers.length == 2){
			if(numbers[0] == numbers[1]){
				limitCount = 1;
			}
		}
		
		for(var n=0; n<numbers.length; n++){
			if(numbers[n] == leftNumber && limitCount > 0){
				createHighlight(gameData.leftTile, "left");
				limitCount--;
			}
			
			if(numbers[n] == rightNumber && limitCount > 0){
				createHighlight(gameData.rightTile, "right");
				limitCount--;
			}
		}
	}
}

function createHighlight(tile, dir){
	var newHighlight = new createjs.Bitmap(loader.getResult('itemTileHighlight'));
	centerReg(newHighlight);
	createHitarea(newHighlight);
	newHighlight.scaleX = newHighlight.scaleY = gameData.mask.scale;

	var highlightRadius = newHighlight.image.naturalWidth;
	var tileDistance = gameData.tile.width;
	var pos;
	
	tileDistance = (gameData.tile.width/2) + (highlightRadius/2);
	if(tile.rotationNum == 90 || tile.rotationNum == 270){
		tileDistance = (gameData.tile.height/2) + (highlightRadius/2);
	}
	
	//console.log("nextDir : ",tile.nextDir, gameData.mask.scale);
	if(tile.nextDir == ""){
		tileDistance = tileDistance * gameData.mask.scale;
		if(dir == "left"){
			pos = getAnglePosition(tile.x, tile.y, tileDistance, 180);
		}else{
			pos = getAnglePosition(tile.x, tile.y, tileDistance, 0);
		}
	}else{
		if(tile.nextDir == "top" || tile.nextDir == "bottom"){
			tileDistance = (gameData.tile.height/2) + (highlightRadius/2);
			if(tile.rotationNum == 90 || tile.rotationNum == 270){
				tileDistance = (gameData.tile.width/2) + (highlightRadius/2);
			}
		}

		tileDistance = tileDistance * gameData.mask.scale;
		if(tile.nextDir == "right"){
			pos = getAnglePosition(tile.x, tile.y, tileDistance, 0);
		}else if(tile.nextDir == "left"){
			pos = getAnglePosition(tile.x, tile.y, tileDistance, 180);
		}else if(tile.nextDir == "top"){
			pos = getAnglePosition(tile.x, tile.y, tileDistance, 270);
		}else if(tile.nextDir == "bottom"){
			pos = getAnglePosition(tile.x, tile.y, tileDistance, 90);
		}
	}

	newHighlight.x = pos.x;
	newHighlight.y = pos.y;

	newHighlight.tileIndex = tile.tileIndex;
	newHighlight.dir = dir;

	if(!gameSettings.dragToMove){
		newHighlight.cursor = "pointer";
		newHighlight.addEventListener("click", function(evt) {
			playerMove($.domino[gameData.tileSelected].tileIndex, evt.target.tileIndex, evt.target.dir);
			highlightPlacelable();
		});
	}

	animateBlink(newHighlight);
	boardHighlightContainer.addChild(newHighlight);
	gameData.highlight.push(newHighlight);
}

/*!
 * 
 * UPDATE GAME - This is the function that runs to loop game update
 * 
 */
function updateGame(){
	if(!gameData.paused){
		for(var n=0; n<gameData.tiles.length; n++){
			var thisTile = gameData.tiles[n];
			thisTile.shadow.x = thisTile.x + gameSettings.tileShadowSpace;
			thisTile.shadow.y = thisTile.y + gameSettings.tileShadowSpace;
			thisTile.shadow.rotation = thisTile.rotation;
			thisTile.shadow.visible = thisTile.visible;
		}
	}
}

/*!
 * 
 * GAME STATUS - This is the function that runs to show game status
 * 
 */
function showGameStatus(con){
	var delayStart = 0;
	var delayMessage = 1;
	var soundName = "soundAlert";
	statusPlayerTxt.text = $.players["stats" + gameData.player].playerName.text;
	if(con == 'first'){
		statusTxt.text = textDisplay.highestToStart;
	}else if(con == 'nomove'){
		statusTxt.text = textDisplay.playerNoMove;

		if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
			if($.players[gameData.player].playerIndex == socketData.gameIndex){
				drawTitleTxt.text = textDisplay.userPickDomino;
			}else{
				drawTitleTxt.text = textDisplay.playerPickDomino.replace("[NAME]", $.players["stats" + gameData.player].playerName.text);
			}
		}else{
			if($.players[gameData.player].playerIndex == 0){
				drawTitleTxt.text = textDisplay.userPickDomino;
			}else{
				drawTitleTxt.text = textDisplay.playerPickDomino.replace("[NAME]", $.players["stats" + gameData.player].playerName.text);
			}
		}

		delayStart = 1;
		TweenMax.to(boardContainer, 3, {overwrite:true, onComplete:function(){
			toggleDrawPiles(true);
			tryFirstMove();
		}});
	}else if(con == 'cantmove'){
		delayStart = 1;
		statusTxt.text = textDisplay.playerCantMove;
		TweenMax.to(boardContainer, 3, {overwrite:true, onComplete:function(){
			nextPlayerTurn();
		}});
	}else if(con == 'block'){
		delayStart = 1;
		statusTxt.text = textDisplay.playerBlocked;
		TweenMax.to(boardContainer, 3, {overwrite:true, onComplete:function(){
			nextPlayerTurn();
		}});
	}else if(con == 'domino'){
		soundName = "soundWinner";
		delayStart = 1;
		statusTxt.text = textDisplay.playerDomino;
		TweenMax.to(boardContainer, 3, {overwrite:true, onComplete:function(){
			toggleRoundScore(true, true);
		}});
	}else if(con == 'roundend'){
		soundName = "soundRound";
		delayStart = 1;
		statusTxt.text = textDisplay.playerNoMove;
		statusPlayerTxt.text = textDisplay.roundEnd;
		TweenMax.to(boardContainer, 3, {overwrite:true, onComplete:function(){
			toggleRoundScore(true, false);
		}});
	}

	statusContainer.alpha = 0;
	TweenMax.to(statusContainer, .5, {delay:delayStart, alpha:1, overwrite:true, onStart:function(){
		playSound(soundName);
	},onComplete:function(){
		TweenMax.to(statusContainer, .5, {delay:delayMessage, alpha:0, overwrite:true});
	}});
}

/*!
 * 
 * TOGGLE ROUND SCORE - This is the function that runs to toggle round score
 * 
 */
function toggleRoundScore(con, win){
	boardScoreListContainer.removeAllChildren();
	boardScoreContainer.visible = con;

	if(con){
		//calculate
		playSound("soundPoint");
		var finalScore = 0;
		var scoreListArr = [];
		var roundEnd = false;

		for(var n=0; n<gameData.players; n++){
			var playerNumberLeft = 0;
			for(var p=0; p<$.players[n].tiles.length; p++){
				var thisTile = $.domino[$.players[n].tiles[p]];
				thisTile.frontContainer.visible = true;

				var totalNumbers = thisTile.numbers[0] + thisTile.numbers[1];
				playerNumberLeft += totalNumbers;
			}

			if(win){
				finalScore += playerNumberLeft;
			}else{
				scoreListArr.push({total:playerNumberLeft, player:n});
			}
		}

		if(!win){
			sortOnObject(scoreListArr, "total", false);
			gameData.player = scoreListArr[0].player;

			finalScore = 0;
			for(var n=1; n<scoreListArr.length; n++){
				finalScore += scoreListArr[n].total;
			}
		}

		//display score
		if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
			if(win && $.players[gameData.player].playerIndex == socketData.gameIndex){
				roundStatusTxt.text = textDisplay.playerRoundWin;
			}else{
				roundStatusTxt.text = textDisplay.playerRoundLose;
			}
		}else{
			if(win && $.players[gameData.player].playerIndex == 0){
				roundStatusTxt.text = textDisplay.playerRoundWin;
			}else{
				roundStatusTxt.text = textDisplay.playerRoundLose;
			}
		}

		var pos = {startY:50, x:-150, y:0, spaceY:45, scoreX:300, titleSpace:50};
		pos.y = pos.startY - (((gameData.players-1) * pos.spaceY));
		pos.y -= pos.titleSpace;
		itemScoreTop.y = pos.y - pos.spaceY;

		var goalPointTitle = new createjs.Text();
		goalPointTitle.font = "25px bpreplaybold";
		goalPointTitle.color = '#fff';
		goalPointTitle.textAlign = "center";
		goalPointTitle.textBaseline='alphabetic';
		goalPointTitle.text = textDisplay.goalPointTitle.replace("[NUMBER]", gameSettings.points[gameData.pointIndex]);
		goalPointTitle.y = pos.y;

		var titleDivide = new createjs.Bitmap(loader.getResult('itemScoreDivide'));
		centerReg(titleDivide);
		titleDivide.y = pos.y + 15;

		pos.y += pos.titleSpace;
		boardScoreListContainer.addChild(goalPointTitle, titleDivide);

		var targetScoreTxt = null;
		var targetScore = 0;
		for(var n=0; n<gameData.players; n++){
			var playerName = new createjs.Text();
			playerName.font = "25px bpreplaybold";
			playerName.color = '#fff';
			playerName.textAlign = "left";
			playerName.textBaseline='alphabetic';
			playerName.text = $.players["stats" + n].playerName.text;

			var playerScore = new createjs.Text();
			playerScore.font = "25px bpreplaybold";
			playerScore.color = '#fff';
			playerScore.textAlign = "right";
			playerScore.textBaseline='alphabetic';
			playerScore.text = textDisplay.playerScore.replace("[NUMBER]", playerData.scores[n]);

			if(n == gameData.player){
				tweenData.tweenScore = playerData.scores[n];
				targetScoreTxt = playerScore;
				playerData.scores[n] += finalScore;
				playerName.text = playerName.text + textDisplay.playerScoreAdd.replace("[NUMBER]", finalScore);
				targetScore = playerData.scores[n];

				if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
					if($.players[gameData.player].playerIndex == socketData.gameIndex){
						roundStatusTxt.text = textDisplay.playerRoundWin;
					}
				}else{
					if($.players[gameData.player].playerIndex == 0){
						roundStatusTxt.text = textDisplay.playerRoundWin;
					}
				}

				if(playerData.scores[n] >= gameData.domino.point){
					if($.players[gameData.player].playerIndex == 0){
						roundStatusTxt.text = textDisplay.userWin;
					}else{
						roundStatusTxt.text = textDisplay.playerWin.replace("[NAME]", $.players["stats" + n].playerName.text);
					}
					roundEnd = true;
				}

				playerName.color = playerScore.color = '#FFFF00';
				animateBlink(playerName, .6);
				animateBlink(playerScore, .6);
			}

			var playerDivide = new createjs.Bitmap(loader.getResult('itemScoreDivide'));
			centerReg(playerDivide);

			playerName.x = pos.x;
			playerName.y = pos.y;

			playerScore.x = pos.x + pos.scoreX;
			playerScore.y = pos.y;

			playerDivide.y = pos.y + (pos.spaceY/4);
			playerDivide.visible = n == gameData.players-1 ? false : true;

			pos.y += pos.spaceY;
			boardScoreListContainer.addChild(playerName, playerScore, playerDivide);
			$.players["stats" + n].playerScore.text = textDisplay.playerScore.replace("[NUMBER]", playerData.scores[n]);
		}

		if(targetScoreTxt != null){
			TweenMax.to(tweenData, .5, {delay:1, tweenScore:targetScore, overwrite:true, onUpdate:function(){
				targetScoreTxt.text = textDisplay.playerScore.replace("[NUMBER]", Math.round(tweenData.tweenScore));
			}});
		}

		boardScoreContainer.alpha = 0;
		TweenMax.to(boardScoreContainer, .5, {alpha:1, overwrite:true, onComplete:function(){
			TweenMax.to(boardScoreContainer, 4, {overwrite:true, onComplete:function(){
				if(roundEnd){
					endGame();
				}else{
					TweenMax.to(boardScoreContainer, .5, {alpha:0, overwrite:true, onComplete:function(){
						playSound("soundShuffleOut");
						for(var n=0; n<gameData.tiles.length; n++){
							var thisTile = gameData.tiles[n];
							thisTile.frontContainer.visible = false;
							TweenMax.to(thisTile, gameSettings.tileDealSpeed, {x:0, y:0, rotation:0, scaleX:1, scaleY:1, overwrite:true});
						}

						for(var n=0; n<gameData.players; n++){
							$.players["stats" + n].visible = false;
						}
						
						TweenMax.to(boardScoreContainer, .5, {alpha:0, overwrite:true, onComplete:function(){
							if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
								postSocketUpdate('resultcomplete', socketData.gameIndex);
							}else{
								startDomino();
							}
						}});
					}});
				}
			}});
		}});
	}
}

/*!
 * 
 * END GAME - This is the function that runs for game end
 * 
 */
function endGame(){
	gameData.paused = true;
	TweenMax.to(gameContainer, 1, {overwrite:true, onComplete:function(){
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
	gtag('event','click',{'event_category':'share','event_label':action});
	
	var loc = location.href
	loc = loc.substring(0, loc.lastIndexOf("/") + 1);
	
	var title = '';
	var text = '';
	
	title = shareTitle.replace("[SCORE]", playerData.score);
	text = shareMessage.replace("[SCORE]", playerData.score);
	
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
	
	window.open(shareurl);
}