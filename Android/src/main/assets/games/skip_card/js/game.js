////////////////////////////////////////////////////////////
// GAME v1.5
////////////////////////////////////////////////////////////

/*!
 * 
 * GAME SETTING CUSTOMIZATION START
 * 
 */

//themes
const themes_arr = [
	{
		front:"assets/themes1/theme_front.png",
		highlight:"assets/themes1/theme_highlight.png",
		numbers:[
			'assets/themes1/theme_1.png',
			'assets/themes1/theme_2.png',
			'assets/themes1/theme_3.png',
			'assets/themes1/theme_4.png',
			'assets/themes1/theme_5.png',
			'assets/themes1/theme_6.png',
			'assets/themes1/theme_7.png',
			'assets/themes1/theme_8.png',
			'assets/themes1/theme_9.png',
			'assets/themes1/theme_10.png',
			'assets/themes1/theme_11.png',
			'assets/themes1/theme_12.png',
		],
		skip:"assets/themes1/theme_skip.png",
		skipnumbers:[
			'assets/themes1/theme_skip_1.png',
			'assets/themes1/theme_skip_2.png',
			'assets/themes1/theme_skip_3.png',
			'assets/themes1/theme_skip_4.png',
			'assets/themes1/theme_skip_5.png',
			'assets/themes1/theme_skip_6.png',
			'assets/themes1/theme_skip_7.png',
			'assets/themes1/theme_skip_8.png',
			'assets/themes1/theme_skip_9.png',
			'assets/themes1/theme_skip_10.png',
			'assets/themes1/theme_skip_11.png',
			'assets/themes1/theme_skip_12.png',
		],
	},
	{
		front:"assets/themes2/theme_front.png",
		highlight:"assets/themes2/theme_highlight.png",
		numbers:[
			'assets/themes2/theme_1.png',
			'assets/themes2/theme_2.png',
			'assets/themes2/theme_3.png',
			'assets/themes2/theme_4.png',
			'assets/themes2/theme_5.png',
			'assets/themes2/theme_6.png',
			'assets/themes2/theme_7.png',
			'assets/themes2/theme_8.png',
			'assets/themes2/theme_9.png',
			'assets/themes2/theme_10.png',
			'assets/themes2/theme_11.png',
			'assets/themes2/theme_12.png',
		],
		skip:"assets/themes2/theme_skip.png",
		skipnumbers:[
			'assets/themes2/theme_skip_1.png',
			'assets/themes2/theme_skip_2.png',
			'assets/themes2/theme_skip_3.png',
			'assets/themes2/theme_skip_4.png',
			'assets/themes2/theme_skip_5.png',
			'assets/themes2/theme_skip_6.png',
			'assets/themes2/theme_skip_7.png',
			'assets/themes2/theme_skip_8.png',
			'assets/themes2/theme_skip_9.png',
			'assets/themes2/theme_skip_10.png',
			'assets/themes2/theme_skip_11.png',
			'assets/themes2/theme_skip_12.png',
		],
	},
	{
		front:"assets/themes3/theme_front.png",
		highlight:"assets/themes3/theme_highlight.png",
		numbers:[
			'assets/themes3/theme_1.png',
			'assets/themes3/theme_2.png',
			'assets/themes3/theme_3.png',
			'assets/themes3/theme_4.png',
			'assets/themes3/theme_5.png',
			'assets/themes3/theme_6.png',
			'assets/themes3/theme_7.png',
			'assets/themes3/theme_8.png',
			'assets/themes3/theme_9.png',
			'assets/themes3/theme_10.png',
			'assets/themes3/theme_11.png',
			'assets/themes3/theme_12.png',
		],
		skip:"assets/themes3/theme_skip.png",
		skipnumbers:[
			'assets/themes3/theme_skip_1.png',
			'assets/themes3/theme_skip_2.png',
			'assets/themes3/theme_skip_3.png',
			'assets/themes3/theme_skip_4.png',
			'assets/themes3/theme_skip_5.png',
			'assets/themes3/theme_skip_6.png',
			'assets/themes3/theme_skip_7.png',
			'assets/themes3/theme_skip_8.png',
			'assets/themes3/theme_skip_9.png',
			'assets/themes3/theme_skip_10.png',
			'assets/themes3/theme_skip_11.png',
			'assets/themes3/theme_skip_12.png',
		],
	},
];

//game settings
const gameSettings = {
	cardW:70,
	cardH:105,
	cardDealSpeed:.4,
	cardFlipSpeed:.2,
	aiThinkSpeed:.5,
	stockPiles:[10,20,30],
	scoreWin:50, //score points to win round
	scoreOpponentStockPiles:5, //score points for each card remaining in oppoentn stock piles
	points:[25,100,250,500], //score points option to end game
};

