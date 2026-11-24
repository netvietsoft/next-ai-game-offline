////////////////////////////////////////////////////////////
// GAME v1.1
////////////////////////////////////////////////////////////

/*!
 * 
 * GAME SETTING CUSTOMIZATION START
 * 
 */

//theme settings
var themesSettings = [
	{
		board:'assets/board_01.png',
		grids:[
			'assets/texture_01_a.png',
			'assets/texture_01_b.png',
			'assets/texture_01_c.png'
		],
		white:'assets/ball_01_w.png',
		black:'assets/ball_01_b.png',
		select:'assets/select.png',
		highlight:'assets/highlight.png',
		arrow:'assets/item_guide.png',
	},
	{
		board:'assets/board_02.png',
		grids:[
			'assets/texture_02_a.png',
			'assets/texture_02_b.png',
			'assets/texture_02_c.png'
		],
		white:'assets/ball_02_w.png',
		black:'assets/ball_02_b.png',
		select:'assets/select.png',
		highlight:'assets/highlight.png',
		arrow:'assets/item_guide.png',
	},
	{
		board:'assets/board_01.png',
		grids:[
			'assets/texture_01_a.png',
			'assets/texture_01_b.png',
			'assets/texture_01_c.png'
		],
		white:'assets/ball_03_w.png',
		black:'assets/ball_03_b.png',
		select:'assets/select.png',
		highlight:'assets/highlight.png',
		arrow:'assets/item_guide.png',
	},
	{
		board:'assets/board_01.png',
		grids:[
			'assets/texture_01_a.png',
			'assets/texture_01_b.png',
			'assets/texture_01_c.png'
		],
		white:'assets/ball_04_w.png',
		black:'assets/ball_04_b.png',
		select:'assets/select.png',
		highlight:'assets/highlight.png',
		arrow:'assets/item_guide.png',
	},
	{
		board:'assets/board_01.png',
		grids:[
			'assets/texture_01_a.png',
			'assets/texture_01_b.png',
			'assets/texture_01_c.png'
		],
		white:'assets/ball_05_w.png',
		black:'assets/ball_05_b.png',
		select:'assets/select.png',
		highlight:'assets/highlight.png',
		arrow:'assets/item_guide.png',
	},
	{
		board:'assets/board_01.png',
		grids:[
			'assets/texture_01_a.png',
			'assets/texture_01_b.png',
			'assets/texture_01_c.png'
		],
		white:'assets/ball_06_w.png',
		black:'assets/ball_06_b.png',
		select:'assets/select.png',
		highlight:'assets/highlight.png',
		arrow:'assets/item_guide.png',
	},
	{
		board:'assets/board_01.png',
		grids:[
			'assets/texture_01_a.png',
			'assets/texture_01_b.png',
			'assets/texture_01_c.png'
		],
		white:'assets/ball_07_w.png',
		black:'assets/ball_07_b.png',
		select:'assets/select.png',
		highlight:'assets/highlight.png',
		arrow:'assets/item_guide.png',
	},
];

//game settings
var gameSettings = {
	layouts:[
		{
			name:'CLASSIC',
			layout:
			[
				[-2,-2,-2,-2,-1,-1,-1, 0, 0],
				[-2,-2,-2,-1,-1,-1,-1, 0, 0],
				[-2,-2,-1,-1,-1,-1, 0, 0, 0],
				[-2, 1,-1,-1,-1,-1, 0, 0, 0],
				[ 1, 1, 1,-1,-1,-1, 0, 0, 0],
				[ 1, 1, 1,-1,-1,-1,-1, 0,-2],
				[ 1, 1, 1,-1,-1,-1,-1,-2,-2],
				[ 1, 1,-1,-1,-1,-1,-2,-2,-2],
				[ 1, 1,-1,-1,-1,-2,-2,-2,-2]
			]
		},
		{
			name:'ALIEN ATTACK',
			layout:
			[
				[-2,-2,-2,-2,-1,-1,-1,-1,0],
				[-2,-2,-2,-1,-1,-1,0,0,-1],
				[-2,-2,-1,-1,-1,-1,1,1,0],
				[-2,-1,1,-1,-1,0,0,1,-1],
				[1,1,0,1,-1,0,1,0,0],
				[-1,0,1,1,-1,-1,0,-1,-2],
				[1,0,0,-1,-1,-1,-1,-2,-2],
				[-1,1,1,-1,-1,-1,-2,-2,-2],
				[1,-1,-1,-1,-1,-2,-2,-2,-2]
			  ]
		},
		{
			name:'BELGIAN DAISY',
			layout:
			[
				[-2,-2,-2,-2,-1,-1,-1,1,1],
				[-2,-2,-2,-1,-1,-1,1,1,1],
				[-2,-2,-1,-1,-1,-1,1,1,-1],
				[-2,0,0,-1,-1,-1,-1,0,0],
				[0,0,0,-1,-1,-1,0,0,0],
				[0,0,-1,-1,-1,-1,0,0,-2],
				[-1,1,1,-1,-1,-1,-1,-2,-2],
				[1,1,1,-1,-1,-1,-2,-2,-2],
				[1,1,-1,-1,-1,-2,-2,-2,-2]
			  ]
		},
		{
			name:'DUTCH DAISY',
			layout:
			[
				[-2,-2,-2,-2,-1,-1,-1,1,1],
				[-2,-2,-2,-1,-1,-1,1,0,1],
				[-2,-2,-1,-1,-1,-1,1,1,-1],
				[-2,0,0,-1,-1,-1,-1,0,0],
				[0,1,0,-1,-1,-1,0,1,0],
				[0,0,-1,-1,-1,-1,0,0,-2],
				[-1,1,1,-1,-1,-1,-1,-2,-2],
				[1,0,1,-1,-1,-1,-2,-2,-2],
				[1,1,-1,-1,-1,-2,-2,-2,-2]
			  ]
		},
		{
			name:'FACE 2 FACE',
			layout:
			[
				[-2,-2,-2,-2,0,0,0,-1,-1],
				[-2,-2,-2,0,0,0,0,-1,-1],
				[-2,-2,0,0,0,0,-1,-1,-1],
				[-2,-1,0,0,0,-1,-1,-1,-1],
				[-1,-1,-1,-1,-1,-1,-1,-1,-1],
				[-1,-1,-1,-1,1,1,1,-1,-2],
				[-1,-1,-1,1,1,1,1,-2,-2],
				[-1,-1,1,1,1,1,-2,-2,-2],
				[-1,-1,1,1,1,-2,-2,-2,-2]
			  ]
		},
		{
			name:'FUJIYAMA',
			layout:
			[
				[-2,-2,-2,-2,-1,-1,-1,-1,1],
				[-2,-2,-2,-1,-1,-1,-1,1,1],
				[-2,-2,-1,-1,-1,-1,1,0,1],
				[-2,-1,-1,-1,-1,1,0,0,1],
				[0,0,0,0,-1,1,1,1,1],
				[0,1,1,0,-1,-1,-1,-1,-2],
				[0,1,0,-1,-1,-1,-1,-2,-2],
				[0,0,-1,-1,-1,-1,-2,-2,-2],
				[0,-1,-1,-1,-1,-2,-2,-2,-2]
			  ]
		},
		{
			name:'GERMAN DAISY',
			layout:
			[
				[-2,-2,-2,-2,-1,-1,1,1,-1],
				[-2,-2,-2,-1,-1,1,1,1,-1],
				[-2,-2,0,0,-1,1,1,-1,-1],
				[-2,0,0,0,-1,-1,-1,-1,-1],
				[-1,0,0,-1,-1,-1,0,0,-1],
				[-1,-1,-1,-1,-1,0,0,0,-2],
				[-1,-1,1,1,-1,0,0,-2,-2],
				[-1,1,1,1,-1,-1,-2,-2,-2],
				[-1,1,1,-1,-1,-2,-2,-2,-2]
			  ]
		},
	],
	twoPlayer:true,
	pushSpeed:300,
	removeSpeed:800,
	aiThinkSpeed:1,
	aiMoveSpeed:.2,
	score:120000
};

//game text display
var textDisplay = {
	tutorialTitle:'HOW TO PLAY?',
	vs:'VS',
	player1:'PLAYER 1',
	player2:'PLAYER 2',
	computer:'COMPUTER',
	userTurn:'YOUR TURN',
	playerTurn:'[NAME] TURN',
	computerTurn:'THINKING...',
	userWin:"YOU WON",
	playerWin:"[NAME] WON",
	gameOver:'GAME OVER',
	exitTitle:'EXIT GAME',
	exitMessage:'Are you sure you want\nto quit game?',
	share:'SHARE YOUR SCORE:',
	resultTitle:"GAME OVER",
	resultDesc:'[NUMBER] PTS',
}

//Social share, [SCORE] will replace with game score
var shareEnable = false; //toggle share
var shareTitle = 'Highscore on Play Abalone is [SCORE]PTS';//social share score title
var shareMessage = '[SCORE]PTS is mine new highscore on Play Abalone game! Try it now!'; //social share score message

/*!
 *
 * GAME SETTING CUSTOMIZATION END
 *
 */
$.editor = {enable:false};
var playerData = {score:0, scores:[]};
var gameData = {paused:true, player:0, players:0, gridSizeW:50, gridSizeH:43, icon:0, iconSwitch:false, themeIndex:0, sizeIndex:0, layoutIndex:0, ai:true, winner:-1, names:[]};
var tweenData = {score:0, tweenScore:0};
var timeData = {enable:false, startDate:null, nowDate:null, timer:0, oldTimer:0, playerTimer:0, opponentTimer:0, playerAccumulate:0, opponentAccumulate:0};

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

	buttonOnePlayer.cursor = "pointer";
	buttonOnePlayer.addEventListener("click", function(evt) {
		playSound('soundButton');
		checkGameType(true);
	});

	buttonTwoPlayer.cursor = "pointer";
	buttonTwoPlayer.addEventListener("click", function(evt) {
		playSound('soundButton');
		checkGameType(false);
	});

	buttonLocal.cursor = "pointer";
	buttonLocal.addEventListener("click", function(evt) {
		playSound('soundButton');
		socketData.online = false;
		toggleMainButton('players');
	});

	buttonOnline.cursor = "pointer";
	buttonOnline.addEventListener("click", function(evt) {
		playSound('soundButton');
		checkQuickGameMode();
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
			toggleMainButton('players');
		}
	});

	buttonTutorial.cursor = "pointer";
	buttonTutorial.addEventListener("click", function(evt) {
		playSound('soundButton');
		goPage('tutorial')
	});

	buttonPlayersIcon.cursor = "pointer";
	buttonPlayersIcon.addEventListener("click", function(evt) {
		playSound('soundButton2');
		toggleGameIcon();
	});

	buttonPlayersSwitch.cursor = "pointer";
	buttonPlayersSwitch.addEventListener("click", function(evt) {
		playSound('soundButton2');
		toggleGameIconSide();
	});

	buttonPlayersNext.cursor = "pointer";
	buttonPlayersNext.addEventListener("click", function(evt) {
		playSound('soundButton');
		toggleBoardOptions(2);
		if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
			postSocketUpdate('updateoptions', {themeIndex:gameData.themeIndex, iconSwitch:gameData.iconSwitch, layoutIndex:gameData.layoutIndex, option:gameData.lastOption}, true);
		}
	});

	buttonTutorialL.cursor = "pointer";
	buttonTutorialL.addEventListener("click", function(evt) {
		playSound('soundButton');
		toggleTutorial(false);
	});

	buttonTutorialR.cursor = "pointer";
	buttonTutorialR.addEventListener("click", function(evt) {
		playSound('soundButton');
		toggleTutorial(true);
	});

	buttonBack.cursor = "pointer";
	buttonBack.addEventListener("click", function(evt) {
		playSound('soundButton');
		goPage('main');
	});

	buttonLayoutL.cursor = "pointer";
	buttonLayoutL.addEventListener("click", function(evt) {
		playSound('soundButton');
		toggleLayout(false);
	});

	buttonLayoutR.cursor = "pointer";
	buttonLayoutR.addEventListener("click", function(evt) {
		playSound('soundButton');
		toggleLayout(true);
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
		if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online && multiplayerSettings.rejoinRoom) {
			goPage('room');
			$('#roomlists').val(socketData.lastRoom);
			joinSocketRoom();
		}else{
			goPage('main');
		}
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

	window.addEventListener('blur', function() {
		TweenMax.ticker.useRAF(false);
	}, false);


	window.addEventListener('focus', function() {
		TweenMax.ticker.useRAF(true);
	}, false);
	
	gameData.players = 2;
	gameData.settings = {
		size:9,
		width:0,
		height:0,
		gridSizeW:gameData.gridSizeW,
		gridSizeH:gameData.gridSizeH,
	}

	setupGridMapping();
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
	buttonTutorial.visible = false;
	buttonPlayerContainer.visible = false;
	buttonLocalContainer.visible = false;

	if(con == 'default'){
		buttonPlay.visible = true;
		buttonTutorial.visible = true;
	}else if(con == 'local'){
		buttonLocalContainer.visible = true;
	}else if(con == 'players'){
		if(!gameSettings.twoPlayer){
			checkGameType(true);
			return;
		}

		buttonPlayerContainer.visible = true;
	}
}

