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
		front:"assets/themes1/theme_front.png",
		highlight:"assets/themes1/theme_highlight.png",
		shadow:"assets/themes1/theme_shadow.png",
		eliminated:"assets/themes1/theme_eliminated.png",
		red:{
			background:'assets/themes1/theme_red_bg.png',
			numbers:[
				'assets/themes1/theme_red_0.png',
				'assets/themes1/theme_red_1.png',
				'assets/themes1/theme_red_2.png',
				'assets/themes1/theme_red_3.png',
				'assets/themes1/theme_red_4.png',
				'assets/themes1/theme_red_5.png',
				'assets/themes1/theme_red_6.png',
				'assets/themes1/theme_red_7.png',
				'assets/themes1/theme_red_8.png',
				'assets/themes1/theme_red_9.png',
			],
			actions:[
				'assets/themes1/theme_red_draw.png',
				'assets/themes1/theme_red_reverse.png',
				'assets/themes1/theme_red_skip.png',
			]
		},
		yellow:{
			background:'assets/themes1/theme_yellow_bg.png',
			numbers:[
				'assets/themes1/theme_yellow_0.png',
				'assets/themes1/theme_yellow_1.png',
				'assets/themes1/theme_yellow_2.png',
				'assets/themes1/theme_yellow_3.png',
				'assets/themes1/theme_yellow_4.png',
				'assets/themes1/theme_yellow_5.png',
				'assets/themes1/theme_yellow_6.png',
				'assets/themes1/theme_yellow_7.png',
				'assets/themes1/theme_yellow_8.png',
				'assets/themes1/theme_yellow_9.png',
			],
			actions:[
				'assets/themes1/theme_yellow_draw.png',
				'assets/themes1/theme_yellow_reverse.png',
				'assets/themes1/theme_yellow_skip.png',
			]
		},
		blue:{
			background:'assets/themes1/theme_blue_bg.png',
			numbers:[
				'assets/themes1/theme_blue_0.png',
				'assets/themes1/theme_blue_1.png',
				'assets/themes1/theme_blue_2.png',
				'assets/themes1/theme_blue_3.png',
				'assets/themes1/theme_blue_4.png',
				'assets/themes1/theme_blue_5.png',
				'assets/themes1/theme_blue_6.png',
				'assets/themes1/theme_blue_7.png',
				'assets/themes1/theme_blue_8.png',
				'assets/themes1/theme_blue_9.png',
			],
			actions:[
				'assets/themes1/theme_blue_draw.png',
				'assets/themes1/theme_blue_reverse.png',
				'assets/themes1/theme_blue_skip.png',
			]
		},
		green:{
			background:'assets/themes1/theme_green_bg.png',
			numbers:[
				'assets/themes1/theme_green_0.png',
				'assets/themes1/theme_green_1.png',
				'assets/themes1/theme_green_2.png',
				'assets/themes1/theme_green_3.png',
				'assets/themes1/theme_green_4.png',
				'assets/themes1/theme_green_5.png',
				'assets/themes1/theme_green_6.png',
				'assets/themes1/theme_green_7.png',
				'assets/themes1/theme_green_8.png',
				'assets/themes1/theme_green_9.png',
			],
			actions:[
				'assets/themes1/theme_green_draw.png',
				'assets/themes1/theme_green_reverse.png',
				'assets/themes1/theme_green_skip.png',
			]
		},
		wilds:[
			'assets/themes1/theme_wild.png',
			'assets/themes1/theme_wilddraw.png',
		],
		specials:[
			'assets/themes1/theme_truesight.png',
			'assets/themes1/theme_oneforme.png',
			'assets/themes1/theme_devildeal.png',
			'assets/themes1/theme_charity.png',
			'assets/themes1/theme_targeteddraw2.png',
			'assets/themes1/theme_eliminatedplayer.png',
			'assets/themes1/theme_frozencolor.png',
		]
	}
];

var cards_arr = {
	numbers:[0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9],
	actions:[
		{type:'draw2', point:20, image:'assets/icon_draw2.png', text:'DRAW 2 CARDS'},
		{type:'reverse', point:20, image:'assets/icon_reverse.png', text:'REVERSE TURN'},
		{type:'skip', point:20, image:'assets/icon_skip.png', text:'SKIP TURN'},
	],
	wilds:[
		{type:'wild', point:50, image:'assets/icon_wild.png', text:'WILD CARD'},
		{type:'wilddraw4', point:50, image:'assets/icon_wilddraw4.png', text:'DRAW 4 CARDS'},
	],
	specials:[
		{type:'truesight', point:50, image:'assets/icon_truesight.png', text:'REVEAL PLAYER CARDS'},
		{type:'oneforme', point:50, image:'assets/icon_oneforme.png', text:'DRAW 1 CARD'},
		{type:'devildeal', point:50, image:'assets/icon_devildeal.png', text:'REVERSE, SKIP AND DRAW 2 CARDS'},
		{type:'charity', point:50, image:'assets/icon_charity.png', text:'HADN 2 CARDS TO TARGETED PLAYER'},
		{type:'targeteddraw2', point:50, image:'assets/icon_targeteddraw2.png', text:'DRAW 2 CARDS TO TARGETED PLAYER'},
		{type:'eliminatedplayer', point:50, image:'assets/icon_eliminatedplayer.png', text:'ELIMINATE PLAYER'},
		{type:'frozencolor', point:50, image:'assets/icon_frozencolor.png', text:'FROZEN COLOR FOR A TURN'}
	],
	otherActions:[]
};

//game settings
var gameSettings = {
	cardW:100,
	cardH:150,
	cardSpace:50,
	cardShadowX:5,
	cardShadowY:5,
	cardMoveSpeed:.2,
	cardDealSpeed:.2,
	cardFlipSpeed:.2,
	aiThinkSpeed:1.5,
	playerCards:7, //total player cards
	penaltyCards:0, //total penalty cards
	lastCardCallTimer:1, //last card call timer
	points:[100,200,300,400,500], //score points option
};

//game text display
var textDisplay = {
					optionsTitle:'OPTIONS',
					tutorialTitle:'HOW TO PLAY?',
					totalPlayers:"[NUMBER] PLAYERS",
					goalPoint:"GOAL [NUMBER]PTS",
					modes:["CLASSIC","SPECIAL"],
					playerName:'PLAYER [NUMBER]',
					playerScore:'[NUMBER]PTS',
					playerPenalty:'PENALTY 2 CARDS',
					userPickColor:'PICK COLORS',
					playerPickColor:'PICKING COLORS',
					playerTarget:'TARGET A PLAYER',
					playerTargeting:'TARGETING PLAYERS',
					selectCards:'SELECT TWO CARDS',
					selectingCards:'SELECTING TWO CARDS',
					emptyCards:"NO CARDS LEFT",
					noMorePlayers:"NO MORE PLAYERS",
					playerWon:' WON',
					playerRoundWin:"YOU WIN THIS ROUND",
					playerRoundLose:"YOU LOSE THIS ROUND",
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
var shareTitle = 'Highscore on Four Colors is [SCORE]PTS';//social share score title
var shareMessage = '[SCORE]PTS is mine new highscore on Four Colors game! Try it now!'; //social share score message

/*!
 *
 * GAME SETTING CUSTOMIZATION END
 *
 */
$.editor = {enable:false};
var playerData = {score:0, scores:[]};
var gameData = {paused:true, colors:['red','blue','yellow','green'], moving:false, player:0, players:0, pointIndex:0, themeIndex:0, drawing:false, ai:true, complete:false, names:[]};
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
	document.addEventListener("visibilitychange", () => {
		if(document.visibilityState==='visible'){
			toggleMusicInMute(false);
			TweenMax.resumeAll();
		}else{
			toggleMusicInMute(true);
			TweenMax.pauseAll();
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

	buttonNext.cursor = "pointer";
	buttonNext.addEventListener("click", function(evt) {
		playSound('soundButton');
		toggleCardsOptions(2);
	});

	buttonTutorial.cursor = "pointer";
	buttonTutorial.addEventListener("click", function(evt) {
		playSound('soundButton');
		toggleCardsOptions(3);
	});

	buttonBack.cursor = "pointer";
	buttonBack.addEventListener("click", function(evt) {
		playSound('soundButton');
		toggleCardsOptions(gameData.lastOption);
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
	
	// buttonFullscreen.cursor = "pointer";
	// buttonFullscreen.addEventListener("click", function(evt) {
	// 	toggleFullScreen();
	// });
	
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

	for(var n=0; n<4; n++){
		$.colors[n].colorIndex = n;
		$.colors[n].cursor = "pointer";
		$.colors[n].addEventListener("click", function(evt) {
			var proceedClick = checkIsPlayer(gameData.player);
			if(proceedClick){
				if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
					postSocketUpdate('choosecolor', gameData.colors[evt.target.colorIndex], true);
				}
				gameData.match.value = 0;
				gameData.match.color = gameData.colors[evt.target.colorIndex];
				toggleColors(false);
				getMatchDetail();
				checkRoundEnd();
			}
		});
	}

	gameData.fourcolors = {
		maxPlayers:4,
		minPlayers:2,
		special:false,
		point:20,
	};
	
	gameData.players = gameData.fourcolors.minPlayers;
	gameData.pointIndex = 0;
	gameData.themeIndex = 0;
	gameData.lastThemeIndex = -1;
	gameData.lastOption = 1;
	gameData.tutorial = 1;

	displayCardsOptions();
}

function checkIsPlayer(player){
	var  isPlayer = false;
	if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
		if(player == socketData.gameIndex){
			isPlayer = true;
		}
	}else{
		if(player == 0){
			isPlayer = true;
		}
	}
	return isPlayer;
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
		gameData.players = gameData.players > gameData.fourcolors.maxPlayers ? gameData.fourcolors.maxPlayers : gameData.players;
	}else{
		gameData.players--;
		gameData.players = gameData.players < gameData.fourcolors.minPlayers ? gameData.fourcolors.minPlayers : gameData.players;
	}

	updateCardsOption();
}

function togglePoints(con){
	if(con){
		gameData.pointIndex++;
		gameData.pointIndex = gameData.pointIndex > gameSettings.points.length-1 ? gameSettings.points.length-1 : gameData.pointIndex;
	}else{
		gameData.pointIndex--;
		gameData.pointIndex = gameData.pointIndex < 0 ? 0 : gameData.pointIndex;
	}

	updateCardsOption();
}

function toggleGameType(con){
	gameData.fourcolors.special = con;

	updateCardsOption();
}

function toggleTheme(con){
	if(con){
		gameData.themeIndex++;
		gameData.themeIndex = gameData.themeIndex > themes_arr.length-1 ? themes_arr.length-1 : gameData.themeIndex;
	}else{
		gameData.themeIndex--;
		gameData.themeIndex = gameData.themeIndex < 0 ? 0 : gameData.themeIndex;
	}

	updateCardsOption();
}

function updateCardsOption(){
	displayCardsOptions();
	if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
		if(socketData.host){
			postSocketUpdate('updateoptions', {pointIndex:gameData.pointIndex, special:gameData.fourcolors.special, themeIndex:gameData.themeIndex, option:gameData.lastOption}, true);
		}
	}
}

function displayCardsOptions(){
	totalPlayersTxt.text = textDisplay.totalPlayers.replace("[NUMBER]", gameData.players);
	pointsTxt.text = textDisplay.goalPoint.replace("[NUMBER]", gameSettings.points[gameData.pointIndex]);
	typeTxt.text = gameData.fourcolors.special == true ? textDisplay.modes[1] : textDisplay.modes[0];

	gameData.fourcolors.point = gameSettings.points[gameData.pointIndex];

	//theme
	if(gameData.lastThemeIndex != gameData.themeIndex){
		buildCards();
		gameData.lastThemeIndex = gameData.themeIndex;

		themeContainer.removeAllChildren();
		
		shuffle(gameData.cards);
		gameData.cardFront = gameData.cards[0].frontContainer.clone(true);
		gameData.cardContent = gameData.cards[0].contentContainer.clone(true);
		themeContainer.addChild(gameData.cardFront, gameData.cardContent);
		flipOptionCard();
	}
}

function flipOptionCard(){
	if(curPage == 'options'){
		playSound('soundCardFlip');
	}
	gameData.cardFront.visible = gameData.cardContent.visible = true;
	gameData.cardFront.scaleX = gameData.cardFront.scaleY = gameData.cardContent.scaleX = gameData.cardContent.scaleY = 1.3;
	gameData.cardContent.scaleX = 0;
	
	var flipSpeed = gameSettings.cardFlipSpeed;
	TweenMax.to(gameData.cardFront, flipSpeed, {delay:flipSpeed, scaleX:0});
	TweenMax.to(gameData.cardContent, flipSpeed, {delay:flipSpeed*2, scaleX:1.3});
}

function toggleCardsOptions(page){
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
	buttonTutorial.visible = false;
	cardsOptionsListContainer.visible = false;

	buttonTutorialL.visible = false;
	buttonTutorialR.visible = false;
	buttonBack.visible = false;
	cardsOptionsTutorialContainer.visible = false;
		
	if(page == 1){
		gameData.lastOption = 1;
		cardsOptionsListContainer.visible = true;
		itemPlayerNumbers.visible = true;
		totalPlayersTxt.visible = true;
		buttonPlayersL.visible = true;
		buttonPlayersR.visible = true;

		itemPoints.visible = true;
		pointsTxt.visible = true;
		buttonPointsL.visible = true;
		buttonPointsR.visible = true;

		itemType.visible = true;
		typeTxt.visible = true;
		buttonTypeL.visible = true;
		buttonTypeR.visible = true;

		buttonNext.visible = true;
		buttonTutorial.visible = true;

		if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
			buttonPlayersL.visible = false;
			buttonPlayersR.visible = false;

			if(!socketData.host){
				buttonPointsL.visible = false;
				buttonPointsR.visible = false;
				buttonTypeL.visible = false;
				buttonTypeR.visible = false;
				buttonNext.visible = false;
				buttonTutorial.visible = false;
			}
		}
	}else if(page == 2){
		gameData.lastOption = 2;
		cardsOptionsListContainer.visible = true;
		themeContainer.visible = true;
		buttonThemeL.visible = true;
		buttonThemeR.visible = true;
		buttonStart.visible = true;
		buttonTutorial.visible = true;

		if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {			
			if(!socketData.host){
				buttonThemeL.visible = false;
				buttonThemeR.visible = false;
				buttonStart.visible = false;
				buttonTutorial.visible = false;
			}
		}

		flipOptionCard();
	}else if(page == 3){
		cardsOptionsTutorialContainer.visible = true;
		buttonTutorialL.visible = true;
		buttonTutorialR.visible = true;
		buttonBack.visible = true;

		displayTutorial();
	}

	updateCardsOption();
	resizeGameLayout();
}

