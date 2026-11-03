////////////////////////////////////////////////////////////
// GAME v1.1
////////////////////////////////////////////////////////////

/*!
 * 
 * GAME SETTING CUSTOMIZATION START
 * 
 */

//dictionary words
var dictionary_arr = [
	{
		file:'3letters.json',
		letters:3,
	},
	{
		file:'4letters.json',
		letters:4,
	},
	{
		file:'5letters.json',
		letters:5,
	},
	{
		file:'6letters.json',
		letters:6,
	}
];

//category gameplay
var category_arr = [
	{
		name:'7 HEXA',
		layers:1,
		score:100,
		timer:30000,
		stage:{
			next:5,
			timer:3000
		}
	},
	{
		name:'19 HEXA',
		layers:2,
		score:200,
		timer:30000,
		stage:{
			next:8,
			timer:3000
		}
	},
	{
		name:'37 HEXA',
		layers:3,
		score:200,
		timer:30000,
		stage:{
			next:8,
			timer:3000
		}
	}
];

//game settings
var gameSettings = {
	title:{
		name:["HEXA","WORD"],
		size:58,
		shadowY:7,
		shadowScale:1.1,
		color:"#38C58E",
		activeColor:"#FFA704",
		fontSize:50,
		textColor:"#fff",
		fontY:20,
		spaceX:20,
		spaceY:40,
	},
	letter:{
		size:45,
		shadowY:5,
		shadowScale:1.1,
		color:"#FFA704",
		activeColor:"#38C58E",
		textColor:"#fff",
		fontSize:43,
		fontY:18,
		spaceX:20,
		spaceY:30,
		sequenceSize:15,
		sequenceColor:"#00A3D9",
		sequenceFontSize:15,
		sequenceFontY:6,
		stroke:15,
		strokeColor:"#1C6347",
		arrowSize:13,
		arrowColor:"#32AF7D",
		focusBounceSpeed:.2,
		correctBounceSpeed:.3,
		arr:["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"]
	},
	hint:{
		size:40,
		shadowY:5,
		shadowScale:1.1,
		color:"#38C58E",
		disabledColor:"#FFA704",
		textColor:"#fff",
		fontSize:50,
		fontY:20
	},
	solve:{
		fontSize:20,
		color:"#fff",
		spaceX:15,
		spaceY:25,
	},
	timer:{
		color:"#fff",
		width:300,
		height:5,
		radius:3
	},
	score:{
		speed:1
	}
}

//game text display
var textDisplay = {
					loading:'LOADING WORDS...',
					gameModeTitle:"GAME MODE:",
					hexaSizeTitle:"HEXA SIZE:",
					tapLetter:"TAP LETTER",
					connectLetter:"CONNECT LETTER",
					pointDisplay:'SCORE : [NUMBER]PTS',
					wordDisplay:'WORDS : [NUMBER]',
					enterWord:'TAP ON LETTERS AND PRESS TICK\nTO CREATE A WORD.',
					connectWord:'HOLD AND CONNECT LETTERS\nTO CREATE A WORD.',
					noWord:'NO WORD IN DICTIONARY.',
					noPossibleWord:'NO MORE POSSIBLE WORD.',
					wordExist:'YOU HAVE CREATED THIS WORD.',
					completeWord:["GOOD JOB!","EXCELLENT!","WELL DONE!","BRILLIANT!"],
					pointplus:'+[NUMBER]PTS',
					timesup:"TIME\'S UP!",
					nextstage:"NEXT STAGE!",
					exitTitle:'EXIT GAME',
					exitMessage:'ARE YOU SURE\nYOU WANT TO\nQUIT THE GAME?',
					share:'SHARE YOUR SCORE',
					resultTitle:'GAME OVER',
					resultTimer:'TIME : [NUMBER]',
					resultWord:'WORDS : [NUMBER]',
					resultDesc:'SCORE : [NUMBER]PTS'
				}

//Social share, [SCORE] will replace with game score
var shareEnable = false; //toggle share
var shareTitle = 'Highscore on Hexa Word is [SCORE]PTS';//social share score title
var shareMessage = '[SCORE]PTS is mine new highscore on Hexa Word Game game! Try it now!'; //social share score message

/*!
 *
 * GAME SETTING CUSTOMIZATION END
 *
 */
$.editor = {enable:false};
var playerData = {score:0, word:0};
var gameData = {paused:true, mode:"quick", connect:false, categoryNum:0, dictionaryNum:0, wordIndex:0, categoryIndex:0, words:[], solve:[], currentWord:"", buttons:[], stage:{timer:0, count:0, layers:0}, grid:{r:7, c:7, w:0, h:0}, targetConnect:null, nextStage:false, complete:false};
var tweenData = {score:0, tweenScore:0};
var timeData = {enable:false, startDate:null, sessionDate:null, nowDate:null, sessionTimer:0, timer:0, oldTimer:0, accumulate:0};

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
	buttonStart.cursor = "pointer";
	buttonStart.addEventListener("click", function(evt) {
		playSound('soundButton');
		gameData.mode = "quick";
		toggleMainButton("type");
	});

	buttonCategory.cursor = "pointer";
	buttonCategory.addEventListener("click", function(evt) {
		playSound('soundButton');
		gameData.mode = "category";
		toggleMainButton("type");
	});

	buttonType.cursor = "pointer";
	buttonType.addEventListener("click", function(evt) {
		playSound('soundButton');
		if(gameData.mode == "quick"){
			goPage("game");
		}else{
			toggleMainButton("category");
		}
	});

	buttonTypeArrowL.cursor = "pointer";
	buttonTypeArrowL.addEventListener("click", function(evt) {
		playSound('soundButton');
		toggleType();
	});

	buttonTypeArrowR.cursor = "pointer";
	buttonTypeArrowR.addEventListener("click", function(evt) {
		playSound('soundButton');
		toggleType();
	});

	buttonLetter.cursor = "pointer";
	buttonLetter.addEventListener("click", function(evt) {
		playSound('soundButton');
		goPage('game');
	});

	buttonArrowL.cursor = "pointer";
	buttonArrowL.addEventListener("click", function(evt) {
		playSound('soundButton');
		toggleCategory(false);
	});

	buttonArrowR.cursor = "pointer";
	buttonArrowR.addEventListener("click", function(evt) {
		playSound('soundButton');
		toggleCategory(true);
	});

	$.letter["enter"].cursor = "pointer";
	$.letter["enter"].addEventListener("click", function(evt) {
		if(!gameData.complete){
			playSound('soundButton2');
			animateHintBounce($.letter["enter"]);
			checkLetterWord();	
		}
	});

	$.letter["clear"].cursor = "pointer";
	$.letter["clear"].addEventListener("click", function(evt) {
		if(!gameData.complete){
			playSound('soundButton2');
			animateHintBounce($.letter["clear"]);
			resetLetters();
		}
	});

	$.letter["reset"].cursor = "pointer";
	$.letter["reset"].addEventListener("click", function(evt) {
		if(evt.currentTarget.active && !gameData.complete){
			playSound('soundReset');
			shuffleLetter();
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
	});
	
	buttonCancel.cursor = "pointer";
	buttonCancel.addEventListener("click", function(evt) {
		playSound('soundButton');
		togglePop(false);
	});

	displayTypename();
	displayCategoryname();
}