//game text display
const textStrings = {
	optionsTitle:'OPTIONS',
	tutorialTitle:'HOW TO PLAY?',
	totalPlayers:"[NUMBER] PLAYERS",
	stockPile:"[NUMBER] STOCK PILE",
	goalPoint:"GOAL [NUMBER]PTS",
	playerName:'PLAYER [NUMBER]',
	playerScore:'[NUMBER]PTS',
	finishedStockPile:'FINISHED STOCK PILE',
	drawPileRanOut:'DRAW PILE RAN OUT',
	reshufflingCards:'RESHUFFLING CARDS',
	playerWon:' WIN',
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
const shareSettings = {
	enable:false,
	options:['facebook','twitter','whatsapp','telegram','reddit','linkedin'],
	shareTitle:'Highscore on Skip Card is [SCORE]PTS',
	shareText:'[SCORE]PTS is mine new highscore on Skip Card game! Try it now!',
	customScore:true, //share a custom score to Facebook, it use customize share.php (Facebook and PHP only)
	gtag:false //Google Tag
}

/*!
 *
 * GAME SETTING CUSTOMIZATION END
 *
 */
$.editor = {enable:false};
const playerData = {score:0, scores:[]};
const gameData = {paused:true, player:0, players:0, pointIndex:0, themeIndex:0, play:false, ai:true, drag:{status:false,x:0,y:0}, complete:false, names:[], lastPiles:[], lastPlayer:-1};
const tweenData = {score:0, tweenScore:0};

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

	if(audioOn){
		if(muteSoundOn){
			toggleSoundMute(true);
		}
		if(muteMusicOn){
			toggleMusicMute(true);
		}
	}

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

	buttonStockPile.cursor = "pointer";
	buttonStockPile.addEventListener("click", function(evt) {
		playSound('soundButton');
		toggleStockPile(false);
	});

	buttonTypeR.cursor = "pointer";
	buttonTypeR.addEventListener("click", function(evt) {
		playSound('soundButton');
		toggleStockPile(true);
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

	if(shareSettings.enable){
		buttonShare.cursor = "pointer";
		buttonShare.addEventListener("click", function(evt) {
			playSound('soundButton');
			toggleSocialShare(true);
		});

		for(let n=0; n<shareSettings.options.length; n++){
			$.share['button'+n].cursor = "pointer";
			$.share['button'+n].addEventListener("click", function(evt) {
				shareLinks(evt.target.shareOption, addCommas(playerData.score));
			});
		}
	}
	
	buttonContinue.cursor = "pointer";
	buttonContinue.addEventListener("click", function(evt) {
		playSound('soundButton');
		if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online && multiplayerSettings.rejoinRoom && multiplayerSettings.roomLists) {
			goPage('room');
			$('#roomlists').val(socketData.lastRoom);
			joinSocketRoom();
		}else{
			goPage('main');
		}
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
		toggleOptions();
	});
	
	buttonSettings.cursor = "pointer";
	buttonSettings.addEventListener("click", function(evt) {
		toggleOptions();
	});
	
	buttonConfirm.cursor = "pointer";
	buttonConfirm.addEventListener("click", function(evt) {
		playSound('soundButton');
		togglePop(false);
		
		stopSound();;
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

	gameData.skipcard = {
		maxPlayers:6,
		minPlayers:2,
		stockPile:0,
		point:20,
	};
	
	gameData.players = gameData.skipcard.minPlayers;
	gameData.pointIndex = 0;
	gameData.stockPileIndex = 0;
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
		gameData.players = gameData.players > gameData.skipcard.maxPlayers ? gameData.skipcard.maxPlayers : gameData.players;
	}else{
		gameData.players--;
		gameData.players = gameData.players < gameData.skipcard.minPlayers ? gameData.skipcard.minPlayers : gameData.players;
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

function toggleStockPile(con){
	if(con){
		gameData.stockPileIndex++;
		gameData.stockPileIndex = gameData.stockPileIndex > gameSettings.stockPiles.length-1 ? gameSettings.stockPiles.length-1 : gameData.stockPileIndex;
	}else{
		gameData.stockPileIndex--;
		gameData.stockPileIndex = gameData.stockPileIndex < 0 ? 0 : gameData.stockPileIndex;
	}

	updateCardsOption();
}

function toggleTheme(con){
	if(con){
		gameData.themeIndex++;
		gameData.themeIndex = gameData.themeIndex > themes_arr.length-1 ? 0 : gameData.themeIndex;
	}else{
		gameData.themeIndex--;
		gameData.themeIndex = gameData.themeIndex < 0 ? themes_arr.length-1 : gameData.themeIndex;
	}

	updateCardsOption();
}

function updateCardsOption(){
	displayCardsOptions();
	if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
		if(socketData.host){
			postSocketUpdate('updateoptions', {pointIndex:gameData.pointIndex, stockPileIndex:gameData.stockPileIndex, themeIndex:gameData.themeIndex, option:gameData.lastOption}, true);
		}
	}
}

function displayCardsOptions(){
	totalPlayersTxt.text = textStrings.totalPlayers.replace("[NUMBER]", gameData.players);
	pointsTxt.text = textStrings.goalPoint.replace("[NUMBER]", gameSettings.points[gameData.pointIndex]);
	stockPileTxt.text = textStrings.stockPile.replace("[NUMBER]", gameSettings.stockPiles[gameData.stockPileIndex]);

	gameData.skipcard.point = gameSettings.points[gameData.pointIndex];
	gameData.skipcard.stockPile = gameSettings.stockPiles[gameData.stockPileIndex];
	if((gameData.skipcard.stockPile * gameData.players) > 120){
		gameData.stockPileIndex--;
		displayCardsOptions();
	}

	if(gameData.players == 6 && gameData.stockPileIndex > 0){
		gameData.stockPileIndex = 0;
		displayCardsOptions();
	}

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

	itemStockPile.visible = false;
	stockPileTxt.visible = false;
	buttonStockPile.visible = false;
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

		itemStockPile.visible = true;
		stockPileTxt.visible = true;
		buttonStockPile.visible = true;
		buttonTypeR.visible = true;

		buttonNext.visible = true;
		buttonTutorial.visible = true;

		if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
			buttonPlayersL.visible = false;
			buttonPlayersR.visible = false;

			if(!socketData.host){
				buttonPointsL.visible = false;
				buttonPointsR.visible = false;
				buttonStockPile.visible = false;
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
		gameData.tutorial = gameData.tutorial > 9 ? 9 : gameData.tutorial;
	}else{
		gameData.tutorial--;
		gameData.tutorial = gameData.tutorial < 1 ? 1 : gameData.tutorial;
	}

	displayTutorial();
}

function displayTutorial(){
	for(var n=0; n<9; n++){
		$.tutorial[n].visible = false;
	}
	$.tutorial[gameData.tutorial-1].visible = true;
	tutorialPageTxt.text = gameData.tutorial+'/9';
	
	buttonTutorialL.visible = true;
	buttonTutorialR.visible = true;
	if(gameData.tutorial == 1){
		buttonTutorialL.visible = false;
	}
	if(gameData.tutorial == 9){
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
 * TOGGLE SOCIAL SHARE - This is the function that runs to toggle social share
 * 
 */
function toggleSocialShare(con){
	if(!shareSettings.enable){return;}
	buttonShare.visible = con == true ? false : true;
	shareSaveContainer.visible = con == true ? false : true;
	socialContainer.visible = con;

	if(con){
		if (typeof buttonSave !== 'undefined') {
			TweenMax.to(buttonShare, 3, {overwrite:true, onComplete:toggleSocialShare, onCompleteParams:[false]});
		}
	}
}

function positionShareButtons(){
	if(!shareSettings.enable){return;}
	if (typeof buttonShare !== 'undefined') {
		if (typeof buttonSave !== 'undefined') {
			if(buttonSave.visible){
				buttonShare.x = -((buttonShare.image.naturalWidth/2) + 5);
				buttonSave.x = ((buttonShare.image.naturalWidth/2) + 5);
			}else{
				buttonShare.x = 0;
			}
		}
	}
}

/*!
 * 
 * TOGGLE POP - This is the function that runs to toggle popup overlay
 * 
 */
function togglePop(con){
	exitContainer.visible = con;
	if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
		if(curPage == 'name' || curPage == 'room'){
			if(con){
				$('#roomWrapper').hide();
			}else{
				$('#roomWrapper').show();
			}
		}
	}
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
	togglePop(false);
	toggleOptions(false);
	
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
			targetContainer = cardsOptionsContainer;
			toggleCardsOptions(1);
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
			toggleSocialShare(false);
			
			playMusicLoop("musicMain");
			stopMusicLoop("musicGame");
			playSound('soundResult');
			tweenData.tweenScore = 0;

			if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
				playerData.score = playerData.scores[socketData.gameIndex];
				
				if(socketData.host){
					postSocketCloseRoom();
				}else{
					exitSocketRoom();
				}
			}else{
				playerData.score = playerData.scores[0];
			}
			
			tweenData.tweenScore = 0;
			TweenMax.to(tweenData, .5, {tweenScore:playerData.score, overwrite:true, onUpdate:function(){
				resultDescTxt.text = textStrings.resultDesc.replace('[NUMBER]', addCommas(Math.floor(tweenData.tweenScore)));
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
	gameData.paused = setGameLaunch();
	playerData.scores = [];

	gameData.lastPlayer = -1;
	gameData.lastPiles = [];
	for(var n=0; n<gameData.players; n++){
		playerData.scores.push(0);
	}

	startCards();
}

function startCards(){
	toggleRoundScore(false);
	prepareCards();
	statusContainer.alpha = 0;

	cardsDiscardHighlightContainer.removeAllChildren();
	for(var d=0; d<4; d++){
		$.cards['discard'+d].cardValue = 0;
		$.cards['discardH'+d] = new createjs.Bitmap(loader.getResult('cardHighlight'+gameData.themeIndex));
		centerReg($.cards['discardH'+d]);
		$.cards['discardH'+d].visible = false;
		cardsDiscardHighlightContainer.addChild($.cards['discardH'+d]);
	}
	
	if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
		gameData.ai = false;
		postSocketUpdate('ready', socketData.gameIndex);
	}else{
		gameData.ai = true;
		preparePlayers();
		hideDiscardHighlight();
	}
}

/*!
 * 
 * STOP GAME - This is the function that runs to stop play game
 * 
 */
function stopGame(){
	stopMusicLoop("musicGame");
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
		if(!gameData.prepared){
			return;
		}

		cardScoreContainer.x = statusContainer.x = canvasW/2;
		cardScoreContainer.y = statusContainer.y = canvasH/2;

		cardsContainer.x = canvasW/100 * 37;
		cardsContainer.y = canvasH/100 * 52;
		if(!viewport.isLandscape){
			cardsContainer.x = canvasW/100 * 28;
		}

		$.cards['discard'+0].x = $.cards['discardH'+0].x = 90;
		$.cards['discard'+1].x = $.cards['discardH'+1].x = $.cards['discard'+0].x + 80;
		$.cards['discard'+2].x = $.cards['discardH'+2].x = $.cards['discard'+1].x + 80;
		$.cards['discard'+3].x = $.cards['discardH'+3].x = $.cards['discard'+2].x + 80;
		
		var positionArr = [];
		var positionLayout = [];

		if(gameData.players == 2){
			positionArr = [0,1];
			positionLayout = [
				{
					x:canvasW/2,
					y:canvasH/100 * 77,
					dir:"bottom",
					scale:1,
				},
				{
					x:canvasW/2,
					y:canvasH/100 * 27,
					dir:"top",
					scale:1,
				}
			];
		}else if(gameData.players == 3){
			positionArr = [0,1,2];
			positionLayout = [
				{
					x:canvasW/2,
					y:canvasH/100 * 77,
					dir:"bottom",
					scale:1,
				},
				{
					x:canvasW/2 - 130,
					y:canvasH/100 * 27,
					dir:"top",
					scale:.55,
				},
				{
					x:canvasW/2 + 130,
					y:canvasH/100 * 27,
					dir:"top",
					scale:.55,
				}
			];
		}else if(gameData.players == 4){
			positionArr = [0,1,2,3];
			positionLayout = [
				{
					x:canvasW/2,
					y:canvasH/100 * 77,
					dir:"bottom",
					scale:1,
				},
				{
					x:canvasW/2 - 260,
					y:canvasH/100 * 27,
					dir:"top",
					scale:.55,
				},
				{
					x:canvasW/2,
					y:canvasH/100 * 27,
					dir:"top",
					scale:.55,
				},
				{
					x:canvasW/2 + 260,
					y:canvasH/100 * 27,
					dir:"top",
					scale:.55,
				}
			];
			if(!viewport.isLandscape){
				cardsContainer.y = canvasH/100 * 60;

				positionLayout[0].y = canvasH/100 * 82;
				positionLayout[1].x = canvasW/2 - 130;
				positionLayout[1].y = canvasH/100 * 20;
				positionLayout[2].x = canvasW/2 + 130;
				positionLayout[2].y = canvasH/100 * 20;
				positionLayout[3].x = canvasW/2;
				positionLayout[3].y = canvasH/100 * 40;
			}
		}else if(gameData.players == 5){
			positionArr = [0,1,2,3,4];
			positionLayout = [
				{
					x:canvasW/2,
					y:canvasH/100 * 77,
					dir:"bottom",
					scale:1,
				},
				{
					x:canvasW/2 - 260,
					y:canvasH/100 * 27,
					dir:"top",
					scale:.55,
				},
				{
					x:canvasW/2,
					y:canvasH/100 * 27,
					dir:"top",
					scale:.55,
				},
				{
					x:canvasW/2 + 260,
					y:canvasH/100 * 27,
					dir:"top",
					scale:.55,
				},
				{
					x:canvasW/2 + 390,
					y:canvasH/100 * 54,
					dir:"top",
					scale:.55,
				}
			];
			if(!viewport.isLandscape){
				cardsContainer.y = canvasH/100 * 60;

				positionLayout[0].y = canvasH/100 * 82;
				positionLayout[1].x = canvasW/2 - 130;
				positionLayout[1].y = canvasH/100 * 20;
				positionLayout[2].x = canvasW/2 + 130;
				positionLayout[2].y = canvasH/100 * 20;
				positionLayout[3].x = canvasW/2 - 130;
				positionLayout[3].y = canvasH/100 * 40;
				positionLayout[4].x = canvasW/2 + 130;
				positionLayout[4].y = canvasH/100 * 40;
			}
		}else if(gameData.players == 6){
			positionArr = [0,1,2,3,4,5];
			positionLayout = [
				{
					x:canvasW/2,
					y:canvasH/100 * 77,
					dir:"bottom",
					scale:1,
				},
				{
					x:canvasW/2 - 390,
					y:canvasH/100 * 54,
					dir:"top",
					scale:.55,
				},
				{
					x:canvasW/2 - 260,
					y:canvasH/100 * 27,
					dir:"top",
					scale:.55,
				},
				{
					x:canvasW/2,
					y:canvasH/100 * 27,
					dir:"top",
					scale:.55,
				},
				{
					x:canvasW/2 + 260,
					y:canvasH/100 * 27,
					dir:"top",
					scale:.55,
				},
				{
					x:canvasW/2 + 390,
					y:canvasH/100 * 54,
					dir:"top",
					scale:.55,
				}
			];
			if(!viewport.isLandscape){
				cardsContainer.y = canvasH/100 * 71;

				positionLayout[0].y = canvasH/100 * 86;

				positionLayout[1].x = canvasW/2 - 130;
				positionLayout[1].y = canvasH/100 * 17;
				positionLayout[2].x = canvasW/2 + 130;
				positionLayout[2].y = canvasH/100 * 17;
				positionLayout[3].x = canvasW/2 - 130;
				positionLayout[3].y = canvasH/100 * 36;
				positionLayout[4].x = canvasW/2 + 130;
				positionLayout[4].y = canvasH/100 * 36;
				positionLayout[5].x = canvasW/2;
				positionLayout[5].y = canvasH/100 * 55;
			}
		}
		
		for(var n=0; n<gameData.players; n++){
			var seqIndex =  gameData.seq[n];
			$.players[seqIndex].x = positionLayout[positionArr[n]].x;
			$.players[seqIndex].y = positionLayout[positionArr[n]].y;
			$.players[seqIndex].dir = positionLayout[positionArr[n]].dir;
			$.players[seqIndex].scaleNum = positionLayout[positionArr[n]].scale;

			if($.players[seqIndex].wideLayout){
				if(viewport.isLandscape){
					$.players[seqIndex].bgPlayer.visible = true;
					$.players[seqIndex].bgPlayerP.visible = false;

					$.players["piles" + seqIndex].scaleX = $.players["piles" + seqIndex].scaleY = positionLayout[positionArr[n]].scale;
					$.players["piles" + seqIndex].x = -290;
					$.players["piles" + seqIndex].y = 10;
					$.players["cards" + seqIndex].scaleX = $.players["cards" + seqIndex].scaleY = positionLayout[positionArr[n]].scale;
					$.players["cards" + seqIndex].x = -120;
					$.players["cards" + seqIndex].y = 10;

					var startX = 55;
					for(var d=0; d<4; d++){
						$.players["discard" + seqIndex+'_'+d].scaleX = $.players["discard" + seqIndex+'_'+d].scaleY = positionLayout[positionArr[n]].scale;
						$.players["discard" + seqIndex+'_'+d].y = 10;
						$.players["discard" + seqIndex+'_'+d].x = startX;
						$.players["discardH" + seqIndex+'_'+d].scaleX = $.players["discardH" + seqIndex+'_'+d].scaleY = positionLayout[positionArr[n]].scale;
						$.players["discardH" + seqIndex+'_'+d].y = 10;
						$.players["discardH" + seqIndex+'_'+d].x = startX;
						startX += gameSettings.cardW + 10;
					}
				}else{
					$.players[seqIndex].bgPlayer.visible = false;
					$.players[seqIndex].bgPlayerP.visible = true;

					$.players["piles" + seqIndex].scaleX = $.players["piles" + seqIndex].scaleY = positionLayout[positionArr[n]].scale;
					$.players["piles" + seqIndex].x = -240;
					$.players["piles" + seqIndex].y = 10;
					$.players["cards" + seqIndex].scaleX = $.players["cards" + seqIndex].scaleY = positionLayout[positionArr[n]].scale;
					$.players["cards" + seqIndex].x = -115;
					$.players["cards" + seqIndex].y = 10;

					var startX = 15;
					for(var d=0; d<4; d++){
						$.players["discard" + seqIndex+'_'+d].scaleX = $.players["discard" + seqIndex+'_'+d].scaleY = positionLayout[positionArr[n]].scale;
						$.players["discard" + seqIndex+'_'+d].y = 10;
						$.players["discard" + seqIndex+'_'+d].x = startX;
						$.players["discardH" + seqIndex+'_'+d].scaleX = $.players["discardH" + seqIndex+'_'+d].scaleY = positionLayout[positionArr[n]].scale;
						$.players["discardH" + seqIndex+'_'+d].y = 10;
						$.players["discardH" + seqIndex+'_'+d].x = startX;
						startX += gameSettings.cardW + 5;
					}
				}
			}else{
				$.players[seqIndex].bgPlayer.visible = true;
				$.players[seqIndex].bgPlayerP.visible = false;

				$.players["piles" + seqIndex].scaleX = $.players["piles" + seqIndex].scaleY = positionLayout[positionArr[n]].scale;
				$.players["piles" + seqIndex].x = -90;
				$.players["piles" + seqIndex].y = 50;
				$.players["cards" + seqIndex].scaleX = $.players["cards" + seqIndex].scaleY = positionLayout[positionArr[n]].scale;
				$.players["cards" + seqIndex].x = 0;
				$.players["cards" + seqIndex].y = -25;

				var startX = -43;
				for(var d=0; d<4; d++){
					$.players["discard" + seqIndex+'_'+d].scaleX = $.players["discard" + seqIndex+'_'+d].scaleY = positionLayout[positionArr[n]].scale;
					$.players["discard" + seqIndex+'_'+d].y = 50;
					$.players["discard" + seqIndex+'_'+d].x = startX;
					startX += (gameSettings.cardW + 10) * positionLayout[positionArr[n]].scale;
				}
			}

			$.players["stats" + seqIndex].scaleX = $.players["stats" + seqIndex].scaleY = positionLayout[positionArr[n]].scale;
			$.players["stats" + seqIndex].x = $.players["piles" + seqIndex].x;
			$.players["stats" + seqIndex].y = $.players["piles" + seqIndex].y;

			positionPlayerCards(seqIndex, true);
			positionPlayerDiscards(seqIndex);
		}

		positionDiscards();
	}
}

/*!
 * 
 * BUILD CARDS - This is the function that runs to build cards
 * 
 */
function buildCards(){
	cardsPlayContainer.removeAllChildren();

	gameData.cards = [];
	gameData.cardNum = 0;

	/*for(var l=0; l<100; l++){
		var thisCard = createCard('cardSkip'+gameData.themeIndex);
		thisCard.cardType = 'skip';
		thisCard.cardValue = -1;
	}*/

	for(var n=0; n<themes_arr[gameData.themeIndex].numbers.length; n++){
		for(var l=0; l<12; l++){
			var thisNumber = n+1;
			var thisCard = createCard('cardNumber'+gameData.themeIndex+'_'+n);
			thisCard.cardType = 'number';
			thisCard.cardValue = thisNumber;
		}
	}

	for(var l=0; l<18; l++){
		var thisCard = createCard('cardSkip'+gameData.themeIndex);
		thisCard.cardType = 'skip';
		thisCard.cardValue = -1;
	}
}

/*!
 * 
 * PREPARE CARDS - This is the function that runs to prepare cards
 * 
 */
function prepareCards(){
	gameData.prepared = false;
	gameData.complete = false;

	gameData.player = gameData.lastPlayer != -1 ? gameData.lastPlayer : 0;
	gameData.lastPlayer = -1;
	
	gameData.seq = [];
	gameData.draw = [];
	gameData.discard = [[],[],[],[]];
	gameData.cardIndex = 0;
	gameData.shuffle = false;

	gameData.deal = {
		status:false,
		animation:'pile',
		stacks:false,
		cards:[],
		cardIndex:0,
	}

	gameData.play = false;
	gameData.drag.status = false;
	
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
	
	/*var cardArr = [];
	gameData.cards = [];
	for(var n=0; n<cardArr.length; n++){
		gameData.cards.push($.cards[cardArr[n]]);
	}*/

	shuffle(gameData.cards);
	var tempArr = [];
	for(var n=0; n<gameData.cards.length; n++){
		tempArr.push(gameData.cards[n].cardIndex);
	}
}

function createCard(name){
	$.cards['front'+gameData.cardNum] = new createjs.Container();
	$.cards['content'+gameData.cardNum] = new createjs.Container();
	$.cards['contentSkip'+gameData.cardNum] = new createjs.Container();
	$.cards[gameData.cardNum] = new createjs.Container();
	$.cards[gameData.cardNum].frontContainer = $.cards['front'+gameData.cardNum];
	$.cards[gameData.cardNum].contentContainer = $.cards['content'+gameData.cardNum];
	$.cards[gameData.cardNum].contentSkipContainer = $.cards['contentSkip'+gameData.cardNum];
	$.cards[gameData.cardNum].contentContainer.visible = false;
	$.cards[gameData.cardNum].contentSkipContainer.visible = false;

	var cardHighlight = new createjs.Bitmap(loader.getResult('cardHighlight'+gameData.themeIndex));
	centerReg(cardHighlight);
	cardHighlight.visible = false;
	$.cards[gameData.cardNum].highlight = cardHighlight;
	$.cards[gameData.cardNum].addChild($.cards[gameData.cardNum].frontContainer, $.cards[gameData.cardNum].contentContainer, $.cards[gameData.cardNum].contentSkipContainer, cardHighlight);
	$.cards[gameData.cardNum].cardIndex = gameData.cardNum;
	$.cards[gameData.cardNum].cardDeal = false;

	$.cards[gameData.cardNum].addEventListener("mousedown", function(evt) {
		toggleCardDragEvent(evt, 'drag')
	});
	$.cards[gameData.cardNum].addEventListener("pressmove", function(evt) {
		toggleCardDragEvent(evt, 'move')
	});
	$.cards[gameData.cardNum].addEventListener("pressup", function(evt) {
		toggleCardDragEvent(evt, 'drop')
	});

	var bgCover = new createjs.Bitmap(loader.getResult('cardCover'+gameData.themeIndex));
	centerReg(bgCover);
	$.cards[gameData.cardNum].frontContainer.addChild(bgCover);
	
	var bgContent = new createjs.Bitmap(loader.getResult(name));
	centerReg(bgContent);
	$.cards[gameData.cardNum].contentContainer.addChild(bgContent);

	var returnCard = $.cards[gameData.cardNum];
	cardsPlayContainer.addChild($.cards[gameData.cardNum]);
	gameData.cards.push($.cards[gameData.cardNum]);
	gameData.cardNum++;

	return returnCard;
}

function createSkipContent(card, value){
	card.contentSkipContainer.removeAllChildren();
	card.contentSkipContainer.visible = true;
	
	var bgContent = new createjs.Bitmap(loader.getResult('cardSkipNumber'+gameData.themeIndex+'_'+value));
	centerReg(bgContent);
	card.contentSkipContainer.addChild(bgContent);
}

/*!
 * 
 * CARD EVENTS - This is the function that runs to prepare card events
 * 
 */
function toggleCardDragEvent(obj, con){
	if(gameData.paused){
		return;
	}

	if(!gameData.play){
		return;
	}

	if(gameData.ai){
		if(gameData.player == 1){
			return;
		}
		gameData.aiMove = true;
	}
	
	var isPlayerCard = false;
	if($.players[gameData.player].piles.indexOf(obj.currentTarget.cardIndex) != -1){
		isPlayerCard = true;
	}else if($.players[gameData.player].cards.indexOf(obj.currentTarget.cardIndex) != -1){
		isPlayerCard = true;
	}else{
		for(var d=0; d<4; d++){
			var thisIndex = $.players[gameData.player].discard[d].indexOf(obj.currentTarget.cardIndex);
			if(thisIndex != -1 && thisIndex == $.players[gameData.player].discard[d].length-1){
				isPlayerCard = true;
			}
		}
	}

	if(!isPlayerCard){
		return;
	}
	
	switch(con){
		case 'drag':
			var global = cardsPlayContainer.localToGlobal(obj.currentTarget.x, obj.currentTarget.y);
			obj.currentTarget.offset = {x:(global.x-(obj.stageX))/dpr, y:(global.y-(obj.stageY))/dpr};
			playSound("soundCardDraw");
			setCardDepth(obj.currentTarget);
			highlightDiscardArea(obj.currentTarget.cardIndex, obj.currentTarget.cardType, obj.currentTarget.cardValue);
			gameData.drag.status = true;
		break;
		
		case 'move':
			if(gameData.drag.status){
				var local = cardsPlayContainer.globalToLocal(obj.stageX, obj.stageY);
				var moveX = ((local.x) + obj.currentTarget.offset.x);
				var moveY = ((local.y) + obj.currentTarget.offset.y);
				obj.currentTarget.x = moveX;
				obj.currentTarget.y = moveY;
			}
		break;
		
		case 'drop':
			var foundDropZone = false;
			var cardDetectRatio = 1.5;
			for(var d=0; d<4; d++){
				var isNear = false;
				var global = cardsDiscardContainer.localToGlobal( $.cards['discard'+d].x, $.cards['discard'+d].y);
				global.x = global.x/dpr;
				global.y = global.y/dpr;
				if(stage.mouseX > global.x - (gameSettings.cardW/2) && stage.mouseX < global.x + (gameSettings.cardW/2)){
					if(stage.mouseY > global.y - (gameSettings.cardH/2) && stage.mouseY < global.y + (gameSettings.cardH/2)){
						isNear = true;
					}
				}

				var global = cardsDiscardContainer.localToLocal( $.cards['discard'+d].x, $.cards['discard'+d].y, cardsPlayContainer);
				if(obj.currentTarget.x > global.x - (gameSettings.cardW/cardDetectRatio) && obj.currentTarget.x < global.x + (gameSettings.cardW/cardDetectRatio)){
					if(obj.currentTarget.y > global.y - (gameSettings.cardH/cardDetectRatio) && obj.currentTarget.y < global.y + (gameSettings.cardH/cardDetectRatio)){
						isNear = true;
					}
				}

				if(isNear){
					if($.cards['discard'+d].cardValue == obj.currentTarget.cardValue-1 || obj.currentTarget.cardType == 'skip'){
						foundDropZone = true;
						
						playPlayerCard(obj.currentTarget, d);
						if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
							postSocketUpdate('playplayercard', {index:obj.currentTarget.cardIndex, discard:d}, true);
						}

						d = 4;
					}
				}
			}

			for(var d=0; d<4; d++){
				var isNear = false;
				var global = $.players[gameData.player].localToGlobal( $.players["discardH" +gameData.player+'_'+d].x, $.players["discardH" +gameData.player+'_'+d].y);
				global.x = global.x/dpr;
				global.y = global.y/dpr;
				if(stage.mouseX > global.x - (gameSettings.cardW/2) && stage.mouseX < global.x + (gameSettings.cardW/2)){
					if(stage.mouseY > global.y - (gameSettings.cardH/2) && stage.mouseY < global.y + (gameSettings.cardH/2)){
						isNear = true;
					}
				}

				var global = $.players[gameData.player].localToLocal( $.players["discardH" +gameData.player+'_'+d].x, $.players["discardH" +gameData.player+'_'+d].y, cardsPlayContainer);
				if(obj.currentTarget.x > global.x - (gameSettings.cardW/cardDetectRatio) && obj.currentTarget.x < global.x + (gameSettings.cardW/cardDetectRatio)){
					if(obj.currentTarget.y > global.y - (gameSettings.cardH/cardDetectRatio) && obj.currentTarget.y < global.y + (gameSettings.cardH/cardDetectRatio)){
						isNear = true;
					}
				}
				if(isNear){
					if($.players[gameData.player].piles.indexOf(obj.currentTarget.cardIndex) == -1){
						var isExistFromDiscard = false;
						for(var ld=0; ld<4; ld++){
							if($.players[gameData.player].discard[ld].indexOf(obj.currentTarget.cardIndex) != -1){
								isExistFromDiscard = true;
							}
						}
						if(!isExistFromDiscard){
							foundDropZone = true;
							
							playDiscardCard(obj.currentTarget, d);
							if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
								postSocketUpdate('playdiscardcard', {index:obj.currentTarget.cardIndex, discard:d}, true);
							}
							d = 4;
						}
					}
				}
			}
			
			if(!foundDropZone){
				hideCardHighlight();
				hideDiscardHighlight();
				positionPlayerCards(gameData.player, true);
				positionPlayerDiscards(gameData.player);
				highlightPlayableCards();
			}
			gameData.drag.status = false;
		break;
	}
}

function playPlayerCard(card, d){
	playSound('soundStack');
	playSound('soundCardDeal');
	playerData.play = false;
	hideCardHighlight();
	hideDiscardHighlight();

	setCardDepth(card);
	TweenMax.to(card, gameSettings.cardDealSpeed, {x:$.cards['discard'+d].x, y:$.cards['discard'+d].y, scaleX:1, scaleY:1, overwrite:true});
	if($.players[gameData.player].piles.indexOf(card.cardIndex) != -1){
		$.players[gameData.player].piles.splice($.players[gameData.player].piles.indexOf(card.cardIndex), 1);
		if($.players[gameData.player].piles.length > 0){
			toggleCardAction($.cards[$.players[gameData.player].piles[0]], true);
			setCardDepth($.cards[$.players[gameData.player].piles[0]]);
			flipCard($.cards[$.players[gameData.player].piles[0]]);
		}
		updatePlayerStats();
	}else if($.players[gameData.player].cards.indexOf(card.cardIndex) != -1){
		$.players[gameData.player].cards.splice($.players[gameData.player].cards.indexOf(card.cardIndex), 1);
	}else{
		for(var ld=0; ld<4; ld++){
			if($.players[gameData.player].discard[ld].indexOf(card.cardIndex) != -1){
				$.players[gameData.player].discard[ld].splice($.players[gameData.player].discard[d].indexOf(card.cardIndex), 1);
			}
		}
	}
	gameData.discard[d].push(card.cardIndex);
	toggleCardAction(card, false);
	if(!card.contentContainer.visible || card.contentContainer.scaleX <= 0){
		flipCard(card);
	}

	if(card.cardType == 'skip'){
		createSkipContent(card, $.cards['discard'+d].cardValue);
		$.cards['discard'+d].cardValue++;
	}else{
		$.cards['discard'+d].cardValue = card.cardValue;
	}
	positionPlayerCards(gameData.player,true);
	checkDiscardFull(true);
	checkGameEnd();
}

function playDiscardCard(card, d){
	playerData.play = false;
	hideCardHighlight();
	hideDiscardHighlight();

	setCardDepth(card);
	if($.players[gameData.player].cards.indexOf(card.cardIndex) != -1){
		$.players[gameData.player].cards.splice($.players[gameData.player].cards.indexOf(card.cardIndex), 1);
	}
	if(!card.contentContainer.visible || card.contentContainer.scaleX <= 0){
		flipCard(card);
	}

	$.players[gameData.player].discard[d].push(card.cardIndex);
	positionPlayerCards(gameData.player,true);
	positionPlayerDiscards(gameData.player);
	nextPlayerTurn();
}

function toggleCardAction(card, con){
	if(con){
		card.cursor = 'pointer';
	}else{
		card.cursor = null;
	}
}

/*!
 * 
 * CARDS HIGHLIGHT - This is the function that runs to highlight cards
 * 
 */
function hideDiscardHighlight(){
	for(var d=0; d<4; d++){
		highlightCard($.cards['discardH'+d], false);
		if($.players[gameData.player].wideLayout){
			highlightCard($.players["discardH" + gameData.player+'_'+d], false);
		}
	}
}

function hideCardHighlight(){
	if($.players[gameData.player].piles.length > 0){
		var thisCard = $.cards[$.players[gameData.player].piles[0]];
		highlightCard(thisCard.highlight, false);
	}

	if($.players[gameData.player].cards.length > 0){
		for(var n=0; n<$.players[gameData.player].cards.length; n++){
			var thisCard = $.cards[$.players[gameData.player].cards[n]];
			highlightCard(thisCard.highlight, false);
		}
	}

	for(var d=0; d<4; d++){
		for(var n=0; n<$.players[gameData.player].discard[d].length; n++){
			var thisCard = $.cards[$.players[gameData.player].discard[d][n]];
			highlightCard(thisCard.highlight, false);
		}
	}
}

function highlightDiscardArea(cardIndex, cardType, cardValue){
	hideCardHighlight();

	var firstDiscard = false;
	for(var d=0; d<4; d++){
		if($.cards['discard'+d].cardValue == cardValue-1 || cardType == 'skip'){
			firstDiscard = true;
			highlightCard($.cards['discardH'+d], true);
		}
	}

	if(!firstDiscard && $.players[gameData.player].piles.indexOf(cardIndex) == -1){
		for(var d=0; d<4; d++){
			highlightCard($.players["discardH" + gameData.player+'_'+d], true);
		}
	}
}

function highlightPlayableCards(){
	var highlighCard = false;
	//stockpile
	if($.players[gameData.player].piles.length > 0){
		var thisCard = $.cards[$.players[gameData.player].piles[0]];
		for(var d=0; d<4; d++){
			if($.cards['discard'+d].cardValue == thisCard.cardValue-1 || thisCard.cardType == 'skip'){
				highlighCard = true;
				highlightCard(thisCard.highlight, true);
			}
		}
	}

	if($.players[gameData.player].cards.length > 0 && !highlighCard){
		for(var n=0; n<$.players[gameData.player].cards.length; n++){
			var thisCard = $.cards[$.players[gameData.player].cards[n]];
			for(var d=0; d<4; d++){
				if($.cards['discard'+d].cardValue == thisCard.cardValue-1 || thisCard.cardType == 'skip'){
					highlighCard = true;
					highlightCard(thisCard.highlight, true);
				}
			}
		}
	}

	for(var d=0; d<4; d++){
		if($.players[gameData.player].discard[d].length > 0){
			var thisCard = $.cards[$.players[gameData.player].discard[d][$.players[gameData.player].discard[d].length-1]];
			for(var ld=0; ld<4; ld++){
				if($.cards['discard'+ld].cardValue == thisCard.cardValue-1 || thisCard.cardType == 'skip'){
					highlighCard = true;
					highlightCard(thisCard.highlight, true);
				}
			}
		}
	}

	if(!highlighCard){
		for(var n=0; n<$.players[gameData.player].cards.length; n++){
			var thisCard = $.cards[$.players[gameData.player].cards[n]];
			highlightCard(thisCard.highlight, true);
		}
	}
}

function highlightCard(highlight, con){
	if(con){
		highlight.visible = true;
		animateBlink(highlight);
	}else{
		highlight.visible = false;
		killAnimateBlink(highlight);
	}
}

/*!
 * 
 * PREPARE PLAYERS - This is the function that runs to prepare players
 * 
 */
function preparePlayers(){
	cardsPlayersContainer.removeAllChildren();

	for(var n=0; n<gameData.players; n++){
		var isWideLayout = false;

		if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
			if(gameData.players == 2){
				isWideLayout = true;
			}else if(n == socketData.gameIndex){
				isWideLayout = true;
			}
		}else{
			if(n == 0){
				isWideLayout = true;
			}else if(n == 1){
				if(gameData.players == 2){
					isWideLayout = true;
				}
			}
		}
		
		$.players[n] = new createjs.Container();
		$.players[n].piles = [];
		$.players[n].cards = [];
		$.players[n].discard = [[],[],[],[]];
		$.players[n].playerIndex = n;
		$.players[n].wideLayout = isWideLayout;

		var playerTotalDeal = gameData.skipcard.stockPile;
		playerTotalDeal = gameData.lastPiles.length != 0 ? gameData.lastPiles[n] : playerTotalDeal;
		for(var p=0; p<playerTotalDeal; p++){
			var cardIndex = gameData.cards[gameData.cardIndex].cardIndex;
			$.players[n].piles.push(cardIndex);
			gameData.cardIndex++;
		}

		var itemPlayer = new createjs.Bitmap(loader.getResult('itemPlayer'));
		centerReg(itemPlayer);
		var newPlayerName = new createjs.Text();
		newPlayerName.font = "18px bpreplaybold";
		newPlayerName.color = "#fff";
		newPlayerName.textAlign = "center";
		newPlayerName.textBaseline='middle';
		newPlayerName.text = textStrings.playerName.replace("[NUMBER]", n+1);

		$.players["name" + n] = new createjs.Container();
		$.players["name" + n].addChild(itemPlayer, newPlayerName);

		var itemPiles = new createjs.Bitmap(loader.getResult('itemPiles'));
		centerReg(itemPiles);
		itemPiles.regY = itemPiles.image.naturalHeight;
		var newPlayerStats = new createjs.Text();
		newPlayerStats.font = "18px bpreplaybold";
		newPlayerStats.color = "#fff";
		newPlayerStats.textAlign = "center";
		newPlayerStats.textBaseline='middle';
		newPlayerStats.text = 19;
		newPlayerStats.y = -65;
		$.players["stats" + n] = new createjs.Container();
		$.players["stats" + n].addChild(itemPiles, newPlayerStats);
		$.players["stats" + n].visible = false;

		if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
			newPlayerName.text = gameData.names[n];
		}

		var bgPlayer;
		var bgPlayerP;
		if(isWideLayout){
			itemPlayer.y = -70;
			newPlayerName.y = -70;
			bgPlayer = new createjs.Bitmap(loader.getResult('itemPlayerBg'));
			centerReg(bgPlayer);
			bgPlayerP = new createjs.Bitmap(loader.getResult('itemPlayerBgP'));
			centerReg(bgPlayerP);
		}else{
			itemPlayer.y = -90;
			newPlayerName.y = -90;
			bgPlayer = new createjs.Bitmap(loader.getResult('itemPlayerBg2'));
			centerReg(bgPlayer);
			bgPlayerP = new createjs.Bitmap(loader.getResult('itemPlayerBgP'));
			centerReg(bgPlayerP);
		}

		$.players[n].addChild(bgPlayer, bgPlayerP, $.players["stats" + n], $.players["name" + n]);

		for(var d=0; d<4; d++){
			$.players["discard" + n+'_'+d] = new createjs.Bitmap(loader.getResult('itemDiscard'));
			centerReg($.players["discard" + n+'_'+d]);
			$.players[n].addChild($.players["discard" + n+'_'+d]);

			if(isWideLayout){
				$.players["discardH" + n+'_'+d] = new createjs.Bitmap(loader.getResult('cardHighlight'+gameData.themeIndex));
				centerReg($.players["discardH" + n+'_'+d]);
				$.players["discardH" + n+'_'+d].visible = false;
				$.players[n].addChild($.players["discardH" + n+'_'+d]);
			}
		}
		$.players["piles" + n] = new createjs.Container();
		$.players["cards" + n] = new createjs.Container();
		$.players[n].addChild($.players["piles" + n], $.players["cards" + n]);

		$.players[n].bgPlayer = bgPlayer;
		$.players[n].bgPlayerP = bgPlayerP;
		$.players[n].playerNameTxt = newPlayerName;
		$.players[n].statsTxt = newPlayerStats;
		cardsPlayersContainer.addChild($.players[n]);
	}

	for(var n=gameData.cardIndex; n<gameData.cards.length; n++){
		var cardIndex = gameData.cards[n].cardIndex;
		gameData.draw.push(cardIndex);
	}

	gameData.lastPiles = [];
	gameData.prepared = true;
	updatePlayerStats();
	resizeGameLayout();
	TweenMax.to(cardsContainer, .5, {overwrite:true, onComplete:function(){
		gameData.deal.status = true;
		gameData.deal.animation = 'pile';
		startPlayerCardsAnimation();
	}});
}