function toggleTutorial(con){
	if(con){
		gameData.tutorial++;
		gameData.tutorial = gameData.tutorial > 15 ? 15 : gameData.tutorial;
	}else{
		gameData.tutorial--;
		gameData.tutorial = gameData.tutorial < 1 ? 1 : gameData.tutorial;
	}

	displayTutorial();
}

function displayTutorial(){
	for(var n=0; n<15; n++){
		$.tutorial[n].visible = false;
	}
	$.tutorial[gameData.tutorial-1].visible = true;
	tutorialPageTxt.text = gameData.tutorial+'/15';
	
	buttonTutorialL.visible = true;
	buttonTutorialR.visible = true;
	if(gameData.tutorial == 1){
		buttonTutorialL.visible = false;
	}
	if(gameData.tutorial == 15){
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
			gameLogsTxt.y = canvasH/100 * 70;
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
	cardsOptionsContainer.visible = false;
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
			playMusicLoop("musicGame");
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
			targetContainer = cardsOptionsContainer;
			toggleCardsOptions(1);
		break;
		
		case 'game':
			targetContainer = gameContainer;
			// playMusicLoop("musicGame");
			// stopMusicLoop("musicMain");
			startGame();
		break;
		
		case 'result':
			targetContainer = resultContainer;
			stopGame();
			togglePop(false);
			
			// playMusicLoop("musicMain");
			// stopMusicLoop("musicGame");
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
	playerData.scores = [];

	for(var n=0; n<gameData.players; n++){
		playerData.scores.push(0);
	}

	startCards();
}

function startCards(){
	itemColors.alpha = 0;
	itemFrozen.alpha = 0;
	statusContainer.alpha = 0;
	guideContainer.alpha = 0;
	toggleRoundScore(false);
	toggleColors(false);
	prepareCards();
	gameData.activePlayers = gameData.players;
	
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
 * RESIZE GAME LAYOUT - This is the function that runs to resize game layout
 * 
 */
function resizeGameLayout(){
	if(curPage == "game"){
		statusContainer.x = cardScoreContainer.x = colorsContainer.x = canvasW/2;
		statusContainer.y = cardScoreContainer.y = colorsContainer.y = canvasH/2;

		guideContainer.x = canvasW/2;
		guideContainer.y = canvasH/100 * 60;

		itemColors.x = itemFrozen.x = canvasW/2 + 150;
		itemColors.y = itemFrozen.y = canvasH/2;

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
			itemColors.x = itemFrozen.x = canvasW/2;
			itemColors.y = itemFrozen.y = canvasH/2 - 120;

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

		checkPlayerCardsAnimation();
	}
}

/*!
 * 
 * BUILD CARDS - This is the function that runs to build cards
 * 
 */
function buildCards(){
	cardsPlayContainer.removeAllChildren();

	gameData.actionArr = [];
	gameData.wildArr = [];
	gameData.specialArr = [];
	gameData.excludeMatch = [];
	gameData.excludeFirst = [];
	gameData.cards = [];
	gameData.cardNum = 0;
	for(var c=0; c<gameData.colors.length; c++){
		//numbers
		for(var n=0; n<cards_arr.numbers.length; n++){
			var thisNumber = cards_arr.numbers[n];
			var thisCard = createCard('cardNumbers'+gameData.themeIndex+'_'+gameData.colors[c]+'_'+thisNumber, gameData.colors[c]);
			thisCard.cardType = 'number';
			thisCard.cardColor = gameData.colors[c];
			thisCard.cardValue = thisNumber;
			thisCard.cardPoint = thisNumber;
		}

		for(var l=0; l<2; l++){
			for(var n=0; n<cards_arr.actions.length; n++){
				var thisCard = 
				createCard('cardActions'+gameData.themeIndex+'_'+gameData.colors[c]+'_'+n, gameData.colors[c]);
				thisCard.cardType = cards_arr.actions[n].type;
				thisCard.cardColor = gameData.colors[c];
				thisCard.cardValue = '';
				thisCard.cardPoint = cards_arr.actions[n].point;
				gameData.actionArr.push(cards_arr.actions[n].type);
			}
		}

		for(var n=0; n<cards_arr.wilds.length; n++){
			var thisCard = createCard('cardWilds'+gameData.themeIndex+'_'+n, '');
			thisCard.cardType = cards_arr.wilds[n].type;
			thisCard.cardColor = '';
			thisCard.cardValue = '';
			thisCard.cardPoint = cards_arr.wilds[n].point;
			gameData.wildArr.push(cards_arr.wilds[n].type);
			gameData.excludeMatch.push(cards_arr.wilds[n].type);
			if(cards_arr.wilds[n].type == "wilddraw4"){
				gameData.excludeFirst.push(cards_arr.wilds[n].type);
			}
		}
	}
	
	if(gameData.fourcolors.special){
		for(var n=0; n<cards_arr.specials.length; n++){
			var thisCard = createCard('cardSpecial'+gameData.themeIndex+'_'+n, '');
			thisCard.cardType = cards_arr.specials[n].type;
			thisCard.cardColor = '';
			thisCard.cardValue = '';
			thisCard.cardPoint = cards_arr.specials[n].point;
			gameData.specialArr.push(cards_arr.specials[n].type);
			gameData.excludeMatch.push(cards_arr.specials[n].type);
			gameData.excludeFirst.push(cards_arr.specials[n].type);
		}
	}

	gameData.actionArr = removeDuplicates(gameData.actionArr);
	gameData.wildArr = removeDuplicates(gameData.wildArr);
	gameData.specialArr = removeDuplicates(gameData.specialArr);
	gameData.excludeMatch = removeDuplicates(gameData.excludeMatch);
}

/*!
 * 
 * PREPARE CARDS - This is the function that runs to prepare cards
 * 
 */
function prepareCards(){
	gameData.prepared = false;
	gameData.complete = false;

	gameData.draw = [];
	gameData.discard = [];
	gameData.seq = [];
	gameData.cardIndex = 0;
	gameData.deal = {
		status:false,
		animation:false,
		cards:[],
		cardIndex:0,
	}
	gameData.match = {
		count:0,
		type:'',
		color:'',
		lastColor:'',
		value:'',
		active:true
	}
	gameData.loopColors = {
		possible:[],
		color:0,
		index:0,
		round:0,
		roundMax:2
	}
	gameData.turn = {
		action:false,
		animating:false,
		reverse:false,
		reverseTurn:false,
		reverseCount:0,
		skip:false,
		highlight:false,
		played:false,
		pickColors:false,
		drawCount:0,
		drawCards:0,
		drawCardsTotal:0,
		drawCardsCount:0,
		drawCard:false,
		loseTurn:false,
		continuePlay:false,
		penalty:false,
		penaltyCards:0,
		revealCard:false,
		targetPlayerAim:false,
		targetPlayer:false,
		targetDrawCards:0,
		targetDrawCard:false,
		giveCards:0,
		giveCard:false,
		removePlayer:false,
		frozenPick:false,
		frozenColor:false,
		frozenReset:-1,
		frozenSkip:false,
		addPoints:0,
		lastCardType:'',
		shuffle:false,
		playerCards:[],
		swap:false,
		queue:[],
	}

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
	playSound("soundCardShuffle");
	buildCards();
	
	//26 wild card
	//23 reverse
	//22 draw
	//skip
	//var cardArr = [91,29,34,36,48,24,74,51,49,55,61,21,16,1,27,23,19,22,103,84,107,119,118,117,113,115,116,110,6,18,3,0,111,112,9,109,108,98,114,89,13,57,53,2,72,105,25,44,99,60,41,102,69,64,26,90,66,67,81,101,88,11,38,31,40,8,83,43,33,82,12,5,62,42,92,37,50,70,93,17,7,56,63,100,97,106,73,46,71,76,96,75,58,10,104,78,86,15,77,65,4,32,54,28,80,95,52,30,47,85,39,14,45,59,68,20,94,35,87,79];
	//gameData.cards = [];

	//for(var n=0; n<cardArr.length; n++){
		//gameData.cards.push($.cards[cardArr[n]]);
	//}
	shuffle(gameData.cards);
}

function createCard(name, color){
	$.cards['front'+gameData.cardNum] = new createjs.Container();
	$.cards['content'+gameData.cardNum] = new createjs.Container();
	$.cards[gameData.cardNum] = new createjs.Container();
	$.cards[gameData.cardNum].frontContainer = $.cards['front'+gameData.cardNum]
	$.cards[gameData.cardNum].contentContainer = $.cards['content'+gameData.cardNum]
	$.cards[gameData.cardNum].contentContainer.visible = false;
	$.cards[gameData.cardNum].addChild($.cards[gameData.cardNum].frontContainer, $.cards[gameData.cardNum].contentContainer);
	$.cards[gameData.cardNum].cardIndex = gameData.cardNum;
	$.cards[gameData.cardNum].cardDeal = false;

	$.cards[gameData.cardNum].addEventListener("click", function(evt) {
		if(!gameData.turn.action){
			return;
		}

		if(gameData.turn.animating){
			return;
		}

		if(gameData.turn.played){
			return;
		}

		var proceedClick = checkIsPlayer(gameData.player);
		if(proceedClick){
			if(gameData.turn.giveCard){
				if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
					postSocketUpdate('wildaction', {card:'givecard', cardData:evt.currentTarget.cardIndex}, true);
				}
				giveCardToPlayer(evt.currentTarget.cardIndex);
			}else if(gameData.turn.drawCard && evt.currentTarget.x < 0 && !evt.currentTarget.cardDeal){
				gameData.turn.drawCount++;
				if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
					postSocketUpdate('wildaction', {card:'drawplayercard', cardData:gameData.turn.drawCount}, true);
				}
				drawPlayerCard(false);
			}else if(evt.currentTarget.cardDeal){
				if(checkMatchCard(evt.currentTarget.cardIndex)){
					if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
						postSocketUpdate('wildaction', {card:'discardplayercard', cardData:evt.currentTarget.cardIndex}, true);
					}
					discardPlayerCard(evt.currentTarget.cardIndex, false);
				}
			}
		}
	});

	var bgCover = new createjs.Bitmap(loader.getResult('cardCover'+gameData.themeIndex));
	centerReg(bgCover);
	$.cards[gameData.cardNum].frontContainer.addChild(bgCover);

	if(color != ''){
		var bgBack = new createjs.Bitmap(loader.getResult('cardBg'+gameData.themeIndex+'_'+color));
		centerReg(bgBack);
		$.cards[gameData.cardNum].contentContainer.addChild(bgBack);
	}
	
	var bgContent = new createjs.Bitmap(loader.getResult(name));
	centerReg(bgContent);
	$.cards[gameData.cardNum].contentContainer.addChild(bgContent);

	$.cards['highlight'+gameData.cardNum] = new createjs.Bitmap(loader.getResult('cardHighlight'+gameData.themeIndex));
	centerReg($.cards['highlight'+gameData.cardNum]);
	$.cards['eliminated'+gameData.cardNum] = new createjs.Bitmap(loader.getResult('cardEliminated'+gameData.themeIndex));
	centerReg($.cards['eliminated'+gameData.cardNum]);
	$.cards['shadow'+gameData.cardNum] = new createjs.Bitmap(loader.getResult('cardShadow'+gameData.themeIndex));
	centerReg($.cards['shadow'+gameData.cardNum]);
	$.cards['highlight'+gameData.cardNum].visible = false;
	$.cards['eliminated'+gameData.cardNum].visible = false;

	$.cards[gameData.cardNum].highlight = $.cards['highlight'+gameData.cardNum];
	$.cards[gameData.cardNum].eliminated = $.cards['eliminated'+gameData.cardNum];
	$.cards[gameData.cardNum].shadow = $.cards['shadow'+gameData.cardNum];

	var returnCard = $.cards[gameData.cardNum];
	// returnCard.scaleY = 0.5;
	cardsPlayContainer.addChild($.cards['shadow'+gameData.cardNum], $.cards[gameData.cardNum], $.cards['highlight'+gameData.cardNum], $.cards['eliminated'+gameData.cardNum]);
	gameData.cards.push($.cards[gameData.cardNum]);
	gameData.cardNum++;
	// returnCard.scaleX = 0.2;


	return returnCard;
}

