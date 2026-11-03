////////////////////////////////////////////////////////////
// CANVAS
////////////////////////////////////////////////////////////
var stage
var canvasW=0;
var canvasH=0;

/*!
 * 
 * START GAME CANVAS - This is the function that runs to setup game canvas
 * 
 */
function initGameCanvas(w,h){
	var gameCanvas = document.getElementById("gameCanvas");
	gameCanvas.width = w;
	gameCanvas.height = h;
	
	canvasW=w;
	canvasH=h;
	stage = new createjs.Stage("gameCanvas");
	
	createjs.Touch.enable(stage);
	stage.enableMouseOver(20);
	stage.mouseMoveOutside = true;
	
	createjs.Ticker.timingMode = createjs.Ticker.RAF_SYNCHED;
	createjs.Ticker.framerate = 50;
	createjs.Ticker.addEventListener("tick", tick);
}

var guide = false;
var canvasContainer, mainContainer, gameContainer, resultContainer, confirmContainer;
var guideline, bg, logo, buttonOk, result, shadowResult, buttonReplay, buttonFacebook, buttonTwitter, buttonWhatsapp, buttonFullscreen, buttonSoundOn, buttonSoundOff;

$.board = {};

/*!
 * 
 * BUILD GAME CANVAS ASSERTS - This is the function that runs to build game canvas asserts
 * 
 */