function checkGameType(con){
	gameData.ai = con;
	goPage('options');
}

function checkQuickGameMode(){
	socketData.online = true;
	if(!multiplayerSettings.enterName){
		buttonPlay.visible = false;
		buttonPlayerContainer.visible = false;
		buttonLocalContainer.visible = false;

		addSocketRandomUser();
	}else{
		goPage('name');
	}
}

function toggleGameIcon(){
	gameData.themeIndex++;
	gameData.themeIndex = gameData.themeIndex > themesSettings.length-1 ? 0 : gameData.themeIndex;

	displayPlayerIcon();
	if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
		postSocketUpdate('updateoptions', {themeIndex:gameData.themeIndex, iconSwitch:gameData.iconSwitch, layoutIndex:gameData.layoutIndex, option:gameData.lastOption}, true);
	}
}

function toggleGameIconSide(){
	gameData.iconSwitch = gameData.iconSwitch == true ? false : true;
	displayPlayerIcon();
	if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
		postSocketUpdate('updateoptions', {themeIndex:gameData.themeIndex, iconSwitch:gameData.iconSwitch, layoutIndex:gameData.layoutIndex, option:gameData.lastOption}, true);
	}
}

function displayPlayerIcon(){
	for(var n=0; n<2; n++){
		if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {

		}else{
			if(n == 0){
				if(gameData.ai){
					$.players['player'+ 1].text = textDisplay.computer;
				}else{
					$.players['player'+ 1].text = textDisplay.player2;
				}
			}
		}
		
		$.players['playerIconContainer'+ n].removeAllChildren();

		var iconID = n == 0 ? 'black'+gameData.themeIndex : 'white'+gameData.themeIndex;
		if(gameData.iconSwitch){
			iconID = n == 0 ? 'white'+gameData.themeIndex : 'black'+gameData.themeIndex;
		}
		$.players['playerIcon'+ n] = new createjs.Bitmap(loader.getResult(iconID));
		centerReg($.players['playerIcon'+ n]);
		$.players['playerIconContainer'+ n].addChild($.players['playerIcon'+ n]);
	}
}

function toggleLayout(con){
	if(con){
		gameData.layoutIndex++;
		gameData.layoutIndex = gameData.layoutIndex > gameSettings.layouts.length-1 ? gameSettings.layouts.length-1 : gameData.layoutIndex;
	}else{
		gameData.layoutIndex--;
		gameData.layoutIndex = gameData.layoutIndex < 0 ? 0 : gameData.layoutIndex;
	}

	displayBoardLayout();
	if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
		postSocketUpdate('updateoptions', {themeIndex:gameData.themeIndex, iconSwitch:gameData.iconSwitch, layoutIndex:gameData.layoutIndex, option:gameData.lastOption}, true);
	}
}

function displayBoardLayout(){
	layoutTitleTxt.text = gameSettings.layouts[gameData.layoutIndex].name;

	setupBoard();
	buildBoard();
	fillBoard();
	resizeGameLayout();
}

function toggleBoardOptions(page){
	playersContainer.visible = false;
	layoutContainer.visible = false;

	if(page == 1){
		gameData.lastOption = 1;
		playersContainer.visible = true;
		buttonPlayersNext.visible = true;
		buttonPlayersIcon.visible = true;
		buttonPlayersSwitch.visible = true;
		
		displayPlayerIcon();
		if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {			
			if(!socketData.host){
				buttonPlayersNext.visible = false;
				buttonPlayersIcon.visible = false;
				buttonPlayersSwitch.visible = false;
			}
		}
	}else if(page == 2){
		gameData.lastOption = 2;
		layoutContainer.visible = true;

		buttonLayoutL.visible = true;
		buttonLayoutR.visible = true;
		buttonStart.visible = true;
		boardContainer.visible = true;
		boardContainer.scaleX = boardContainer.scaleY = .8;
		displayBoardLayout();

		if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {			
			if(!socketData.host){
				buttonLayoutL.visible = false;
				buttonLayoutR.visible = false;
				buttonStart.visible = false;
			}
		}
	}
	resizeGameLayout();
}

function toggleTutorial(con){
	if(con){
		gameData.tutorial++;
		gameData.tutorial = gameData.tutorial > 5 ? 5 : gameData.tutorial;
	}else{
		gameData.tutorial--;
		gameData.tutorial = gameData.tutorial < 1 ? 1 : gameData.tutorial;
	}

	displayTutorial();
}

function displayTutorial(){
	for(var n=0; n<5; n++){
		$.tutorial[n].visible = false;
	}
	$.tutorial[gameData.tutorial-1].visible = true;
	tutorialPageTxt.text = gameData.tutorial+'/5';
	
	buttonTutorialL.visible = true;
	buttonTutorialR.visible = true;
	if(gameData.tutorial == 1){
		buttonTutorialL.visible = false;
	}
	if(gameData.tutorial == 5){
		buttonTutorialR.visible = false;
	}
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
			gameLogsTxt.y = canvasH/100 * 77;
		}else{
			gameLogsTxt.x = canvasW/2;
			gameLogsTxt.y = canvasH/100 * 73;
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
	tutorialContainer.visible = false;
	boardOptionsContainer.visible = false;
	boardContainer.visible = false;
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

		case 'tutorial':
			targetContainer = tutorialContainer;
			gameData.tutorial = 1;
			displayTutorial();
		break;

		case 'options':
			targetContainer = boardOptionsContainer;
			gameData.layoutIndex = 0;
			gameData.themeIndex = 0;
			gameData.iconSwitch = false;
			toggleBoardOptions(1);
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
				var playerScore = playerData.score;
				if(!socketData.host){
					playerScore = playerData.opponentScore;
				}
				TweenMax.to(tweenData, .5, {tweenScore:playerScore, overwrite:true, onUpdate:function(){
					resultDescTxt.text = textDisplay.resultDesc.replace('[NUMBER]', addCommas(Math.floor(tweenData.tweenScore)));
				}});
				
				if(socketData.host){
					postSocketCloseRoom();
				}else{
					exitSocketRoom();
				}

				saveGame(playerScore);
			}else{
				TweenMax.to(tweenData, .5, {tweenScore:playerData.score, overwrite:true, onUpdate:function(){
					resultDescTxt.text = textDisplay.resultDesc.replace('[NUMBER]', addCommas(Math.floor(tweenData.tweenScore)));
				}});

				saveGame(playerData.score);
			}
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
	gameData.animating = false;
	gameData.over = false;
	gameData.player = 0;
	gameData.winner = -1;

	gameData.firstX = -1;
	gameData.firstY = -1;
	gameData.secondX = -1;
	gameData.secondY = -1;
	gameData.dirX;
	gameData.dirY;

	gameData.highlightArr = [];
	gameData.targetC;
	gameData.targetR;
	
	statusContainer.alpha = 0;

	timeData.playerAccumulate = 0;
	timeData.opponentAccumulate = 0;

	boardContainer.scaleX = boardContainer.scaleY = 1;
	boardContainer.visible = true;

	setupBoard();
	buildBoard();
	fillBoard();
	
	if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
		gameData.ai = false;
		if(socketData.host){
			toggleGameTimer(true);
		}
		postSocketUpdate('ready', socketData.gameIndex);
	}else{
		toggleGameTimer(true);
		startBoard();
	}
	resizeGameLayout();
}

function startBoard(){
	gameData.ready = true;
	preparePlayers();
	animateGuide(boardGuideContainer);
	playSound('soundStart');
	displayPlayerTurn();
}

/*!
 * 
 * STOP GAME - This is the function that runs to stop play game
 * 
 */