function toggleMainButton(con){
	buttonStart.visible = false;
	buttonCategory.visible = false;
	selectContainer.visible = false;
	typeContainer.visible = false;

	if(con == "start"){
		buttonStart.visible = true;
		buttonCategory.visible = true;
	}else if(con == "type"){
		typeContainer.visible = true;
	}else if(con == "category"){
		selectContainer.visible = true;
	}
}

/*!
 * 
 * GAME TITLE - This is the function that runs to build game title
 * 
 */
function buildGameTitle(){
	titleContainer.removeAllChildren();

	var totalW = 0;
	var totalH = 0;
	var startX = 0;
	var startY = 0;
	var pos = {x:0, y:0};
	var size = gameSettings.title.size*1.5;
	if(gameSettings.title.name.length > 1){
		totalH = (size) * (gameSettings.title.name.length-1);
		totalH += gameSettings.title.spaceY * (gameSettings.title.name.length-1);
		pos.y = startY - (totalH/2);
	}

	for(var n=0; n<gameSettings.title.name.length; n++){
		var curWord = gameSettings.title.name[n];

		totalW = 0;
		startX = 0;
		if(gameSettings.title.name[n].length > 1){
			totalW = (size) * (gameSettings.title.name[n].length-1);
			totalW += gameSettings.title.spaceX * (gameSettings.title.name[n].length-1);
			pos.x = startX - (totalW/2);
		}
		
		var randomChangeColor = Math.floor(Math.random()*curWord.length);
		for(var w=0; w<curWord.length; w++){
			buildHexagonShape("title"+n+"_"+w, curWord.substring(w,w+1), "title");
			
			if(w == randomChangeColor){
				$.letter["title"+n+"_"+w].shape.fillCommand.style = gameSettings.title.activeColor;
				$.letter["title"+n+"_"+w].shapeShadow.fillCommand.style = gameSettings.title.activeColor;
			}
			$.letter["title"+n+"_"+w].x = $.letter["title"+n+"_"+w].oriX = pos.x;
			$.letter["title"+n+"_"+w].y = $.letter["title"+n+"_"+w].oriY = pos.y;
			if(isEven(w)){
				$.letter["title"+n+"_"+w].y = $.letter["title"+n+"_"+w].oriY = pos.y + (size/1.5);
			}
			pos.x += (gameSettings.title.spaceX) + (size);
		}		
		pos.y += (gameSettings.title.spaceY) + (size);
	}
}

function toggleAnimateTitle(con){
	var count = 0;
	for(var n=0; n<gameSettings.title.name.length; n++){
		var curWord = gameSettings.title.name[n];
		for(var w=0; w<curWord.length; w++){
			var thisLetter = $.letter["title"+n+"_"+w];
			if(con){
				animateTitleBounce(thisLetter, count*.2);
			}else{
				TweenMax.killTweensOf(thisLetter);
			}
			count++;
		}
	}
}

function animateTitleBounce(obj, delay){
	obj.scaleX = obj.scaleY = 1;
	TweenMax.to(obj, .2, {delay:delay, scaleX:1.2, scaleY:1.2, overwrite:true, onComplete:function(){
		TweenMax.to(obj, 1, {scaleX:1, scaleY:1, overwrite:true, ease: Elastic. easeOut.config(1, 0.3), onComplete:function(){
			animateTitleBounceComplete();
		}});
	}});
}

function animateTitleBounceComplete(){
	TweenMax.to(gameData, 3, {overwrite:true, ease:Linear.easeNone, onComplete:toggleAnimateTitle, onCompleteParams:[true]});
}

/*!
 * 
 * TOGGLE LETTERS - This is the function that runs to toggle letters
 * 
 */
function toggleType(){
	gameData.connect = gameData.connect == true ? false : true;
	displayTypename();
}

function displayTypename(){
	typeTxt.text = gameData.connect == false ? textDisplay.tapLetter : textDisplay.connectLetter;
}

function toggleCategory(con){
	if(con){
		gameData.categoryNum++;
		gameData.categoryNum = gameData.categoryNum >= category_arr.length ? category_arr.length-1 : gameData.categoryNum;
	}else{
		gameData.categoryNum--;
		gameData.categoryNum = gameData.categoryNum < 0 ? 0 : gameData.categoryNum++;
	}
	displayCategoryname();
}