function buildGameCanvas(){
	canvasContainer = new createjs.Container();
	mainContainer = new createjs.Container();
	gameContainer = new createjs.Container();
	boardContainer = new createjs.Container();
	diceContainer = new createjs.Container();
	rotateContainer = new createjs.Container();
	scoreDisplayContainer = new createjs.Container();
	scoreContainer = new createjs.Container();
	timerContainer = new createjs.Container();
	statusContainer = new createjs.Container();
	instructionContainer = new createjs.Container();
	particlesContainer = new createjs.Container();
	resultContainer = new createjs.Container();
	confirmContainer = new createjs.Container();
	
	bg = new createjs.Bitmap(loader.getResult('bg'));
	bgP = new createjs.Bitmap(loader.getResult('bgP'));
	logo = new createjs.Bitmap(loader.getResult('logo'));
	logoP = new createjs.Bitmap(loader.getResult('logoP'));

	bgMain = new createjs.Bitmap(loader.getResult('bgMain'));
	bgMainP = new createjs.Bitmap(loader.getResult('bgMainP'));
	
	buttonPlay = new createjs.Bitmap(loader.getResult('buttonPlay'));
	centerReg(buttonPlay);

	//game
	itemBoard = new createjs.Bitmap(loader.getResult('itemBoard'));
	centerReg(itemBoard);

	var maskW = gameSettings.board.size * gameSettings.board.column;
	var maskH = gameSettings.board.size * gameSettings.board.row;
	itemDestroyMask = new createjs.Shape();	
	itemDestroyMask.graphics.beginFill('#fff').drawRect(-(maskW/2), -(maskH/2), maskW, maskH);

	itemDestroy= new createjs.Bitmap(loader.getResult('itemDestroy'));
	centerReg(itemDestroy);
	itemDestroy.mask = itemDestroyMask;

	itemRotate = new createjs.Bitmap(loader.getResult('itemRotate'));
	centerReg(itemRotate);
	rotateContainer.addChild(itemRotate);

	gameInstructionTxt = new createjs.Text();
	gameInstructionTxt.font = "30px fignoregular";
	gameInstructionTxt.color = '#fff';
	gameInstructionTxt.textAlign = "center";
	gameInstructionTxt.textBaseline='alphabetic';

	gameInstructionShadowTxt = new createjs.Text();
	gameInstructionShadowTxt.font = "30px fignoregular";
	gameInstructionShadowTxt.color = '#000';
	gameInstructionShadowTxt.textAlign = "center";
	gameInstructionShadowTxt.textBaseline='alphabetic';
	gameInstructionShadowTxt.alpha = .3;
	gameInstructionShadowTxt.y = 6;

	instructionContainer.addChild(gameInstructionShadowTxt, gameInstructionTxt);

	itemScore = new createjs.Bitmap(loader.getResult('itemScore'));
	gameScoreTxt = new createjs.Text();
	gameScoreTxt.font = "30px fignoregular";
	gameScoreTxt.color = '#fff';
	gameScoreTxt.textAlign = "left";
	gameScoreTxt.textBaseline='alphabetic';
	gameScoreTxt.x = 80;
	gameScoreTxt.y = 45;
	scoreContainer.addChild(itemScore, gameScoreTxt);

	itemTimer = new createjs.Bitmap(loader.getResult('itemTimer'));
	gameTimerTxt = new createjs.Text();
	gameTimerTxt.font = "30px fignoregular";
	gameTimerTxt.color = '#fff';
	gameTimerTxt.textAlign = "left";
	gameTimerTxt.textBaseline='alphabetic';
	gameTimerTxt.x = 80;
	gameTimerTxt.y = 45;

	gameTimerRedTxt = new createjs.Text();
	gameTimerRedTxt.font = "30px fignoregular";
	gameTimerRedTxt.color = '#aa9046';
	gameTimerRedTxt.textAlign = "left";
	gameTimerRedTxt.textBaseline='alphabetic';
	gameTimerRedTxt.x = 80;
	gameTimerRedTxt.y = 45;

	timerContainer.addChild(itemTimer, gameTimerTxt, gameTimerRedTxt);

	itemStatus = new createjs.Bitmap(loader.getResult('itemStatus'));
	centerReg(itemStatus);

	gameStatusTxt = new createjs.Text();
	gameStatusTxt.font = "45px fignoregular";
	gameStatusTxt.color = '#aa9046';
	gameStatusTxt.textAlign = "center";
	gameStatusTxt.textBaseline='alphabetic';
	gameStatusTxt.text = "OUT OF ROOM";
	gameStatusTxt.y = 14;

	statusContainer.addChild(itemStatus, gameStatusTxt);

	//result
	itemResult = new createjs.Bitmap(loader.getResult('itemPop'));
	itemResultP = new createjs.Bitmap(loader.getResult('itemPopP'));
	
	buttonContinue = new createjs.Bitmap(loader.getResult('buttonContinue'));
	centerReg(buttonContinue);
	
	resultShareTxt = new createjs.Text();
	resultShareTxt.font = "30px fignoregular";
	resultShareTxt.color = '#aa9046';
	resultShareTxt.textAlign = "center";
	resultShareTxt.textBaseline='alphabetic';
	resultShareTxt.text = textDisplay.share;
	
	resultDescTxt = new createjs.Text();
	resultDescTxt.font = "75px fignoregular";
	resultDescTxt.color = '#ffaa00';
	resultDescTxt.textAlign = "center";
	resultDescTxt.textBaseline='alphabetic';
	resultDescTxt.text = '';

	resultDescShadowTxt = new createjs.Text();
	resultDescShadowTxt.font = "75px fignoregular";
	resultDescShadowTxt.color = '#000';
	resultDescShadowTxt.textAlign = "center";
	resultDescShadowTxt.textBaseline='alphabetic';
	resultDescShadowTxt.alpha = .3;

	resultTitleTxt = new createjs.Text();
	resultTitleTxt.font = "60px fignoregular";
	resultTitleTxt.color = "#fff";
	resultTitleTxt.textAlign = "center";
	resultTitleTxt.textBaseline='alphabetic';
	resultTitleTxt.text = textDisplay.resultTitle;

	resultTitleShadowTxt = new createjs.Text();
	resultTitleShadowTxt.font = "60px fignoregular";
	resultTitleShadowTxt.color = "#000";
	resultTitleShadowTxt.textAlign = "center";
	resultTitleShadowTxt.textBaseline='alphabetic';
	resultTitleShadowTxt.text = textDisplay.resultTitle;
	resultTitleShadowTxt.alpha = .3;
	
	buttonFacebook = new createjs.Bitmap(loader.getResult('buttonFacebook'));
	buttonTwitter = new createjs.Bitmap(loader.getResult('buttonTwitter'));
	buttonWhatsapp = new createjs.Bitmap(loader.getResult('buttonWhatsapp'));
	centerReg(buttonFacebook);
	createHitarea(buttonFacebook);
	centerReg(buttonTwitter);
	createHitarea(buttonTwitter);
	centerReg(buttonWhatsapp);
	createHitarea(buttonWhatsapp);
	
	buttonFullscreen = new createjs.Bitmap(loader.getResult('buttonFullscreen'));
	centerReg(buttonFullscreen);
	buttonSoundOn = new createjs.Bitmap(loader.getResult('buttonSoundOn'));
	centerReg(buttonSoundOn);
	buttonSoundOff = new createjs.Bitmap(loader.getResult('buttonSoundOff'));
	centerReg(buttonSoundOff);
	buttonSoundOn.visible = false;
	buttonMusicOn = new createjs.Bitmap(loader.getResult('buttonMusicOn'));
	centerReg(buttonMusicOn);
	buttonMusicOff = new createjs.Bitmap(loader.getResult('buttonMusicOff'));
	centerReg(buttonMusicOff);
	buttonMusicOn.visible = false;
	
	buttonExit = new createjs.Bitmap(loader.getResult('buttonExit'));
	centerReg(buttonExit);
	buttonSettings = new createjs.Bitmap(loader.getResult('buttonSettings'));
	centerReg(buttonSettings);
	
	createHitarea(buttonFullscreen);
	createHitarea(buttonSoundOn);
	createHitarea(buttonSoundOff);
	createHitarea(buttonMusicOn);
	createHitarea(buttonMusicOff);
	createHitarea(buttonExit);
	createHitarea(buttonSettings);
	optionsContainer = new createjs.Container();
	optionsContainer.addChild(buttonFullscreen, buttonSoundOn, buttonSoundOff, buttonMusicOn, buttonMusicOff, buttonExit);
	optionsContainer.visible = false;
	
	//exit
	itemExit = new createjs.Bitmap(loader.getResult('itemPop'));
	itemExitP = new createjs.Bitmap(loader.getResult('itemPopP'));
	
	buttonConfirm = new createjs.Bitmap(loader.getResult('buttonConfirm'));
	centerReg(buttonConfirm);
	
	buttonCancel = new createjs.Bitmap(loader.getResult('buttonCancel'));
	centerReg(buttonCancel);
	
	popDescTxt = new createjs.Text();
	popDescTxt.font = "40px fignoregular";
	popDescTxt.lineHeight = 40;
	popDescTxt.color = "#aa9046";
	popDescTxt.textAlign = "center";
	popDescTxt.textBaseline='alphabetic';
	popDescTxt.text = textDisplay.exitMessage;

	exitTitleTxt = new createjs.Text();
	exitTitleTxt.font = "60px fignoregular";
	exitTitleTxt.color = "#fff";
	exitTitleTxt.textAlign = "center";
	exitTitleTxt.textBaseline='alphabetic';
	exitTitleTxt.text = textDisplay.exitTitle;

	exitTitleShadowTxt = new createjs.Text();
	exitTitleShadowTxt.font = "60px fignoregular";
	exitTitleShadowTxt.color = "#000";
	exitTitleShadowTxt.textAlign = "center";
	exitTitleShadowTxt.textBaseline='alphabetic';
	exitTitleShadowTxt.text = textDisplay.exitTitle;
	exitTitleShadowTxt.alpha = .3;
	
	confirmContainer.addChild(itemExit, itemExitP, popDescTxt, exitTitleShadowTxt, exitTitleTxt, buttonConfirm, buttonCancel);
	confirmContainer.visible = false;
	
	if(guide){
		guideline = new createjs.Shape();	
		guideline.graphics.setStrokeStyle(2).beginStroke('red').drawRect((stageW-contentW)/2, (stageH-contentH)/2, contentW, contentH);
	}
	
	mainContainer.addChild(bgMain, bgMainP, logo, logoP, buttonPlay);
	gameContainer.addChild(boardContainer, instructionContainer, rotateContainer, diceContainer, scoreDisplayContainer, statusContainer, scoreContainer, timerContainer, particlesContainer);

	resultContainer.addChild(itemResult, itemResultP, buttonContinue, resultDescShadowTxt, resultDescTxt, resultTitleShadowTxt, resultTitleTxt);
	
	if(shareEnable){
		resultContainer.addChild(resultShareTxt, buttonFacebook, buttonTwitter, buttonWhatsapp);
	}
	
	canvasContainer.addChild(bg, bgP, mainContainer, gameContainer, resultContainer, confirmContainer, optionsContainer, buttonSettings, guideline);
	stage.addChild(canvasContainer);
	
	changeViewport(viewport.isLandscape);
	resizeGameFunc();
}