function updatePlayerStats(){
	for(var n=0; n<gameData.players; n++){
		$.players[n].statsTxt.text = $.players[n].piles.length;
		if($.players[n].piles.length == 0){
			$.players["stats" + n].visible = false;
		}
	}
}

function startPlayerCardsAnimation(){
	if(gameData.deal.animation == 'pile'){
		for(var p=0; p<gameData.players; p++){
			for(var n=0; n<$.players[p].piles.length; n++){
				var thisCard = $.cards[$.players[p].piles[n]];
				if(n == 0){
					thisCard.cardDeal = false;
					gameData.deal.cards.push({card:thisCard, player:p});
					gameData.deal.total++;
				}else{
					thisCard.cardDeal = true;
				}
			}
		}
		dealPlayerPileCard();
	}else if(gameData.deal.animation == 'play'){
		gameData.play = false;
		gameData.deal.cards = [];
		gameData.deal.cardIndex = 0;
		gameData.deal.total = 0;
		
		if(gameData.draw.length == 0){
			gameData.lastPlayer = gameData.player;
			for(var n=0; n<gameData.players; n++){
				gameData.lastPiles.push($.players[n].piles.length);
			}
			isGameEnd = true;
			gameData.play = false;
			hideCardHighlight();
			hideDiscardHighlight();
			highlightPlayer(false);
			showGameStatus('nocard');
		}else{
			var totalCards = 5-$.players[gameData.player].cards.length;
			totalCards = totalCards > gameData.draw.length ? gameData.draw.length : totalCards;
			var drawIndex = gameData.draw.length-1;
			for(var n=0; n<totalCards; n++){
				$.players[gameData.player].cards.push(gameData.draw[drawIndex]);

				var thisCard = $.cards[gameData.draw[drawIndex]];
				thisCard.cardDeal = false;
				gameData.deal.cards.push({card:thisCard, player:gameData.player});
				gameData.deal.total++;
				drawIndex--;
			}

			var pos = cardsPlayContainer.globalToLocal($.players[gameData.player].x*dpr, $.players[gameData.player].y*dpr);
			$.players[gameData.player].cardX = pos.x + $.players["cards"+gameData.player].x;
			$.players[gameData.player].cardY = pos.y + $.players["cards"+gameData.player].y;
			gameData.draw.length = gameData.draw.length-totalCards;
			dealPlayerCard();
		}
	}else{
		for(var n=0; n<gameData.players; n++){
			positionPlayerCards(n, gameData.deal.status);
		}
	}
}