function stopGame(){
	gameData.paused = true;
	toggleGameTimer(false);
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
 * RESIZE GAME LAYOUT - This is the function that runs to resize game layout
 * 
 */
function resizeGameLayout(){
	if(curPage == "game"){
		if(viewport.isLandscape){
			statusContainer.x = canvasW/2;
			statusContainer.y = canvasH/2;

			boardContainer.x = canvasW/2;
			boardContainer.y = canvasH/2;
		}else{
			statusContainer.x = canvasW/2;
			statusContainer.y = canvasH/100 * 40;

			boardContainer.x = canvasW/2;
			boardContainer.y = canvasH/100 * 40;
		}

		for(var n=0; n<2; n++){
			var posData = {x:0, y:0, sX:0, sY:0, w:0, size:48};
			posData.w = (($.players['gamePlayer'+ n].oppIcons.length-1) * posData.size);
			posData.sX = -(posData.w/2);
			posData.x = posData.sX;

			for(var i=0; i<$.players['gamePlayer'+ n].oppIcons.length; i++){
				var thisIcon = $.players['gamePlayer'+ n].oppIcons[i];
				thisIcon.x = posData.x;
				thisIcon.y = posData.y;

				posData.x += posData.size;
			}
		}
	}else{
		boardContainer.x = canvasW/2;
		boardContainer.y = canvasH/2;
	}
}

/*!
 * 
 * PREPARE PLAYERS - This is the function that runs to prepare players
 * 
 */
function preparePlayers(){
	for(var n=0; n<2; n++){
		$.players['gameIconContainer'+ n].removeAllChildren();
		$.players['gameOppIconContainer'+ n].removeAllChildren();
		$.players['gamePlayer'+ n].totalWon = 0;
		$.players['gamePlayer'+ n].oppIcons = [];

		if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {

		}else{
			if(n == 0){
				if(gameData.ai){
					$.players['gamePlayer'+ 1].text = textDisplay.computer;
				}else{
					$.players['gamePlayer'+ 1].text = textDisplay.player2;
				}
			}
		}

		addUserIcon(n);
		$.players['gameTurn'+ n].text = '';
	}
	playerData.score = gameSettings.score;
	playerData.opponentScore = gameSettings.score;
}

function addUserIcon(n){
	$.players['gameIconContainer'+ n].removeAllChildren();
	
	var iconID = n == 0 ? 'black'+gameData.themeIndex : 'white'+gameData.themeIndex;
	if(gameData.iconSwitch){
		iconID = n == 0 ? 'white'+gameData.themeIndex : 'black'+gameData.themeIndex;
	}
	$.players['gameIcon'+ n] = new createjs.Bitmap(loader.getResult(iconID));
	centerReg($.players['gameIcon'+ n]);
	$.players['gameIcon'+ n].y = 0;

	$.players['gameIconContainer'+ n].addChild($.players['gameIcon'+ n]);
}

function updatePlayerOppIcons(index){
	$.players['gameOppIconContainer'+ index].removeAllChildren();
	$.players['gamePlayer'+ index].oppIcons = [];

	for(var n=0; n<$.players['gamePlayer'+ index].totalWon; n++){
		var iconID = index == 1 ? 'black'+gameData.themeIndex : 'white'+gameData.themeIndex;
		if(gameData.iconSwitch){
			iconID = index == 1 ? 'white'+gameData.themeIndex : 'black'+gameData.themeIndex;
		}
		var newIcon = new createjs.Bitmap(loader.getResult(iconID));
		centerReg(newIcon);

		$.players['gamePlayer'+ index].oppIcons.push(newIcon);
		$.players['gameOppIconContainer'+ index].addChild(newIcon);
	}

	resizeGameLayout();
}

/*!
 * 
 * BUILD BOARD - This is the function that runs to build board
 * 
 */
function setupGridMapping(){
	//Game grid mapping to find best move
	gameData.CI = new Array(24);
	gameData.CJ = new Array(24);
	gameData.CI[0] = new Array(4,-1, 0, 1);
	gameData.CJ[0] = new Array(0, 1, 1, 0);
	gameData.CI[1] = new Array(5,-1, 0);
	gameData.CJ[1] = new Array(0, 1, 1);
	gameData.CI[2] = new Array(6,-1, 0);
	gameData.CJ[2] = new Array(0, 1, 1);
	gameData.CI[3] = new Array(7,-1, 0);
	gameData.CJ[3] = new Array(0, 1, 1);
	gameData.CI[4] = new Array(8,-1,-1, 0);
	gameData.CJ[4] = new Array(0, 0, 1, 1);
	gameData.CI[5] = new Array(8,-1,-1);
	gameData.CJ[5] = new Array(1, 0, 1);
	gameData.CI[6] = new Array(8,-1,-1);
	gameData.CJ[6] = new Array(2, 0, 1);
	gameData.CI[7] = new Array(8,-1,-1);
	gameData.CJ[7] = new Array(3, 0, 1);
	gameData.CI[8] = new Array(8, 0,-1,-1);
	gameData.CJ[8] = new Array(4,-1, 0, 1);
	gameData.CI[9] = new Array(7, 0,-1);
	gameData.CJ[9] = new Array(5,-1, 0);
	gameData.CI[10] = new Array(6, 0,-1);
	gameData.CJ[10] = new Array(6,-1, 0);
	gameData.CI[11] = new Array(5, 0,-1);
	gameData.CJ[11] = new Array(7,-1, 0);
	gameData.CI[12] = new Array(4, 1, 0,-1);
	gameData.CJ[12] = new Array(8,-1,-1, 0);
	gameData.CI[13] = new Array(3, 1, 0);
	gameData.CJ[13] = new Array(8,-1,-1);
	gameData.CI[14] = new Array(2, 1, 0);
	gameData.CJ[14] = new Array(8,-1,-1);
	gameData.CI[15] = new Array(1, 1, 0);
	gameData.CJ[15] = new Array(8,-1,-1);
	gameData.CI[16] = new Array(0, 1, 1, 0);
	gameData.CJ[16] = new Array(8, 0,-1,-1);
	gameData.CI[17] = new Array(0, 1, 1);
	gameData.CJ[17] = new Array(7, 0,-1);
	gameData.CI[18] = new Array(0, 1, 1);
	gameData.CJ[18] = new Array(6, 0,-1);
	gameData.CI[19] = new Array(0, 1, 1);
	gameData.CJ[19] = new Array(5, 0,-1);
	gameData.CI[20] = new Array(0, 0, 1, 1);
	gameData.CJ[20] = new Array(4, 1, 0,-1);
	gameData.CI[21] = new Array(1, 0, 1);
	gameData.CJ[21] = new Array(3, 1, 0);
	gameData.CI[22] = new Array(2, 0, 1);
	gameData.CJ[22] = new Array(2, 1, 0);
	gameData.CI[23] = new Array(3, 0, 1);
	gameData.CJ[23] = new Array(1, 1, 0);
}

function setupBoard(){
	//field value
	gameData.value = new Array(gameData.settings.size);
	gameData.value[0] = new Array(0, 0, 0, 0, 45, 45, 45, 45, 45);
	gameData.value[1] = new Array(0, 0, 0, 45, 50, 50, 50, 50, 45);
	gameData.value[2] = new Array(0, 0, 45, 50, 53, 53, 53, 50, 45);
	gameData.value[3] = new Array(0, 45, 50, 53, 54, 54, 53, 50, 45);
	gameData.value[4] = new Array(45, 50, 53, 54, 54, 54, 53, 50, 45);
	gameData.value[5] = new Array(45, 50, 53, 54, 54, 53, 50, 45, 0);
	gameData.value[6] = new Array(45, 50, 53, 53, 53, 50, 45, 0, 0);
	gameData.value[7] = new Array(45, 50, 50, 50, 50, 45, 0, 0, 0);
	gameData.value[8] = new Array(45, 45, 45, 45, 45, 0, 0, 0, 0);

	gameData.board = new Array(gameData.settings.size);
	gameData.field = new Array(gameData.settings.size);
	for (var n = 0; n < gameData.settings.size; n++) {
		gameData.board[n] = new Array(gameData.settings.size);
		gameData.field[n] = new Array(gameData.settings.size);
	}

	gameData.movement = new Array(6);
	for (var n = 0; n < 6; n++) {
		gameData.movement[n] = new Array(2);
	}

	gameData.temp = new Array(gameData.settings.size);
	for (i = 0; i < gameData.settings.size; i++) {
		gameData.temp[i] = new Array(gameData.settings.size);
	}
}

function buildBoard(){
	gameData.settings.width = gameData.settings.size * gameData.settings.gridSizeW;
	gameData.settings.height = gameData.settings.size * gameData.settings.gridSizeH;

	boardDesignContainer.removeAllChildren();
	boardIconContainer.removeAllChildren();
	boardHighlightContainer.removeAllChildren();
	boardArrowContainer.removeAllChildren();

	var bgBoard = new createjs.Bitmap(loader.getResult('board'+gameData.themeIndex));
	centerReg(bgBoard);
	boardDesignContainer.addChild(bgBoard);

	var positionData = {x:0, y:0, sX:0, sY:0};
	positionData.sY = -(gameData.settings.height/2);
	positionData.x = positionData.sX;
	positionData.y = positionData.sY;

	for(var r=0; r<gameData.settings.size; r++){
		var totalColumn = getTotalColumn(r);
		positionData.sX = -((totalColumn * gameData.settings.gridSizeW)/2);
		positionData.x = positionData.sX;

		for(var c=0; c<gameData.settings.size; c++){
			gameData.field[c][r] = gameSettings.layouts[gameData.layoutIndex].layout[c][r];

			if(gameData.value[c][r] != 0){
				var gridIndex = 1;
				if(r == 4){
					gridIndex = 0;
				}else if(r > 4){
					gridIndex = 2;
				}
				var newGrid = new createjs.Bitmap(loader.getResult('grid'+gameData.themeIndex+'_'+gridIndex));
				centerReg(newGrid);
				
				gameData.board[c][r] = new createjs.Shape();
				gameData.board[c][r].hitArea = new createjs.Shape(new createjs.Graphics().beginFill('red').drawCircle(0, 0, gameData.settings.gridSizeW/2));
				gameData.board[c][r].x = newGrid.x = positionData.x + (gameData.settings.gridSizeW/2);
				gameData.board[c][r].y = newGrid.y = positionData.y + (gameData.settings.gridSizeH/2);
				gameData.board[c][r].ball = null;
				gameData.board[c][r].column = c;
				gameData.board[c][r].row = r;
				gameData.board[c][r].field = -1;
				positionData.x += gameData.settings.gridSizeW;

				gameData.board[c][r].cursor = "pointer";
				gameData.board[c][r].addEventListener("click", function(evt) {
					boardDown(evt.target.column, evt.target.row);
				});

				gameData.board[c][r].addEventListener("mouseover", function(evt) {
					boardOver(evt.target.column, evt.target.row);
				});

				gameData.board[c][r].addEventListener("mouseout", function(evt) {
					boardOut(evt.target.column, evt.target.row);
				});

				boardDesignContainer.addChild(gameData.board[c][r], newGrid);
			}
		}
		positionData.y += gameData.settings.gridSizeH;
	}
}

function getTotalColumn(row){
	var totalColumn = 0;
	for(var c=0; c<gameData.settings.size; c++){
		if(gameData.value[c][row] != 0){
			totalColumn++;
		}
	}
	return totalColumn;
}

/*!
 * 
 * AUTO FILL - This is the function that runs to auto fill
 * 
 */
function fillBoard(){
	var countIndex = 0;
	for(var r=0; r<gameData.settings.size; r++){
		for(var c=0; c<gameData.settings.size; c++){
			if(gameData.value[c][r] != 0){
				if(gameData.value[c][r] != 0){
					var ballImage = '';
					if(gameData.field[c][r] == 0){
						ballImage = 'black'+gameData.themeIndex;
					}else if(gameData.field[c][r] == 1){
						ballImage = 'white'+gameData.themeIndex;
					}

					if(gameData.iconSwitch){
						if(gameData.field[c][r] == 0){
							ballImage = 'white'+gameData.themeIndex;
						}else if(gameData.field[c][r] == 1){
							ballImage = 'black'+gameData.themeIndex;
						}
					}

					if(ballImage != ''){
						var newBall = new createjs.Bitmap(loader.getResult(ballImage));
						centerReg(newBall);
						gameData.board[c][r].ball = newBall;
						newBall.x = gameData.board[c][r].x;
						newBall.y = gameData.board[c][r].y;
						newBall.countIndex = countIndex;
						newBall.ballIndex = gameData.field[c][r];

						boardIconContainer.addChild(newBall);
						countIndex++;
					}
				}
			}
		}
	}
}

/*!
 * 
 * FIND POSSIBLE MOVES - This is the function that runs to run to find possible moves
 * 
 */
function updateGameField(nn, mm) {
	if (nn < 0) {
		return -2;
	}
	if (nn >= gameData.settings.size) {
		return -2;
	}
	if (mm < 0) {
		return -2;
	}
	if (mm >= gameData.settings.size) {
		return -2;
	}
	return gameData.field[nn][mm];
}

function updateMovement() {
	var ii;
	
	//Clear 
	for (ii = 0; ii < 6; ii++) {
		gameData.movement[ii][0] = -1;
		gameData.movement[ii][1] = -1;
	}
	if (gameData.firstX < 0) {
		return;
	}
	if (gameData.secondX < 0) {
		if (updateGameField(gameData.firstX + 1, gameData.firstY) === -1) {
			gameData.movement[0][0] = gameData.firstX + 1;
			gameData.movement[0][1] = gameData.firstY;
		}
		if (updateGameField(gameData.firstX, gameData.firstY + 1) === -1) {
			gameData.movement[1][0] = gameData.firstX;
			gameData.movement[1][1] = gameData.firstY + 1;
		}
		if (updateGameField(gameData.firstX - 1, gameData.firstY + 1) === -1) {
			gameData.movement[2][0] = gameData.firstX - 1;
			gameData.movement[2][1] = gameData.firstY + 1;
		}
		if (updateGameField(gameData.firstX - 1, gameData.firstY) === -1) {
			gameData.movement[3][0] = gameData.firstX - 1;
			gameData.movement[3][1] = gameData.firstY;
		}
		if (updateGameField(gameData.firstX, gameData.firstY - 1) === -1) {
			gameData.movement[4][0] = gameData.firstX;
			gameData.movement[4][1] = gameData.firstY - 1;
		}
		if (updateGameField(gameData.firstX + 1, gameData.firstY - 1) === -1) {
			gameData.movement[5][0] = gameData.firstX + 1;
			gameData.movement[5][1] = gameData.firstY - 1;
		}
		return;
	}
	if (checkCanMove(1, 0)) {
		if (2 * gameData.firstX + gameData.firstY > 2 * gameData.secondX + gameData.secondY) {
			gameData.movement[0][0] = gameData.firstX + 1;
			gameData.movement[0][1] = gameData.firstY;
		} else {
			gameData.movement[0][0] = gameData.secondX + 1;
			gameData.movement[0][1] = gameData.secondY;
		}
	}
	if (checkCanMove(0, 1)) {
		if (gameData.firstX + 2 * gameData.firstY > gameData.secondX + 2 * gameData.secondY) {
			gameData.movement[1][0] = gameData.firstX;
			gameData.movement[1][1] = gameData.firstY + 1;
		} else {
			gameData.movement[1][0] = gameData.secondX;
			gameData.movement[1][1] = gameData.secondY + 1;
		}
	}
	if (checkCanMove(-1, 1)) {
		if (-gameData.firstX + 2 * gameData.firstY > -gameData.secondX + 2 * gameData.secondY) {
			gameData.movement[2][0] = gameData.firstX - 1;
			gameData.movement[2][1] = gameData.firstY + 1;
		} else {
			gameData.movement[2][0] = gameData.secondX - 1;
			gameData.movement[2][1] = gameData.secondY + 1;
		}
	}
	if (checkCanMove(-1, 0)) {
		if (2 * gameData.firstX + gameData.firstY < 2 * gameData.secondX + gameData.secondY) {
			gameData.movement[3][0] = gameData.firstX - 1;
			gameData.movement[3][1] = gameData.firstY;
		} else {
			gameData.movement[3][0] = gameData.secondX - 1;
			gameData.movement[3][1] = gameData.secondY;
		}
	}
	if (checkCanMove(0, -1)) {
		if (gameData.firstX + 2 * gameData.firstY < gameData.secondX + 2 * gameData.secondY) {
			gameData.movement[4][0] = gameData.firstX;
			gameData.movement[4][1] = gameData.firstY - 1;
		} else {
			gameData.movement[4][0] = gameData.secondX;
			gameData.movement[4][1] = gameData.secondY - 1;
		}
	}
	if (checkCanMove(1, -1)) {
		if (gameData.firstX - 2 * gameData.firstY > gameData.secondX - 2 * gameData.secondY) {
			gameData.movement[5][0] = gameData.firstX + 1;
			gameData.movement[5][1] = gameData.firstY - 1;
		} else {
			gameData.movement[5][0] = gameData.secondX + 1;
			gameData.movement[5][1] = gameData.secondY - 1;
		}
	}  
}

function checkCanMove(ii, jj) {
	var vv, ww;
	//1 marble selected
	if (gameData.secondX < 0) {
		if (updateGameField(gameData.firstX + ii, gameData.firstY + jj) === -1) {
			return true;
		}
		return false;
	}
	//2 marbles selected
	if (Math.abs(gameData.firstX - gameData.secondX) === 1 || Math.abs(gameData.firstY - gameData.secondY) === 1) {
		if ((gameData.firstX - gameData.secondX === ii) && (gameData.firstY - gameData.secondY === jj)) {
			vv = updateGameField(gameData.firstX + ii, gameData.firstY + jj);
			if (vv === -1 || (vv === 1 - gameData.player && updateGameField(gameData.firstX + 2 * ii, gameData.firstY + 2 * jj < 0))) {
				return true;
			}
			return false;
		}
		if ((gameData.secondX - gameData.firstX === ii) && (gameData.secondY - gameData.firstY === jj)) {
			vv = updateGameField(gameData.secondX + ii, gameData.secondY + jj);
			if (vv === -1 || (vv === 1 - gameData.player && updateGameField(gameData.secondX + 2 * ii, gameData.secondY + 2 * jj) < 0)) {
				return true;
			}
			return false;
		}
		if (updateGameField(gameData.firstX + ii, gameData.firstY + jj) === -1 && updateGameField(gameData.secondX + ii, gameData.secondY + jj) === -1) {
			return true;
		}
		return false;
	}
	//3 marbles selected
	if (Math.abs(gameData.firstX - gameData.secondX) === 2 || Math.abs(gameData.firstY - gameData.secondY) === 2) {
		if (gameData.firstX - gameData.secondX === 2 * ii && gameData.firstY - gameData.secondY === 2 * jj) {
			vv = updateGameField(gameData.firstX + ii, gameData.firstY + jj);
			if (vv === -1) {
				return true;
			}
			if (vv !== 1 - gameData.player) {
				return false;
			}
			vv = updateGameField(gameData.firstX + 2 * ii, gameData.firstY + 2 * jj);
			if (vv < 0 || (vv === 1 - gameData.player && updateGameField(gameData.firstX + 3 * ii, gameData.firstY + 3 * jj) < 0)) {
				return true;
			}
			return false;
		}
		if (gameData.secondX - gameData.firstX === 2 * ii && gameData.secondY - gameData.firstY === 2 * jj) {
			vv = updateGameField(gameData.secondX + ii, gameData.secondY + jj);
			if (vv === -1) {
				return true;
			}
			if (vv !== 1 - gameData.player) {
				return false;
			}
			vv = updateGameField(gameData.secondX + 2 * ii, gameData.secondY + 2 * jj);
			if (vv < 0 || (vv === 1 - gameData.player && updateGameField(gameData.secondX + 3 * ii, gameData.secondY + 3 * jj) < 0)) {
				return true;
			}
			return false;
		}
		if (updateGameField(gameData.firstX + ii, gameData.firstY + jj) === -1 && updateGameField(gameData.secondX + ii, gameData.secondY + jj) === -1) {
			return true;
		}
		return false;
	}   
	
}

function makeBallMove(ii, jj, ss) {
	var moveArr = [];
	var resetArr = [];
	var vv;
	if (gameData.secondX < 0) {
		if (updateGameField(gameData.firstX + ii, gameData.firstY + jj) === -1) {
			gameData.field[gameData.firstX + ii][gameData.firstY + jj] = gameData.player;
			gameData.field[gameData.firstX][gameData.firstY] = -1;
			if (ss) {
				gameData.targetC = gameData.firstX + ii;
				gameData.targetR = gameData.firstY + jj;
				moveArr.push({c:gameData.firstX + ii, r:gameData.firstY + jj});
				resetArr.push({c:gameData.firstX, r:gameData.firstY});
				updateBoard(moveArr, resetArr);
			}
			return 1;
		}
		return 0;
	}
	if (Math.abs(gameData.firstX - gameData.secondX) === 1 || Math.abs(gameData.firstY - gameData.secondY) === 1) {
		if (gameData.firstX - gameData.secondX === ii && gameData.firstY - gameData.secondY === jj) {
			vv = updateGameField(gameData.firstX + ii, gameData.firstY + jj);
			if (vv === -1) {
				gameData.field[gameData.firstX + ii][gameData.firstY + jj] = gameData.player;
				gameData.field[gameData.secondX][gameData.secondY] = -1;
				if (ss) {
					gameData.targetC = gameData.firstX + ii;
					gameData.targetR = gameData.firstY + jj;
					moveArr.push({c:gameData.firstX + ii, r:gameData.firstY + jj});
					moveArr.push({c:gameData.firstX, r:gameData.firstY});
					resetArr.push({c:gameData.secondX, r:gameData.secondY});
					updateBoard(moveArr, resetArr);
				}
				return 1;
			}
			if (vv !== 1 - gameData.player) {
				return 0;
			}
			vv = updateGameField(gameData.firstX + 2 * ii, gameData.firstY + 2 * jj);
			if (vv < 0) {
				if (vv === -1) {
					gameData.field[gameData.firstX + 2 * ii][gameData.firstY + 2 * jj] = 1 - gameData.player;
				}
				gameData.field[gameData.firstX + ii][gameData.firstY + jj] = gameData.player;
				gameData.field[gameData.secondX][gameData.secondY] = -1;
				if (ss) {
					if (vv === -1) {
						moveArr.push({c:gameData.firstX + 2 * ii, r:gameData.firstY + 2 * jj});
					}
					gameData.targetC = gameData.firstX + ii;
					gameData.targetR = gameData.firstY + jj;
					moveArr.push({c:gameData.firstX + ii, r:gameData.firstY + jj});
					moveArr.push({c:gameData.firstX, r:gameData.firstY});
					resetArr.push({c:gameData.secondX, r:gameData.secondY});
					updateBoard(moveArr, resetArr);
				}
				return -vv;
			}
			return 0;
		}
		if (gameData.secondX - gameData.firstX === ii && gameData.secondY - gameData.firstY === jj) {
			vv = updateGameField(gameData.secondX + ii, gameData.secondY + jj);
			if (vv === -1) {
				gameData.field[gameData.secondX + ii][gameData.secondY + jj] = gameData.player;
				gameData.field[gameData.firstX][gameData.firstY] = -1;
				if (ss) {
					gameData.targetC = gameData.secondX + ii;
					gameData.targetR = gameData.secondY + jj;
					moveArr.push({c:gameData.secondX + ii, r:gameData.secondY + jj});
					moveArr.push({c:gameData.secondX, r:gameData.secondY});
					resetArr.push({c:gameData.firstX, r:gameData.firstY});
					updateBoard(moveArr, resetArr);
				}
				return 1;
			}
			if (vv !== 1 - gameData.player) {
				return 0;
			}
			vv = updateGameField(gameData.secondX + 2 * ii, gameData.secondY + 2 * jj);
			if (vv < 0) {
				if (vv === -1) {
					gameData.field[gameData.secondX + 2 * ii][gameData.secondY + 2 * jj] = 1 - gameData.player;
				}
				gameData.field[gameData.secondX + ii][gameData.secondY + jj] = gameData.player;
				gameData.field[gameData.firstX][gameData.firstY] = -1;
				if (ss) {
					if (vv === -1) {
						moveArr.push({c:gameData.secondX + 2 * ii, r:gameData.secondY + 2 * jj});
					}
					gameData.targetC = gameData.firstX + ii;
					gameData.targetR = gameData.firstY + jj;
					moveArr.push({c:gameData.secondX + ii, r:gameData.secondY + jj});
					moveArr.push({c:gameData.secondX, r:gameData.secondY});
					resetArr.push({c:gameData.firstX, r:gameData.firstY});
					updateBoard(moveArr, resetArr);
				}
				return -vv;
			}
			return 0;
		}
		if (updateGameField(gameData.firstX + ii, gameData.firstY + jj) === -1 && updateGameField(gameData.secondX + ii, gameData.secondY + jj) === -1) {
			gameData.field[gameData.firstX + ii][gameData.firstY + jj] = gameData.player;
			gameData.field[gameData.firstX][gameData.firstY] = -1;
			gameData.field[gameData.secondX + ii][gameData.secondY + jj] = gameData.player;
			gameData.field[gameData.secondX][gameData.secondY] = -1;
			if (ss) {
				gameData.targetC = gameData.firstX + ii;
				gameData.targetR = gameData.firstY + jj;
				moveArr.push({c:gameData.firstX + ii, r:gameData.firstY + jj});
				resetArr.push({c:gameData.firstX, r:gameData.firstY});
				moveArr.push({c:gameData.secondX + ii, r:gameData.secondY + jj});
				resetArr.push({c:gameData.secondX, r:gameData.secondY});
				updateBoard(moveArr, resetArr);
			}
			return 1;
		}
		return 0;
	}
	if (Math.abs(gameData.firstX - gameData.secondX) === 2 || Math.abs(gameData.firstY - gameData.secondY) === 2) {
		if (gameData.firstX - gameData.secondX === 2 * ii && gameData.firstY - gameData.secondY === 2 * jj) {
			vv = updateGameField(gameData.firstX + ii, gameData.firstY + jj);
			if (vv === -1) {
				gameData.field[gameData.firstX + ii][gameData.firstY + jj] = gameData.player;
				gameData.field[gameData.secondX][gameData.secondY] = -1;
				if (ss) {
					gameData.targetC = gameData.firstX + ii;
					gameData.targetR = gameData.firstY + jj;
					moveArr.push({c:gameData.firstX + ii, r:gameData.firstY + jj});
					moveArr.push({c:gameData.firstX, r:gameData.firstY});
					moveArr.push({c:gameData.firstX - ii, r:gameData.firstY - jj});
					resetArr.push({c:gameData.secondX, r:gameData.secondY});
					updateBoard(moveArr, resetArr);
				}
				return 1;
			}
			if (vv !== 1 - gameData.player) {
				return 0;
			}
			vv = updateGameField(gameData.firstX + 2 * ii, gameData.firstY + 2 * jj);
			if (vv < 0) {
				if (vv === -1) {
					gameData.field[gameData.firstX + 2 * ii][gameData.firstY + 2 * jj] = 1 - gameData.player;
				}
				gameData.field[gameData.firstX + ii][gameData.firstY + jj] = gameData.player;
				gameData.field[gameData.secondX][gameData.secondY] = -1;
				if (ss) {
					if (vv === -1) {
						moveArr.push({c:gameData.firstX + 2 * ii, r:gameData.firstY + 2 * jj});
					}
					gameData.targetC = gameData.firstX + ii;
					gameData.targetR = gameData.firstY + jj;
					moveArr.push({c:gameData.firstX + ii, r:gameData.firstY + jj});
					moveArr.push({c:gameData.firstX, r:gameData.firstY});
					moveArr.push({c:gameData.firstX - ii, r:gameData.firstY - jj});
					resetArr.push({c:gameData.secondX, r:gameData.secondY});
					updateBoard(moveArr, resetArr);
				}
				return -vv;
			}
			if (vv !== 1 - gameData.player) {
				return 0;
			}
			vv = updateGameField(gameData.firstX + 3 * ii, gameData.firstY + 3 * jj);
			if (vv < 0) {
				if (vv === -1) {
					gameData.field[gameData.firstX + 3 * ii][gameData.firstY + 3 * jj] = 1 - gameData.player;
				}
				gameData.field[gameData.firstX + ii][gameData.firstY + jj] = gameData.player;
				gameData.field[gameData.secondX][gameData.secondY] = -1;
				if (ss) {
					if (vv === -1) {
						moveArr.push({c:gameData.firstX + 3 * ii, r:gameData.firstY + 3 * jj});
					}
					gameData.targetC = gameData.firstX + ii;
					gameData.targetR = gameData.firstY + jj;
					moveArr.push({c:gameData.firstX + ii, r:gameData.firstY + jj});
					moveArr.push({c:gameData.firstX, r:gameData.firstY});
					moveArr.push({c:gameData.firstX - ii, r:gameData.firstY - jj});
					resetArr.push({c:gameData.secondX, r:gameData.secondY});
					updateBoard(moveArr, resetArr);
				}
				return -vv;
			}
			return 0;
		}
		if (gameData.secondX - gameData.firstX === 2 * ii && gameData.secondY - gameData.firstY === 2 * jj) {
			vv = updateGameField(gameData.secondX + ii, gameData.secondY + jj);
			if (vv === -1) {
				gameData.field[gameData.secondX + ii][gameData.secondY + jj] = gameData.player;
				gameData.field[gameData.firstX][gameData.firstY] = -1;
				if (ss) {
					gameData.targetC = gameData.secondX + ii;
					gameData.targetR = gameData.secondY + jj;
					moveArr.push({c:gameData.secondX + ii, r:gameData.secondY + jj});
					moveArr.push({c:gameData.secondX, r:gameData.secondY});
					moveArr.push({c:gameData.secondX - ii, r:gameData.secondY - jj});
					resetArr.push({c:gameData.firstX, r:gameData.firstY});
					updateBoard(moveArr, resetArr);
				}
				return 1;
			}
			if (vv !== 1 - gameData.player) {
				return 0;
			}
			vv = updateGameField(gameData.secondX + 2 * ii, gameData.secondY + 2 * jj);
			if (vv < 0) {
				if (vv === -1) {
					gameData.field[gameData.secondX + 2 * ii][gameData.secondY + 2 * jj] = 1 - gameData.player;
				}
				gameData.field[gameData.secondX + ii][gameData.secondY + jj] = gameData.player;
				gameData.field[gameData.firstX][gameData.firstY] = -1;
				if (ss) {
					if (vv === -1) {
						moveArr.push({c:gameData.secondX + 2 * ii, r:gameData.secondY + 2 * jj});
					}
					gameData.targetC = gameData.secondX + ii;
					gameData.targetR = gameData.secondY + jj;
					moveArr.push({c:gameData.secondX + ii, r:gameData.secondY + jj});
					moveArr.push({c:gameData.secondX, r:gameData.secondY});
					moveArr.push({c:gameData.secondX - ii, r:gameData.secondY - jj});
					resetArr.push({c:gameData.firstX, r:gameData.firstY});
					updateBoard(moveArr, resetArr);
				}
				return -vv;
			}
			if (vv !== 1 - gameData.player) {
				return 0;
			}
			vv = updateGameField(gameData.secondX + 3 * ii, gameData.secondY + 3 * jj);
			if (vv < 0) {
				if (vv === -1) {
					gameData.field[gameData.secondX + 3 * ii][gameData.secondY + 3 * jj] = 1 - gameData.player;
				}
				gameData.field[gameData.secondX + ii][gameData.secondY + jj] = gameData.player;
				gameData.field[gameData.firstX][gameData.firstY] = -1;
				if (ss) {
					if (vv === -1) {
						moveArr.push({c:gameData.secondX + 3 * ii, r:gameData.secondY + 3 * jj});
					}
					gameData.targetC = gameData.secondX + ii;
					gameData.targetR = gameData.secondY + jj;
					moveArr.push({c:gameData.secondX + ii, r:gameData.secondY + jj});
					moveArr.push({c:gameData.secondX, r:gameData.secondY});
					moveArr.push({c:gameData.secondX - ii, r:gameData.secondY - jj});
					resetArr.push({c:gameData.firstX, r:gameData.firstY});
					updateBoard(moveArr, resetArr);
				}
				return -vv;
			}
			return 0;
		}
		if (updateGameField(gameData.firstX + ii, gameData.firstY + jj) === -1 && updateGameField(gameData.secondX + ii, gameData.secondY + jj) === -1 && updateGameField((gameData.firstX + gameData.secondX) / 2 + ii, (gameData.firstY + gameData.secondY) / 2 + jj) === -1) {
			gameData.field[gameData.firstX + ii][gameData.firstY + jj] = gameData.player;
			gameData.field[gameData.firstX][gameData.firstY] = -1;
			gameData.field[gameData.secondX + ii][gameData.secondY + jj] = gameData.player;
			gameData.field[gameData.secondX][gameData.secondY] = -1;
			gameData.field[(gameData.firstX + gameData.secondX) / 2 + ii][(gameData.firstY + gameData.secondY) / 2 + jj] = gameData.player;
			gameData.field[(gameData.firstX + gameData.secondX) / 2][(gameData.firstY + gameData.secondY) / 2] = -1;
			if (ss) {
				gameData.targetC = gameData.firstX + ii;
				gameData.targetR = gameData.firstY + jj;
				moveArr.push({c:gameData.firstX + ii, r:gameData.firstY + jj});
				resetArr.push({c:gameData.firstX, r:gameData.firstY});
				moveArr.push({c:gameData.secondX + ii, r:gameData.secondY + jj});
				resetArr.push({c:gameData.secondX, r:gameData.secondY});
				moveArr.push({c:(gameData.firstX + gameData.secondX) / 2 + ii, r:(gameData.firstY + gameData.secondY) / 2 + jj});
				resetArr.push({c:(gameData.firstX + gameData.secondX) / 2, r:(gameData.firstY + gameData.secondY) / 2});
				updateBoard(moveArr, resetArr);
			}
			return 1;
		}
		return 0;
	}  
}

function updateBoard(moveArr, resetArr){
	showPlayerStatus();

	boardHighlightContainer.removeAllChildren();
	boardArrowContainer.removeAllChildren();
	gameData.highlightArr = [];

	gameData.animating = true;
	var selectBoard = gameData.board[gameData.targetC][gameData.targetR];
	var rotateNum = Math.round(setRotation(gameData.board[resetArr[0].c][resetArr[0].r].x, gameData.board[resetArr[0].c][resetArr[0].r].y, selectBoard.x, selectBoard.y));
	if(resetArr.length >= 2){
		gameData.animateCount = 0;
		gameData.animateTotal = resetArr.length;
		for(var n=0; n<resetArr.length; n++){
			var targetBall = gameData.board[resetArr[n].c][resetArr[n].r].ball;
			gameData.board[resetArr[n].c][resetArr[n].r].ball = null;

			var targetBoard = gameData.board[moveArr[n].c][moveArr[n].r];
			targetBoard.ball = targetBall;
			animateBall(targetBall, targetBoard);
		}
	}else{
		var finalMoveArr = [];
		var startC = resetArr[0].c;
		var startR = resetArr[0].r;
		var totalLoop = 6;
		var lastC;
		var lastR;

		for(var n=0; n<totalLoop; n++){
			finalMoveArr.push({c:startC, r:startR});
			if(rotateNum == 0){
				//left
				startC--;
			}else if(rotateNum == -180){
				//right
				targetRotateNum = -180;
				startC++;
			}else if(rotateNum == 60){
				//top left
				targetRotateNum = 60;
				startR--;
			}else if(rotateNum == -240){
				//top right
				targetRotateNum = -240;
				startC++;
				startR--;
			}else if(rotateNum == -60){
				//bottom left
				targetRotateNum = -60;
				startC--;
				startR++;
			}else if(rotateNum == -120){
				targetRotateNum = -120;
				//bottom right
				startR++;
			}

			startC = startC < 0 ? 0 : startC;
			startC = startC > gameData.settings.size-1 ? gameData.settings.size-1 : startC;
			startR = startR < 0 ? 0 : startR;
			startR = startR > gameData.settings.size-1 ? gameData.settings.size-1 : startR;
			
			if(gameData.field[startC][startR] == -2){
				n = totalLoop;
			}else{
				var targetBoard = gameData.board[startC][startR];
				var targetNewRotateNum = Math.round(setRotation(gameData.board[resetArr[0].c][resetArr[0].r].x, gameData.board[resetArr[0].c][resetArr[0].r].y, targetBoard.x, targetBoard.y));
				if(targetNewRotateNum == rotateNum){
					if(targetBoard.ball == null){
						finalMoveArr.push({c:startC, r:startR});
						n = totalLoop;
					}else if(startC == lastC && startR == lastR){
						n = totalLoop;
					}
				}else{
					n = totalLoop;
				}
			}
			lastC = startC;
			lastR = startR;
		}

		var ballsMoveArr = [];
		var targetBoard = gameData.board[finalMoveArr[finalMoveArr.length-1].c][finalMoveArr[finalMoveArr.length-1].r];
		for(var n=0; n<finalMoveArr.length; n++){
			var checkDistance = getDistance(gameData.board[finalMoveArr[n].c][finalMoveArr[n].r].x, gameData.board[finalMoveArr[n].c][finalMoveArr[n].r].y, targetBoard.x, targetBoard.y);
			if(gameData.board[finalMoveArr[n].c][finalMoveArr[n].r].ball != null){
				ballsMoveArr.push({ball:gameData.board[finalMoveArr[n].c][finalMoveArr[n].r].ball, dis:checkDistance});
				gameData.board[finalMoveArr[n].c][finalMoveArr[n].r].ball = null;
			}
		}

		sortOnObject(ballsMoveArr, 'dis', false);

		gameData.animateCount = 0;
		gameData.animateTotal = ballsMoveArr.length;
		var posData = {x:targetBoard.x, y:targetBoard.y, boardIndex:finalMoveArr.length-1};
		for(var b=0; b<ballsMoveArr.length; b++){
			var targetBall = ballsMoveArr[b].ball;
			var storeX = targetBall.x;
			var storeY = targetBall.y;

			if(targetBall.x == gameData.board[finalMoveArr[posData.boardIndex].c][finalMoveArr[posData.boardIndex].r].x && targetBall.y == gameData.board[finalMoveArr[posData.boardIndex].c][finalMoveArr[posData.boardIndex].r].y && b == 0){
				var distanceX = targetBall.x + (ballsMoveArr[0].ball.x - ballsMoveArr[1].ball.x);
				var distanceY = targetBall.y + (ballsMoveArr[0].ball.y - ballsMoveArr[1].ball.y);
				animateBall(targetBall, {x:distanceX, y:distanceY}, true);
			}else{
				gameData.board[finalMoveArr[posData.boardIndex].c][finalMoveArr[posData.boardIndex].r].ball = targetBall;
				posData.boardIndex--;
				animateBall(targetBall, {x:posData.x, y:posData.y}, false);
			}
			
			posData.x = storeX;
			posData.y = storeY;
		}
	}
}

function animateBall(targetBall, targetBoard, remove){
	boardIconContainer.setChildIndex(targetBall, boardIconContainer.numChildren-1);
	
	if(remove){
		var distanceSpeed = getDuration(getDistance(targetBall.x, targetBall.y, targetBoard.x, targetBoard.y), gameSettings.pushSpeed);
		targetBall.nextX = targetBoard.x;
		targetBall.nextY = targetBoard.y;
		TweenMax.to(targetBall, distanceSpeed, {x:targetBoard.x, y:targetBoard.y, overwrite:true, onComplete:animateBallScore, onCompleteParams:[targetBall]});
	}else{
		var distanceSpeed = getDuration(getDistance(targetBall.x, targetBall.y, targetBoard.x, targetBoard.y), gameSettings.pushSpeed);
		var curveRadius = gameData.settings.gridSizeW/5;
		var centerPoint = getCenterPosition(targetBall.x, targetBall.y, targetBoard.x, targetBoard.y);
		centerPoint.x = centerPoint.x + randomIntFromInterval(-curveRadius,curveRadius);
		centerPoint.y = centerPoint.y + randomIntFromInterval(-curveRadius,curveRadius);
		var strokePosition = [];
		strokePosition.push({x:targetBall.x, y:targetBall.y});
		strokePosition.push({x:centerPoint.x, y:centerPoint.y});
		strokePosition.push({x:targetBoard.x, y:targetBoard.y});
		targetBall.nextX = targetBoard.x;
		targetBall.nextY = targetBoard.y;
		TweenMax.to(targetBall, distanceSpeed, {bezier:{type:"thru", values:strokePosition, curviness:1, autoRotate:false}, ease:Linear.easeNone, overwrite:true, onComplete:animateBallComplete, onCompleteParams:[targetBall, false]});
	}
}

function animateBallScore(targetBall){
	var pt = $.players['gameOppIconContainer'+ gameData.player].globalToLocal(boardContainer.x + targetBall.x, boardContainer.y + targetBall.y);
	var newBall = targetBall.clone();
	boardIconContainer.removeChild(targetBall);
	$.players['gameOppIconContainer'+ gameData.player].addChild(newBall);
	newBall.x = pt.x;
	newBall.y = pt.y;
	var distanceSpeed = getDuration(getDistance(newBall.x, newBall.y, 0, 0), gameSettings.removeSpeed);
	TweenMax.to(newBall, distanceSpeed, {x:0, y:0, overwrite:true, onComplete:animateBallComplete, onCompleteParams:[targetBall, true]});
}

function animateBallComplete(targetBall, remove){
	if(remove){
		playSound('soundCollect');
		$.players['gameOppIconContainer'+ gameData.player].removeChild(targetBall);
		$.players['gamePlayer'+ gameData.player].totalWon++;
		updatePlayerOppIcons(gameData.player);
	}else{
		playSound('soundJoin');
		targetBall.x = targetBall.nextX;
		targetBall.y = targetBall.nextY;
	}

	//check
	gameData.animateCount++;
	if(gameData.animateCount >= gameData.animateTotal){
		playerActionComplete();
	}
}

function playerActionComplete(){
	if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
		postSocketUpdate('animationcomplete', {index:socketData.gameIndex});
	}else{
		gameData.animating = false;
		checkGameEnd();
	}
}