function displayCategoryname(){
	letterTxt.text = category_arr[gameData.categoryNum].name;
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
	toggleAnimateTitle(false);

	var targetContainer = null;
	switch(page){
		case 'main':
			targetContainer = mainContainer;

			toggleMainButton("start");

			gameData.categoryNum = 0;
			displayCategoryname();

			buildGameTitle();
			toggleAnimateTitle(true);
		break;
		
		case 'game':
			targetContainer = gameContainer;
			startGame();
		break;
		
		case 'result':
			targetContainer = resultContainer;
			stopGame();
			togglePop(false);
			playSound('soundResult');

			resultWordTxt.text = textDisplay.resultWord.replace("[NUMBER]", playerData.word);
			resultTimerTxt.text = textDisplay.resultTimer.replace("[NUMBER]", millisecondsToTimeGame(timeData.timer));
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
	gameData.nextStage = false;
	gameStatusTxt.alpha = 0;

	playerData.score = 0;
	playerData.word = 0;
	tweenData.tweenScore = 0;

	updateGameWord();
	updateGameScore();
	setupGameStage();

	startLetters();
	if(gameData.connect){
		showGameStatus("connectword");
	}else{
		showGameStatus("enterword");
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

function resizeGameUI(){
	checkSolveWordsMeasure();

	if(viewport.isLandscape){
		scoreTxt.textAlign = "left";
		scoreTxt.x = offset.x + 50;
		scoreTxt.y = offset.y + 50;

		wordTxt.textAlign = "center";
		wordTxt.x = canvasW/2;
		wordTxt.y = offset.y + 50;

		wordContainer.x = linesContainer.x = canvasW/2;
		wordContainer.y = linesContainer.y = canvasH/100 * 47;
		var scaleNum = gameData.grid.h > 350 ? (350/gameData.grid.h) : 1;
		wordContainer.scaleX = wordContainer.scaleY = linesContainer.scaleX = linesContainer.scaleY = scaleNum;

		gameStatusTxt.x = canvasW/2;
		gameStatusTxt.y = canvasH/100 * 78;

		scoreCalculateTxt.x = canvasW/2;
		scoreCalculateTxt.y = canvasH/100 * 82;

		timerShape.x = timerShapeBg.x = (canvasW/2) - (gameSettings.timer.width/2);
		timerShape.y = timerShapeBg.y = canvasH/100 * 85;

		$.letter["reset"].x = canvasW/2 + 425;
		$.letter["reset"].y = canvasH/2 - 30;

		$.letter["clear"].x = canvasW/2 + 350;
		$.letter["clear"].y = canvasH/2 - 80;

		$.letter["enter"].x = canvasW/2 + 350;
		$.letter["enter"].y = canvasH/2 + 18;

		solveContainer.x = canvasW/2 - 370;
		solveContainer.y = (canvasH/100 * 45) - ((gameData.solveH/3) * scaleNum);
		solveContainer.scaleX = solveContainer.scaleY = scaleNum;
	}else{
		scoreTxt.textAlign = "left";
		scoreTxt.x = offset.x + 50;
		scoreTxt.y = offset.y + 50;

		wordTxt.textAlign = "left";
		wordTxt.x = offset.x + 50;
		wordTxt.y = offset.y + 90;

		wordContainer.x = linesContainer.x = canvasW/2;
		wordContainer.y = linesContainer.y = canvasH/100 * 35;
		var scaleNum = gameData.grid.h > 350 ? (350/gameData.grid.h) : 1;
		wordContainer.scaleX = wordContainer.scaleY = linesContainer.scaleX = linesContainer.scaleY = scaleNum;

		gameStatusTxt.x = canvasW/2;
		gameStatusTxt.y = canvasH/100 * 70;

		scoreCalculateTxt.x = canvasW/2;
		scoreCalculateTxt.y = canvasH/100 * 73;

		timerShape.x = timerShapeBg.x = (canvasW/2) - (gameSettings.timer.width/2);
		timerShape.y = timerShapeBg.y = canvasH/100 * 75;

		$.letter["reset"].x = canvasW/2;
		$.letter["reset"].y = canvasH/100 * 62;

		$.letter["enter"].x = canvasW/2 + 120;
		$.letter["enter"].y = canvasH/100 * 62;

		$.letter["clear"].x = canvasW/2 - 120;
		$.letter["clear"].y = canvasH/100 * 62;

		solveContainer.x = canvasW/2;
		solveContainer.y = canvasH/100 * 80;
		solveContainer.scaleX = solveContainer.scaleY = .7;
	}
}

/*!
 * 
 * GAME STAGE - This is the function that runs to setup and increase game stage
 * 
 */

function setupGameStage(){
	gameData.stage.timer = category_arr[gameData.categoryNum].timer;
	gameData.stage.count = 0;
	gameData.stage.layers = category_arr[gameData.categoryNum].layers;

	$.letter["reset"].visible = false;
	$.letter["reset"].noti.text = category_arr[gameData.categoryNum].reset;
	$.letter["reset"].visible = true;
	toggleHintButton("reset", true);
}

function increaseStage(){
	gameData.stage.timer -= category_arr[gameData.categoryNum].stage.timer;
	
	if(gameData.mode == "quick"){
		gameData.stage.count++;
		if(gameData.stage.count >= category_arr[gameData.categoryNum].stage.next){
			var newCategoryNum = gameData.categoryNum;
			newCategoryNum++;
			newCategoryNum = newCategoryNum > category_arr.length-1 ? category_arr.length-1 : newCategoryNum;
			if(newCategoryNum != gameData.categoryNum){
				gameData.categoryNum = newCategoryNum;
				gameData.nextStage = true;
				setupGameStage();
			}
		}
	}
}

/*!
 * 
 * BUILD LETTER - This is the function that runs to build letter
 * 
 */
function startLetters(){
	playSound("soundStart");
	buildLetters();

	toggleGameTimer(true);
	toggleGameSessionTimer(true);
	checkPossibleWord();
	tryNewWord();
}

function buildLetters(){
	wordContainer.removeAllChildren();

	gameData.grid = {r:7, c:7, w:0, h:0};
	var letterCount = 0;
	var pos = {x:0, y:0, startX:0, startY:0, spaceX:gameSettings.letter.spaceX, spaceY:gameSettings.letter.spaceY, size:gameSettings.letter.size * 1.5};

	gameData.grid.w = (pos.size) * (gameData.grid.c-1);
	gameData.grid.w += pos.spaceX * (gameData.grid.c-1);
	pos.startX = -(gameData.grid.w/2);

	gameData.grid.h = (pos.size) * (gameData.grid.r-1);
	gameData.grid.h += pos.spaceY * (gameData.grid.r-1);
	pos.startY = -(gameData.grid.h/2);
	pos.startY -= pos.size/1.5;

	pos.x = pos.startX;
	pos.y = pos.startY;

	var lettersArr = [];
	if(gameData.stage.layers == 1){
		lettersArr = [17,23,24,25,30,31,32];
		gameData.grid.h = (pos.size) * (2);
		gameData.grid.h += pos.spaceY * (2);
	}else if(gameData.stage.layers == 2){
		lettersArr = [10,15,16,17,18,19,22,23,24,25,26,29,30,31,32,33,37,38,39];
		gameData.grid.h = (pos.size) * (4);
		gameData.grid.h += pos.spaceY * (4);
	}else if(gameData.stage.layers == 3){
		lettersArr = [3,8,9,10,11,12,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,44,45,46];
		gameData.grid.h = (pos.size) * (6);
		gameData.grid.h += pos.spaceY * (6);
	}

	gameData.buttons = [];
	for(var r=0; r<gameData.grid.r; r++){
		for(var c=0; c<gameData.grid.c; c++){
			buildHexagonShape(r+'_'+c, "", "word");
			$.letter[r+'_'+c].visible = false;

			if(lettersArr.indexOf(letterCount) != -1){
				$.letter[r+'_'+c].visible = true;
				$.letter[r+'_'+c].x = pos.x;
				$.letter[r+'_'+c].y = pos.y;
				$.letter[r+'_'+c].row = r;
				$.letter[r+'_'+c].column = c;
			
				if(!isEven(c)){
					$.letter[r+'_'+c].y += pos.size/1.5;
				}

				$.letter[r+'_'+c].oriX = $.letter[r+'_'+c].x;
				$.letter[r+'_'+c].oriY = $.letter[r+'_'+c].y;

				$.letter[r+'_'+c].active = false;
				$.letter[r+'_'+c].cursor = "pointer";

				if(gameData.connect){
					$.letter[r+'_'+c].addEventListener("mousedown", function(evt) {
						if(!gameData.complete && !evt.currentTarget.active){
							activeLetter(evt.currentTarget);
							startLetterConnect(evt.currentTarget);
						}
					});
				}else{
					$.letter[r+'_'+c].addEventListener("click", function(evt) {
						if(!gameData.complete && !evt.currentTarget.active){
							activeLetter(evt.currentTarget);
						}
					});
				}

				var delay = randomIntFromInterval(0,3) * .1;
				$.letter[r+'_'+c].scaleX = $.letter[r+'_'+c].scaleY = 0;
				TweenMax.to($.letter[r+'_'+c], .5, {delay:delay, scaleX:1, scaleY:1, overwrite:true});
				gameData.buttons.push($.letter[r+'_'+c]);
			}
			pos.x += pos.size + pos.spaceX;
			letterCount++;
		}
		pos.x = pos.startX;
		pos.y += pos.size + pos.spaceY;
	}

	scoreCalculateTxt.alpha = 0;
	gameData.shake = false;
	gameData.complete = false;
	timeData.countdown = gameData.stage.timer;

	if(gameData.connect){
		$.letter["clear"].visible = false;
		$.letter["enter"].visible = false;
	}else{
		$.letter["clear"].visible = true;
		$.letter["enter"].visible = true;
	}

	resizeGameUI();
	fillLetters(lettersArr.length);
	resetLetters();
	buildSolveWords();
}

function activeLetter(letter){
	var randomNum = Math.floor(Math.random()*3)+1;
	playSound('soundPop'+randomNum);

	animateBounce(letter, gameSettings.letter.focusBounceSpeed);
	gameData.currentWord += letter.letter.text.toLowerCase();
	letter.active = true;

	letter.shape.fillCommand.style = gameSettings.letter.activeColor;
	letter.shapeShadow.fillCommand.style = gameSettings.letter.activeColor;

	if(gameData.connect){

	}else{
		letter.seqShape.visible = true;
		letter.seq.text = gameData.currentWord.length;
	}
}

function fillLetters(length){
	gameData.solve = [];

	if(gameData.connect){
		gameData.possibleWord = [];
		var categoryLettersArr = [];
		var maxWords = 5;
		if(gameData.stage.layers == 1){
			categoryLettersArr = [3,4];
		}else if(gameData.stage.layers == 2){
			categoryLettersArr = [3,4,5];
		}else if(gameData.stage.layers == 3){
			categoryLettersArr = [3,4,5,6];
		}
		
		//get fill words
		var fillWords = [];
		for(var n=0; n<categoryLettersArr.length; n++){
			var currentLetter = categoryLettersArr[n];
			for(var d=0; d<dictionary_arr.length; d++){
				if(currentLetter == dictionary_arr[d].letters){
					shuffle(gameData.words[d]);
					for(var w=0; w<maxWords; w++){
						if(w < gameData.words[d].length){
							fillWords.push(gameData.words[d][w]);
						}
					}
				}
			}
		}

		shuffle(fillWords);
		
		//fill letters
		var maxAttempts = 3;
		for(var n=0; n<fillWords.length; n++){
			for(var a=0; a<maxAttempts; a++){
				//find blanks
				var blanksArr = [];
				for(var b=0; b<gameData.buttons.length; b++){
					var thisButton = gameData.buttons[b];
					if(thisButton.letter.text == ""){
						blanksArr.push(thisButton);
					}
				}
				shuffle(blanksArr);

				//find possible move
				var thisWord = fillWords[n];
				if(blanksArr.length >= thisWord.length){
					var fillArr = [];
					fillArr.push(blanksArr[0]);
					
					for(var w=0; w<thisWord.length-1; w++){
						var nextMoveArr = [];
						for(var m=0; m<6; m++){
							var nextRow = fillArr[w].row;
							var nextColumn = fillArr[w].column;

							if(m == 0){
								nextRow--;
							}else if(m == 1){
								nextRow++;
							}else if(m == 2){
								nextColumn--;
							}else if(m == 3){
								nextColumn++;
							}else if(m == 4){
								if(!isEven(nextColumn)){
									nextRow++;
								}else{
									nextRow--;
								}
								nextColumn--;
							}else if(m == 5){
								if(!isEven(nextColumn)){
									nextRow++;
								}else{
									nextRow--;
								}
								nextColumn++;
							}

							if(nextRow >= 0 && nextRow < gameData.grid.r){
								if(nextColumn >= 0 && nextColumn < gameData.grid.c){
									if($.letter[nextRow+"_"+nextColumn].visible && $.letter[nextRow+"_"+nextColumn].letter.text == ""){
										if(fillArr.indexOf($.letter[nextRow+"_"+nextColumn]) == -1){
											nextMoveArr.push($.letter[nextRow+"_"+nextColumn]);
										}
									}
								}
							}
						}

						if(nextMoveArr.length == 0){
							//skip
							w = thisWord.length;
						}else{
							shuffle(nextMoveArr);						
							fillArr.push(nextMoveArr[0]);
						}
					}

					if(fillArr.length == thisWord.length){
						a = maxAttempts;

						gameData.possibleWord.push(thisWord);
						for(var f=0; f<thisWord.length; f++){
							fillArr[f].letter.text = thisWord.substring(f,f+1).toUpperCase();
						}
					}
				}
			}
		}

		//fill empty
		var extraLetters = gameSettings.letter.arr.slice();
		var extraLettersIndex = 0;
		shuffle(extraLetters);

		for(var n=0; n<gameData.buttons.length; n++){
			var thisLetter = gameData.buttons[n];
			if(thisLetter.letter.text == ""){
				thisLetter.letter.text = extraLetters[extraLettersIndex].toUpperCase();
				extraLettersIndex++;
			}
		}

		console.log(gameData.possibleWord);
	}else{
		//get first word
		if(gameData.wordIndex > gameData.words[gameData.categoryIndex].length){
			gameData.wordIndex = 0;
			shuffle(gameData.words[gameData.categoryIndex]);
		}
		gameData.word = gameData.words[gameData.categoryIndex][gameData.wordIndex].toUpperCase();
		gameData.wordIndex++;
		
		//suffle extra letters
		var extraLetters = gameSettings.letter.arr.slice();
		var extraLettersIndex = 0;
		shuffle(extraLetters);

		//generate letters
		gameData.letters = [];
		for(var n=0; n<gameData.word.length; n++){
			gameData.letters.push(gameData.word.substring(n,n+1).toLowerCase());
		}

		for(var n=gameData.letters.length; n<length; n++){
			gameData.letters.push(extraLetters[extraLettersIndex].toLowerCase());
			extraLettersIndex++;
			if(extraLettersIndex > extraLetters.length-1){
				extraLettersIndex = 0;
				shuffle(extraLetters);
			}
		}

		for(var n=0; n<gameData.buttons.length; n++){
			var thisLetter = gameData.buttons[n];
			thisLetter.letter.text = gameData.letters[n].toUpperCase();
		}
	}
}

function resetLetters(){
	linesContainer.removeAllChildren();

	gameData.currentWord = "";
	for(var n=0; n<gameData.buttons.length; n++){
		var thisLetter = gameData.buttons[n];

		if(thisLetter.active){
			thisLetter.scaleX = thisLetter.scaleY = 0;
			TweenMax.to(thisLetter, .5, {scaleX:1, scaleY:1, overwrite:true});
		}
		thisLetter.active = false;
		thisLetter.shape.fillCommand.style = gameSettings.letter.color;
		thisLetter.shapeShadow.fillCommand.style = gameSettings.letter.color;
		thisLetter.seqShape.visible = false;
		thisLetter.seq.text = "";

		thisLetter.dirShape.visible = false;
		thisLetter.dirIcon.visible = false;
	}
}

/*!
 * 
 * SETUP MOVE DIRECTION - This is the function that runs to setup move direction
 * 
 */
function startLetterConnect(letter){
	gameData.targetConnect = letter;
	setupMoveDirection();
}

function setupMoveDirection(){
	stage.addEventListener("pressmove", handlerMoveMethod);
	stage.addEventListener("pressup", handlerMoveMethod);
}

function removeMoveDirection(){
	stage.removeEventListener("pressmove", handlerMoveMethod);
	stage.removeEventListener("pressup", handlerMoveMethod);
}

function handlerMoveMethod(evt) {
	 switch (evt.type){			
		 case 'pressmove':
			var global = wordContainer.globalToLocal(evt.stageX, evt.stageY);
			
			for(var b=0; b<gameData.buttons.length; b++){
				var thisLetter = gameData.buttons[b];
				if(!thisLetter.active){
					var letterDistance = getDistance(gameData.targetConnect.x, gameData.targetConnect.y, thisLetter.x, thisLetter.y);
					if(letterDistance <= (gameSettings.letter.size) * 2.5){
						var connectDistance = getDistance(thisLetter.x, thisLetter.y, global.x, global.y);
						if(connectDistance <= (gameSettings.letter.size)){
							drawConnectLine(gameData.targetConnect, thisLetter);
							gameData.targetConnect = thisLetter;
							activeLetter(thisLetter);
						}
					}
				}
			}
		 break;
		 
		 case 'pressup':
			removeMoveDirection();
			checkConnectWord();
		 break;
	 }
}

function drawConnectLine(from ,to){
	var newLine = new createjs.Shape();	
	newLine.graphics.beginStroke(gameSettings.letter.strokeColor).setStrokeStyle(gameSettings.letter.stroke).mt(from.x, from.y).lt(to.x, to.y);
	linesContainer.addChild(newLine);

	var rotateNum = getDirection(from.x, from.y, to.x, to.y) + 90;
	var pos = getAnglePosition(0, 0, gameSettings.letter.size/1.2, rotateNum);

	from.dirShape.x = from.dirIcon.x = pos.x;
	from.dirShape.y = from.dirIcon.y = pos.y;
	from.dirIcon.rotation = rotateNum;
	from.dirShape.visible = true;
	from.dirIcon.visible = true;
}

/*!
 * 
 * SHUFFLE BUTTON - This is the function that runs to shuffle letter
 * 
 */
function shuffleLetter(){
	animateHintBounce($.letter["reset"]);
	buildLetters();
	checkPossibleWord();
	tryNewWord();
}

function toggleHintButton(type, con){
	if(con){
		$.letter[type].active = true;
		$.letter[type].shape.fillCommand.style = gameSettings.hint.color;
		$.letter[type].shapeShadow.fillCommand.style = gameSettings.hint.color;
	}else{
		$.letter[type].active = false;
		$.letter[type].shape.fillCommand.style = gameSettings.hint.disabledColor;
		$.letter[type].shapeShadow.fillCommand.style = gameSettings.hint.disabledColor;
	}
}

/*!
 * 
 * BUILD HEXA - This is the function that runs to build hexa shape
 * 
 */
function buildHexagonShape(n, text, type){
	$.letter[n] = new createjs.Container();

	var side = 6;
	var size = gameSettings.letter.size;
	var color = gameSettings.letter.color;
	var fontSize = gameSettings.letter.fontSize;
	var textColor = gameSettings.letter.textColor;
	var fontY = gameSettings.letter.fontY;
	var shadowY = gameSettings.letter.shadowY;
	var shadowScale = gameSettings.letter.shadowScale;
	var angle = 0;

	if(type == "reset"){
		size = gameSettings.hint.size;
		color = gameSettings.hint.color;
		fontSize = gameSettings.hint.fontSize;
		textColor = gameSettings.hint.textColor;
		fontY = gameSettings.hint.fontY;
		shadowY = gameSettings.hint.shadowY;
		shadowScale = gameSettings.hint.shadowScale;
	}else if(type == "title"){
		size = gameSettings.title.size;
		color = gameSettings.title.color;
		fontSize = gameSettings.title.fontSize;
		textColor = gameSettings.title.textColor;
		fontY = gameSettings.title.fontY;
		shadowY = gameSettings.title.shadowY;
		shadowScale = gameSettings.title.shadowScale;
	}else if(type == "enter" || type == "clear"){
		color = gameSettings.letter.activeColor;
	}
		
	var letterTxt = new createjs.Text();
	letterTxt.font = fontSize + "px comfortaabold";
	letterTxt.color = textColor;
	letterTxt.textAlign = "center";
	letterTxt.textBaseline='alphabetic';
	letterTxt.text = text;
	letterTxt.y = fontY;

	var newShape = new createjs.Shape();
	newShape.fillCommand = newShape.graphics.beginFill(color).command;
	newShape.graphics.drawPolyStar(0, 0, size, side, 0, angle);

	var newShapeShadow = new createjs.Shape();	
	newShapeShadow.fillCommand = newShapeShadow.graphics.beginFill(color).command;
	newShapeShadow.graphics.drawPolyStar(0, 0, size, side, 0, angle);
	newShapeShadow.y = shadowY;

	var newShapeShadowDim = new createjs.Shape();	
	newShapeShadowDim.graphics.beginFill("#000").drawPolyStar(0, 0, size, side, 0, angle);
	newShapeShadowDim.alpha = .5;
	newShapeShadowDim.y = shadowY;
	newShapeShadow.scaleX = newShapeShadow.scaleY = newShapeShadowDim.scaleX = newShapeShadowDim.scaleY = shadowScale;

	$.letter[n].shape = newShape;
	$.letter[n].shapeShadow = newShapeShadow;
	$.letter[n].letter = letterTxt;
	$.letter[n].addChild(newShapeShadow, newShapeShadowDim, newShape, letterTxt);

	if(type == "title"){
		titleContainer.addChild($.letter[n]);
	}else if(type == "word"){
		var newSeqShape = new createjs.Shape();
		var seqTxt = new createjs.Text();
		
		newSeqShape.fillCommand = newSeqShape.graphics.beginFill(gameSettings.letter.sequenceColor).command;
		newSeqShape.graphics.drawCircle(0,0,gameSettings.letter.sequenceSize);
		newSeqShape.y = (size/1.2);

		seqTxt.font = gameSettings.letter.sequenceFontSize + "px comfortaabold";
		seqTxt.color = textColor;
		seqTxt.textAlign = "center";
		seqTxt.textBaseline='alphabetic';
		seqTxt.text = "0";
		seqTxt.y = ((size/1.2));
		seqTxt.y += gameSettings.letter.sequenceFontY;

		$.letter[n].seq = seqTxt;
		$.letter[n].seqShape = newSeqShape;
		$.letter[n].addChild(newSeqShape, seqTxt);

		var newDirShape = new createjs.Shape();
		var buttonIcon = new createjs.Bitmap(loader.getResult('itemDir'));
		centerReg(buttonIcon);

		newDirShape.fillCommand = newDirShape.graphics.beginFill(gameSettings.letter.arrowColor).command;
		newDirShape.graphics.drawCircle(0,0,gameSettings.letter.arrowSize);

		$.letter[n].dirShape = newDirShape;
		$.letter[n].dirIcon = buttonIcon;
		$.letter[n].addChild(newDirShape, buttonIcon);

		wordContainer.addChild($.letter[n]);
	}else{
		var buttonIcon = new createjs.Bitmap(loader.getResult('buttonEnter'));
		if(type == "reset"){
			buttonIcon = new createjs.Bitmap(loader.getResult('buttonReset'));
		}else if(type == "clear"){
			buttonIcon = new createjs.Bitmap(loader.getResult('buttonClear'));
		}
		centerReg(buttonIcon);
		
		var newNotiShape = new createjs.Shape();
		var notiTxt = new createjs.Text();
		
		if(type == "reset"){
			newNotiShape.fillCommand = newNotiShape.graphics.beginFill(gameSettings.hint.notificationColor).command;
			newNotiShape.graphics.drawCircle(0,0,gameSettings.hint.notificationSize);
			newNotiShape.x = size/2.5;
			newNotiShape.y = -(size/1.2);

			notiTxt.font = gameSettings.hint.notificationFontSize + "px comfortaabold";
			notiTxt.color = textColor;
			notiTxt.textAlign = "center";
			notiTxt.textBaseline='alphabetic';
			notiTxt.text = "0";
			notiTxt.x = size/2.5;
			notiTxt.y = -((size/1.2));
			notiTxt.y += gameSettings.hint.notificationFontY;

			$.letter[n].noti = notiTxt;
		}
		
		$.letter[n].addChild(buttonIcon);
		gameContainer.addChild($.letter[n]);
	}
}

/*!
 * 
 * CHECK WORD - This is the function that runs to check word
 * 
 */
function checkLetterWord(){
	if(gameData.currentWord == ""){
		showGameStatus("enterword");
		return;
	}

	var solveIndex = gameData.solve.indexOf(gameData.currentWord);
	if(solveIndex == -1){
		var foundWord = false;
		for(var n=0; n<gameData.possibleWord.length; n++){
			if(gameData.currentWord == gameData.possibleWord[n]){
				foundWord = true;
				foundLetterWord();
			}
		}

		if(!foundWord){
			showGameStatus("error");
			playSound('soundError');

			gameData.shake = true;
			TweenMax.to(wordContainer, .5, {overwrite:true, onComplete:function(){
				resetLetters();
				gameData.shake = false;
			}});
		}
	}else{
		playSound('soundError2');
		showGameStatus("exist");
		resetLetters();
	}
}

function checkConnectWord(){
	var solveIndex = gameData.solve.indexOf(gameData.currentWord);
	if(solveIndex == -1){
		var foundWord = false;
		for(var n=0; n<gameData.possibleWord.length; n++){
			if(gameData.currentWord == gameData.possibleWord[n]){
				foundWord = true;
				foundLetterWord();
			}
		}

		if(!foundWord){
			for(var d=0; d<dictionary_arr.length; d++){
				if(gameData.currentWord.length == dictionary_arr[d].letters){
					if(gameData.words[d].indexOf(gameData.currentWord) != -1){
						foundWord = true;
						foundLetterWord();
					}
				}
			}

			if(!foundWord){
				showGameStatus("error");
				playSound('soundError');

				gameData.shake = true;
				TweenMax.to(wordContainer, .5, {overwrite:true, onComplete:function(){
					resetLetters();
					gameData.shake = false;
				}});
			}
		}
	}else{
		playSound('soundError2');
		showGameStatus("exist");
		resetLetters();
	}
}

function foundLetterWord(){
	playerData.word++;
	gameData.solve.push(gameData.currentWord);
	if(gameData.solve.length > 35){
		gameData.solve.splice(0,1);
	}
	gameData.complete = true;
	showGameStatus("complete");
	toggleGameSessionTimer(false);
	playSound('soundComplete');

	scoreCalculateTxt.text = textDisplay.pointplus.replace("[NUMBER]", 0);
	scoreCalculateTxt.alpha = 0;
	TweenMax.to(scoreCalculateTxt, 1, {alpha:1, overwrite:true});
	calculateScore();

	for(var b=0; b<gameData.buttons.length; b++){
		var thisLetter = gameData.buttons[b];
		if(thisLetter.active){
			animateBounce(thisLetter, gameSettings.letter.correctBounceSpeed);
		}
	}
}

/*!
 * 
 * BUILD SOLVE WORD - This is the function that runs to build solve word
 * 
 */
function buildSolveWords(){
	solveContainer.removeAllChildren();

	for(var n=0; n<gameData.solve.length; n++){
		$.words[n] = new createjs.Text();
		$.words[n].font = gameSettings.solve.fontSize + "px comfortaabold";
		$.words[n].color = gameSettings.solve.color;
		$.words[n].textAlign = "center";
		$.words[n].textBaseline='middle';
		$.words[n].text = gameData.solve[n].toUpperCase();
		$.words[n].tween = {x:0, y:0};
		solveContainer.addChild($.words[n]);
	}
	checkSolveWordsMeasure();
}

function checkSolveWordsMeasure(){
	var totalW = 0;
	var wordArray = [];
	var posY = 0;
	var adjust = false;
	var targetWidth = viewport.isLandscape ? 250 : 700;
	
	for(var n=0; n<gameData.solve.length; n++){
		adjust = false;
		wordArray.push(n);
		if(n<gameData.solve.length-1){
			totalW += Math.round($.words[n].getMeasuredWidth()/2);
			totalW += Math.round($.words[n+1].getMeasuredWidth()/2);
			totalW += gameSettings.solve.spaceX;
		}

		if(n == gameData.solve.length-1){
			adjust = true;
		}else if(totalW > targetWidth){
			adjust = true;
		}

		if(adjust){
			if(n != gameData.solve.length-1){
				wordArray.splice(wordArray.length-1,1);
			}
			adjustSolveWords(wordArray, posY);

			wordArray = [];
			wordArray.push(n);
			posY += gameSettings.solve.spaceY;

			//reset
			totalW = 0;
			if(n<gameData.solve.length-1){
				totalW += Math.round($.words[n].getMeasuredWidth()/2);
				totalW += Math.round($.words[n+1].getMeasuredWidth()/2);
				totalW += gameSettings.solve.spaceX;
			}
		}
	}

	gameData.solveH = posY;
}

function adjustSolveWords(array, posY){
	var pos = {x:0, y:posY};
	var totalW = 0;

	for(var n=0; n<array.length; n++){
		if(n == 0){
			pos.x += Math.round($.words[array[n]].getMeasuredWidth()/2);
		}
		$.words[array[n]].x = pos.x;
		$.words[array[n]].y = pos.y;

		if(n<array.length-1){
			pos.x += Math.round($.words[array[n]].getMeasuredWidth()/2);
			pos.x += Math.round($.words[array[n+1]].getMeasuredWidth()/2);
			pos.x += gameSettings.solve.spaceX;
		}

		if(n == array.length-1){
			pos.x += Math.round($.words[array[n]].getMeasuredWidth()/2);
		}
	}

	totalW = (pos.x/2);
	for(var n=0; n<array.length; n++){
		$.words[array[n]].x -= totalW;
	}
}

/*!
 * 
 * ANIMATION WORD - This is the function that runs to animate word
 * 
 */
function animateBounce(obj, speed){
	TweenMax.to(obj, speed, {scaleX:1.2, scaleY:1.2, overwrite:true, onComplete:function(){
		TweenMax.to(obj, speed, {scaleX:1, scaleY:1, overwrite:true, onComplete:function(){
			
		}});
	}});
}

function animateHintBounce(obj){
	obj.scaleX = obj.scaleY = .5;
	TweenMax.to(obj, .2, {scaleX:1, scaleY:1, overwrite:true, onComplete:function(){
			
	}});
}

function animateBlink(obj){
	var tweenSpeed = .5;
	obj.alpha = 0;
	TweenMax.to(obj, tweenSpeed, {alpha:1, overwrite:true, onComplete:function(){
		TweenMax.to(obj, tweenSpeed, {alpha:0, overwrite:true, onComplete:animateBlink, onCompleteParams:[obj]});
	}});
}

/*!
 * 
 * POSSIBLE WORD - This is the function that runs to check possible word
 * 
 */
function checkPossibleWord(){
	if(gameData.connect){
		return;
	}

	gameData.possibleWord = [];
	for(var n=0; n<gameData.words.length; n++){
		for(var i=0; i<gameData.words[n].length; i++){
			var thisWord = gameData.words[n][i];

			var checkLetters = gameData.letters.slice();
			var letterCount = 0;

			for(var w=0; w<thisWord.length; w++){
				var thisLetter = thisWord.substring(w,w+1);
				var letterIndex = checkLetters.indexOf(thisLetter);
				if(letterIndex != -1){
					checkLetters.splice(letterIndex,1);
					letterCount++;
				}
			}

			if(letterCount == thisWord.length){
				gameData.possibleWord.push(thisWord);
			}
		}
	}
	console.log(gameData.possibleWord);
}

function tryNewWord(){
	if(gameData.possibleWord.length == 0){
		startLetters();
	}else if(gameData.possibleWord.length == gameData.solve.length){
		startLetters();
	}
}

/*!
 * 
 * NEXT WORD - This is the function that runs to proceed next word
 * 
 */
function proceedNext(){
	increaseStage();

	var tween = 1;
	var nextStageCon = "word";
	if(gameData.nextStage){
		nextStageCon = "stage";
		tween = 3;
		gameData.nextStage = false;
		showGameStatus("stage");
		playSound('soundClear');
	}else{
		gameData.complete = false;
		if(gameData.possibleWord.length == gameData.solve.length){
			gameData.complete = true;
		}
	}

	TweenMax.to(gameContainer, tween, {overwrite:true, onComplete:function(){
		scoreCalculateTxt.text = "";
		if(nextStageCon == "word"){
			if(gameData.possibleWord.length == gameData.solve.length){
				showGameStatus("nomoreword");
				TweenMax.to(wordContainer, 2, {overwrite:true, onComplete:function(){
					tryNewWord();
				}});
			}else{
				timeData.countdown = gameData.stage.timer;
				toggleGameSessionTimer(true);
			}
		}else{
			startLetters();
		}
	}});
}

/*!
 * 
 * GAME TIMER - This is the function that runs for game timer
 * 
 */
function toggleGameTimer(con){	
	if(con){
		timeData.startDate = new Date();
	}else{
		
	}
	timeData.enable = con;
}

function toggleGameSessionTimer(con){	
	if(con){
		timerShape.alpha = 1;
		timeData.oldTimer = -1;
		timeData.accumulate = 0;
		timeData.sessionDate = new Date();
	}else{
		timeData.accumulate = timeData.countdown - timeData.sessionTimer;
	}
	timeData.enable = con;
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
			timeData.timer = (timeData.elapsedTime);

			timeData.elapsedTime = Math.floor((timeData.nowDate.getTime() - timeData.sessionDate.getTime()));
			timeData.sessionTimer = Math.floor((timeData.countdown) - (timeData.elapsedTime));

			if(timeData.oldTimer == -1){
				timeData.oldTimer = timeData.sessionTimer;
			}
			
			if(timeData.sessionTimer <= 0){
				//stop
				timeData.sessionTimer = 0;
				playSound('soundTimerEnd');
				showGameStatus("timesup");
				endGame();
			}else{
				if((timeData.oldTimer - timeData.sessionTimer) > 1000){
					if(timeData.sessionTimer < 5000){
						timerShape.alpha = .5;
						TweenMax.to(timerShape, .3, {alpha:1});
						timerShapeBg.alpha = 0;
						TweenMax.to(timerShapeBg, .3, {alpha:.3});
						playSound('soundTimer');
					}
					timeData.oldTimer = timeData.sessionTimer;
				}
			}
			updateTimerBar();
		}

		for(var n=0; n<gameData.buttons.length; n++){
			var thisButton = gameData.buttons[n];
			if(gameData.shake && thisButton.active){
				var rangeX = randomIntFromInterval(-5,5);
				var rangeY = randomIntFromInterval(-5,5);
				thisButton.x = thisButton.oriX + rangeX;
				thisButton.y = thisButton.oriY + rangeY;
			}else{
				thisButton.x = thisButton.oriX;
				thisButton.y = thisButton.oriY;
			}
		}
	}
}

function updateTimerBar(){
	timerShape.graphics.clear();
	timerShape.graphics.beginFill(gameSettings.timer.color);
	
	timerShapeBg.graphics.clear();
	timerShapeBg.graphics.beginFill(gameSettings.timer.color);
	timerShapeBg.alpha = .3;
	
	var totalW = timeData.sessionTimer/timeData.countdown * gameSettings.timer.width;
	totalW = totalW < 5 ? 5 : totalW;
	var radius = gameSettings.timer.radius;
	timerShape.graphics.drawRoundRectComplex(0, 0, totalW, gameSettings.timer.height, radius, radius, radius, radius);
	timerShapeBg.graphics.drawRoundRectComplex(0, 0, gameSettings.timer.width, gameSettings.timer.height, radius, radius, radius, radius);
}

/*!
 * 
 * GAME SCORE - This is the function that runs to show game score
 * 
 */
function calculateScore(){
	playSound('soundScore');
	var scorePercentage = category_arr[gameData.categoryNum].score/gameData.stage.timer;
	TweenMax.to(timeData, gameSettings.score.speed, {sessionTimer:0, overwrite:true, onUpdate:function(){
		var calTimer = timeData.countdown - timeData.sessionTimer;
		var totalScore = Math.floor((calTimer - timeData.accumulate) * scorePercentage);
		scoreCalculateTxt.text = textDisplay.pointplus.replace("[NUMBER]", addCommas(totalScore));
		updateTimerBar();
	}, onComplete:function(){
		var calTimer = timeData.countdown - timeData.sessionTimer;
		var totalScore = Math.floor((calTimer - timeData.accumulate) * scorePercentage);
		playerData.score += totalScore;
		
		buildSolveWords();
		resetLetters();
		updateGameWord();
		updateGameScore();
		proceedNext();
	}});
}

function updateGameScore(){
	TweenMax.to(tweenData, .5, {tweenScore:playerData.score, overwrite:true, onUpdate:function(){
		scoreTxt.text = textDisplay.pointDisplay.replace("[NUMBER]", addCommas(Math.floor(tweenData.tweenScore)));
	}});
}

function updateGameWord(){
	wordTxt.text = textDisplay.wordDisplay.replace("[NUMBER]", playerData.word);
}

/*!
 * 
 * GAME STATUS - This is the function that runs to show game status
 * 
 */
function showGameStatus(con){
	var delay = 2;
	if(con == 'enterword'){
		delay = 3;
		gameStatusTxt.text = textDisplay.enterWord;
	}else if(con == 'connectword'){
		delay = 3;
		gameStatusTxt.text = textDisplay.connectWord;
	}else if(con == 'timesup'){
		gameStatusTxt.text = textDisplay.timesup;
	}else if(con == 'stage'){
		gameStatusTxt.text = textDisplay.nextstage;
	}else if(con == 'error'){
		gameStatusTxt.text = textDisplay.noWord;
	}else if(con == 'exist'){
		gameStatusTxt.text = textDisplay.wordExist;
	}else if(con == 'complete'){
		var randomComplete = Math.floor(Math.random() * textDisplay.completeWord.length)
		gameStatusTxt.text = textDisplay.completeWord[randomComplete];
	}else if(con == 'nomoreword'){
		delay = 1;
		gameStatusTxt.text = textDisplay.noPossibleWord;
	}

	gameStatusTxt.alpha = 0;
	TweenMax.to(gameStatusTxt, .5, {alpha:1, overwrite:true, onComplete:function(){
		TweenMax.to(gameStatusTxt, .5, {delay:delay, alpha:0, overwrite:true});
	}});
}

/*!
 * 
 * END GAME - This is the function that runs for game end
 * 
 */
function endGame(){
	gameData.paused = true;
	removeMoveDirection();
	toggleGameSessionTimer(false);
	toggleGameTimer(false);
	
	$.letter["reset"].visible = false;
	$.letter["clear"].visible = false;
	$.letter["enter"].visible = false;
	TweenMax.to(gameContainer, 3, {overwrite:true, onComplete:function(){
		goPage('result');
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

function loadJSON(){
	buttonStart.visible = false;
	buttonCategory.visible = false;
	loadingTxt.visible = true;

	loopJSONFile();
}

function loopJSONFile(){
	$.getJSON(dictionary_arr[gameData.dictionaryNum].file, function(data){
		gameData.words.push([]);
		gameData.words[gameData.dictionaryNum] = data;

		gameData.dictionaryNum++;
		if(gameData.dictionaryNum < dictionary_arr.length){
			loopJSONFile();
		}else{
			for(var n=0; n<dictionary_arr.length; n++){
				shuffle(gameData.words[n]);
			}
			gameData.dictionaryNum = 0;
			buttonStart.visible = true;
			buttonCategory.visible = true;
			loadingTxt.visible = false;
			goPage("main");
		}
	}).fail(function(){
		//console.log("An error has occurred.");
	});
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
	
	window.open(shareurl);
}