/*!
 * 
 * DEAL PLAYER CARD - This is the function that runs to deal player card
 * 
 */
function dealPlayerPileCard(){
	var thisCard = gameData.deal.cards[gameData.deal.cardIndex].card;
	var thisPlayer = gameData.deal.cards[gameData.deal.cardIndex].player;
	var pos = cardsPlayContainer.globalToLocal($.players[thisPlayer].x*dpr, $.players[thisPlayer].y*dpr);
	setCardDepth(thisCard);

	thisCard.oriX = pos.x + $.players["piles"+thisPlayer].x;
	thisCard.oriY = pos.y + $.players["piles"+thisPlayer].y;

	TweenMax.to(thisCard, gameSettings.cardDealSpeed, {x:thisCard.oriX, y:thisCard.oriY, scaleX:$.players[thisPlayer].scaleNum, scaleY:$.players[thisPlayer].scaleNum, overwrite:true, onStart:function(){
		thisCard.cardDeal = true;
		playSound('soundCardDeal');
	},onComplete:dealPlayerPileCardComplete, onCompleteParams:[thisPlayer, thisCard]});

	TweenMax.to(cardsContainer, .2, {overwrite:true, onComplete:dealPlayerPileCardComplete, onCompleteParams:[thisPlayer, thisCard]});
}