/*!
 * 
 * BOARD EVENTS - This is the function that runs for board events
 * 
 */
function boardDown(ii, jj) {
	if (gameData.paused) {
		return;
	}
	if (gameData.over) {
		return;
	}
	if (gameData.animating) {
		return;
	}
	if (!checkIsPlayer(gameData.player)) {
		return;
	}

	var nn, mm = -1;
	if (gameData.firstX < 0) {
		if (gameData.field[ii][jj] !== gameData.player) {
			return;
		}
		gameData.firstX = ii;
		gameData.firstY = jj;
		gameData.highlightArr.push({c:ii, r:jj});
		updateMovement();
		showBoardSelect();
		return;
	}
	if (gameData.secondX < 0) {
		if (gameData.field[ii][jj] === -1) {
			if (ii === gameData.firstX && Math.abs(jj - gameData.firstY) === 1 || jj === gameData.firstY && Math.abs(ii - gameData.firstX) === 1 || ii === gameData.firstX + 1 && jj === gameData.firstY - 1 || ii === gameData.firstX - 1 && jj === gameData.firstY + 1) {
				makeBallMove(ii - gameData.firstX, jj - gameData.firstY, true);
				if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
					if(gameData.player == socketData.gameIndex){
						postSocketUpdate('makeballmove', {ii:ii - gameData.firstX, jj:jj - gameData.firstY, ss:true, firstX:gameData.firstX, firstY:gameData.firstY, secondX:gameData.secondX, secondY:gameData.secondY }, true);
					}
				}
				gameData.firstX = -1;
				gameData.firstY = -1;
				updateMovement();
			}
			return;
		}
		if (gameData.field[ii][jj] === gameData.player) {
			if (ii === gameData.firstX && jj === gameData.firstY) {
				gameData.highlightArr = [];
				gameData.firstX = -1;
				gameData.firstY = -1;
				updateMovement();
				showBoardSelect();
				return;
			}
			if (ii === gameData.firstX && Math.abs(jj - gameData.firstY) <= 2 || jj === gameData.firstY && Math.abs(ii - gameData.firstX) <= 2 || ii === gameData.firstX + 1 && jj === gameData.firstY - 1 || ii === gameData.firstX - 1 && jj === gameData.firstY + 1 || ii === gameData.firstX + 2 && jj === gameData.firstY - 2 || ii === gameData.firstX - 2 && jj === gameData.firstY + 2) {
				if (Math.abs(ii - gameData.firstX) === 1 || Math.abs(jj - gameData.firstY) === 1) {
					gameData.secondX = ii;
					gameData.secondY = jj;
					gameData.highlightArr.push({c:gameData.secondX, r:gameData.secondY});
					updateMovement();
					showBoardSelect();
					return;
				}
				if (gameData.field[(ii + gameData.firstX) / 2][(jj + gameData.firstY) / 2] === gameData.player) {
					gameData.secondX = ii;
					gameData.secondY = jj;
					gameData.highlightArr.push({c:gameData.secondX, r:gameData.secondY});
					gameData.highlightArr.push({c:(gameData.firstX + gameData.secondX) / 2, r:(gameData.firstY + gameData.secondY) / 2});
					updateMovement();
					showBoardSelect();
					return;
				}
			}

			gameData.highlightArr = [];
			showBoardSelect();
			gameData.firstX = -1;
			gameData.firstY = -1;
			boardDown(ii, jj);
			return;
		}
	}
	if (gameData.field[ii][jj] === gameData.player) {
		gameData.highlightArr = [];
		showBoardSelect();

		gameData.firstX = -1;
		gameData.firstY = -1;
		gameData.secondX = -1;
		gameData.secondY = -1;
		boardDown(ii, jj);
		return;
	}

	for (nn = 0; nn < 6; nn++) {
		if (gameData.movement[nn][0] === ii && gameData.movement[nn][1] === jj) mm = nn;
	}
	if (mm < 0) {
		return;
	}

	if (Math.abs(2 * (ii - gameData.firstX) + (jj - gameData.firstY)) + 2 * Math.abs(jj - gameData.firstY) < Math.abs(2 * (ii - gameData.secondX) + (jj - gameData.secondY)) + 2 * Math.abs(jj - gameData.secondY)) {
		makeBallMove(ii - gameData.firstX, jj - gameData.firstY, true);
		if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
			if(gameData.player == socketData.gameIndex){
				postSocketUpdate('makeballmove', {ii:ii - gameData.firstX, jj:jj - gameData.firstY, ss:true, firstX:gameData.firstX, firstY:gameData.firstY, secondX:gameData.secondX, secondY:gameData.secondY }, true);
			}
		}
	} else {
		makeBallMove(ii - gameData.secondX, jj - gameData.secondY, true);
		if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
			if(gameData.player == socketData.gameIndex){
				postSocketUpdate('makeballmove', {ii:ii - gameData.secondX, jj:jj - gameData.secondY, ss:true, firstX:gameData.firstX, firstY:gameData.firstY, secondX:gameData.secondX, secondY:gameData.secondY }, true);
			}
		}
	}
	
	gameData.firstX = -1;
	gameData.firstY = -1;
	gameData.secondX = -1;
	gameData.secondY = -1;
	updateMovement();
}

