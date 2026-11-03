////////////////////////////////////////////////////////////
// GAME v1.4
////////////////////////////////////////////////////////////

/*!
 * 
 * GAME SETTING CUSTOMIZATION START
 * 
 */

//words array
var words_arr = [
	{
		file:'3letters.json',
		name:'3 LETTERS',
		letters:3,
		radius:70,
		score:100,
		timer:30000,
		hint:0,
		stage:{
			next:5,
			timer:3000
		}
	},
	{
		file:'4letters.json',
		name:'4 LETTERS',
		letters:4,
		radius:80,
		score:200,
		timer:40000,
		hint:1,
		stage:{
			next:4,
			timer:2000
		}
	},
	{
		file:'5letters.json',
		name:'5 LETTERS',
		letters:5,
		radius:90,
		score:300,
		timer:50000,
		hint:2,
		stage:{
			next:3,
			timer:1000
		}
	},
	{
		file:'6letters.json',
		name:'6 LETTERS',
		letters:6,
		radius:100,
		score:400,
		timer:60000,
		hint:3,
		stage:{
			next:3,
			timer:1000
		}
	},
];

//word settings
var gameSettings = {
	title:{
		name:["CIRCLE","WORD"],
		radius:50,
		shadowY:10,
		fontSize:55,
		textColor:"#fff",
		fontY:20
	},
	letters:{
		radius:40,
		shadowY:10,
		fontSize:50,
		colors:["#1ABC9C","#2ECC71","#3498DB","#E67E22","#F1C40F","#E67E22","#D90000"],
		textColor:"#fff",
		fontY:20,
		angleSpeed:30,
	},
	word:{
		x:0,
		y:-240,
		formY:60,
		space:20,
		speed:.3,
		revertSpeed:.3
	},
	timer:{
		color:"#fff",
		radius:170,
		stroke:10,
	},
	score:{
		speed:1
	},
	keyboard:["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"],
}

//game test display
var textDisplay = {
					loading:'LOADING WORDS...',
					point:'[NUMBER]PTS',
					pointplus:'+[NUMBER]PTS',
					pointDisplay:'SCORE : [NUMBER]PTS',
					timesup:"TIME\'S UP!",
					nextstage:"NEXT STAGE!",
					exitTitle:'EXIT GAME',
					exitMessage:'ARE YOU SURE\nYOU WANT TO\nQUIT THE GAME?',
					share:'SHARE YOUR SCORE',
					resultTitle:'GAME OVER',
					resultTimer:'TIME : [NUMBER]',
					resultDesc:'SCORE : [NUMBER]PTS'
				}

//Social share, [SCORE] will replace with game score
var shareEnable = false; //toggle share
var shareTitle = 'Highscore on Circle Word is [SCORE]PTS';//social share score title
var shareMessage = '[SCORE]PTS is mine new highscore on Circle Word Game game! Try it now!'; //social share score message

/*!
 *
 * GAME SETTING CUSTOMIZATION END
 *
 */