function dealPlayerPileCardComplete(index, card){
	var pos = cardsPlayContainer.globalToLocal($.players[index].x*dpr, $.players[index].y*dpr);
	for(var n=0; n<$.players[index].piles.length; n++){
		var otherCard = $.cards[$.players[index].piles[n]];
		if(n != 0){
			otherCard.scaleX = otherCard.scaleY = $.players[index].scaleNum;
			otherCard.oriX = otherCard.x = pos.x + $.players["piles"+index].x;
			otherCard.oriY = otherCard.y = pos.y + $.players["piles"+index].y;
		}
	}
	
	var showCardContent = checkIsPlayer(index);
	if(showCardContent){
		toggleCardAction(card, true);
	}
	flipCard(card);
	positionPlayerCards(index, true);
	$.players["stats" + index].visible = true;

	gameData.deal.cardIndex++;
	if(gameData.deal.cardIndex < gameData.deal.cards.length){
		dealPlayerPileCard();
	}else{
		if(gameData.deal.animation){
			gameData.deal.status = true;
			gameData.deal.animation = 'play';
			startPlayerCardsAnimation();
		}
	}
}

function dealPlayerCard(){
	var thisCard = gameData.deal.cards[gameData.deal.cardIndex].card;
	var thisPlayer = gameData.deal.cards[gameData.deal.cardIndex].player;
	var pos = getPlayerCardPosition(thisPlayer);
	setCardDepth(thisCard);

	thisCard.oriX = $.players[thisPlayer].cardX;
	thisCard.oriY = $.players[thisPlayer].cardY;

	TweenMax.to(thisCard, gameSettings.cardDealSpeed, {x:thisCard.oriX, y:thisCard.oriY, scaleX:$.players[thisPlayer].scaleNum, scaleY:$.players[thisPlayer].scaleNum, overwrite:true, onStart:function(){
		thisCard.cardDeal = true;
		playSound('soundCardDeal');
	},onComplete:dealPlayerCardComplete, onCompleteParams:[thisPlayer, thisCard]});
	TweenMax.to(cardsContainer, .2, {overwrite:true, onComplete:dealPlayerCardComplete, onCompleteParams:[thisPlayer, thisCard]});
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
			gameData.deal.animation = '';
			displayPlayerTurn(true);
		}
	}
}