function showBoardSelect(){
	boardHighlightContainer.removeAllChildren();
	if(gameData.highlightArr.length > 0){
		playSound('soundPush');
		for(var n=0; n<gameData.highlightArr.length; n++){
			var targetBoard = gameData.board[gameData.highlightArr[n].c][gameData.highlightArr[n].r];
			var newSelect = new createjs.Bitmap(loader.getResult('select'+gameData.themeIndex));
			centerReg(newSelect);;
			newSelect.x = targetBoard.x;
			newSelect.y = targetBoard.y;
			boardHighlightContainer.addChild(newSelect);
		}

		for(var r=0; r<gameData.settings.size; r++){
			for(var c=0; c<gameData.settings.size; c++){
				if (gameData.firstX < 0) {
					return;
				}
				var nn, mm = -1;
				for (nn = 0; nn < 6; nn++) {
					if (gameData.movement[nn][0] === c && gameData.movement[nn][1] === r) {
						mm = nn;
					}
				}
				if (mm < 0) {
					
				}else{
					var targetBoard = gameData.board[c][r];
					var newHighlight = new createjs.Bitmap(loader.getResult('highlight'+gameData.themeIndex));
					centerReg(newHighlight);;
					newHighlight.x = targetBoard.x;
					newHighlight.y = targetBoard.y;
					boardHighlightContainer.addChild(newHighlight);
				}
			}
		}
	}
}