function toggleCardAction(card, con){
	if(con){
		card.cursor = 'pointer';
	}else{
		card.cursor = null;
	}
}

function highlightCard(card, con){
	if(con){
		// console.log(card.cardValue + " "+card.cardColor);
		card.highlight.visible = true;
		animateBlink(card.highlight);
	}else{
		card.highlight.visible = false;
		killAnimateBlink(card.highlight);
	}
}

function discardPlayerCard(cardIndex, flip){
	gameData.turn.played = true;
	gameData.match.count++;
	var playerCardIndex = $.players[gameData.player].cards.indexOf(cardIndex);

	for(var n=0; n<$.players[gameData.player].cards.length; n++){
		highlightCard($.cards[$.players[gameData.player].cards[n]], false);
	}
	$.players[gameData.player].cards.splice(playerCardIndex, 1);
	positionPlayerCards(gameData.player, true);

	showDiscardCard(cardIndex, flip);
}

/*!
 * 
 * PREPARE PLAYERS - This is the function that runs to prepare players
 * 
 */
function preparePlayers(){
	cardsPlayersContainer.removeAllChildren();

	//find total deal
	var playerTotalDeal = gameSettings.playerCards;

	for(var n=0; n<gameData.players; n++){
		$.players[n] = new createjs.Container();
		$.players[n].cards = [];
		$.players[n].score = 0;
		$.players[n].playerIndex = n;
		$.players[n].active = true;

		for(var p=0; p<playerTotalDeal; p++){
			var cardIndex = gameData.cards[gameData.cardIndex].cardIndex;
			$.players[n].cards.push(cardIndex);
			gameData.cardIndex++;
		}

		$.players["stats" + n] = new createjs.Container();
		var newPlayerLine = new createjs.Bitmap(loader.getResult('itemPlayerLine'));
		centerReg(newPlayerLine);

		var newPlayerName = new createjs.Text();
		newPlayerName.font = "18px bpreplaybold";
		newPlayerName.color = "#fff";
		newPlayerName.textAlign = "left";
		newPlayerName.textBaseline='middle';
		newPlayerName.text = textDisplay.playerName.replace("[NUMBER]", n+1);

		if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
			newPlayerName.text = gameData.names[n];
		}

		var newPlayerScore = new createjs.Text();
		newPlayerScore.font = "22px bpreplaybold";
		newPlayerScore.color = "#fff";
		newPlayerScore.textAlign = "right";
		newPlayerScore.textBaseline='middle';
		newPlayerScore.text = textDisplay.playerScore.replace("[NUMBER]", playerData.scores[n]);

		$.players["stats" + n].playerLine = newPlayerLine;
		$.players["stats" + n].playerName = newPlayerName;
		$.players["stats" + n].playerScore = newPlayerScore;
		$.players["stats" + n].visible = false;
		$.players["stats" + n].addChild(newPlayerLine, newPlayerName, newPlayerScore);

		$.players["call" + n] = new createjs.Bitmap(loader.getResult('buttonCall'));
		$.players["call" + n].visible = false;
		$.players["called" + n] = new createjs.Bitmap(loader.getResult('buttonCalled'));
		$.players["called" + n].visible = false;
		centerReg($.players["call" + n]);
		centerReg($.players["called" + n]);

		$.players["call" + n].callIndex = n;
		$.players["call" + n].cursor = "pointer";
		$.players["call" + n].addEventListener("click", function(evt) {
			if($.players[evt.target.callIndex].cards.length == 1){
				if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
					postSocketUpdate('called', socketData.gameIndex, true);
				}
				playSound('soundCall');
				$.players["called" + evt.target.callIndex].visible = true;
				animateFocus($.players["called" + evt.target.callIndex]);
			}
		});

		$.players["aim" + n] = new createjs.Bitmap(loader.getResult('buttonAim'));
		$.players["aim" + n].visible = false;
		centerReg($.players["aim" + n]);
		$.players["aim" + n].playerIndex = n;
		$.players["aim" + n].cursor = "pointer";
		$.players["aim" + n].addEventListener("click", function(evt) {
			var proceedAction = checkIsPlayer(gameData.player);
			if(proceedAction){
				playSound('soundCall');
				if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
					postSocketUpdate('targetaim', evt.target.playerIndex, true);
				}

				toggleTargetIcon(evt.target.playerIndex);
				if(gameData.turn.swap){
					swapPlayerCards(evt.target.playerIndex);
				}else if(gameData.turn.revealCard){
					revealPlayerCards(evt.target.playerIndex);
				}else if(gameData.turn.giveCard){
					choosePlayerCards(evt.target.playerIndex);
				}else if(gameData.turn.removePlayer){
					removePlayers(evt.target.playerIndex);
				}else{
					targetedPlayerDraw(evt.target.playerIndex);
				}
			}
		});

		$.players["arrow" + n] = new createjs.Container();
		var itemArrowL = new createjs.Bitmap(loader.getResult('itemArrow'));
		centerReg(itemArrowL);
		var itemArrowR = new createjs.Bitmap(loader.getResult('itemArrow'));
		centerReg(itemArrowR);
		itemArrowR.visible = false;
		itemArrowR.scaleX = -1;
		$.players["arrow" + n].itemArrowL = itemArrowL;
		$.players["arrow" + n].itemArrowR = itemArrowR;
		$.players["arrow" + n].addChild(itemArrowL, itemArrowR);
		$.players["arrow" + n].visible = false;

		$.players["target" + n] = new createjs.Bitmap(loader.getResult('itemTarget'));
		$.players["target" + n].visible = false;
		centerReg($.players["target" + n]);

		$.players["skip" + n] = new createjs.Bitmap(loader.getResult('itemSkip'));
		$.players["skip" + n].visible = false;
		centerReg($.players["skip" + n]);

		$.players["eliminated" + n] = new createjs.Bitmap(loader.getResult('itemEliminated'));
		$.players["eliminated" + n].visible = false;
		centerReg($.players["eliminated" + n]);

		cardsPlayersContainer.addChild($.players[n], $.players["stats" + n], $.players["call" + n], $.players["called" + n], $.players["aim" + n], $.players["skip" + n], $.players["target" + n], $.players["eliminated" + n], $.players["arrow" + n]);
	}

	for(var n=gameData.cardIndex; n<gameData.cards.length; n++){
		var cardIndex = gameData.cards[n].cardIndex;
		gameData.draw.push(cardIndex);
	}

	gameData.prepared = true;
	resizeGameLayout();
	TweenMax.to(cardsContainer, .5, {overwrite:true, onComplete:function(){
		gameData.deal.status = true;
		gameData.deal.animation = true;
		checkPlayerCardsAnimation();
	}});
}

function checkPlayerCardsAnimation(){
	if(gameData.deal.animation){
		gameData.deal.cards = [];
		gameData.deal.cardIndex = 0;

		for(var n=0; n<gameSettings.playerCards; n++){
			for(var p=0; p<gameData.players; p++){
				var thisCard = $.cards[$.players[p].cards[n]];
				thisCard.cardDeal = false;
				gameData.deal.cards.push({card:thisCard, player:p});
				gameData.deal.total++;
			}
		}
		dealPlayerCard();
	}else{
		for(var n=0; n<gameData.players; n++){
			positionPlayerCards(n, gameData.deal.status);
		}
	}

	if(gameData.drawing){
		toggleDrawPiles(true);
	}
}

/*!
 * 
 * DEAL PLAYER CARD - This is the function that runs to deal player card
 * 
 */