function getPlayerCardPosition(index){
	var pt = cardsPlayContainer.globalToLocal($.players[index].x*dpr, $.players[index].y*dpr);
	pt.x = pt.x + $.players["cards"+index].x;
	pt.y = pt.y + $.players["cards"+index].y;

	var pos = {x:0, y:0, startX:0, startY:0, w:0, h:0, maxW:500, maxH:300, gap:0, cardSpace:40 * $.players[index].scaleNum, totalCards:0};
	if(!viewport.isLandscape){
		pos.maxW = 80;
		pos.maxH = 300;
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

	pos.w = (pos.totalCards) * pos.cardSpace;
	pos.gap = pos.cardSpace;

	if(pos.w > pos.maxW){
		pos.w = pos.maxW;
		pos.gap = pos.maxW/(pos.totalCards);
	}

	pos.x = pos.startX = pt.x - (pos.w/2);
	pos.y = pos.startY = pt.y;

	return pos;
}

/*!
 * 
 * POSITION CARDS - This is the function that runs to position cards
 * 
 */
function positionPlayerCards(index, animation){
	var pos = cardsPlayContainer.globalToLocal($.players[index].x*dpr, $.players[index].y*dpr);
	for(var p=0; p<$.players[index].piles.length; p++){
		var thisCard = $.cards[$.players[index].piles[p]];
		if(thisCard.cardDeal){
			thisCard.oriX = pos.x + $.players["piles"+index].x;
			thisCard.oriY = pos.y + $.players["piles"+index].y;

			if(animation){
				TweenMax.to(thisCard, gameSettings.cardDealSpeed, {x:thisCard.oriX, y:thisCard.oriY, scaleX:$.players[index].scaleNum, scaleY:$.players[index].scaleNum, overwrite:true});
			}
		}
	}

	var pos = getPlayerCardPosition(index);
	for(var p=0; p<$.players[index].cards.length; p++){
		$.players[index].cardX = pos.x;
		$.players[index].cardY = pos.y;

		var thisCard = $.cards[$.players[index].cards[p]];
		if(thisCard.cardDeal){
			thisCard.oriX = pos.x;
			thisCard.oriY = pos.y;
			setCardDepth(thisCard);
			pos.x += pos.gap;

			if(animation){
				TweenMax.to(thisCard, gameSettings.cardDealSpeed, {x:thisCard.oriX, y:thisCard.oriY, scaleX:$.players[index].scaleNum, scaleY:$.players[index].scaleNum, overwrite:true});
			}
		}
	}
}

function positionPlayerDiscards(index){
	for(var d=0; d<4; d++){
		var pt = cardsPlayContainer.globalToLocal($.players[index].x*dpr, $.players[index].y*dpr);
		pt.x = pt.x + $.players["discard" +index+'_'+d].x;
		pt.y = pt.y + $.players["discard" +index+'_'+d].y;
		
		var showCardCount = 3;
		var loopCount = 0;
		var spaceY = 0;
		for(var n=0; n<$.players[index].discard[d].length; n++){
			var thisCard = $.cards[$.players[index].discard[d][n]];

			if($.players[index].discard[d].length - n <= showCardCount){
				loopCount++;
			}

			thisCard.oriX = pt.x;
			thisCard.oriY = pt.y + (spaceY * $.players[index].scaleNum);
			TweenMax.to(thisCard, gameSettings.cardDealSpeed, {x:pt.x, y:pt.y + (spaceY * $.players[index].scaleNum), overwrite:true});
			if(loopCount > 0){
				spaceY += 20;
			}
		}
	}
}

function positionDiscards(){
	for(var d=0; d<4; d++){
		for(var n=0; n<gameData.discard[d].length; n++){
			var thisCard = $.cards[gameData.discard[d]];
			TweenMax.to(thisCard, gameSettings.cardDealSpeed, {x:$.cards['discard'+d].x, y:$.cards['discard'+d].y, overwrite:true});
		}
	}
}

function flipCard(card){
	playSound('soundCardFlip');
	card.contentContainer.visible = true;
	card.contentContainer.scaleX = 0;

	var flipSpeed = gameSettings.cardFlipSpeed;
	TweenMax.to(card.frontContainer, flipSpeed, {scaleX:0});
	TweenMax.to(card.contentContainer, flipSpeed, {delay:flipSpeed, scaleX:1});
}

function flipCardCover(card){
	playSound('soundCardFlip');
	card.frontContainer.visible = true;
	card.frontContainer.scaleX = 0;

	var flipSpeed = gameSettings.cardFlipSpeed;
	TweenMax.to(card.contentContainer, flipSpeed, {scaleX:0});
	TweenMax.to(card.frontContainer, flipSpeed, {delay:flipSpeed, scaleX:1});
}

/*!
 * 
 * SET CARD DEPTH - This is the function that runs to set card depth
 * 
 */
function setCardDepth(thisCard){
	cardsPlayContainer.setChildIndex(thisCard, cardsPlayContainer.numChildren-1);
}

/*!
 * 
 * AI MOVE - This is the function that runs to ai move
 * 
 */
function tryAIMove(){
	if(!gameData.ai){
		return;
	}

	var pileIndex = $.players[gameData.player].piles[0];
	var pileCard = $.cards[pileIndex];
	var pileCardDiscard = -1;
	for(var d=0; d<4; d++){
		if($.cards['discard'+d].cardValue == pileCard.cardValue-1 || pileCard.cardType == 'skip'){
			pileCardDiscard = d;
			d = 4;
		}
	}

	var playCardIndex = -1;
	var playCardDiscard = -1;
	var playCardArr = [];
	if(pileCardDiscard == -1){
		for(var n=0; n<$.players[gameData.player].cards.length; n++){
			var playIndex = $.players[gameData.player].cards[n];
			var playCard = $.cards[playIndex];
			playCardArr.push({index:playIndex, value:playCard.cardValue})
		}
		sortOnObject(playCardArr,'value',false);
		for(var n=0; n<playCardArr.length; n++){
			var playCard = $.cards[playCardArr[n].index];
			for(var d=0; d<4; d++){
				if($.cards['discard'+d].cardValue == playCard.cardValue-1 || playCard.cardType == 'skip'){
					playCardIndex = playCardArr[n].index;
					playCardDiscard = d;
					d = 4;
				}
			}
		}
	}

	var playDiscardIndex = -1;
	var playDiscardFrom = -1;
	var playDiscard = -1;
	var playDiscardArr = [];
	if(playCardDiscard == -1){
		for(var d=0; d<4; d++){
			if($.players[gameData.player].discard[d].length > 0){
				var playIndex = $.players[gameData.player].discard[d][$.players[gameData.player].discard[d].length-1];
				var playCard = $.cards[playIndex];
				playDiscardArr.push({discard:d, index:playIndex, value:playCard.cardValue})
			}
		}
		sortOnObject(playDiscardArr,'value',false);
		for(var n=0; n<playDiscardArr.length; n++){
			var playCard = $.cards[playDiscardArr[n].index];
			for(var d=0; d<4; d++){
				if($.cards['discard'+d].cardValue == playCard.cardValue-1 || playCard.cardType == 'skip'){
					playDiscardFrom = playDiscardArr[n].discard;
					playDiscardIndex = playDiscardArr[n].index;
					playDiscard = d;
					d = 4;
				}
			}
		}
	}

	var playCardDiscardIndex = -1;
	var playCardDiscardSelf = -1;
	if(playCardDiscard == -1 && playDiscard == -1 && pileCardDiscard == -1){
		sortOnObject(playCardArr,'value',true);
		//find same value
		for(var n=0; n<$.players[gameData.player].cards.length; n++){
			var playIndex = $.players[gameData.player].cards[n];
			var playCard = $.cards[playIndex];
			for(var d=0; d<4; d++){
				if($.players[gameData.player].discard[d].length > 0){
					var discardCard = $.cards[$.players[gameData.player].discard[d][$.players[gameData.player].discard[d].length-1]];
					if(playCard.cardValue == discardCard.cardValue){
						playCardDiscardIndex = playIndex;
						playCardDiscardSelf = d;
						d = 4;
					}
				}
			}
		}
		//find less
		if(playCardDiscardSelf == -1){

			var discardCardArr = [];
			for(var d=0; d<4; d++){
				discardCardArr.push({index:d, cards:$.players[gameData.player].discard[d].length});
			}
			sortOnObject(discardCardArr,'cards',false);
			playCardDiscardIndex = playCardArr[0].index;
			playCardDiscardSelf = discardCardArr[0].index;
		}
	}

	TweenMax.to($.players[gameData.player], gameSettings.aiThinkSpeed, {overwrite:true, onComplete:function(){
		if(pileCardDiscard != -1){
			//play pile card
			playSound('soundStack');
			playSound('soundCardDeal');
			var thisCard = pileCard;
			if($.players[gameData.player].piles.indexOf(thisCard.cardIndex) != -1){
				$.players[gameData.player].piles.splice($.players[gameData.player].piles.indexOf(thisCard.cardIndex), 1);
			}
			gameData.discard[pileCardDiscard].push(thisCard.cardIndex);

			if(thisCard.cardType == 'skip'){
				createSkipContent(thisCard, $.cards['discard'+pileCardDiscard].cardValue);
				$.cards['discard'+pileCardDiscard].cardValue++;
			}else{
				$.cards['discard'+pileCardDiscard].cardValue = thisCard.cardValue;
			}
			
			setCardDepth(thisCard);
			positionPlayerCards(gameData.player, true);
			updatePlayerStats();

			if($.players[gameData.player].piles.length > 0){
				setCardDepth($.cards[$.players[gameData.player].piles[0]]);
				flipCard($.cards[$.players[gameData.player].piles[0]]);
			}
			TweenMax.to(thisCard, gameSettings.cardDealSpeed, {x:$.cards['discard'+pileCardDiscard].x, y:$.cards['discard'+pileCardDiscard].y, scaleX:1, scaleY:1, overwrite:true, onComplete:function(){
				var isCardFull = checkDiscardFull();
				var tweenSpeed = isCardFull == true ? gameSettings.aiThinkSpeed+.5 : 0;
				TweenMax.to($.players[gameData.player], tweenSpeed, {overwrite:true, onComplete:function(){
					checkGameEnd();
				}});
			}});
		}else if(playCardDiscard != -1){
			//play draw card
			playSound('soundStack');
			playSound('soundCardDeal');
			var thisCard = $.cards[playCardIndex];
			if($.players[gameData.player].cards.indexOf(thisCard.cardIndex) != -1){
				$.players[gameData.player].cards.splice($.players[gameData.player].cards.indexOf(thisCard.cardIndex), 1);
			}
			gameData.discard[playCardDiscard].push(thisCard.cardIndex);
			if(thisCard.cardType == 'skip'){
				createSkipContent(thisCard, $.cards['discard'+playCardDiscard].cardValue);
				$.cards['discard'+playCardDiscard].cardValue++;
			}else{
				$.cards['discard'+playCardDiscard].cardValue = thisCard.cardValue;
			}
			setCardDepth(thisCard);
			flipCard(thisCard);
			positionPlayerCards(gameData.player, true);
			TweenMax.to(thisCard, gameSettings.cardDealSpeed, {x:$.cards['discard'+playCardDiscard].x, y:$.cards['discard'+playCardDiscard].y, scaleX:1, scaleY:1, overwrite:true, onComplete:function(){
				var isCardFull = checkDiscardFull();
				var tweenSpeed = isCardFull == true ? gameSettings.aiThinkSpeed+.5 : 0;
				TweenMax.to($.players[gameData.player], tweenSpeed, {overwrite:true, onComplete:function(){
					checkGameEnd();
				}});
			}});
		}else if(playDiscard != -1){
			//play discard card
			playSound('soundStack');
			playSound('soundCardDeal');
			var thisCard = $.cards[playDiscardIndex];
			if($.players[gameData.player].discard[playDiscardFrom].indexOf(thisCard.cardIndex) != -1){
				$.players[gameData.player].discard[playDiscardFrom].splice($.players[gameData.player].discard[playDiscardFrom].indexOf(thisCard.cardIndex), 1);
			}
			gameData.discard[playDiscard].push(thisCard.cardIndex);
			if(thisCard.cardType == 'skip'){
				createSkipContent(thisCard, $.cards['discard'+playDiscard].cardValue);
				$.cards['discard'+playDiscard].cardValue++;
			}else{
				$.cards['discard'+playDiscard].cardValue = thisCard.cardValue;
			}
			setCardDepth(thisCard);
			positionPlayerDiscards(gameData.player);
			TweenMax.to(thisCard, gameSettings.cardDealSpeed, {x:$.cards['discard'+playDiscard].x, y:$.cards['discard'+playDiscard].y, scaleX:1, scaleY:1, overwrite:true, onComplete:function(){
				var isCardFull = checkDiscardFull();
				var tweenSpeed = isCardFull == true ? gameSettings.aiThinkSpeed+.5 : 0;
				TweenMax.to($.players[gameData.player], tweenSpeed, {overwrite:true, onComplete:function(){
					checkGameEnd();
				}});
			}});
		}else{
			playSound('soundCardDeal');
			var thisCard = $.cards[playCardDiscardIndex];
			if($.players[gameData.player].cards.indexOf(thisCard.cardIndex) != -1){
				$.players[gameData.player].cards.splice($.players[gameData.player].cards.indexOf(thisCard.cardIndex), 1);
			}
			$.players[gameData.player].discard[playCardDiscardSelf].push(thisCard.cardIndex);
			setCardDepth(thisCard);
			flipCard(thisCard);
			positionPlayerCards(gameData.player, true);
			positionPlayerDiscards(gameData.player);
			TweenMax.to($.players[gameData.player], gameSettings.aiThinkSpeed, {overwrite:true, onComplete:function(){
				nextPlayerTurn();
			}});
		}
	}});
}

/*!
 * 
 * CHECK CARDS CONDITION - This is the function that runs to check cards condition
 * 
 */
function checkGameEnd(){
	var isGameEnd = false;
	if($.players[gameData.player].piles.length == 0){
		isGameEnd = true;
		gameData.play = false;
		hideCardHighlight();
		hideDiscardHighlight();
		highlightPlayer(false);
		showGameStatus('win');
	}else{
		if($.players[gameData.player].cards.length == 0){
			dealMoreCards = true;
			gameData.deal.status = true;
			gameData.deal.animation = 'play';
			startPlayerCardsAnimation();
		}else{
			displayPlayerTurn(false);
		}
	}
	return isGameEnd;
}

function checkDiscardFull(isPlayer){
	var cardFull = false;
	var totalToDiscard = 12;
	for(var d=0; d<4; d++){
		if($.cards['discard'+d].cardValue == totalToDiscard){
			cardFull = true;
		}
	}

	if(cardFull){
		playSound('soundStackComplete');
		gameData.play = false;
		TweenMax.to(cardsDiscardContainer, .2, {overwrite:true, onComplete:function(){
			gameData.play = true;
			for(var d=0; d<4; d++){
				if($.cards['discard'+d].cardValue == totalToDiscard){
					for(var n=0; n<gameData.discard[d].length; n++){
						gameData.draw.push(gameData.discard[d][n]);
						var thisCard = $.cards[gameData.discard[d][n]];
						if(n == gameData.discard[d].length-1){
							thisCard.x = $.cards[gameData.discard[d][0]].x;
							thisCard.y = $.cards[gameData.discard[d][0]].y;
						}
						flipCardCover(thisCard);
						setCardDepth(thisCard);
						TweenMax.to(thisCard, gameSettings.cardDealSpeed, {delay:.5, x:0, y:0, overwrite:true, onComplete:startBackDraw, onCompleteParams:[thisCard]});
						if(thisCard.cardType == 'skip'){
							thisCard.contentSkipContainer.visible = false;
						}
					}
					$.cards['discard'+d].cardValue = 0;
					gameData.discard[d].length = 0;
				}
			}

			if(cardFull){
				if(isPlayer && gameData.play){
					TweenMax.to(cardsDiscardContainer, (gameSettings.cardDealSpeed+.6), {overwrite:true, onComplete:function(){
						highlightPlayableCards();
					}});
				}
				gameData.shuffle = true;
			}
		}});
	}
	return cardFull;
}

function startBackDraw(thisCard){
	cardsPlayContainer.setChildIndex(thisCard, 0);
}

/*!
 * 
 * DISPLAY PLAYER TURN - This is the function that runs to display player turn
 * 
 */
function displayPlayerTurn(highlight){
	if(highlight){
		highlightPlayer(true);
	}
	if(gameData.shuffle){
		gameData.shuffle = false;
		shuffle(gameData.draw);
	}
	
	if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
		postSocketUpdate('cardactioncomplete', socketData.gameIndex);
	}else{
		playerReadyAction(highlight);
	}
}