function boardOver(ii, jj) {
	//console.log('over', ii, jj, gameData.board[ii][jj].ball);
	if (gameData.paused) {
		return;
	}
	if (gameData.over) {
		return;
	}
	if (gameData.animating) {
		return;
	}
	if (!checkIsPlayer(gameData.player)) {
		return;
	}
	if (gameData.firstX < 0) {
		return;
	}

	var arrowArr = [];
	var nn, mm = -1;
	for (nn = 0; nn < 6; nn++) {
		if (gameData.movement[nn][0] === ii && gameData.movement[nn][1] === jj) {
			mm = nn;
		}
	}
	if (mm < 0) {
		return;
	}

	arrowArr.push({c:gameData.firstX, r:gameData.firstY});
	if (gameData.secondX >= 0) {
		arrowArr.push({c:gameData.secondX, r:gameData.secondY});
		if (Math.abs(gameData.secondX - gameData.firstX) === 2 || Math.abs(gameData.secondY - gameData.firstY) === 2) {
			arrowArr.push({c:(gameData.firstX + gameData.secondX) / 2, r:(gameData.firstY + gameData.secondY) / 2});
		}
	}

	showArrowHighlight(arrowArr, ii, jj);
}

function boardOut() {
	showArrowHighlight([]);
}

function showArrowHighlight(arrowArr, ii, jj){
	boardArrowContainer.removeAllChildren();

	if(arrowArr.length > 0){
		var rotateBoard = gameData.board[ii][jj];
		for(var n=0; n<arrowArr.length; n++){
			var targetBoard = gameData.board[arrowArr[n].c][arrowArr[n].r];
			var checkDistance = getDistance(targetBoard.x, targetBoard.y, rotateBoard.x, rotateBoard.y);
			arrowArr[n].dis = checkDistance;
		}

		sortOnObject(arrowArr, 'dis', false);
		var rotateNum = setRotation(gameData.board[arrowArr[0].c][arrowArr[0].r].x, gameData.board[arrowArr[0].c][arrowArr[0].r].y, rotateBoard.x, rotateBoard.y);
		
		for(var n=0; n<arrowArr.length; n++){
			var targetBoard = gameData.board[arrowArr[n].c][arrowArr[n].r];
			var newHighlight = new createjs.Bitmap(loader.getResult('arrow'+gameData.themeIndex));
			centerReg(newHighlight);;
			newHighlight.x = targetBoard.x;
			newHighlight.y = targetBoard.y;
			newHighlight.rotation = rotateNum;
			boardArrowContainer.addChild(newHighlight);
		}
	}
}