function dealPlayerCard(){
	var thisCard = gameData.deal.cards[gameData.deal.cardIndex].card;
	var thisPlayer = gameData.deal.cards[gameData.deal.cardIndex].player;
	var pos = getPlayerCardPosition(thisPlayer);
	setCardDepth(thisCard);

	thisCard.oriX = $.players[thisPlayer].cardX;
	thisCard.oriY = $.players[thisPlayer].cardY;

	if(pos.horizontal){
		var rotationNum = $.players[thisPlayer].dir == 'bottom' ? 0 : 180;
	}else{
		var rotationNum = $.players[thisPlayer].dir == 'right' ? -90 : 90;
	}

	var cardSpeed = gameSettings.cardDealSpeed;
	TweenMax.to(thisCard, cardSpeed, {x:thisCard.oriX, y:thisCard.oriY, rotation:rotationNum, scaleX:1, scaleY:1, overwrite:true, onStart:function(){
		thisCard.cardDeal = true;
		playSound('soundCardDeal');
	},onComplete:dealPlayerCardComplete, onCompleteParams:[thisPlayer, thisCard]});
}

function dealPlayerCardComplete(index, card){
	var showCardContent = checkIsPlayer(index);
	if(showCardContent){
		toggleCardAction(card, true);
		flipCard(card);
	}

	positionPlayerCards(index, true);
	gameData.deal.cardIndex++;
	if(gameData.deal.cardIndex < gameData.deal.cards.length){
		dealPlayerCard();
	}else{
		if(gameData.deal.animation){
			gameData.deal.animation = false;
			showDrawCard(true);
		}
	}
}

function getPlayerCardPosition(index){
	var horizontal = $.players[index].horizontal;
	var pt = cardsPlayContainer.globalToLocal($.players[index].x, $.players[index].y);
	var pos = {horizontal:horizontal, x:0, y:0, startX:0, startY:0, w:0, h:0, maxW:500, maxH:300, gap:0, cardSpace:gameSettings.cardSpace, totalCards:0};

	if(!viewport.isLandscape){
		pos.maxW = 300;
		pos.maxH = 500;
	}

	for(var p=0; p<$.players[index].cards.length; p++){
		var thisCard = $.cards[$.players[index].cards[p]];
		if(thisCard.cardDeal){
			pos.totalCards++;
		}
	}

	if(pos.totalCards > 0){
		pos.totalCards = pos.totalCards-1;
	}

	if(pos.horizontal){
		pos.w = (pos.totalCards) * pos.cardSpace;
		pos.gap = pos.cardSpace;

		if(pos.w > pos.maxW){
			pos.w = pos.maxW;
			pos.gap = pos.maxW/(pos.totalCards);
		}

		pos.x = pos.startX = pt.x - (pos.w/2);
		pos.y = pos.startY = pt.y;
	}else{
		pos.h = (pos.totalCards) * pos.cardSpace;
		pos.gap = pos.cardSpace;

		if(pos.h > pos.maxH){
			pos.h = pos.maxH;
			pos.gap = pos.maxH/(pos.totalCards);
		}

		pos.x = pos.startX = pt.x;
		pos.y = pos.startY = pt.y - (pos.h/2);
	}

	return pos;
}

/*!
 * 
 * TOGGLE COLORS - This is the function that runs to toggle colors
 * 
 */
function toggleColors(con){
	colorsContainer.visible = con;

	if(con){
		var isPlayer = false;
		var isActivePlayer = false;
		if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
			isPlayer = true;
			if(gameData.player == socketData.gameIndex){
				isActivePlayer = true;
			}
		}else{
			if(gameData.player == 0){
				isPlayer = true;
				isActivePlayer = true;
			}
		}
		
		if(isPlayer){
			for(var n=0; n<4; n++){	
				$.colors[n].gotoAndStop(n);
			}
			if(isActivePlayer){
				colorSelectTxt.text = textDisplay.userPickColor;
			}else{
				colorSelectTxt.text = textDisplay.playerPickColor;
			}
		}else{
			colorSelectTxt.text = textDisplay.playerPickColor.replace('[NAME]', $.players["stats" + gameData.player].playerName.text);

			gameData.loopColors.round = 0;
			gameData.loopColors.possible = [];
			for(var n=0;n<$.players[gameData.player].cards.length; n++){
				var cardIndex = $.players[gameData.player].cards[n];
				if($.cards[cardIndex].cardColor != ''){
					gameData.loopColors.possible.push($.cards[cardIndex].cardColor);
				}
			}
			
			if(gameData.loopColors.possible.length > 0){
				shuffle(gameData.loopColors.possible);
				gameData.loopColors.color = gameData.colors.indexOf(gameData.loopColors.possible[0]);
			}else{
				var randomColorIndex = Math.floor(Math.random()*gameData.loopColors.length);
				gameData.loopColors.color = randomColorIndex;
			}
			loopAutoColors();
		}
	}
}

function loopAutoColors(){
	playSound('soundColorPick');
	for(var n=0; n<4; n++){	
		$.colors[n].gotoAndStop(n+4);
	}
	$.colors[gameData.loopColors.index].gotoAndStop(gameData.loopColors.index);

	var proceedLoop = true;
	if(gameData.loopColors.round > gameData.loopColors.roundMax){
		if(gameData.loopColors.index == gameData.loopColors.color){
			proceedLoop = false;
			TweenMax.to(cardsContainer, 1, {overwrite:true, onComplete:function(){
				gameData.match.value = 0;
				gameData.match.color = gameData.colors[gameData.loopColors.index];
				toggleColors(false);
				getMatchDetail();
				checkRoundEnd();
			}});
		}
	}

	if(proceedLoop){
		gameData.loopColors.index++;
		if(gameData.loopColors.index > gameData.colors.length-1){
			gameData.loopColors.index = 0;
			gameData.loopColors.round++;
		}

		TweenMax.to(cardsContainer, .1, {overwrite:true, onComplete:loopAutoColors});
	}
}

/*!
 * 
 * SPECIAL CARDS FUNCTION - This is the function that runs to check special cards
 * 
 */
function revealPlayerCards(playerIndex){
	gameData.turn.revealCard = false;
	toggleTargetPlayers(false);

	var isPlayer = checkIsPlayer(playerIndex);
	if(!isPlayer){
		for(var n=0; n<$.players[playerIndex].cards.length; n++){
			var thisCard = $.cards[$.players[playerIndex].cards[n]];
			flipCard(thisCard);
		}
	}

	TweenMax.to(cardsContainer, 3, {overwrite:true, onComplete:function(){
		if(!isPlayer){
			for(var n=0; n<$.players[playerIndex].cards.length; n++){
				var thisCard = $.cards[$.players[playerIndex].cards[n]];
				flipCardCover(thisCard);
			}
		}
		toggleTargetIcon();
		checkRoundEnd();
	}});
}

function choosePlayerCards(playerIndex){
	gameData.targetPlayer = playerIndex;
	toggleTargetPlayers(false);
	showGameGuide('selectcards');

	gameData.turn.action = true;
	gameData.turn.played = false;

	var isPlayer = checkIsPlayer(playerIndex);
	if(!isPlayer){
		for(var n=0; n<$.players[gameData.player].cards.length; n++){
			var cardIndex = $.players[gameData.player].cards[n];
			highlightCard($.cards[cardIndex], true);
		}
	}
}

function removePlayers(playerIndex){
	gameData.turn.removePlayer = false;
	toggleTargetPlayers(false);
	toggleTargetIcon();
	$.players[playerIndex].active = false;
	$.players["called"+playerIndex].visible = false;
	$.players["call"+playerIndex].visible = false;
	$.players["eliminated"+playerIndex].visible = true;
	animateFocus($.players["eliminated"+playerIndex]);

	for(var n=0; n<$.players[playerIndex].cards.length; n++){
		var cardIndex = $.players[playerIndex].cards[n];
		$.cards[cardIndex].eliminated.visible = true;
	}

	playSound('soundEliminated');
	gameData.activePlayers--;
	checkRoundEnd();
}

function targetedPlayerDraw(playerIndex){
	toggleTargetPlayers(false);
	toggleTargetIcon();
	
	gameData.player = playerIndex;
	nextPlayerTurn(false);
}

function giveCardToPlayer(cardIndex){
	gameData.turn.giveCards--;
	var playerCardIndex = $.players[gameData.player].cards.indexOf(cardIndex);
	$.players[gameData.player].cards.splice(playerCardIndex, 1);
	$.players[gameData.targetPlayer].cards.push(cardIndex);
	
	var isPlayer = false;
	var isTargetPlayer = false;
	if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
		if(gameData.player == socketData.gameIndex){
			isPlayer = true;
		}
		if(gameData.targetPlayer == socketData.gameIndex){
			isTargetPlayer = true;
		}
	}else{
		if(gameData.player == 0){
			isPlayer = true;
		}
		isTargetPlayer = false;
	}

	var thisCard = $.cards[cardIndex];
	if(isPlayer){
		highlightCard(thisCard, false);
	}

	if(isTargetPlayer){
		flipCard(thisCard);
	}else{
		flipCardCover(thisCard);
	}
	
	positionPlayerCards(gameData.player, true);
	positionPlayerCards(gameData.targetPlayer, true);

	if(gameData.turn.giveCards == 0 || $.players[gameData.player].cards.length == 0){
		for(var n=0; n<$.players[gameData.player].cards.length; n++){
			var cardIndex = $.players[gameData.player].cards[n];
			highlightCard($.cards[cardIndex], false);
		}

		toggleTargetIcon();
		showGameGuide();
		gameData.turn.giveCard = false
		gameData.turn.action = false;
		gameData.turn.played = true;
		checkRoundEnd();
	}
}

function autoGiveCardToPlayer(){
	var possibleCards = $.players[gameData.player].cards.slice();
	shuffle(possibleCards);
	var cardIndex = possibleCards[0];
	
	gameData.turn.giveCards--;
	var playerCardIndex = $.players[gameData.player].cards.indexOf(cardIndex);
	$.players[gameData.player].cards.splice(playerCardIndex, 1);
	$.players[gameData.targetPlayer].cards.push(cardIndex);
	$.players["called" + gameData.targetPlayer].visible = false;
	
	var isPlayer = checkIsPlayer(gameData.targetPlayer);
	if(isPlayer){
		var thisCard = $.cards[cardIndex];
		flipCard(thisCard);
	}
	
	playSound('soundCardDeal');
	positionPlayerCards(gameData.player, true);
	positionPlayerCards(gameData.targetPlayer, true);

	TweenMax.to(cardsContainer, .2, {overwrite:true, onComplete:function(){
		if(gameData.turn.giveCards == 0 || $.players[gameData.player].cards.length == 0){
			for(var n=0; n<$.players[gameData.player].cards.length; n++){
				var cardIndex = $.players[gameData.player].cards[n];
				highlightCard($.cards[cardIndex], false);
			}
	
			toggleTargetIcon();
			showGameGuide();
			gameData.turn.giveCard = false
			gameData.turn.action = false;
			gameData.turn.played = true;
			checkRoundEnd();
		}else{
			autoGiveCardToPlayer();
		}
	}});
}

function swapPlayerCards(playerIndex){
	gameData.turn.swap = false;
	toggleTargetPlayers(false);
	toggleTargetIcon();

	var playerAimCards = $.players[playerIndex].cards.slice();
	var playerCards = $.players[gameData.player].cards.slice();
	$.players[playerIndex].cards = playerCards;
	$.players[gameData.player].cards = playerAimCards;

	for(var c=0; c<$.players[playerIndex].cards.length; c++){
		var thisCard = $.cards[$.players[playerIndex].cards[c]];
		var showCardContent = checkIsPlayer(playerIndex);
		if(showCardContent){
			flipCard(thisCard);
		}else{
			flipCardCover(thisCard);
		}
	}

	for(var c=0; c<$.players[gameData.player].cards.length; c++){
		var thisCard = $.cards[$.players[gameData.player].cards[c]];
		var showCardContent = checkIsPlayer(gameData.player);
		if(showCardContent){
			flipCard(thisCard);
		}else{
			flipCardCover(thisCard);
		}
	}

	positionPlayerCards(playerIndex, true);
	positionPlayerCards(gameData.player, true);
	checkRoundEnd();
}