function changeViewport(isLandscape){
	if(isLandscape){
		//landscape
		stageW=landscapeSize.w;
		stageH=landscapeSize.h;
		contentW = landscapeSize.cW;
		contentH = landscapeSize.cH;
	}else{
		//portrait
		stageW=portraitSize.w;
		stageH=portraitSize.h;
		contentW = portraitSize.cW;
		contentH = portraitSize.cH;
	}
	
	gameCanvas.width = stageW;
	gameCanvas.height = stageH;
	
	canvasW=stageW;
	canvasH=stageH;
	
	changeCanvasViewport();
}

function changeCanvasViewport(){
	if(canvasContainer!=undefined){

		if(viewport.isLandscape){
			bg.visible = true;
			bgP.visible = false;

			bgMain.visible = true;
			bgMainP.visible = false;

			logo.visible = true;
			logoP.visible = false;

			buttonPlay.x = canvasW/2;
			buttonPlay.y = canvasH/100 * 80;

			//game
			
			//result
			itemResult.visible = true;
			itemResultP.visible = false;
			
			buttonFacebook.x = canvasW/100*43;
			buttonFacebook.y = canvasH/100*58;
			buttonTwitter.x = canvasW/2;
			buttonTwitter.y = canvasH/100*58;
			buttonWhatsapp.x = canvasW/100*57;
			buttonWhatsapp.y = canvasH/100*58;
			
			buttonContinue.x = canvasW/2;
			buttonContinue.y = canvasH/100 * 70;
	
			resultShareTxt.x = canvasW/2;
			resultShareTxt.y = canvasH/100 * 52;
	
			resultDescTxt.x = canvasW/2;
			resultDescTxt.y = canvasH/100 * 45;

			resultDescShadowTxt.x = resultDescTxt.x;
			resultDescShadowTxt.y = resultDescTxt.y+6;

			resultTitleTxt.x = canvasW/2;
			resultTitleTxt.y = canvasH/100 * 29;

			resultTitleShadowTxt.x = resultTitleTxt.x;
			resultTitleShadowTxt.y = resultTitleTxt.y + 6;
			
			//exit
			itemExit.visible = true;
			itemExitP.visible = false;

			buttonConfirm.x = (canvasW/2);
			buttonConfirm.y = (canvasH/100 * 59);
			
			buttonCancel.x = (canvasW/2);
			buttonCancel.y = (canvasH/100 * 71);
			
			popDescTxt.x = canvasW/2;
			popDescTxt.y = canvasH/100 * 41;

			exitTitleTxt.x = canvasW/2;
			exitTitleTxt.y = canvasH/100 * 29;

			exitTitleShadowTxt.x = exitTitleTxt.x;
			exitTitleShadowTxt.y = exitTitleTxt.y + 6;

		}else{
			bg.visible = false;
			bgP.visible = true;

			bgMain.visible = false;
			bgMainP.visible = true;

			logo.visible = false;
			logoP.visible = true;
			
			buttonPlay.x = canvasW/2;
			buttonPlay.y = canvasH/100 * 75;

			//game
			
			//result
			itemResult.visible = false;
			itemResultP.visible = true;
			
			buttonFacebook.x = canvasW/100*39;
			buttonFacebook.y = canvasH/100*55;
			buttonTwitter.x = canvasW/2;
			buttonTwitter.y = canvasH/100*55;
			buttonWhatsapp.x = canvasW/100*61;
			buttonWhatsapp.y = canvasH/100*55;
			
			buttonContinue.x = canvasW/2;
			buttonContinue.y = canvasH/100 * 65;
	
			resultShareTxt.x = canvasW/2;
			resultShareTxt.y = canvasH/100 * 50;
	
			resultDescTxt.x = canvasW/2;
			resultDescTxt.y = canvasH/100 * 45;

			resultDescShadowTxt.x = resultDescTxt.x;
			resultDescShadowTxt.y = resultDescTxt.y+6;

			resultTitleTxt.x = canvasW/2;
			resultTitleTxt.y = canvasH/100 * 34;

			resultTitleShadowTxt.x = resultTitleTxt.x;
			resultTitleShadowTxt.y = resultTitleTxt.y + 6;
			
			//exit
			itemExit.visible = false;
			itemExitP.visible = true;

			buttonConfirm.x = (canvasW/2);
			buttonConfirm.y = (canvasH/100 * 57);
			
			buttonCancel.x = (canvasW/2);
			buttonCancel.y = (canvasH/100 * 66);
			
			popDescTxt.x = canvasW/2;
			popDescTxt.y = canvasH/100 * 43;

			exitTitleTxt.x = canvasW/2;
			exitTitleTxt.y = canvasH/100 * 34;

			exitTitleShadowTxt.x = exitTitleTxt.x;
			exitTitleShadowTxt.y = exitTitleTxt.y + 6;
		}
	}
}