/*!
 * 
 * CHECK GAME END - This is the function that runs to check game end
 * 
 */
function checkGameEnd(){
	for(var n=0; n<2; n++){
		if($.players['gamePlayer'+ n].totalWon >= 6){
			gameData.over = true;
			gameData.winner = n;
		}
	}

	if(!gameData.over){
		TweenMax.to(boardContainer, .5, {onComplete:function(){
			nextPlayerTurn();
			displayPlayerTurn();
		}});
	}else{
		playSound('soundOver');
		TweenMax.to(statusContainer, .5, {alpha:1, overwrite:true});
		showPlayerStatus('win');
		endGame();
	}
}

/*!
 * 
 * NEXT PLAYER - This is the function that runs to next player
 * 
 */
function nextPlayerTurn(){
	gameData.player = 1 - gameData.player;
}

/*!
 * 
 * DISPLAY PLAYER TURN - This is the function that runs to display player turn
 * 
 */
function checkIsPlayer(player){
	var  isPlayer = false;
	if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
		if(player == socketData.gameIndex){
			isPlayer = true;
		}
	}else{
		if(gameData.ai){
			if(player == 0) isPlayer = true;
		}else{
			isPlayer = true;
		}
	}
	return isPlayer;
}

function displayPlayerTurn(){
	for(var n=0; n<2; n++){
		var userTurn = '';
		if(n == gameData.player && !gameData.over){
			userTurn = textDisplay.userTurn;

			if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
				if(socketData.host){
					userTurn = n == 1 ? textDisplay.playerTurn.replace('[NAME]', $.players['gamePlayer'+ n].text) : userTurn;
				}else{
					userTurn = n == 0 ? textDisplay.playerTurn.replace('[NAME]', $.players['gamePlayer'+ n].text) : userTurn;
				}
			}else{
				if(n == 1 && gameData.ai){
					userTurn = textDisplay.computerTurn;
				}
			}
		}

		$.players['gameTurn'+ n].text = userTurn;
		TweenMax.killTweensOf($.players['gameTurn'+ n]);
		if(userTurn != ''){
			animateBlink($.players['gameTurn'+ n]);
		}
	}
	
	playSound('soundTurn');
	//aniamtePlayerFocus($.players['gamePlayerContainer'+ gameData.player]);
	togglePlayerTimer();

	gameData.highlightArr = [];
	if(gameData.ai && gameData.player != 0){
		TweenMax.to(boardContainer, gameSettings.aiThinkSpeed, {onComplete:function(){
			if (gameData.firstX === -1) {
				getBestMove(gameData.player);
				gameData.highlightArr.push({c:gameData.firstX, r:gameData.firstY});
				if (gameData.secondX > 0) {
					gameData.highlightArr.push({c:gameData.secondX, r:gameData.secondY});
					if (Math.abs(gameData.firstX - gameData.secondX) === 2 || Math.abs(gameData.firstY - gameData.secondY) === 2) {
						gameData.highlightArr.push({c:(gameData.firstX + gameData.secondX) / 2, r:(gameData.firstY + gameData.secondY) / 2});
					}
				}
				showBoardSelect();
			}

			TweenMax.to(boardContainer, gameSettings.aiMoveSpeed, {onComplete:function(){
				gameData.targetC = gameData.dirX;
				gameData.targetR = gameData.dirY;
				makeBallMove(gameData.dirX, gameData.dirY, true);
				gameData.firstX = -1;
				gameData.firstY = -1;
				gameData.secondX = -1;
				gameData.secondY = -1;  
				updateMovement();
			}});
		}});
	}else{
		
	}
}

function animateBlink(obj){
	obj.alpha = .3;
	var tweenSpeed = .2;
	TweenMax.to(obj, tweenSpeed, {alpha:1, overwrite:true, onComplete:function(){
		TweenMax.to(obj, tweenSpeed, {alpha:.3, overwrite:true, onComplete:animateBlink, onCompleteParams:[obj]});
	}});
}

function animateGuide(obj){
	obj.alpha = .3;
	var tweenSpeed = .6;
	TweenMax.to(obj, tweenSpeed, {alpha:1, overwrite:true, onComplete:function(){
		TweenMax.to(obj, tweenSpeed, {alpha:.3, overwrite:true, onComplete:animateGuide, onCompleteParams:[obj]});
	}});
}

function aniamtePlayerFocus(obj){
	TweenMax.to(obj, .2, {scaleX:1.2, scaleY:1.2, ease:Sine.easeIn,  overwrite:true, onComplete:function(){
		TweenMax.to(obj, .2, {scaleX:1, scaleY:1, ease:Sine.easeOut, overwrite:true});	
	}});
}

/*!
 * 
 * AI MOVE - This is the function that runs to run to show ai move
 * 
 */