$.editor = {enable:false};
var playerData = {score:0, scores:[]};
var gameData = {paused:true, mode:"quick", wordNum:0, colors:[], colorIndex:0, wordIndex:0, words:[], word:'', wordArr:[], stage:{timer:0, count:0}, angle:0, letters:0, shake:false, hint:false, showHint:false, nextStage:false, complete:false};
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
	if($.browser.mobile || isTablet){

	}else{
		var isInIframe = (window.location != window.parent.location) ? true : false;
		if(isInIframe){
			this.document.onkeydown = keydown;
			this.document.onkeyup = keyup;
		
			$(window).blur(function() {
				appendFocusFrame();
			});
			appendFocusFrame();
        }else{
            this.document.onkeydown = keydown;
			this.document.onkeyup = keyup;
        }
	}

	buttonStart.cursor = "pointer";
	buttonStart.addEventListener("click", function(evt) {
		playSound('soundButton');
		gameData.mode = "quick";
		goPage('game');
	});

	buttonCategory.cursor = "pointer";
	buttonCategory.addEventListener("click", function(evt) {
		playSound('soundButton');
		gameData.mode = "category";
		buttonStart.visible = false;
		buttonCategory.visible = false;
		selectContainer.visible = true;
	});

	buttonLetter.cursor = "pointer";
	buttonLetter.addEventListener("click", function(evt) {
		playSound('soundButton');
		goPage('game');
	});

	buttonArrowL.cursor = "pointer";
	buttonArrowL.addEventListener("click", function(evt) {
		playSound('soundButton');
		toggleLetters(false);
	});

	buttonArrowR.cursor = "pointer";
	buttonArrowR.addEventListener("click", function(evt) {
		playSound('soundButton');
		toggleLetters(true);
	});

	$.letter["hint"].cursor = "pointer";
	$.letter["hint"].addEventListener("click", function(evt) {
		playSound('soundButton');
		showGameHint();
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

	displayWordName();
	preventScrolling();
}

function preventScrolling(){
	var keys = [32,38,37,40,39];
    $(window).on( "keydown", function(event) {
      if(keys.indexOf(event.keyCode) != -1){
        event.preventDefault();
      }
    });
}

/*!
 * 
 * GAME TITLE - This is the function that runs to build game title
 * 
 */
function buildGameTitle(){
	titleContainer.removeAllChildren();
	shuffle(gameData.colors);

	var totalW = 0;
	var totalH = 0;
	var startX = 0;
	var startY = 0;
	var pos = {x:0, y:0};
	if(gameSettings.title.name.length > 1){
		totalH = (gameSettings.title.radius*2.3) * (gameSettings.title.name.length-1);
		totalH += gameSettings.word.space * (gameSettings.title.name.length-1);
		pos.y = startY - (totalH/2);
	}

	for(var n=0; n<gameSettings.title.name.length; n++){
		var curWord = gameSettings.title.name[n];

		totalW = 0;
		startX = 0;
		if(gameSettings.title.name[n].length > 1){
			totalW = (gameSettings.title.radius*2) * (gameSettings.title.name[n].length-1);
			totalW += gameSettings.word.space * (gameSettings.title.name[n].length-1);
			pos.x = startX - (totalW/2);
		}
		
		for(var w=0; w<curWord.length; w++){
			buildCircleShape("title"+n+"_"+w, curWord.substring(w,w+1), "title");
			
			$.letter["title"+n+"_"+w].x = $.letter["title"+n+"_"+w].oriX = pos.x;
			$.letter["title"+n+"_"+w].y = $.letter["title"+n+"_"+w].oriY = pos.y;
			pos.x += (gameSettings.word.space) + (gameSettings.title.radius*2);
		}

		gameData.colorIndex++;
		if(gameData.colorIndex > gameData.colors.length-1){
			gameData.colorIndex = 0;
			shuffle(gameData.colors);
		}
		
		pos.y += (gameSettings.word.space) + (gameSettings.title.radius*2.3);
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
	TweenMax.to(obj, .2, {delay:delay, y:obj.oriY-20, overwrite:true, onComplete:function(){
		TweenMax.to(obj, 1, {y:obj.oriY, overwrite:true, ease: Elastic. easeOut.config(1, 0.3), onComplete:function(){
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
function toggleLetters(con){
	if(con){
		gameData.wordNum++;
		gameData.wordNum = gameData.wordNum >= words_arr.length ? words_arr.length-1 : gameData.wordNum;
	}else{
		gameData.wordNum--;
		gameData.wordNum = gameData.wordNum < 0 ? 0 : gameData.wordNum++;
	}

	displayWordName();
}

function displayWordName(){
	letterTxt.text = words_arr[gameData.wordNum].name;
}

function appendFocusFrame(){
	$('#mainHolder').prepend('<div id="focus" style="position:absolute; width:100%; height:100%; z-index:1000;"></div');
	$('#focus').click(function(){
		$('#focus').remove();
	});	
}


/*!
 * 
 * KEYBOARD EVENTS - This is the function that runs for keyboard events
 * 
 */
function keydown(event) {
	var letter = String.fromCharCode(event.which);

	matchKeyboard(letter.toLowerCase());
}

function keyup(event) {

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

			buttonStart.visible = true;
			buttonCategory.visible = true;
			selectContainer.visible = false;

			gameData.wordNum = 0;
			displayWordName();
			
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
	tweenData.tweenScore = 0;

	gameData.colorIndex = 0;
	shuffle(gameData.colors);
	updateGameScore();
	setupGameStage();

	toggleGameTimer(true);
	buildLetters();
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

function resizeGameScore(){
	scoreTxt.textAlign = "left";
	scoreTxt.x = offset.x + 50;
	scoreTxt.y = offset.y + 50;

	$.letter["hint"].x = canvasW/100 * 80;
	$.letter["hint"].y = canvasH/2;

	if(!viewport.isLandscape){
		scoreTxt.textAlign = "center";
		scoreTxt.x = canvasW/2;

		$.letter["hint"].x = canvasW/2;
		$.letter["hint"].y = canvasH/100 * 80;
	}
}

/*!
 * 
 * GAME STAGE - This is the function that runs to setup and increase game stage
 * 
 */

function setupGameStage(){
	gameData.stage.timer = words_arr[gameData.wordNum].timer;
	gameData.stage.count = 0;
}

function increaseStage(){
	gameData.stage.timer -= words_arr[gameData.wordNum].stage.timer;
	
	if(gameData.mode == "quick"){
		gameData.stage.count++;
		if(gameData.stage.count >= words_arr[gameData.wordNum].stage.next){
			var newWordNum = gameData.wordNum;
			newWordNum++;
			newWordNum = newWordNum > words_arr.length-1 ? words_arr.length-1 : newWordNum;
			if(newWordNum != gameData.wordNum){
				gameData.wordNum = newWordNum;
				gameData.nextStage = true;
				setupGameStage();
			}
		}
	}
}

/*!
 * 
 * BUILD LETTERS - This is the function that runs to build letters
 * 
 */
function buildLetters(){
	lettersContainer.removeAllChildren();

	if(gameData.wordIndex > gameData.words[gameData.wordNum].length){
		gameData.wordIndex = 0;
		shuffle(gameData.words[gameData.wordNum]);
	}

	gameData.word = gameData.words[gameData.wordNum][gameData.wordIndex];
	gameData.wordIndex++;

	var randomLetter = [];
	for(var n=0; n<gameData.word.length; n++){
		randomLetter.push(gameData.word.substring(n,n+1));
	}
	console.log(gameData.word);

	shuffle(randomLetter);
	var angleNum = 360/gameData.word.length;
	for(var n=0; n<gameData.word.length; n++){
		buildCircleShape(n, randomLetter[n].toUpperCase(), "game");

		$.letter[n].index = n;
		$.letter[n].active = false;
		$.letter[n].letter = randomLetter[n].toLocaleLowerCase();
		$.letter[n].moveRadius = 0;
		$.letter[n].angle = (angleNum * n) - 90;

		$.letter[n].cursor = "pointer";
		$.letter[n].addEventListener("click", function(evt) {
			if(gameData.animating){
				return;
			}

			if(!evt.currentTarget.active){
				formLetter(evt.currentTarget.index);
			}else{
				revertLetter(evt.currentTarget.index);
			}
		});
	}

	$.letter["hint"].shape.fillCommand.style = gameData.colors[gameData.colorIndex];
	$.letter["hint"].shapeShadow.fillCommand.style = gameData.colors[gameData.colorIndex];

	gameData.colorIndex++;
	if(gameData.colorIndex > gameData.colors.length-1){
		gameData.colorIndex = 0;
		shuffle(gameData.colors);
	}

	$.letter["hint"].visible = false;
	gameData.animating = false;
	gameData.hint = false;
	gameData.showHint = false;
	gameData.shake = false;
	gameData.wordArr = [];
	gameData.angle = 0;
	startAnimateScale();
	startAnimateAngle();
	toggleWordPos();
	playSound('soundStart');
	
	timeData.countdown = gameData.stage.timer;
	toggleGameSessionTimer(true);
}

/*!
 * 
 * BUILD CIRCLE - This is the function that runs to build circle shape
 * 
 */
function buildCircleShape(n, text, type){
	$.letter[n] = new createjs.Container();

	var fontSize = gameSettings.letters.fontSize;
	var textColor = gameSettings.letters.textColor;
	var fontY = gameSettings.letters.fontY;
	var radius = gameSettings.letters.radius;
	var shadowY = gameSettings.letters.shadowY;

	if(type == "title"){
		fontSize = gameSettings.title.fontSize;
		textColor = gameSettings.title.textColor;
		fontY = gameSettings.title.fontY;
		radius = gameSettings.title.radius;
		shadowY = gameSettings.title.shadowY;
	}
		
	var letterTxt = new createjs.Text();
	letterTxt.font = fontSize + "px comfortaabold";
	letterTxt.color = textColor;
	letterTxt.textAlign = "center";
	letterTxt.textBaseline='alphabetic';
	letterTxt.text = text;
	letterTxt.y = fontY;

	var newShape = new createjs.Shape();
	newShape.fillCommand = newShape.graphics.beginFill(gameData.colors[gameData.colorIndex]).command;
	newShape.graphics.drawCircle(0, 0, radius);

	var newShapeShadow = new createjs.Shape();	
	newShapeShadow.fillCommand = newShapeShadow.graphics.beginFill(gameData.colors[gameData.colorIndex]).command;
	newShapeShadow.graphics.drawCircle(0, 0, radius);
	newShapeShadow.y = shadowY;

	var newShapeShadowDim = new createjs.Shape();	
	newShapeShadowDim.graphics.beginFill('#000').drawCircle(0, 0, radius);
	newShapeShadowDim.alpha = .5;
	newShapeShadowDim.y = shadowY;

	$.letter[n].shape = newShape;
	$.letter[n].shapeShadow = newShapeShadow;
	$.letter[n].addChild(newShapeShadow, newShapeShadowDim, newShape, letterTxt);

	if(type == "game"){
		lettersContainer.addChild($.letter[n]);
	}else if(type == "title"){
		titleContainer.addChild($.letter[n]);
	}else if(type == "hint"){
		var buttonHint = new createjs.Bitmap(loader.getResult('buttonHint'));
		centerReg(buttonHint);
		$.letter[n].addChild(buttonHint);
		gameContainer.addChild($.letter[n]);
	}
}

/*!
 * 
 * LETTERS ANIMATION - This is the function that runs loop letters animation
 * 
 */
function startAnimateScale(){
	var tweenSpeed = .5;
	for(var n=0; n<gameData.word.length; n++){
		$.letter[n].scaleX = $.letter[n].scaleY = 0;
		TweenMax.to($.letter[n], tweenSpeed, {scaleX:1, scaleY:1, overwrite:true, onComplete:startAnimateRadius, onCompleteParams:[n]});
	}
}

function startAnimateRadius(n){
	var tweenSpeed = .5;
	TweenMax.to($.letter[n], tweenSpeed, {moveRadius:words_arr[gameData.wordNum].radius, overwrite:true});
}

function startAnimateAngle(){
	gameData.angle = 0;
	TweenMax.to(gameData, gameSettings.letters.angleSpeed, {angle:360, overwrite:true, ease:Linear.easeNone, onComplete:startAnimateAngle});
}

function getRadiusPos(obj, x, y, radius){
	var angle = (obj.angle + gameData.angle) * Math.PI/180;
	var pos = {x:0, y:0};
	pos.x = Math.floor(x + (radius * Math.cos(angle)));
	pos.y = Math.floor(y + (radius * Math.sin(angle)));
	return pos;
}

function setAnglePos(target, x, y, radius){
	var pos = getRadiusPos(target, x, y, radius);
	target.x = pos.x;
	target.y = pos.y;
}

/*!
 * 
 * MATCH KEYBOARD - This is the function that runs to match keyboard
 * 
 */
function matchKeyboard(letter){
	if(gameData.paused){
		return;
	}

	if(gameData.animating){
		return;
	}

	var keyIndex = gameSettings.keyboard.indexOf(letter);
	if(keyIndex != -1){
		var foundKey = false;


		for(var n=0; n<gameData.word.length; n++){
			if($.letter[n].letter == letter){
				if(!$.letter[n].active && !foundKey){
					foundKey = true;
					formLetter($.letter[n].index);
				}
			}
		}
	}
}

/*!
 * 
 * FORM LETTER - This is the function that runs to form letter
 * 
 */
function formLetter(index){
	var randomNum = Math.floor(Math.random()*3)+1;
	playSound('soundPop'+randomNum);

	$.letter[index].active = true;
	gameData.wordArr.push(index);
	lettersContainer.setChildIndex($.letter[index], lettersContainer.numChildren-1);

	positionLetters(true);
}

function positionLetters(con){
	if(gameData.wordArr.length == gameData.word.length){
		gameData.animating = true;
	}
	gameData.animateCount = 0;

	var totalW = 0;
	var startX = gameSettings.word.x;
	var startY = gameSettings.word.y;
	var pos = {x:0, y:startY};
	if(gameData.wordArr.length > 1){
		totalW = (gameSettings.letters.radius*2) * (gameData.wordArr.length-1);
		totalW += gameSettings.word.space * (gameData.wordArr.length-1);
		pos.x = startX - (totalW/2);
	}

	for(var n=0; n<gameData.wordArr.length; n++){
		var thisLetter = $.letter[gameData.wordArr[n]];
		thisLetter.oriX = pos.x;
		thisLetter.oriY = pos.y;
		if(con){
			TweenMax.to(thisLetter, gameSettings.word.speed, {x:pos.x, y:pos.y, overwrite:true, onComplete:formLetterComplete});
		}else{
			TweenMax.to(thisLetter, gameSettings.word.speed, {x:pos.x, y:pos.y, overwrite:true});
		}
		pos.x += (gameSettings.word.space) + (gameSettings.letters.radius*2);
	}
	if(!con){
		gameData.animating = false;
	}
	toggleWordPos();
}	

function toggleWordPos(){
	var posY = gameData.wordArr.length == 0 ? 0 : gameSettings.word.formY;
	TweenMax.to(wordContainer, gameSettings.word.speed, {y:posY, overwrite:true});
}

/*!
 * 
 * REVERT LETTER - This is the function that runs to revert letter
 * 
 */
function revertLetter(index){
	playSound('soundPopRevert');
	$.letter[index].active = false;

	var getIndex = gameData.wordArr.indexOf(index);
	gameData.wordArr.splice(getIndex, 1);
	positionLetters(false);
}

/*!
 * 
 * LETTERS COMPLETE - This is the function that runs to form letter complete
 * 
 */
function formLetterComplete(){
	gameData.animateCount++;
	if(gameData.animateCount >= gameData.word.length){
		gameData.animating = true;
		var finalWord = "";
		for(var n=0; n<gameData.wordArr.length; n++){
			finalWord += $.letter[gameData.wordArr[n]].letter;
		}
		var existWord = gameData.words[gameData.wordNum].indexOf(finalWord);
		gameData.animateCount = 0;
		if(existWord == -1){
			playSound('soundError');
			gameData.shake = true;
			TweenMax.to(gameContainer, .5, {overwrite:true, onComplete:function(){
				for(var n=0; n<gameData.wordArr.length; n++){
					var thisLetter = $.letter[gameData.wordArr[n]];
					thisLetter.active = false;
				}
				gameData.wordArr = [];
				gameData.animating = false;
				gameData.shake = false;
				toggleWordPos();
			}});
		}else{
			toggleGameSessionTimer(false);
			playSound('soundComplete');
			gameData.complete = true;
			scoreCalculateTxt.text = textDisplay.pointplus.replace("[NUMBER]", 0);
			scoreCalculateTxt.alpha = 0;
			TweenMax.to(scoreCalculateTxt, 1, {alpha:1, overwrite:true});

			for(var n=0; n<gameData.wordArr.length; n++){
				var thisLetter = $.letter[gameData.wordArr[n]];
				animateBounce(thisLetter, n*.2);
			}
		}
	}else{
		gameData.animating = false;
	}
}

function animateBounce(obj, delay){
	TweenMax.to(obj, .2, {delay:delay, y:obj.oriY-20, overwrite:true, onComplete:function(){
		if(obj.index == 0){
			calculateScore();
		}
		TweenMax.to(obj, 1, {y:obj.oriY, overwrite:true, ease: Elastic. easeOut.config(1, 0.3), onComplete:function(){
			animateBounceComplete();
		}});
	}});
}

function animateBounceComplete(){
	gameData.animateCount++;
	if(gameData.animateCount >= gameData.word.length){
		gameData.complete = true;
	}
}

function hideLetters(con){
	gameData.wordArr = [];
	scoreCalculateTxt.text = "";
	
	for(var n=0; n<gameData.word.length; n++){
		var thisLetter = $.letter[n];
		if(n == 0 && con){
			TweenMax.to(thisLetter, gameSettings.word.speed, {scaleX:0, scaleY:0, overwrite:true, onComplete:proceedNextWord});
		}else{
			TweenMax.to(thisLetter, gameSettings.word.speed, {scaleX:0, scaleY:0, overwrite:true});
		}
	}
}

/*!
 * 
 * NEXT WORD - This is the function that runs to proceed next word
 * 
 */
function proceedNextWord(){
	increaseStage();

	var tween = 0;
	if(gameData.nextStage){
		gameData.nextStage = false;
		tween = 3;
		showGameStatus("stage");
		toggleWordPos();
		playSound('soundClear');
	}

	TweenMax.to(gameContainer, tween, {overwrite:true, onComplete:function(){
		buildLetters();
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

			if(timeData.sessionTimer <= (timeData.countdown/2) && !gameData.hint && words_arr[gameData.wordNum].hint > 0){
				gameData.hint = true;
				$.letter["hint"].visible = true;
				$.letter["hint"].scaleX = $.letter["hint"].scaleY = 0;
				TweenMax.to($.letter["hint"], gameSettings.word.speed, {scaleX:1, scaleY:1, overwrite:true});
			}

			if(timeData.oldTimer == -1){
				timeData.oldTimer = timeData.sessionTimer;
			}
			
			if(timeData.sessionTimer <= 0){
				//stop
				timeData.sessionTimer = 0;
				playSound('soundTimerEnd');
				endGame();
			}else{
				if((timeData.oldTimer - timeData.sessionTimer) > 1000){
					if(timeData.sessionTimer < 5000){
						timerShape.alpha = .5;
						TweenMax.to(timerShape, .3, {alpha:1});
						playSound('soundTimer');
					}
					timeData.oldTimer = timeData.sessionTimer;
				}
			}
			updateTimerIcon();
		}

		for(var n=0; n<gameData.word.length; n++){
			var thisLetter = $.letter[n];
			if(!$.letter[n].active){
				var pos = getRadiusPos($.letter[n], 0, 0, $.letter[n].moveRadius);
				TweenMax.to(thisLetter, gameSettings.word.revertSpeed, {x:pos.x, y:pos.y});
			}else if(gameData.shake){
				var rangeX = randomIntFromInterval(-5,5);
				var rangeY = randomIntFromInterval(-5,5);
				thisLetter.x = thisLetter.oriX + rangeX;
				thisLetter.y = thisLetter.oriY + rangeY;
			}
		}
	}
}

function updateTimerIcon(){
	timerShape.graphics.clear();
	timerShape.graphics.beginFill(gameSettings.timer.color);
	
	timerShapeShadow.graphics.clear();
	timerShapeShadow.graphics.beginFill('#000');
	timerShapeShadow.alpha = .5;
	
	var numberAngle = Number(-1.55 - (Math.PI * 2 * ((timeData.sessionTimer) / timeData.countdown)));
	var endAngle = Number(numberAngle + (Math.PI * 2 * ((timeData.sessionTimer) / timeData.countdown)));
	
	timerShape.graphics.moveTo(0, 0).arc(0, 0, gameSettings.timer.radius, numberAngle, endAngle, false).lineTo(0, 0).closePath();
	timerShapeShadow.graphics.moveTo(0, 0).arc(0, 0, gameSettings.timer.radius, numberAngle, endAngle, false).lineTo(0, 0).closePath();
}

/*!
 * 
 * GAME SCORE - This is the function that runs to show game score
 * 
 */
function calculateScore(){
	playSound('soundScore');
	var scorePercentage = words_arr[gameData.wordNum].score/gameData.stage.timer;
	TweenMax.to(timeData, gameSettings.score.speed, {sessionTimer:0, overwrite:true, onUpdate:function(){
		var calTimer = timeData.countdown - timeData.sessionTimer;
		var totalScore = Math.floor((calTimer - timeData.accumulate) * scorePercentage);
		scoreCalculateTxt.text = textDisplay.pointplus.replace("[NUMBER]", addCommas(totalScore));
		updateTimerIcon();
	}, onComplete:function(){
		var calTimer = timeData.countdown - timeData.sessionTimer;
		var totalScore = Math.floor((calTimer - timeData.accumulate) * scorePercentage);
		playerData.score += totalScore;
		updateGameScore();

		TweenMax.to(gameContainer, .5, {overwrite:true, onComplete:function(){
			hideLetters(true);
		}});
	}});
}

function updateGameScore(){
	TweenMax.to(tweenData, .5, {tweenScore:playerData.score, overwrite:true, onUpdate:function(){
		scoreTxt.text = textDisplay.pointDisplay.replace("[NUMBER]", addCommas(Math.floor(tweenData.tweenScore)));
	}});
}

/*!
 * 
 * GAME HINT - This is the function that runs to show game hint
 * 
 */
function showGameHint(){
	if(!gameData.showHint){
		gameData.showHint = true;
		TweenMax.to($.letter["hint"], gameSettings.word.speed, {scaleX:0, scaleY:0, overwrite:true});

		while (gameData.wordArr.length > 0) {
			revertLetter(gameData.wordArr[0]);
		}

		var founded = false;
		for(var h=0; h<words_arr[gameData.wordNum].hint; h++){
			founded = false;
			for(var n=0; n<gameData.word.length; n++){
				if($.letter[n].letter == gameData.word.substring(h,h+1) && !$.letter[n].active && !founded){
					founded = true;
					formLetter(n);
				}
			}
		}
	}
}

/*!
 * 
 * GAME STATUS - This is the function that runs to show game status
 * 
 */
function showGameStatus(con){
	if(con == 'timesup'){
		gameStatusTxt.text = textDisplay.timesup;
	}else if(con == 'stage'){
		gameStatusTxt.text = textDisplay.nextstage;
	}

	gameStatusTxt.alpha = 0;
	TweenMax.to(gameStatusTxt, .5, {alpha:1, overwrite:true, onComplete:function(){
		TweenMax.to(gameStatusTxt, .5, {delay:2, alpha:0, overwrite:true});
	}});
}

/*!
 * 
 * END GAME - This is the function that runs for game end
 * 
 */
function endGame(){
	gameData.paused = true;
	toggleGameSessionTimer(false);
	toggleGameTimer(false);
	
	$.letter["hint"].visible = false;
	hideLetters(false);
	showGameStatus("timesup");

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
	$.getJSON(words_arr[gameData.wordNum].file, function(data){
		gameData.words.push([]);
		gameData.words[gameData.wordNum] = data;

		gameData.wordNum++;
		if(gameData.wordNum < words_arr.length){
			loopJSONFile();
		}else{
			for(var n=0; n<words_arr.length; n++){
				shuffle(gameData.words[n]);
			}
			gameData.wordNum = 0;
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