function toggleTargetIcon(playerIndex){
	if(playerIndex != undefined){
		playSound('soundTarget');
		gameData.lastPlayerIndex = playerIndex;
		$.players["target"+playerIndex].visible = true;
		$.players["call"+playerIndex].alpha = 0;
		$.players["called"+playerIndex].alpha = 0;

		$.players["target"+playerIndex].alpha = 0;
		$.players["target"+playerIndex].scaleX = $.players["target"+playerIndex].scaleY = 3;
		TweenMax.to($.players["target"+playerIndex], .5, {alpha:1, scaleX:1, scaleY:1, overwrite:true});
	}else{
		$.players["target"+gameData.lastPlayerIndex].visible = false;
		$.players["call"+gameData.lastPlayerIndex].alpha = 1;
		$.players["called"+gameData.lastPlayerIndex].alpha = 1;
	}
}

/*!
 * 
 * TOGGLE TARGET PLAYERS - This is the function that runs to target players
 * 
 */
function toggleTargetPlayers(con){
	for(var n=0; n<gameData.players; n++){
		killAnimateBlink($.players["aim" + n]);
		$.players["aim" + n].visible = false;
		$.players["call" + n].alpha = 1;
		$.players["called" + n].alpha = 1;
	}

	if(con){
		var isPlayer = false;
		if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
			isPlayer = true;
		}else{
			if(gameData.player == 0){
				isPlayer = true;
			}
		}

		showGameGuide('targetplayer');
		for(var n=0; n<gameData.players; n++){
			if(n != gameData.player && $.players[n].active){
				$.players["call" + n].alpha = 0;
				$.players["called" + n].alpha = 0;
				$.players["aim" + n].visible = true;
				animateBlink($.players["aim" + n]);
			}
		}
		
		if(!isPlayer){
			var possiblePlayer = [];
			for(var n=0; n<gameData.players; n++){
				if(n != gameData.player && $.players[n].active){
					possiblePlayer.push({index:n, cards:$.players[n].cards.length});
				}
			}
			sortOnObject(possiblePlayer, 'cards', false);
			toggleTargetPlayers(false);
			toggleTargetIcon(possiblePlayer[0].index);

			TweenMax.to(cardsContainer, gameSettings.aiThinkSpeed, {overwrite:true, onComplete:function(){
				if(gameData.turn.swap){
					swapPlayerCards(possiblePlayer[0].index);
				}else if(gameData.turn.revealCard){
					gameData.turn.revealCard = false;
					toggleTargetIcon();
					checkRoundEnd();
				}else if(gameData.turn.giveCard){
					gameData.targetPlayer = possiblePlayer[0].index;
					autoGiveCardToPlayer();
				}else if(gameData.turn.removePlayer){
					removePlayers(possiblePlayer[0].index);
				}else{
					targetedPlayerDraw(possiblePlayer[0].index);
				}
			}});
		}
	}else{
		showGameGuide();
	}
}

/*!
 * 
 * POSITION CARDS - This is the function that runs to position cards
 * 
 */
function positionPlayerCards(index, animation){
	var pos = getPlayerCardPosition(index);

	for(var p=0; p<$.players[index].cards.length; p++){
		$.players[index].cardX = pos.x;
		$.players[index].cardY = pos.y;

		var thisCard = $.cards[$.players[index].cards[p]];
		if(thisCard.cardDeal){
			thisCard.oriX = pos.x;
			thisCard.oriY = pos.y;

			if(pos.horizontal){
				var rotationNum = $.players[index].dir == 'bottom' ? 0 : 180;
				pos.x += pos.gap;
			}else{
				var rotationNum = $.players[index].dir == 'right' ? -90 : 90;
				pos.y += pos.gap;
			}

			if(animation){
				setCardDepth(thisCard);
				var cardSpeed = gameSettings.cardMoveSpeed;
				TweenMax.to(thisCard, cardSpeed, {x:thisCard.oriX, y:thisCard.oriY, rotation:rotationNum, scaleX:1, scaleY:1, overwrite:true});
			}
		}
	}

	var gapX = (gameSettings.cardW/2) + 15;
	var gapY = (gameSettings.cardH/2) + 15;
	var buttonSpace = 20;

	$.players["stats" + index].playerName.y = $.players["stats" + index].playerScore.y = -12;
	$.players["stats" + index].playerName.x = -150;
	$.players["stats" + index].playerScore.x = 150;

	$.players["stats" + index].playerName.textAlign = "left";
	$.players["stats" + index].playerScore.textAlign = "right";

	var arrowTopBottom = 450;
	var arrowLeftRight = 250;
	if(!viewport.isLandscape){
		arrowTopBottom = 250;
		arrowLeftRight = 350;
	}

	if($.players[index].dir == "bottom"){
		$.players["stats" + index].rotation = 0;
		$.players["stats" + index].x = $.players[index].x;
		$.players["stats" + index].y = $.players[index].y - gapY;
		$.players["call" + index].x = $.players[index].x;
		$.players["call" + index].y = $.players[index].y - (gapY + buttonSpace);
		$.players["arrow" + index].x = $.players[index].x - arrowTopBottom;
		$.players["arrow" + index].y = $.players[index].y;
		$.players["arrow" + index].rotation = 0;
	}else if($.players[index].dir == "top"){
		$.players["stats" + index].rotation = 0;
		$.players["stats" + index].x = $.players[index].x;
		$.players["stats" + index].y = $.players[index].y + gapY;
		$.players["call" + index].x = $.players[index].x;
		$.players["call" + index].y = $.players[index].y + (gapY + buttonSpace);
		$.players["stats" + index].playerName.y = $.players["stats" + index].playerScore.y = 16;
		$.players["stats" + index].playerName.x = 150;
		$.players["stats" + index].playerScore.x = -150;
		$.players["stats" + index].playerName.textAlign = "right";
		$.players["stats" + index].playerScore.textAlign = "left";
		$.players["arrow" + index].x = $.players[index].x + arrowTopBottom;
		$.players["arrow" + index].y = $.players[index].y;
		$.players["arrow" + index].rotation = 180;
	}else if($.players[index].dir == "left"){
		$.players["stats" + index].rotation = 90;
		$.players["stats" + index].x = $.players[index].x + gapY;
		$.players["stats" + index].y = $.players[index].y;
		$.players["call" + index].x = $.players[index].x + (gapY + buttonSpace);
		$.players["call" + index].y = $.players[index].y;
		$.players["arrow" + index].x = $.players[index].x;
		$.players["arrow" + index].y = $.players[index].y - arrowLeftRight;
		$.players["arrow" + index].rotation = 90;
	}else if($.players[index].dir == "right"){
		$.players["stats" + index].rotation = -90;
		$.players["stats" + index].x = $.players[index].x - gapY;
		$.players["stats" + index].y = $.players[index].y;
		$.players["call" + index].x = $.players[index].x - (gapY + buttonSpace);
		$.players["call" + index].y = $.players[index].y;
		$.players["arrow" + index].x = $.players[index].x;
		$.players["arrow" + index].y = $.players[index].y + arrowLeftRight;
		$.players["arrow" + index].rotation = -90;
	}

	$.players["called" + index].x = $.players["aim" + index].x = $.players["target" + index].x = $.players["skip" +index].x = $.players["eliminated" +index].x = $.players["call" + index].x;
	$.players["called" + index].y = $.players["aim" + index].y = $.players["target" + index].y = $.players["skip" +index].y = $.players["eliminated" +index].y = $.players["call" + index].y;
}

function flipCard(card){
	playSound('soundCardFlip');
	card.contentContainer.visible = true;
	card.contentContainer.scaleX = 0;

	var flipSpeed = gameSettings.cardFlipSpeed;
	TweenMax.to(card.frontContainer, flipSpeed, {scaleX:0});
	TweenMax.to(card.contentContainer, flipSpeed, {delay:flipSpeed, scaleX:1});
	TweenMax.to(card.shadow, flipSpeed, {scaleX:0});
	TweenMax.to(card.shadow, flipSpeed, {delay:flipSpeed, scaleX:1});
}

function flipCardCover(card){
	playSound('soundCardFlip');
	card.frontContainer.visible = true;
	card.frontContainer.scaleX = 0;

	var flipSpeed = gameSettings.cardFlipSpeed;
	TweenMax.to(card.contentContainer, flipSpeed, {scaleX:0});
	TweenMax.to(card.frontContainer, flipSpeed, {delay:flipSpeed, scaleX:1});
	TweenMax.to(card.shadow, flipSpeed, {scaleX:0});
	TweenMax.to(card.shadow, flipSpeed, {delay:flipSpeed, scaleX:1});
}

/*!
 * 
 * SHOW DRAW CARD - This is the function that runs to show draw card
 * 
 */
function showDrawCard(pileCard){
	if(gameData.draw.length > 1){
		var cardW = gameSettings.cardW;
		var cardSpeed = gameSettings.cardMoveSpeed;
		var cardIndex = gameData.draw[0];
		gameData.draw.splice(0,1);

		for(var d=0; d<gameData.draw.length; d++){
			var thisCard = $.cards[gameData.draw[d]];
			if(d == 0){
				thisCard.frontContainer.scaleX = 1;
				thisCard.frontContainer.visible = true;
				thisCard.contentContainer.visible = false;
				thisCard.visible = true;
				setCardDepth(thisCard);
			}else{
				thisCard.visible = false;
			}
			TweenMax.to(thisCard, cardSpeed, {x:-(cardW/2), overwrite:true});
		}

		if(pileCard){
			showDiscardCard(cardIndex, true);
		}else{
			var discardCardIndex = gameData.discard[gameData.discard.length-1];
			var thisCard = $.cards[discardCardIndex];
			setCardDepth(thisCard);
		}
	}else{
		for(var n=0; n<gameData.discard.length-2; n++){
			gameData.draw.push(gameData.discard[n]);
		}
		for(var n=0; n<gameData.discard.length-2; n++){
			gameData.discard.splice(n,1);
			n--;
		}
		shuffle(gameData.draw);
		if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
			postSocketUpdate('shuffledrawcards', socketData.gameIndex);
		}else{
			showDrawCard(pileCard);
		}
	}
}

function setCardDepth(thisCard){
	cardsPlayContainer.setChildIndex(thisCard.shadow, cardsPlayContainer.numChildren-1);
	cardsPlayContainer.setChildIndex(thisCard, cardsPlayContainer.numChildren-1);
	cardsPlayContainer.setChildIndex(thisCard.highlight, cardsPlayContainer.numChildren-1);
	cardsPlayContainer.setChildIndex(thisCard.eliminated, cardsPlayContainer.numChildren-1);
}

function showDiscardCard(cardIndex, flip){
	var cardW = gameSettings.cardW;
	var cardSpeed = gameSettings.cardMoveSpeed;

	gameData.discard.push(cardIndex);
	var discardCardIndex = gameData.discard[gameData.discard.length-1];
	var thisCard = $.cards[discardCardIndex];
	thisCard.cardDeal = false;
	toggleCardAction(thisCard, false);
	setCardDepth(thisCard);

	if(flip){
		flipCard(thisCard);
	}
	playSound('soundCardDeal');
	TweenMax.to(thisCard, cardSpeed, {x:(cardW/2), y:0, rotation:0, overwrite:true, onComplete:showDiscardCardComplete, onCompleteParams:[thisCard]});
	getMatchDetail();
}