function getBestMove(currentPlayer) {
	var ii, jj, nn, vv, ii0_best, jj0_best, ii1_best, jj1_best, iid_best, jjd_best, vv_best = -10000;
	var ddi = new Array(1, 0, -1, -1, 0, 1);
	var ddj = new Array(0, 1, 1, 0, -1, -1);
	
	//Set tempField to Fld values
	for (ii = 0; ii < gameData.settings.size; ii++) {
		for (jj = 0; jj < gameData.settings.size; jj++) {
			gameData.temp[ii][jj] = gameData.field[ii][jj];
		}
	}
	for (ii = 0; ii < gameData.settings.size; ii++) {
		for (jj = 0; jj < gameData.settings.size; jj++) {
			if (gameData.field[ii][jj] === currentPlayer) {
				gameData.firstX = ii; 
				gameData.firstY = jj; 
				gameData.secondX = -1; 
				gameData.secondY = -1;
				
				for (nn = 0; nn < 6; nn++) {
					vv = makeBallMove(ddi[nn], ddj[nn], false);
					if (vv > 0) {
						vv = EvalGameField(currentPlayer) + Math.random();
						if (vv_best < vv) {
							ii0_best = gameData.firstX; 
							jj0_best = gameData.firstY; 
							ii1_best = gameData.secondX; 
							jj1_best = gameData.secondY;
							iid_best = ddi[nn]; 
							jjd_best = ddj[nn]; 
							vv_best = vv;
						}
						restoreGameField();
					}
				}
			}
		}
	}
	for (ii = 0; ii < gameData.settings.size - 1; ii++) {
		for (jj = 0; jj < gameData.settings.size; jj++) {
			if (gameData.field[ii][jj] === currentPlayer && gameData.field[ii + 1][jj] === currentPlayer) {
				gameData.firstX = ii; 
				gameData.firstY = jj; 
				gameData.secondX = ii + 1; 
				gameData.secondY = jj;
				for (nn = 0; nn < 6; nn++) {
					vv = makeBallMove(ddi[nn], ddj[nn], false);
					if (vv > 0) {
						vv = EvalGameField(currentPlayer) + Math.random() * 2;
						if (vv_best < vv) {
							ii0_best = gameData.firstX; 
							jj0_best = gameData.firstY; 
							ii1_best = gameData.secondX; 
							jj1_best = gameData.secondY;
							iid_best = ddi[nn]; 
							jjd_best = ddj[nn]; 
							vv_best = vv;
						}
						restoreGameField();
					}
				}
			}
		}
	}
	for (ii = 0; ii < gameData.settings.size; ii++) {
		for (jj = 0; jj < gameData.settings.size - 1; jj++) {
			if (gameData.field[ii][jj] === currentPlayer && gameData.field[ii][jj + 1] === currentPlayer) {
				gameData.firstX = ii; 
				gameData.firstY = jj; 
				gameData.secondX = ii; 
				gameData.secondY = jj + 1;
				for (nn = 0; nn < 6; nn++) {
					vv = makeBallMove(ddi[nn], ddj[nn], false);
					if (vv > 0) {
						vv = EvalGameField(currentPlayer) + Math.random() * 2;
						if (vv_best < vv) {
							ii0_best = gameData.firstX; 
							jj0_best = gameData.firstY; 
							ii1_best = gameData.secondX; 
							jj1_best = gameData.secondY;
							iid_best = ddi[nn]; 
							jjd_best = ddj[nn]; 
							vv_best = vv;
						}
						restoreGameField();
					}
				}
			}
		}
	}
	for (ii = 1; ii < gameData.settings.size; ii++) {
		for (jj = 0; jj < gameData.settings.size - 1; jj++) {
			if (gameData.field[ii][jj] === currentPlayer && gameData.field[ii - 1][jj + 1] === currentPlayer) {
				gameData.firstX = ii; 
				gameData.firstY = jj; 
				gameData.secondX = ii - 1; 
				gameData.secondY = jj + 1;
				for (nn = 0; nn < 6; nn++) {
					vv = makeBallMove(ddi[nn], ddj[nn], false);
					if (vv > 0) {
						vv = EvalGameField(currentPlayer) + Math.random() * 2;
						if (vv_best < vv) {
							ii0_best = gameData.firstX; 
							jj0_best = gameData.firstY; 
							ii1_best = gameData.secondX; 
							jj1_best = gameData.secondY;
							iid_best = ddi[nn]; 
							jjd_best = ddj[nn]; 
							vv_best = vv;
						}
						restoreGameField();
					}
				}
			}
		}
	}
	for (ii = 0; ii < gameData.settings.size - 2; ii++) {
		for (jj = 0; jj < gameData.settings.size; jj++) {
			if (gameData.field[ii][jj] === currentPlayer && gameData.field[ii + 1][jj] === currentPlayer && gameData.field[ii + 2][jj] === currentPlayer) {
				gameData.firstX = ii; 
				gameData.firstY = jj; 
				gameData.secondX = ii + 2; 
				gameData.secondY = jj;
				for (nn = 0; nn < 6; nn++) {
					vv = makeBallMove(ddi[nn], ddj[nn], false);
					if (vv > 0) {
						vv = EvalGameField(currentPlayer) + Math.random() * 3;
						if (vv_best < vv) {
							ii0_best = gameData.firstX; 
							jj0_best = gameData.firstY; 
							ii1_best = gameData.secondX; 
							jj1_best = gameData.secondY;
							iid_best = ddi[nn]; 
							jjd_best = ddj[nn]; 
							vv_best = vv;
						}
						restoreGameField();
					}
				}
			}
		}
	}
	for (ii = 0; ii < gameData.settings.size; ii++) {
		for (jj = 0; jj < gameData.settings.size - 2; jj++) {
			if (gameData.field[ii][jj] === currentPlayer && gameData.field[ii][jj + 1] === currentPlayer && gameData.field[ii][jj + 2] === currentPlayer) {
				gameData.firstX = ii; 
				gameData.firstY = jj; 
				gameData.secondX = ii; 
				gameData.secondY = jj + 2;
				for (nn = 0; nn < 6; nn++) {
					vv = makeBallMove(ddi[nn], ddj[nn], false);
					if (vv > 0) {
						vv = EvalGameField(currentPlayer) + Math.random() * 3;
						if (vv_best < vv) {
							ii0_best = gameData.firstX; 
							jj0_best = gameData.firstY; 
							ii1_best = gameData.secondX; 
							jj1_best = gameData.secondY;
							iid_best = ddi[nn]; 
							jjd_best = ddj[nn]; 
							vv_best = vv;
						}
						restoreGameField();
					}
				}
			}
		}
	}
	for (ii = 2; ii < gameData.settings.size; ii++) {
		for (jj = 0; jj < gameData.settings.size - 2; jj++) {
			if (gameData.field[ii][jj] === currentPlayer && gameData.field[ii - 1][jj + 1] === currentPlayer && gameData.field[ii - 2][jj + 2] === currentPlayer) {
				gameData.firstX = ii; 
				gameData.firstY = jj; 
				gameData.secondX = ii - 2; 
				gameData.secondY = jj + 2;
				for (nn = 0; nn < 6; nn++) {
					vv = makeBallMove(ddi[nn], ddj[nn], false);
					if (vv > 0) {
						vv = EvalGameField(currentPlayer) + Math.random() * 3;
						if (vv_best < vv) {
							ii0_best = gameData.firstX; 
							jj0_best = gameData.firstY; 
							ii1_best = gameData.secondX; 
							jj1_best = gameData.secondY;
							iid_best = ddi[nn]; 
							jjd_best = ddj[nn]; 
							vv_best = vv;
						}
						restoreGameField();
					}
				}
			}
		}
	}
	gameData.firstX = ii0_best;
	gameData.firstY = jj0_best;
	gameData.secondX = ii1_best;
	gameData.secondY = jj1_best;
	gameData.dirX = iid_best;
	gameData.dirY = jjd_best;
}

function EvalGameField(checkCurrentPlayer) {
	var ii, jj, vv = 0;
	for (jj = 0; jj < gameData.settings.size; jj++) {
		for (ii = 0; ii < gameData.settings.size; ii++) {
			if (gameData.field[ii][jj] >= 0) {
				vv += gameData.value[ii][jj] * (2 * gameData.field[ii][jj] - 1);
			}
		}
	}
	if (checkCurrentPlayer === 0) {
		vv *= -1;
	}
	for (ii = 0; ii < 24; ii++)
	{
		if (gameData.field[gameData.CI[ii][0]][gameData.CJ[ii][0]] === checkCurrentPlayer) {
			for (jj = 1; jj < gameData.CI[ii].length; jj++) {
				if (gameData.field[gameData.CI[ii][0] + gameData.CI[ii][jj]][gameData.CJ[ii][0] + gameData.CJ[ii][jj]] === 1 - checkCurrentPlayer && gameData.field[gameData.CI[ii][0] + 2 * gameData.CI[ii][jj]][gameData.CJ[ii][0] + 2 * gameData.CJ[ii][jj]] === 1 - checkCurrentPlayer) {
					vv -= 16;
				} else {
					if (gameData.field[gameData.CI[ii][0] + gameData.CI[ii][jj]][gameData.CJ[ii][0] + gameData.CJ[ii][jj]] === checkCurrentPlayer &&
						gameData.field[gameData.CI[ii][0] + 2 * gameData.CI[ii][jj]][gameData.CJ[ii][0] + 2 * gameData.CJ[ii][jj]] === 1 - checkCurrentPlayer &&
						gameData.field[gameData.CI[ii][0] + 3 * gameData.CI[ii][jj]][gameData.CJ[ii][0] + 3 * gameData.CJ[ii][jj]] === 1 - checkCurrentPlayer &&
						gameData.field[gameData.CI[ii][0] + 4 * gameData.CI[ii][jj]][gameData.CJ[ii][0] + 4 * gameData.CJ[ii][jj]] === 1 - checkCurrentPlayer) {
						vv -= 16;
					}
				}
			}
		}
		if (gameData.field[gameData.CI[ii][0]][gameData.CJ[ii][0]] === 1 - checkCurrentPlayer) {
			for (jj = 1; jj < gameData.CI[ii].length; jj++) {
				if (gameData.field[gameData.CI[ii][0] + gameData.CI[ii][jj]][gameData.CJ[ii][0] + gameData.CJ[ii][jj]] === checkCurrentPlayer &&
					gameData.field[gameData.CI[ii][0] + 2 * gameData.CI[ii][jj]][gameData.CJ[ii][0] + 2 * gameData.CJ[ii][jj]] === checkCurrentPlayer)
					vv += 8;
				else {
					if (gameData.field[gameData.CI[ii][0] + gameData.CI[ii][jj]][gameData.CJ[ii][0] + gameData.CJ[ii][jj]] === 1 - checkCurrentPlayer &&
						gameData.field[gameData.CI[ii][0] + 2 * gameData.CI[ii][jj]][gameData.CJ[ii][0] + 2 * gameData.CJ[ii][jj]] === checkCurrentPlayer &&
						gameData.field[gameData.CI[ii][0] + 3 * gameData.CI[ii][jj]][gameData.CJ[ii][0] + 3 * gameData.CJ[ii][jj]] === checkCurrentPlayer &&
						gameData.field[gameData.CI[ii][0] + 4 * gameData.CI[ii][jj]][gameData.CJ[ii][0] + 4 * gameData.CJ[ii][jj]] === checkCurrentPlayer) {
						vv += 8;
					}	
				}
			}
		}
	}
	return vv;
}

function restoreGameField() {
	var ii, jj;
	//Set Fld to tempField values
	for (ii = 0; ii < gameData.settings.size; ii++) {
		for (jj = 0; jj < gameData.settings.size; jj++) {
			gameData.field[ii][jj] = gameData.temp[ii][jj];
		}
	}  
}

function getDuration(distance, pixelsPerSecond){
	var duration = distance / pixelsPerSecond;
	return duration;
}

/*!
 * 
 * SHOW GAME STATUS - This is the function that runs to update game status
 * 
 */

function showPlayerStatus(con){
	if(con == 'win'){
		var isPlayer = checkIsPlayer(gameData.winner);
		if(isPlayer){
			$.players['gameTurn'+ gameData.winner].text = textDisplay.userWin;
		}else{
			$.players['gameTurn'+ gameData.winner].text = textDisplay.playerWin.replace('[NAME]', $.players['gamePlayer'+ gameData.winner].text);;
		}
		animateBlink($.players['gameTurn'+ gameData.winner]);
	}else{
		for(var n=0; n<2; n++){
			$.players['gameTurn'+ n].text = '';
			TweenMax.killTweensOf($.players['gameTurn'+ n]);
		}
	}
}


/*!
 * 
 * GAME TIMER - This is the function that runs for game timer
 * 
 */
function toggleGameTimer(con){
	if(con){
		timeData.startDate = new Date();
	}
	timeData.enable = con;
}

function togglePlayerTimer(){
	timeData.startDate = new Date();
	if(gameData.player == 0){
		timeData.opponentAccumulate = timeData.opponentTimer;
	}else{
		timeData.playerAccumulate = timeData.playerTimer;
	}
}

/*!
 * 
 * UPDATE GAME - This is the function that runs to loop game update
 * 
 */
function updateGame(){
	if(!gameData.paused){
		if(timeData.enable){
			timeData.nowDate = new Date();
			timeData.elapsedTime = Math.floor((timeData.nowDate.getTime() - timeData.startDate.getTime()));
			timeData.timer = Math.floor(timeData.elapsedTime);

			if(gameData.player == 0){
				timeData.playerTimer = Math.floor(timeData.elapsedTime + timeData.playerAccumulate);
			}else{
				timeData.opponentTimer = Math.floor(timeData.elapsedTime + timeData.opponentAccumulate);	
			}

			updateTimer();
			if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
				postSocketUpdate('updatetimer', {playerTimer:timeData.playerTimer, opponentTimer:timeData.opponentTimer}, true);
			}
		}
	}
}

function updateTimer(){
	playerData.score = gameSettings.score - timeData.playerTimer;
	playerData.opponentScore = gameSettings.score - timeData.opponentTimer;

	playerData.score = playerData.score < 0 ? 0 : playerData.score;
	playerData.opponentScore = playerData.opponentScore < 0 ? 0 : playerData.opponentScore;
}

/*!
 * 
 * END GAME - This is the function that runs for game end
 * 
 */
function endGame(){
	gameData.paused = true;
	TweenMax.to(gameContainer, 3, {overwrite:true, onComplete:function(){
		if (window.Android && window.Android.showInterstitialInGame) {
			window.Android.showInterstitialInGame("abalone_game_over");
		}
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