function playerReadyAction(highlight){
	var proceedAction = checkIsPlayer(gameData.player);
	if(proceedAction){
		var tweenSpeed = highlight == true ? 1 : 0;
		TweenMax.to($.players[gameData.player], tweenSpeed, {overwrite:true, onComplete:function(){
			highlightPlayableCards();
			gameData.play = true;
		}});
	}else{
		tryAIMove();
	}
}

/*!
 * 
 * NEXT PLAYER - This is the function that runs to next player
 * 
 */
function nextPlayerTurn(){
	gameData.player++;
	gameData.player = gameData.player > gameData.players-1 ? 0 : gameData.player;
	
	gameData.deal.status = true;
	gameData.deal.animation = 'play';
	startPlayerCardsAnimation();
}

/*!
 * 
 * HIGHLIGHT PLAYER - This is the function that runs to highlight player
 * 
 */
function highlightPlayer(con){
	for(var n=0; n<gameData.players; n++){
		TweenMax.to($.players[n].playerNameTxt, .2, {alpha:1, overwrite:true});
	}

	if(con){
		playSound('soundAlert');
		animatePlayerFocus($.players["name" + gameData.player]);
		animateBlink($.players[gameData.player].playerNameTxt);
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
 * GAME STATUS - This is the function that runs to show game status
 * 
 */
function showGameStatus(con){
	statusPlayerTxt.text = $.players[gameData.player].playerNameTxt.text;

	if(con == 'win'){
		statusTxt.text = textStrings.finishedStockPile;
		statusPlayerTxt.text = statusPlayerTxt.text + textStrings.playerWon;
		TweenMax.to(cardsContainer, 3, {overwrite:true, onComplete:function(){
			toggleRoundScore(true);
		}});
	}else if(con == 'nocard'){
		statusTxt.text = textStrings.reshufflingCards;
		statusPlayerTxt.text = textStrings.drawPileRanOut;
		TweenMax.to(cardsContainer, 3, {overwrite:true, onComplete:function(){
			prepareNewGame();
		}});
	}

	statusContainer.alpha = 0;
	TweenMax.to(statusContainer, .5, {alpha:1, overwrite:true, onComplete:function(){
		TweenMax.to(statusContainer, .5, {delay:3, alpha:0, overwrite:true});
	}});
}

/*!
 * 
 * UPDATE GAME - This is the function that runs to loop game update
 * 
 */
function updateGame(){
	if(!gameData.paused){

	}
}

/*!
 * 
 * TOGGLE ROUND SCORE - This is the function that runs to toggle round score
 * 
 */
function toggleRoundScore(con){
	cardScoreListContainer.removeAllChildren();
	cardScoreContainer.visible = con;
	cardScoreMoveContainer.y = 0;

	if(con){
		//calculate
		playSound("soundPoint");
		var finalScore = gameSettings.scoreWin;
		var roundEnd = false;

		for(var n=0; n<gameData.players; n++){
			finalScore += $.players[n].piles.length * gameSettings.scoreOpponentStockPiles;
		}

		//display score
		if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
			if($.players[gameData.player].playerIndex == socketData.gameIndex){
				roundStatusTxt.text = textStrings.playerRoundWin;
			}else{
				roundStatusTxt.text = textStrings.playerRoundLose;
			}
		}else{
			if($.players[gameData.player].playerIndex == 0){
				roundStatusTxt.text = textStrings.playerRoundWin;
			}else{
				roundStatusTxt.text = textStrings.playerRoundLose;
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
		goalPointTitle.text = textStrings.goalPointTitle.replace("[NUMBER]", gameSettings.points[gameData.pointIndex]);
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
			playerName.text = $.players[n].playerNameTxt.text;

			var playerScore = new createjs.Text();
			playerScore.font = "23px bpreplaybold";
			playerScore.color = '#fff';
			playerScore.textAlign = "right";
			playerScore.textBaseline='alphabetic';
			playerScore.text = textStrings.playerScore.replace("[NUMBER]", playerData.scores[n]);

			if(n == gameData.player){
				tweenData.tweenScore = playerData.scores[n];
				targetScoreTxt = playerScore;
				playerData.scores[n] += finalScore;
				playerName.text = playerName.text + textStrings.playerScoreAdd.replace("[NUMBER]", finalScore);
				targetScore = playerData.scores[n];

				if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
					if($.players[gameData.player].playerIndex == socketData.gameIndex){
						roundStatusTxt.text = textStrings.playerRoundWin;
					}
				}else{
					if($.players[gameData.player].playerIndex == 0){
						roundStatusTxt.text = textStrings.playerRoundWin;
					}
				}

				if(playerData.scores[n] >= gameData.skipcard.point){
					if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
						if($.players[gameData.player].playerIndex == socketData.gameIndex){
							roundStatusTxt.text = textStrings.userWin;
						}else{
							roundStatusTxt.text = textStrings.playerWin.replace("[NAME]", $.players[n].playerNameTxt.text);
						}
					}else{
						if($.players[gameData.player].playerIndex == 0){
							roundStatusTxt.text = textStrings.userWin;
						}else{
							roundStatusTxt.text = textStrings.playerWin.replace("[NAME]", $.players[n].playerNameTxt.text);
						}
					}
					roundEnd = true;
				}

				playerName.color = playerScore.color = '#ffad0d';
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
		}

		if(targetScoreTxt != null){
			TweenMax.to(tweenData, .5, {delay:1, tweenScore:targetScore, overwrite:true, onUpdate:function(){
				targetScoreTxt.text = textStrings.playerScore.replace("[NUMBER]", Math.round(tweenData.tweenScore));
			}});
		}
		
		if(gameData.players * 40 > 200){
			cardScoreMoveContainer.y = -((gameData.players * 20) - 200);
		}
		cardScoreContainer.alpha = 0;
		TweenMax.to(cardScoreContainer, .5, {alpha:1, overwrite:true, onComplete:function(){
			TweenMax.to(cardScoreContainer, 4, {overwrite:true, onComplete:function(){
				if(roundEnd){
					endGame();
				}else{
					prepareNewGame();
				}
			}});
		}});
	}
}

function prepareNewGame(){
	TweenMax.to(cardScoreContainer, .5, {alpha:0, overwrite:true, onComplete:function(){
		playSound("soundCardShuffle");
		for(var n=0; n<gameData.cards.length; n++){
			var thisCard = gameData.cards[n];
			if(thisCard.contentContainer.visible || thisCard.contentContainer.scaleX <= 0){
				flipCardCover(thisCard);
				if(thisCard.contentSkipContainer.visible){
					thisCard.contentSkipContainer.visible = false;
					thisCard.contentSkipContainer.removeAllChildren();
				}
			}
			TweenMax.to(thisCard, gameSettings.cardDealSpeed, {x:0, y:0, rotation:0, scaleX:1, scaleY:1, overwrite:true});
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

function toggleOptions(con){
	if(optionsContainer.visible){
		optionsContainer.visible = false;
	}else{
		optionsContainer.visible = true;
	}
	if(con!=undefined){
		optionsContainer.visible = con;
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
function shareLinks(action, shareScore){
	if(shareSettings.gtag){
		gtag('event','click',{'event_category':'share','event_label':action});
	}

	var gameURL = location.href;
	gameURL = encodeURIComponent(gameURL.substring(0,gameURL.lastIndexOf("/") + 1));

	var shareTitle = shareSettings.shareTitle.replace("[SCORE]", shareScore);
	var shareText = shareSettings.shareText.replace("[SCORE]", shareScore);

	var shareURL = '';
	if( action == 'facebook' ){
		if(shareSettings.customScore){
			gameURL = decodeURIComponent(gameURL);
			shareURL = `https://www.facebook.com/sharer/sharer.php?u=`+encodeURIComponent(`${gameURL}share.php?title=${shareTitle}&url=${gameURL}&thumb=${gameURL}share.jpg`);
		}else{
			shareURL = `https://www.facebook.com/sharer/sharer.php?u=${gameURL}`;
		}
	}else if( action == 'twitter' ){
		shareURL = `https://twitter.com/intent/tweet?text=${shareText}&url=${gameURL}`;
	}else if( action == 'whatsapp' ){
		shareURL = `https://api.whatsapp.com/send?text=${shareText}%20${gameURL}`;
	}else if( action == 'telegram' ){
		shareURL = `https://t.me/share/url?url=${gameURL}&text=${shareText}`;
	}else if( action == 'reddit' ){
		shareURL = `https://www.reddit.com/submit?url=${gameURL}&title=${shareText}`;
	}else if( action == 'linkedin' ){
		shareURL = `https://www.linkedin.com/sharing/share-offsite/?url=${gameURL}`;
	}

	window.open(shareURL);
}