/*!
 * 
 * RESIZE GAME CANVAS - This is the function that runs to resize game canvas
 * 
 */
function resizeCanvas(){
 	if(canvasContainer!=undefined){
		
		buttonSettings.x = (canvasW - offset.x) - 50;
		buttonSettings.y = offset.y + 45;
		
		var distanceNum = 75;
		var nextCount = 0;
		if(curPage != 'game'){
			buttonExit.visible = false;
			buttonSoundOn.x = buttonSoundOff.x = buttonSettings.x;
			buttonSoundOn.y = buttonSoundOff.y = buttonSettings.y+distanceNum;
			buttonSoundOn.x = buttonSoundOff.x;
			buttonSoundOn.y = buttonSoundOff.y = buttonSettings.y+distanceNum;

			if (typeof buttonMusicOn != "undefined") {
				buttonMusicOn.x = buttonMusicOff.x = buttonSettings.x;
				buttonMusicOn.y = buttonMusicOff.y = buttonSettings.y+(distanceNum*2);
				buttonMusicOn.x = buttonMusicOff.x;
				buttonMusicOn.y = buttonMusicOff.y = buttonSettings.y+(distanceNum*2);
				nextCount = 2;
			}else{
				nextCount = 1;
			}
			
			buttonFullscreen.x = buttonSettings.x;
			buttonFullscreen.y = buttonSettings.y+(distanceNum*(nextCount+1));
		}else{
			buttonExit.visible = true;
			buttonSoundOn.x = buttonSoundOff.x = buttonSettings.x;
			buttonSoundOn.y = buttonSoundOff.y = buttonSettings.y+distanceNum;
			buttonSoundOn.x = buttonSoundOff.x;
			buttonSoundOn.y = buttonSoundOff.y = buttonSettings.y+distanceNum;

			if (typeof buttonMusicOn != "undefined") {
				buttonMusicOn.x = buttonMusicOff.x = buttonSettings.x;
				buttonMusicOn.y = buttonMusicOff.y = buttonSettings.y+(distanceNum*2);
				buttonMusicOn.x = buttonMusicOff.x;
				buttonMusicOn.y = buttonMusicOff.y = buttonSettings.y+(distanceNum*2);
				nextCount = 2;
			}else{
				nextCount = 1;
			}
			
			buttonFullscreen.x = buttonSettings.x;
			buttonFullscreen.y = buttonSettings.y+(distanceNum*(nextCount+1));
			
			buttonExit.x = buttonSettings.x;
			buttonExit.y = buttonSettings.y+(distanceNum*(nextCount+2));
		}

		resizeGameLayout();
	}
}

/*!
 * 
 * REMOVE GAME CANVAS - This is the function that runs to remove game canvas
 * 
 */
 function removeGameCanvas(){
	 stage.autoClear = true;
	 stage.removeAllChildren();
	 stage.update();
	 createjs.Ticker.removeEventListener("tick", tick);
	 createjs.Ticker.removeEventListener("tick", stage);
 }

/*!
 * 
 * CANVAS LOOP - This is the function that runs for canvas loop
 * 
 */ 
function tick(event) {
	updateGame(event);
	stage.update(event);
}

/*!
 * 
 * CANVAS MISC FUNCTIONS
 * 
 */
function centerReg(obj){
	obj.regX=obj.image.naturalWidth/2;
	obj.regY=obj.image.naturalHeight/2;
}

function createHitarea(obj){
	obj.hitArea = new createjs.Shape(new createjs.Graphics().beginFill("#000").drawRect(0, 0, obj.image.naturalWidth, obj.image.naturalHeight));	
}