function showDiscardCardComplete(thisCard){
	var proceedCheck = true;
	if(gameData.match.count == 0){
		//begin
		for(var n=0; n<gameData.players; n++){
			$.players["stats" + n].visible = true;
			$.players["arrow" + n].visible = true;
		}

		if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
			$.players["call" + socketData.gameIndex].visible = true;
		}else{
			$.players["call" + 0].visible = true;
		}
		itemColors.alpha = 1;

		if(gameData.excludeFirst.indexOf(thisCard.cardType) != -1){
			proceedCheck = false;
			showDrawCard(true);
		}else{
			toggleArrowTurn();
			displayPlayerTurn();	
		}
	}

	if(proceedCheck){
		checkDiscardCard(thisCard.cardType);
	}
}

function checkDiscardCard(cardType){
	gameData.turn.lastCardType = cardType;
	gameData.turn.drawCardsTotal = 0;
	if($.players[gameData.player].cards.length == 0){
		//end
		highlightPlayer(false);
		showGameStatus("emptycards");
	}else if(gameData.activePlayers == 1){
		//end
		highlightPlayer(false);
		showGameStatus("nomoreplayers");
	}else if(cardType == "draw2"){
		gameData.turn.drawCards = gameData.turn.drawCardsTotal = 2;
		showGameStatus(cardType);
	}else if(cardType == "draw3"){
		gameData.turn.drawCards = gameData.turn.drawCardsTotal = 3;
		showGameStatus(cardType);
	}else if(cardType == "reverse"){
		gameData.turn.reverseTurn = true;
		if(gameData.activePlayers == 2){
			gameData.turn.reverseCount = 1;
		}else{
			if(gameData.match.count == 0){
				gameData.turn.reverseCount = 1;
			}else{
				gameData.turn.reverseCount = 2;
			}
		}
		showGameStatus(cardType);
	}else if(cardType == "skip"){
		gameData.turn.skip = true;
		togglePlayerSkip(true, true);
		showGameStatus(cardType);
	}else if(cardType == "wild"){
		gameData.turn.pickColors = true;
		showGameStatus(cardType);
	}else if(cardType == "wilddraw4"){
		gameData.turn.pickColors = true;
		gameData.turn.drawCards = gameData.turn.drawCardsTotal = 4;
		showGameStatus(cardType);
	}else if(cardType == "truesight"){
		gameData.turn.revealCard = true;
		gameData.turn.targetPlayerAim = true;
		showGameStatus(cardType);
	}else if(cardType == "oneforme"){
		gameData.turn.targetPlayer = gameData.player;
		gameData.turn.targetDrawCards = 1;
		gameData.turn.targetDrawCard = true;
		showGameStatus(cardType);
	}else if(cardType == "devildeal"){
		//Reverse, Skip then Draw 2 cards.
		var nextAction = {action:'reverse', data:[{obj:'reverseTurn', value:true}, {obj:'reverseCount', value:2}]};
		gameData.turn.queue.push(nextAction);
		var nextAction = {action:'skip', data:[]};
		gameData.turn.queue.push(nextAction);
		var nextAction = {action:'draw2', data:[{obj:'targetDrawCards', value:2}, {obj:'targetDrawCard', value:true}, {obj:'played', value:true}]};
		gameData.turn.queue.push(nextAction);

		showGameStatus(cardType);
	}else if(cardType == "charity"){
		gameData.turn.targetPlayerAim = true;
		gameData.turn.giveCards = 2;
		gameData.turn.giveCard = true;
		showGameStatus(cardType);
	}else if(cardType == "targeteddraw2"){
		gameData.turn.targetPlayerAim = true;
		var nextAction = {action:'draw2', data:[{obj:'targetDrawCards', value:2}, {obj:'targetDrawCard', value:true}, {obj:'continuePlay', value:true}]};
		gameData.turn.queue.push(nextAction);
		showGameStatus(cardType);
	}else if(cardType == "eliminatedplayer"){
		gameData.turn.targetPlayerAim = true;
		gameData.turn.removePlayer = true;
		showGameStatus(cardType);
	}else if(cardType == "frozencolor"){
		gameData.turn.pickColors = true;
		gameData.turn.frozenPick = true;
		gameData.turn.frozenSkip = true;
		gameData.turn.frozenReset = gameData.player;
		showGameStatus(cardType);
	}else if(cardType == "add50points"){
		gameData.turn.addPoints = 50;
		showGameStatus(cardType);
	}else if(cardType == "targeteddraw3"){
		gameData.turn.targetPlayerAim = true;
		var nextAction = {action:'draw3', data:[{obj:'targetDrawCards', value:3}, {obj:'targetDrawCard', value:true}, {obj:'continuePlay', value:true}]};
		gameData.turn.queue.push(nextAction);
		showGameStatus(cardType);
	}else if(cardType == "shufflehandcards"){
		gameData.turn.shuffle = true;
		showGameStatus(cardType);
	}else if(cardType == "swapcards"){
		gameData.turn.targetPlayerAim = true;
		gameData.turn.swap = true;
		showGameStatus(cardType);
	}else if(cardType == "itsatrap"){
		gameData.turn.targetPlayer = gameData.player;
		gameData.turn.targetDrawCards = 4;
		gameData.turn.targetDrawCard = true;
		showGameStatus(cardType);
	}else{
		checkRoundEnd();
	}
}

function drawPlayerCard(turn){
	gameData.turn.animating = true;
	$.players["called" + gameData.player].visible = false;

	if(turn){
		if(gameData.turn.penalty){
			if(gameData.turn.penaltyCards > 0){
				gameData.turn.penaltyCards--;
			}
		}else{
			if(gameData.turn.drawCards > 0){
				gameData.turn.drawCards--;
			}
		}
	}

	var drawCardIndex = gameData.draw[0];
	gameData.draw.splice(0,1);
	showDrawCard(false);

	$.players[gameData.player].cards.push(drawCardIndex);

	var thisCard = $.cards[drawCardIndex];
	var thisPlayer = gameData.player;
	var pos = getPlayerCardPosition(thisPlayer);
	setCardDepth(thisCard);
	highlightCard(thisCard, false);
	
	thisCard.oriX = $.players[thisPlayer].cardX;
	thisCard.oriY = $.players[thisPlayer].cardY;

	if(pos.horizontal){
		var rotationNum = $.players[thisPlayer].dir == 'bottom' ? 0 : 180;
	}else{
		var rotationNum = $.players[thisPlayer].dir == 'right' ? -90 : 90;
	}

	var cardSpeed = gameSettings.cardDealSpeed;
	TweenMax.to(thisCard, cardSpeed, {x:thisCard.oriX, y:thisCard.oriY, rotation:rotationNum, scaleX:1, scaleY:1, overwrite:true, onStart:function(){
		thisCard.cardDeal = true;
		playSound('soundCardDeal');
	},onComplete:drawPlayerCardComplete, onCompleteParams:[thisPlayer, thisCard]});
}

function drawPlayerCardComplete(index, card){
	gameData.turn.animating = false;

	var showCardContent = false;
	if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
		if(index == socketData.gameIndex){
			showCardContent = true;
		}
	}else{
		if(index == 0){
			showCardContent = true;
		}
	}

	if(showCardContent){
		toggleCardAction(card, true);
		flipCard(card);
	}

	positionPlayerCards(index, true);
	loopCardAction();
}

function getMatchDetail(){
	var discardCardIndex = gameData.discard[gameData.discard.length-1];
	var thisCard = $.cards[discardCardIndex];
	
	gameData.match.type = thisCard.cardType;
	if(gameData.excludeMatch.indexOf(thisCard.cardType) == -1){
		gameData.match.color = thisCard.cardColor;
		gameData.match.value = thisCard.cardValue;
	}

	var frozenColor = gameData.turn.frozenColor;
	if(gameData.turn.frozenPick){
		frozenColor = false;
		gameData.turn.frozenPick = false;
		gameData.turn.frozenColor = true;
		itemFrozen.alpha = 1;
		playSound('soundFreeze');
		animateFocus(itemFrozen);
	}

	if(gameData.match.lastColor != gameData.match.color && !frozenColor){
		playSound('soundColor');
		gameData.match.lastColor = gameData.match.color;
		itemColors.gotoAndStop(gameData.colors.indexOf(gameData.match.color));
		TweenMax.to(itemColors, .2, {scaleX:1, scaleY:1, overwrite:true, onComplete:function(){
			TweenMax.to(itemColors, .2, {scaleX:.7, scaleY:.7, overwrite:true});	
		}});
	}
}

/*!
 * 
 * DISPLAY PLAYER TURN - This is the function that runs to display player turn
 * 
 */
function tryAIMove(possibleCardArr){
	if(!gameData.ai){
		return;
	}

	if(gameData.turn.loseTurn){
		checkRoundEnd();
	}else{
		var aiSpeed = gameData.turn.drawCount > 0 ? .2 : gameSettings.aiThinkSpeed;
		if(possibleCardArr.length > 0){
			TweenMax.to($.players[gameData.player], aiSpeed, {overwrite:true, onComplete:function(){
				shuffle(possibleCardArr);
				discardPlayerCard(possibleCardArr[0], true);
			}});
		}else{
			if(gameData.turn.drawCount >= 1){
				checkRoundEnd();
			}else{
				TweenMax.to($.players[gameData.player], aiSpeed, {overwrite:true, onComplete:function(){
					gameData.turn.drawCount++;
					drawPlayerCard(false);
				}});
			}
		}
	}
}

/*!
 * 
 * DISPLAY PLAYER TURN - This is the function that runs to display player turn
 * 
 */
function displayPlayerTurn(){
	gameData.match.active = true;
	gameData.turn.highlight = true;
	gameData.turn.played = false;
	gameData.turn.drawCount = 0;
	gameData.turn.drawCardsCount = 0;
	gameData.turn.drawCard = false;
	gameData.turn.loseTurn = false;
	gameData.turn.continuePlay = false;
	gameData.turn.penalty = false;

	var actionCard = false;
	if(gameData.turn.queue.length > 0){
		for(var n=0; n<gameData.turn.queue[0].data.length; n++){
			gameData.turn[gameData.turn.queue[0].data[n].obj] = gameData.turn.queue[0].data[n].value;
		}
		if(gameData.turn.queue[0].action == 'draw2'){
			gameData.turn.targetPlayer = gameData.player;
		}else if(gameData.turn.queue[0].action == 'draw3'){
			gameData.turn.targetPlayer = gameData.player;
		}else if(gameData.turn.queue[0].action == 'skip'){
			togglePlayerSkip(true, false);
		}
		showGameStatus(gameData.turn.queue[0].action);
		gameData.turn.queue.splice(0,1);
		actionCard = true;
	}

	if(!actionCard){
		if(gameData.turn.drawCards > 0){
			gameData.turn.highlight = false;
			gameData.turn.played = true;
		}
		loopCardAction();
	}

	if(gameData.turn.highlight){
		highlightPlayer(true);
	}

	if(!gameData.turn.played){
		if(!actionCard){
			if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
				postSocketUpdate('cardactioncomplete', socketData.gameIndex);
			}else{
				playerReadyAction();
			}
		}
	}
}

function playerReadyAction(){
	var proceedAction = checkIsPlayer(gameData.player);
	if(proceedAction){
		TweenMax.to($.players[gameData.player], 1, {overwrite:true, onComplete:function(){
			gameData.turn.action = true;
		}});
	}
}

function loopCardAction(){
	if(gameData.turn.penaltyCards > 0){
		drawPlayerCard(true);
	}else if(gameData.turn.drawCards > 0 && !gameData.turn.penalty){
		gameData.turn.drawCardsCount++;
		drawPlayerCard(true);
	}else{
		if(gameData.turn.drawCardsCount == gameData.turn.drawCardsTotal && gameData.turn.drawCardsTotal != 0){
			if(gameData.turn.continuePlay){
				gameData.turn.action = true;
				gameData.turn.continuePlay = false;
			}else{
				gameData.turn.loseTurn = true;
			}
		}

		if(!gameData.turn.played){
			var possibleCardArr = checkPossibleCard(gameData.player);
			var proceedAction = checkIsPlayer(gameData.player);
			if(proceedAction){
				if(gameData.turn.loseTurn){
					gameData.turn.drawCard = false;
					checkRoundEnd();
				}else{
					if(possibleCardArr.length > 0){
						//play card
						for(var n=0; n<possibleCardArr.length; n++){
							highlightCard($.cards[possibleCardArr[n]], true);
						}
						gameData.turn.drawCard = false;
					}else{
						//draw card
						if(gameData.turn.drawCount >= 1){
							gameData.turn.drawCard = false;
							gameData.match.active = false;
							checkRoundEnd();
						}else{
							gameData.turn.drawCard = true;
							var thisCard = $.cards[gameData.draw[0]];
							toggleCardAction(thisCard, true);
							highlightCard(thisCard, true);
						}
					}
				}
			}else{
				if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
					if(gameData.turn.loseTurn){
						checkRoundEnd();
					}else if(gameData.turn.drawCount >= 1 && possibleCardArr.length == 0){
						gameData.turn.drawCard = false;
						gameData.match.active = false;
						checkRoundEnd();
					}
				}else{
					tryAIMove(possibleCardArr);
				}
			}	
		}else{
			checkRoundEnd();
		}
	}
}

/*!
 * 
 * POSSIBLE MOVES - This is the function that runs to check possible moves
 * 
 */
function checkPossibleCard(index){
	var possibleCardArr = [];

	for(var c=0; c<$.players[index].cards.length; c++){
		if(checkMatchCard($.players[index].cards[c])){
			possibleCardArr.push($.players[index].cards[c]);
		}
	}

	return possibleCardArr;
}

function checkMatchCard(cardIndex){
	var matchCard = false;
	var thisCard = $.cards[cardIndex];
	if(gameData.specialArr.indexOf(thisCard.cardType) != -1){
		matchCard = true;
	}else if(gameData.wildArr.indexOf(thisCard.cardType) != -1){
		matchCard = true;
	}else if(gameData.match.color == thisCard.cardColor && gameData.actionArr.indexOf(thisCard.cardType) != -1){
		matchCard = true;
	}else if(gameData.match.type == thisCard.cardType && gameData.actionArr.indexOf(thisCard.cardType) != -1){
		matchCard = true; 
	}else if(gameData.match.color == thisCard.cardColor){
		matchCard = true;
	}else if(gameData.match.value != '' && gameData.match.value == thisCard.cardValue){
		matchCard = true;
	}else if(gameData.match.type == thisCard.cardType && thisCard.cardValue == 0 && gameData.match.value == 0){
		matchCard = true;
	}
	return matchCard;
}

/*!
 * 
 * HIGHLIGHT PLAYER - This is the function that runs to highlight player
 * 
 */
function highlightPlayer(con){
	for(var n=0; n<gameData.players; n++){
		TweenMax.to($.players["stats" + n].playerName, .2, {alpha:1, overwrite:true});	
		$.players["stats" + n].alpha = .5;
	}

	if(con){
		playSound('soundAlert');
		animatePlayerFocus($.players["stats" + gameData.player]);
		animateBlink($.players["stats" + gameData.player].playerName);
		$.players["stats" + gameData.player].alpha = 1;
	}
}

function animatePlayerFocus(obj){
	TweenMax.to(obj, .2, {delay:.5, scaleX:1.3, scaleY:1.3, ease:Sine.easeIn,  overwrite:true, onComplete:function(){
		TweenMax.to(obj, .2, {scaleX:1, scaleY:1, ease:Sine.easeOut, overwrite:true});	
	}});
}

function animateFocus(obj){
	TweenMax.to(obj, .2, {scaleX:1.3, scaleY:1.3, overwrite:true, onComplete:function(){
		TweenMax.to(obj, .2, {scaleX:1, scaleY:1, overwrite:true});	
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
 * CHECK ROUND END - This is the function that runs to check round end
 * 
 */
function checkRoundEnd(){
	gameData.turn.action = false;
	togglePlayerSkip(false);

	if($.players[gameData.player].cards.length == 0){
		//end
		highlightPlayer(false);
		showGameStatus("emptycards");
	}else if(gameData.activePlayers == 1){
		//end
		highlightPlayer(false);
		showGameStatus("nomoreplayers");
	}else if(gameData.turn.addPoints > 0){
		tweenData.tweenScore = playerData.scores[gameData.player];
		playerData.scores[gameData.player] += gameData.turn.addPoints;
		gameData.turn.addPoints = 0;
		TweenMax.to(tweenData, .5, {tweenScore:playerData.scores[gameData.player], overwrite:true, onUpdate:function(){
			$.players["stats" + gameData.player].playerScore.text = textDisplay.playerScore.replace("[NUMBER]", Math.round(tweenData.tweenScore));
		}, onComplete:function(){
			TweenMax.to(cardsContainer, 1, {overwrite:true, onComplete:function(){
				checkRoundEnd();
			}});
		}});
	}else if(gameData.turn.shuffle){
		gameData.turn.shuffle = false;
		gameData.turn.playerCards = [];
		for(var n=0; n<gameData.players; n++){
			if($.players[n].active){
				for(var c=0; c<$.players[n].cards.length; c++){
					gameData.turn.playerCards.push($.players[n].cards[c]);
				}
			}
		}
		shuffle(gameData.turn.playerCards);
		if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
			postSocketUpdate('shuffleplayercards', {index:socketData.gameIndex, allCards:gameData.turn.playerCards});
		}else{
			shufflePlayerCards(gameData.turn.playerCards);
		}
	}else if(gameData.turn.targetDrawCard && gameData.turn.targetPlayer == gameData.player){
		gameData.turn.targetDrawCard = false;
		gameData.turn.drawCards = gameData.turn.drawCardsTotal = gameData.turn.targetDrawCards;
		loopCardAction();
	}else if(gameData.turn.pickColors){
		gameData.turn.pickColors = false;
		toggleColors(true);
	}else if(gameData.turn.targetPlayerAim){
		gameData.turn.targetPlayerAim = false;
		toggleTargetPlayers(true);
	}else if(gameData.match.count == 0 && gameData.match.active){
		if(gameData.turn.drawCount > 0 || gameData.turn.loseTurn){
			nextPlayerTurn(true);
		}else{
			//stay
			nextPlayerTurn(false);
		}
	}else if(gameData.turn.frozenSkip){
		gameData.turn.frozenSkip = false;
		nextPlayerTurn(true);
	}else{
		if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
			if($.players[gameData.player].cards.length == 1){
				if($.players["called" + gameData.player].visible){
					nextPlayerTurn(true);
				}else{
					var proceedAction = checkIsPlayer(gameData.player);
					if(proceedAction){
						TweenMax.to(cardsContainer, gameSettings.lastCardCallTimer, {overwrite:true, onComplete:function(){
							if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
								postSocketUpdate('calltimer', socketData.gameIndex);
							}else{
								checkCallPenalty();
							}
						}});
					}
				}
			}else{
				nextPlayerTurn(true);
			}
		}else{
			if(gameData.player != 0){
				if($.players[gameData.player].cards.length == 1){
					playSound('soundCall');
					$.players["called" + gameData.player].visible = true;
					animateFocus($.players["called" + gameData.player]);
				}
				nextPlayerTurn(true);
			}else{
				if($.players[gameData.player].cards.length == 1){
					if($.players["called" + gameData.player].visible){
						nextPlayerTurn(true);
					}else{
						TweenMax.to(cardsContainer, gameSettings.lastCardCallTimer, {overwrite:true, onComplete:function(){
							checkCallPenalty();
						}});
					}
				}else{
					nextPlayerTurn(true);
				}
			}
		}
	}
}

function shufflePlayerCards(allCards){
	var playerCards = [];
	for(var n=0; n<gameData.players; n++){
		var totalCards = $.players[n].cards.length;
		if($.players[n].active){
			$.players[n].cards.length = 0;
		}
		playerCards.push({index:n, totalCards:totalCards});
	}
	var allCardsIndex = 0;
	for(var n=0; n<gameData.players; n++){
		if($.players[n].active){
			for(var c=0; c<playerCards[n].totalCards; c++){
				var cardIndex = allCards[allCardsIndex];
				$.players[n].cards.push(cardIndex);

				var thisCard = $.cards[cardIndex];
				var showCardContent = checkIsPlayer(n);
				if(showCardContent){
					flipCard(thisCard);
				}else{
					flipCardCover(thisCard);
				}
				allCardsIndex++;
			}
			positionPlayerCards(n, true);
		}
	}

	TweenMax.to(cardsContainer, 1, {overwrite:true, onComplete:function(){
		checkRoundEnd();
	}});
}

function updatePlayerScore(player){
	tweenData.tweenScore = playerData.scores[player];
	playerData.scores[player] += gameData.turn.addPoints;
	gameData.turn.addPoints = 0;

	TweenMax.to(tweenData, .5, {tweenScore:playerData.scores[player], overwrite:true, onUpdate:function(){
		$.players["stats" + player].playerScore.text = textDisplay.playerScore.replace("[NUMBER]", Math.round(tweenData.tweenScore));
	}});
}

function checkCallPenalty(){
	// if($.players["called" + gameData.player].visible){
		nextPlayerTurn(true);
	// }else{
	// 	//penalty
	// 	gameData.turn.penalty = true;
	// 	gameData.turn.penaltyCards = 2;
	// 	showGameStatus('penalty');
	// 	animateFocus($.players["call"+gameData.player]);
	// }
}

/*!
 * 
 * NEXT PLAYER - This is the function that runs to next player
 * 
 */
function nextPlayerTurn(next){
	if(next){
		//if(gameData.turn.lastCardType != 'devildeal'){
			gameData.player = findNextPlayer(gameData.player);
		//}
		gameData.turn.lastCardType = '';
	}

	if(gameData.turn.frozenColor && gameData.player == gameData.turn.frozenReset){
		itemFrozen.alpha = 0;
		gameData.turn.frozenColor = false;
	}

	if(!$.players[gameData.player].active){
		nextPlayerTurn(true);
		return;
	}else if(gameData.turn.skip){
		gameData.turn.skip = false;
		nextPlayerTurn(true);
		return;
	}else if(gameData.turn.reverseTurn){
		gameData.turn.reverseCount--;
		if(gameData.players == 2){

		}
		gameData.turn.reverse = gameData.turn.reverse == true ? false : true;
		gameData.turn.reverseTurn = false;
		toggleArrowTurn();
		nextPlayerTurn(true);
		return;
	}else if(gameData.turn.reverseCount > 0){
		gameData.turn.reverseCount--;
		nextPlayerTurn(true);
		return;
	}

	displayPlayerTurn();
}

function findNextPlayer(nextPlayer){
	if(!gameData.turn.reverse){
		nextPlayer++;
		nextPlayer = nextPlayer > gameData.players-1 ? 0 : nextPlayer;
	}else{
		nextPlayer--;
		nextPlayer = nextPlayer < 0 ? gameData.players-1 : nextPlayer;
	}
	return nextPlayer;
}

function togglePlayerSkip(con, next){
	var skipPlayer = gameData.player;
	if(con){
		if(gameData.match.count != 0 && next){
			skipPlayer = findNextPlayer(gameData.player);
		}
	}else{
		skipPlayer = -1;
	}

	for(var n=0; n<gameData.players; n++){
		$.players["skip" + n].visible = false;
		$.players["call"+n].alpha = 1;
		$.players["called"+n].alpha = 1;

		if(skipPlayer == n){
			$.players["skip" + n].visible = true;
			$.players["call"+n].alpha = 0;
			$.players["called"+n].alpha = 0;
		}
	}
}

function toggleArrowTurn(){
	for(var n=0; n<gameData.players; n++){
		$.players["arrow" + n].itemArrowL.visible = false;
		$.players["arrow" + n].itemArrowR.visible = false;
		if(!gameData.turn.reverse){
			$.players["arrow" + n].itemArrowL.rotation = -90;
			$.players["arrow" + n].itemArrowL.visible = true;
			TweenMax.to($.players["arrow" + n].itemArrowL, .5, {rotation:0, overwrite:true});
			playSound('soundDirection');
		}else{
			$.players["arrow" + n].itemArrowR.rotation = 180;
			$.players["arrow" + n].itemArrowR.visible = true;
			TweenMax.to($.players["arrow" + n].itemArrowR, .5, {rotation:90, overwrite:true});
			playSound('soundDirectionReverse');
		}
	}
}

/*!
 * 
 * UPDATE GAME - This is the function that runs to loop game update
 * 
 */
function updateGame(){
	if(!gameData.paused){
		for(var n=0; n<gameData.cards.length; n++){
			var thisCard = gameData.cards[n];
			thisCard.highlight.x = thisCard.x;
			thisCard.highlight.y = thisCard.y;
			thisCard.highlight.rotation = thisCard.rotation;
			thisCard.eliminated.x = thisCard.x;
			thisCard.eliminated.y = thisCard.y;
			thisCard.eliminated.rotation = thisCard.rotation;

			thisCard.shadow.x = thisCard.x + gameSettings.cardShadowX;
			thisCard.shadow.y = thisCard.y + gameSettings.cardShadowY;
			thisCard.shadow.rotation = thisCard.rotation;
			thisCard.shadow.visible = thisCard.visible;
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
	statusIconContainer.removeAllChildren();
	statusTxt.font = "25px bpreplaybold";
	itemStatus.visible = true;
	itemStatusLong.visible = false;

	if(con == 'penalty'){
		soundName = "soundWarning";
		delayStart = .5;
		statusTxt.text = textDisplay.playerPenalty;
		TweenMax.to(cardsContainer, 2, {overwrite:true, onComplete:function(){
			loopCardAction();
		}});
	}else if(con == 'emptycards'){
		soundName = "soundWinner";
		delayStart = 1;
		statusTxt.text = textDisplay.emptyCards;
		statusPlayerTxt.text = statusPlayerTxt.text + textDisplay.playerWon;
		TweenMax.to(cardsContainer, 3, {overwrite:true, onComplete:function(){
			toggleRoundScore(true, true);
		}});
	}else if(con == 'nomoreplayers'){
		soundName = "soundWinner";
		delayStart = 1;
		statusTxt.text = textDisplay.noMorePlayers;
		statusPlayerTxt.text = statusPlayerTxt.text + textDisplay.playerWon;
		TweenMax.to(cardsContainer, 3, {overwrite:true, onComplete:function(){
			toggleRoundScore(true, true);
		}});
	}else{
		soundName = "soundAction";
		delayStart = .5;
		delayMessage = 1;
		statusTxt.text = findCardText(con);
		statusPlayerTxt.text = '';

		for(var n=0; n<$.players[gameData.player].cards.length; n++){
			highlightCard($.cards[$.players[gameData.player].cards[n]], false);
		}
		highlightCard($.cards[gameData.draw[0]], false);
		TweenMax.to(cardsContainer, 2.5, {overwrite:true, onComplete:function(){
			checkRoundEnd();
		}});
	}

	if(statusTxt.getMeasuredWidth() > 260){
		itemStatus.visible = false;
		itemStatusLong.visible = true;
	}

	for(var n=25; n>=0; n--){
		statusTxt.font = n+"px bpreplaybold";
		if(statusTxt.getMeasuredWidth() < 360){
			n = -1;
		}
	}

	statusContainer.alpha = 0;
	TweenMax.to(statusContainer, .5, {delay:delayStart, alpha:1, overwrite:true, onStart:function(){
		playSound(soundName);
	},onComplete:function(){
		TweenMax.to(statusContainer, .5, {delay:delayMessage, alpha:0, overwrite:true});
	}});
}

function findCardText(con){
	var cardText;
	var cardIconName;
	guideTxt.font = "20px bpreplaybold";

	for(var n=0; n<cards_arr.actions.length; n++){
		if(con == cards_arr.actions[n].type){
			cardText = cards_arr.actions[n].text;
			cardIconName = 'cardActions'+n;
		}
	}

	for(var n=0; n<cards_arr.wilds.length; n++){
		if(con == cards_arr.wilds[n].type){
			cardText = cards_arr.wilds[n].text;
			cardIconName = 'cardWilds'+n;
		}
	}

	for(var n=0; n<cards_arr.specials.length; n++){
		if(con == cards_arr.specials[n].type){
			cardText = cards_arr.specials[n].text;
			cardIconName = 'cardSpecials'+n;
		}
	}

	for(var n=0; n<cards_arr.otherActions.length; n++){
		if(con == cards_arr.otherActions[n].type){
			cardText = cards_arr.otherActions[n].text;
			cardIconName = 'cardOtherActions'+n;
		}
	}

	for(var n=20; n>=0; n--){
		guideTxt.font = n+"px bpreplaybold";
		if(guideTxt.getMeasuredWidth() < 250){
			n = -1;
		}
	}

	var cardIcon = new createjs.Bitmap(loader.getResult(cardIconName));
	centerReg(cardIcon);
	cardIcon.regY = cardIcon.image.naturalHeight;
	statusIconContainer.addChild(cardIcon);

	return cardText;
}

function showGameGuide(con){
	var isPlayer = checkIsPlayer(gameData.player);	
	if(con == 'targetplayer'){
		guideTxt.text = isPlayer == true ? textDisplay.playerTarget : textDisplay.playerTargeting;
	}else if(con == 'selectcards'){
		guideTxt.text = isPlayer == true ? textDisplay.selectCards : textDisplay.selectingCards;
	}
	
	var alphaNum = con == undefined ? 0 : 1;
	TweenMax.to(guideContainer, .5, {alpha:alphaNum, overwrite:true});
}

/*!
 * 
 * TOGGLE ROUND SCORE - This is the function that runs to toggle round score
 * 
 */
function toggleRoundScore(con, win){
	cardScoreListContainer.removeAllChildren();
	cardScoreContainer.visible = con;

	if(con){
		//calculate
		playSound("soundPoint");
		var finalScore = 0;
		var scoreListArr = [];
		var roundEnd = false;

		for(var n=0; n<gameData.players; n++){
			var totalPoints = 0;
			for(var p=0; p<$.players[n].cards.length; p++){
				var thisCard = $.cards[$.players[n].cards[p]];
				thisCard.eliminated.visible = false;

				var notPlayer = false;
				if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
					if(n != socketData.gameIndex){
						notPlayer = true;
					}
				}else{
					if(n != 0){
						notPlayer = true;
					}
				}
				
				if(notPlayer){
					flipCard(thisCard);
				}
				totalPoints += thisCard.cardPoint;
			}

			if(win){
				finalScore += totalPoints;
			}else{
				scoreListArr.push({total:totalPoints, player:n});
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
		goalPointTitle.font = "23px bpreplaybold";
		goalPointTitle.color = '#fff';
		goalPointTitle.textAlign = "center";
		goalPointTitle.textBaseline='alphabetic';
		goalPointTitle.text = textDisplay.goalPointTitle.replace("[NUMBER]", gameSettings.points[gameData.pointIndex]);
		goalPointTitle.y = pos.y;

		var titleDivide = new createjs.Bitmap(loader.getResult('itemScoreDivide'));
		centerReg(titleDivide);
		titleDivide.y = pos.y + 15;

		pos.y += pos.titleSpace;
		cardScoreListContainer.addChild(goalPointTitle, titleDivide);

		var targetScoreTxt = null;
		var targetScore = 0;
		for(var n=0; n<gameData.players; n++){
			var playerName = new createjs.Text();
			playerName.font = "23px bpreplaybold";
			playerName.color = '#fff';
			playerName.textAlign = "left";
			playerName.textBaseline='alphabetic';
			playerName.text = $.players["stats" + n].playerName.text;

			var playerScore = new createjs.Text();
			playerScore.font = "23px bpreplaybold";
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

				if(playerData.scores[n] >= gameData.fourcolors.point){
					if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
						if($.players[gameData.player].playerIndex == socketData.gameIndex){
							roundStatusTxt.text = textDisplay.userWin;
						}else{
							roundStatusTxt.text = textDisplay.playerWin.replace("[NAME]", $.players["stats" + n].playerName.text);
						}
					}else{
						if($.players[gameData.player].playerIndex == 0){
							roundStatusTxt.text = textDisplay.userWin;
						}else{
							roundStatusTxt.text = textDisplay.playerWin.replace("[NAME]", $.players["stats" + n].playerName.text);
						}
					}
					roundEnd = true;
				}

				playerName.color = playerScore.color = '#FF7F0B';
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
			cardScoreListContainer.addChild(playerName, playerScore, playerDivide);
			$.players["stats" + n].playerScore.text = textDisplay.playerScore.replace("[NUMBER]", playerData.scores[n]);
		}

		if(targetScoreTxt != null){
			TweenMax.to(tweenData, .5, {delay:1, tweenScore:targetScore, overwrite:true, onUpdate:function(){
				targetScoreTxt.text = textDisplay.playerScore.replace("[NUMBER]", Math.round(tweenData.tweenScore));
			}});
		}
		sendEvent("showInterstitialInGame","endRound");
		cardScoreContainer.alpha = 0;
		TweenMax.to(cardScoreContainer, .5, {alpha:1, overwrite:true, onComplete:function(){
			TweenMax.to(cardScoreContainer, 4, {overwrite:true, onComplete:function(){

				if(roundEnd){
					endGame();
				}else{
					TweenMax.to(cardScoreContainer, .5, {alpha:0, overwrite:true, onComplete:function(){
						playSound("soundCardShuffle");
						for(var n=0; n<gameData.cards.length; n++){
							var thisCard = gameData.cards[n];
							thisCard.eliminated.visible = false;
							if(thisCard.contentContainer.visible){
								flipCardCover(thisCard);
							}
							TweenMax.to(thisCard, gameSettings.cardDealSpeed, {x:0, y:0, rotation:0, scaleX:1, scaleY:1, overwrite:true});
						}

						itemColors.alpha = 0;
						for(var n=0; n<gameData.players; n++){
							$.players[n].active = true;
							$.players["stats" + n].visible = false;
							$.players["call" + n].visible = false;
							$.players["called" + n].visible = false;
							$.players["arrow" + n].visible = false;
							$.players["eliminated"+n].visible = false;
						}
						
						TweenMax.to(cardScoreContainer, .5, {alpha:0, overwrite:true, onComplete:function(){
							if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
								postSocketUpdate('resultcomplete', socketData.gameIndex);
							}else{
								startCards();
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

function sendEvent(typeVar,valueVar){
    try {
        var messageBody = {type: typeVar, value: valueVar}
        window.webkit.messageHandlers.ports.postMessage(messageBody);
    } catch (err) {
        console.log(err);
    }
}

