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
	
	createjs.Ticker.framerate = 60;
	createjs.Ticker.addEventListener("tick", tick);
}

var guide = false;
var canvasContainer, mainContainer, gameContainer, instructionContainer, resultContainer, moveContainer, confirmContainer;
var guideline, bg, logo, buttonOk, result, shadowResult, buttonReplay, buttonFacebook, buttonTwitter, buttonWhatsapp, buttonFullscreen, buttonSoundOn, buttonSoundOff;

$.tutorial = {};
$.players = {};
$.colors = {};
$.cards = {};

/*!
 * 
 * BUILD GAME CANVAS ASSERTS - This is the function that runs to build game canvas asserts
 * 
 */
function buildGameCanvas(){
	canvasContainer = new createjs.Container();
	mainContainer = new createjs.Container();
	buttonLocalContainer = new createjs.Container();
	mainContainer = new createjs.Container();
	cardsOptionsContainer = new createjs.Container();
	cardsOptionsListContainer = new createjs.Container();
	cardsOptionsTutorialContainer = new createjs.Container();
	gameContainer = new createjs.Container();
	statusContainer = new createjs.Container();
	guideContainer = new createjs.Container();
	cardScoreContainer = new createjs.Container();
	cardScoreListContainer = new createjs.Container();
	cardsContainer = new createjs.Container();
	cardsPlayContainer = new createjs.Container();
	cardsPlayersContainer = new createjs.Container();
	colorsContainer = new createjs.Container();
	resultContainer = new createjs.Container();
	confirmContainer = new createjs.Container();
	
	
	bg = new createjs.Bitmap(loader.getResult('background'));
	bgP = new createjs.Bitmap(loader.getResult('backgroundP'));
	
	logo = new createjs.Bitmap(loader.getResult('logo'));
	logoP = new createjs.Bitmap(loader.getResult('logoP'));

	buttonPlay = new createjs.Bitmap(loader.getResult('buttonPlay'));
	centerReg(buttonPlay);

	buttonLocal = new createjs.Bitmap(loader.getResult('buttonLocal'));
	centerReg(buttonLocal);

	buttonOnline = new createjs.Bitmap(loader.getResult('buttonOnline'));
	centerReg(buttonOnline);

	//players
	itemOptions = new createjs.Bitmap(loader.getResult('itemOptions'));
	centerReg(itemOptions);

	optionsTitleTxt = new createjs.Text();
	optionsTitleTxt.font = "60px bpreplaybold";
	optionsTitleTxt.color = '#fff';
	optionsTitleTxt.textAlign = "center";
	optionsTitleTxt.textBaseline='alphabetic';
	optionsTitleTxt.text = textDisplay.optionsTitle;
	optionsTitleTxt.y = -150;

	itemPlayerNumbers = new createjs.Bitmap(loader.getResult('itemNumber'));
	centerReg(itemPlayerNumbers);

	totalPlayersTxt = new createjs.Text();
	totalPlayersTxt.font = "28px bpreplaybold";
	totalPlayersTxt.color = '#0e6bdd';
	totalPlayersTxt.textAlign = "center";
	totalPlayersTxt.textBaseline='middle';

	buttonPlayersL = new createjs.Bitmap(loader.getResult('buttonArrowLeft'));
	centerReg(buttonPlayersL);
	buttonPlayersR = new createjs.Bitmap(loader.getResult('buttonArrowRight'));
	centerReg(buttonPlayersR);

	itemPoints = new createjs.Bitmap(loader.getResult('itemNumber'));
	centerReg(itemPoints);

	pointsTxt = new createjs.Text();
	pointsTxt.font = "28px bpreplaybold";
	pointsTxt.color = '#0e6bdd';
	pointsTxt.textAlign = "center";
	pointsTxt.textBaseline='middle';

	buttonPointsL = new createjs.Bitmap(loader.getResult('buttonArrowLeft'));
	centerReg(buttonPointsL);
	buttonPointsR = new createjs.Bitmap(loader.getResult('buttonArrowRight'));
	centerReg(buttonPointsR);

	itemType = new createjs.Bitmap(loader.getResult('itemNumber'));
	centerReg(itemType);

	typeTxt = new createjs.Text();
	typeTxt.font = "28px bpreplaybold";
	typeTxt.color = '#0e6bdd';
	typeTxt.textAlign = "center";
	typeTxt.textBaseline='middle';

	buttonTypeL = new createjs.Bitmap(loader.getResult('buttonArrowLeft'));
	centerReg(buttonTypeL);
	buttonTypeR = new createjs.Bitmap(loader.getResult('buttonArrowRight'));
	centerReg(buttonTypeR);

	themeContainer = new createjs.Container();
	buttonThemeL = new createjs.Bitmap(loader.getResult('buttonArrowLeft'));
	centerReg(buttonThemeL);
	buttonThemeR = new createjs.Bitmap(loader.getResult('buttonArrowRight'));
	centerReg(buttonThemeR);

	buttonNext = new createjs.Bitmap(loader.getResult('buttonNext'));
	centerReg(buttonNext);

	buttonStart = new createjs.Bitmap(loader.getResult('buttonStart'));
	centerReg(buttonStart);

	buttonTutorial = new createjs.Bitmap(loader.getResult('buttonTutorial'));
	centerReg(buttonTutorial);

	itemPlayerNumbers.y = buttonPlayersL.y = buttonPlayersR.y = -90;
	totalPlayersTxt.y = -90;

	itemPoints.y = buttonPointsL.y = buttonPointsR.y = -5;
	pointsTxt.y = -5;

	itemType.y = buttonTypeL.y = buttonTypeR.y = 80;
	typeTxt.y = 80;

	buttonPlayersL.x = buttonPointsL.x = buttonTypeL.x = -190;
	buttonPlayersR.x = buttonPointsR.x = buttonTypeR.x = 190;

	buttonThemeL.x = -120;
	buttonThemeR.x = 120;

	buttonNext.y = buttonStart.y = buttonTutorial.y = 180;
	buttonNext.x = buttonStart.x = -50;
	buttonTutorial.x = 140;

	buttonTutorialL = new createjs.Bitmap(loader.getResult('buttonArrowLeft'));
	centerReg(buttonTutorialL);
	buttonTutorialR = new createjs.Bitmap(loader.getResult('buttonArrowRight'));
	centerReg(buttonTutorialR);

	buttonTutorialL.x = -270;
	buttonTutorialR.x = 270;

	buttonBack = new createjs.Bitmap(loader.getResult('buttonBack'));
	centerReg(buttonBack);
	buttonBack.y = 180;

	tutorialTitleTxt = new createjs.Text();
	tutorialTitleTxt.font = "40px bpreplaybold";
	tutorialTitleTxt.color = '#fff';
	tutorialTitleTxt.textAlign = "left";
	tutorialTitleTxt.textBaseline='alphabetic';
	tutorialTitleTxt.text = textDisplay.tutorialTitle;
	tutorialTitleTxt.y = -150;
	tutorialTitleTxt.x = -220;

	tutorialPageTxt = new createjs.Text();
	tutorialPageTxt.font = "40px bpreplaybold";
	tutorialPageTxt.color = '#fff';
	tutorialPageTxt.textAlign = "right";
	tutorialPageTxt.textBaseline='alphabetic';
	tutorialPageTxt.y = -150;
	tutorialPageTxt.x = 220;

	cardsOptionsTutorialContainer.addChild(tutorialTitleTxt, tutorialPageTxt, buttonBack, buttonTutorialL, buttonTutorialR);

	for(var n=0; n<15; n++){
		$.tutorial[n] = new createjs.Bitmap(loader.getResult('itemTutorial' + (n+1)));
		centerReg($.tutorial[n]);
		cardsOptionsTutorialContainer.addChild($.tutorial[n]);
	}

	cardsOptionsListContainer.addChild(optionsTitleTxt, itemPlayerNumbers, totalPlayersTxt, buttonPlayersL, buttonPlayersR, itemPoints, pointsTxt, buttonPointsL, buttonPointsR, itemType, typeTxt, buttonTypeL, buttonTypeR, themeContainer, buttonThemeL, buttonThemeR, buttonStart, buttonTutorial, buttonNext);
	cardsOptionsContainer.addChild(itemOptions, cardsOptionsListContainer, cardsOptionsTutorialContainer);

	//game
	var _frameW = 100;
	var _frameH = 100;
	var _regX = _frameW/2;
	var _regY = _frameH/2;
	var _count = 9;

	var _animations = {
		animate:{frames: [0,1,2,3], speed:1}
	};

	_default = "animate";
	var _frame = {"regX": _regX, "regY": _regY, "height": _frameH, "width": _frameW, "count": _count};					
	colorSpriteData = new createjs.SpriteSheet({
		"images": [loader.getResult('itemColors').src],
		"frames": _frame,
		"animations": _animations
	});

	itemColors = new createjs.Sprite(colorSpriteData, 'animate');
	itemColors.framerate = 20;
	itemColors.scaleX = itemColors.scaleY = .7;

	itemFrozen = new createjs.Bitmap(loader.getResult('itemFrozen'));
	centerReg(itemFrozen);
	itemFrozen.scaleX = itemFrozen.scaleY = .7;

	itemColorBg = new createjs.Bitmap(loader.getResult('itemColorBg'));
	centerReg(itemColorBg);

	colorSelectTxt = new createjs.Text();
	colorSelectTxt.font = "26px bpreplaybold";
	colorSelectTxt.color = '#fff';
	colorSelectTxt.textAlign = "center";
	colorSelectTxt.textBaseline='alphabetic';
	colorSelectTxt.y = 127;
	colorSelectTxt.text = 'PICK YOUR';

	colorsInnerContainer = new createjs.Container();
	colorsInnerContainer.y = -20;
	colorsContainer.addChild(itemColorBg, colorsInnerContainer, colorSelectTxt);

	for(var n=0; n<4; n++){		
		$.colors[n] = new createjs.Sprite(colorSpriteData, 'animate');
		$.colors[n].framerate = 20;
		$.colors[n].gotoAndStop(n);
		colorsInnerContainer.addChild($.colors[n]);
	}

	$.colors[0].x = $.colors[2].x = -55;
	$.colors[1].x = $.colors[3].x = 55;
	$.colors[0].y = $.colors[1].y = -55;
	$.colors[2].y = $.colors[3].y = 55;

	itemStatus = new createjs.Bitmap(loader.getResult('itemStatus'));
	centerReg(itemStatus);
	itemStatusLong = new createjs.Bitmap(loader.getResult('itemStatusLong'));
	centerReg(itemStatusLong);

	statusTxt = new createjs.Text();
	statusTxt.font = "25px bpreplaybold";
	statusTxt.color = '#fff';
	statusTxt.textAlign = "center";
	statusTxt.textBaseline='middle';
	statusTxt.y = 16;

	statusPlayerTxt = new createjs.Text();
	statusPlayerTxt.font = "26px bpreplaybold";
	statusPlayerTxt.color = '#fff';
	statusPlayerTxt.textAlign = "center";
	statusPlayerTxt.textBaseline='middle';
	statusPlayerTxt.y = -24;

	statusIconContainer = new createjs.Container();
	statusIconContainer.y = -15;
	statusContainer.addChild(itemStatus, itemStatusLong, statusTxt, statusPlayerTxt, statusIconContainer);

	itemScore = new createjs.Bitmap(loader.getResult('itemScore'));
	centerReg(itemScore);

	itemScoreTopMask = new createjs.Shape();	
	itemScoreTopMask.graphics.beginFill('red').drawRect(-200, -200, 400, 300);

	itemScoreTop = new createjs.Bitmap(loader.getResult('itemScoreTop'));
	centerReg(itemScoreTop);
	itemScoreTop.regY = 0;
	itemScoreTop.mask = itemScoreTopMask;

	roundStatusTxt = new createjs.Text();
	roundStatusTxt.font = "25px bpreplaybold";
	roundStatusTxt.color = '#fff';
	roundStatusTxt.textAlign = "center";
	roundStatusTxt.textBaseline='alphabetic';
	roundStatusTxt.y = 97;

	cardScoreContainer.addChild(itemScoreTop, itemScore, roundStatusTxt, cardScoreListContainer);

	itemInstruction = new createjs.Bitmap(loader.getResult('itemInstruction'));
	centerReg(itemInstruction);

	guideTxt = new createjs.Text();
	guideTxt.font = "20px bpreplaybold";
	guideTxt.color = '#fff';
	guideTxt.textAlign = "center";
	guideTxt.textBaseline='middle';
	guideTxt.y = -3;

	guideContainer.addChild(itemInstruction, guideTxt);
	
	//result
	itemResult = new createjs.Bitmap(loader.getResult('itemPop'));
	itemResultP = new createjs.Bitmap(loader.getResult('itemPopP'));
	
	buttonContinue = new createjs.Bitmap(loader.getResult('buttonContinue'));
	centerReg(buttonContinue);
	
	resultShareTxt = new createjs.Text();
	resultShareTxt.font = "25px bpreplaybold";
	resultShareTxt.color = '#fff';
	resultShareTxt.textAlign = "center";
	resultShareTxt.textBaseline='alphabetic';
	resultShareTxt.text = textDisplay.share;
	
	resultTitleTxt = new createjs.Text();
	resultTitleTxt.font = "60px bpreplaybold";
	resultTitleTxt.color = '#fff';
	resultTitleTxt.textAlign = "center";
	resultTitleTxt.textBaseline='alphabetic';
	resultTitleTxt.text = textDisplay.resultTitle;
	
	resultDescTxt = new createjs.Text();
	resultDescTxt.font = "75px bpreplaybold";
	resultDescTxt.lineHeight = 35;
	resultDescTxt.color = '#FF7F0B';
	resultDescTxt.textAlign = "center";
	resultDescTxt.textBaseline='alphabetic';
	resultDescTxt.text = '';
	
	
	buttonFacebook = new createjs.Bitmap(loader.getResult('buttonFacebook'));
	buttonTwitter = new createjs.Bitmap(loader.getResult('buttonTwitter'));
	buttonWhatsapp = new createjs.Bitmap(loader.getResult('buttonWhatsapp'));
	centerReg(buttonFacebook);
	createHitarea(buttonFacebook);
	centerReg(buttonTwitter);
	createHitarea(buttonTwitter);
	centerReg(buttonWhatsapp);
	createHitarea(buttonWhatsapp);
	
	// buttonFullscreen = new createjs.Bitmap(loader.getResult('buttonFullscreen'));
	// centerReg(buttonFullscreen);
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
	
	// createHitarea(buttonFullscreen);
	createHitarea(buttonSoundOn);
	createHitarea(buttonSoundOff);
	createHitarea(buttonExit);
	createHitarea(buttonSettings);
	optionsContainer = new createjs.Container();
	optionsContainer.addChild( buttonSoundOn, buttonSoundOff, buttonMusicOn, buttonMusicOff, buttonExit);
	optionsContainer.visible = false;
	
	//exit
	itemExit = new createjs.Bitmap(loader.getResult('itemPop'));
	itemExitP = new createjs.Bitmap(loader.getResult('itemPopP'));
	
	buttonConfirm = new createjs.Bitmap(loader.getResult('buttonConfirm'));
	centerReg(buttonConfirm);
	
	buttonCancel = new createjs.Bitmap(loader.getResult('buttonCancel'));
	centerReg(buttonCancel);
	
	popTitleTxt = new createjs.Text();
	popTitleTxt.font = "60px bpreplaybold";
	popTitleTxt.color = "#fff";
	popTitleTxt.textAlign = "center";
	popTitleTxt.textBaseline='alphabetic';
	popTitleTxt.text = textDisplay.exitTitle;
	
	popDescTxt = new createjs.Text();
	popDescTxt.font = "40px bpreplaybold";
	popDescTxt.lineHeight = 50;
	popDescTxt.color = "#fff";
	popDescTxt.textAlign = "center";
	popDescTxt.textBaseline='alphabetic';
	popDescTxt.text = textDisplay.exitMessage;
	
	confirmContainer.addChild(itemExit, itemExitP, popTitleTxt, popDescTxt, buttonConfirm, buttonCancel);
	confirmContainer.visible = false;

	//room
	roomContainer = new createjs.Container();
	nameContainer = new createjs.Container();

	gameLogsTxt = new createjs.Text();
	gameLogsTxt.font = "25px bpreplaybold";
	gameLogsTxt.color = "#fff";
	gameLogsTxt.textAlign = "center";
	gameLogsTxt.textBaseline='alphabetic';
	gameLogsTxt.text = '';
	
	if(guide){
		guideline = new createjs.Shape();	
		guideline.graphics.setStrokeStyle(2).beginStroke('red').drawRect((stageW-contentW)/2, (stageH-contentH)/2, contentW, contentH);
	}
	
	buttonLocalContainer.addChild(buttonLocal, buttonOnline);
	mainContainer.addChild(logo, logoP, buttonPlay, buttonLocalContainer);
	cardsContainer.addChild(cardsPlayContainer);
	gameContainer.addChild(cardsPlayersContainer, itemColors, itemFrozen, cardsContainer, colorsContainer, statusContainer, guideContainer, cardScoreContainer);
	
	resultContainer.addChild(itemResult, itemResultP, buttonContinue, resultTitleTxt, resultDescTxt);
	
	if(shareEnable){
		resultContainer.addChild(resultShareTxt, buttonFacebook, buttonTwitter, buttonWhatsapp);
	}
	
	canvasContainer.addChild(bg, bgP, mainContainer, nameContainer, roomContainer, cardsOptionsContainer, gameContainer, gameLogsTxt, resultContainer, confirmContainer, optionsContainer, buttonSettings, guideline);
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
		cardsContainer.x = canvasW/2;
		cardsContainer.y = canvasH/2;

		cardsOptionsContainer.x = canvasW/2;
		cardsOptionsContainer.y = canvasH/2;

		if(viewport.isLandscape){
			bg.visible = false;
			bgP.visible = false;

			logo.visible = true;
			logoP.visible = false;

			buttonPlay.x = (canvasW/2);
			buttonPlay.y = canvasH/100 * 75;

			buttonLocal.x = canvasW/2 - 140;
			buttonLocal.y = canvasH/100 * 75;

			buttonOnline.x = canvasW/2 + 140;
			buttonOnline.y = canvasH/100 * 75;

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
			buttonContinue.y = canvasH/100 * 68;
	
			resultShareTxt.x = canvasW/2;
			resultShareTxt.y = canvasH/100 * 53;
	
			resultTitleTxt.x = canvasW/2;
			resultTitleTxt.y = canvasH/100 * 37;

			resultDescTxt.x = canvasW/2;
			resultDescTxt.y = canvasH/100 * 48;
			
			//exit
			itemExit.visible = true;
			itemExitP.visible = false;

			buttonConfirm.x = (canvasW/2) - 140;
			buttonConfirm.y = (canvasH/100 * 68);
			
			buttonCancel.x = (canvasW/2) + 140;
			buttonCancel.y = (canvasH/100 * 68);

			popTitleTxt.x = canvasW/2;
			popTitleTxt.y = canvasH/100 * 37;
			
			popDescTxt.x = canvasW/2;
			popDescTxt.y = canvasH/100 * 45;

			//room
			$('#roomWrapper').removeClass('forPortrait');
			$('#notificationHolder').removeClass('forPortrait');
			$('#roomlists').attr('size', 10);
			$('#namelists').attr('size', 10);
			$('#roomLogs').attr('rows', 10);
		}else{
			cardsContainer.x = canvasW/2;
			cardsContainer.y = canvasH/100 * 50;

			bg.visible = false;
			bgP.visible = false;

			logo.visible = false;
			logoP.visible = true;

			buttonPlay.x = (canvasW/2);
			buttonPlay.y = canvasH/100 * 73;
			
			buttonLocal.x = canvasW/2;
			buttonLocal.y = canvasH/100 * 73;

			buttonOnline.x = canvasW/2;
			buttonOnline.y = canvasH/100 * 83;

			//game
			
			//result
			itemResult.visible = false;
			itemResultP.visible = true;
			
			buttonFacebook.x = canvasW/100*39;
			buttonFacebook.y = canvasH/100*56;
			buttonTwitter.x = canvasW/2;
			buttonTwitter.y = canvasH/100*56;
			buttonWhatsapp.x = canvasW/100*61;
			buttonWhatsapp.y = canvasH/100*56;
			
			buttonContinue.x = canvasW/2;
			buttonContinue.y = canvasH/100 * 64;
	
			resultShareTxt.x = canvasW/2;
			resultShareTxt.y = canvasH/100 * 52;
	
			resultTitleTxt.x = canvasW/2;
			resultTitleTxt.y = canvasH/100 * 40;

			resultDescTxt.x = canvasW/2;
			resultDescTxt.y = canvasH/100 * 48;
			
			//exit
			itemExit.visible = false;
			itemExitP.visible = true;

			buttonConfirm.x = (canvasW/2) - 130;
			buttonConfirm.y = (canvasH/100 * 64);
			
			buttonCancel.x = (canvasW/2) + 130;
			buttonCancel.y = (canvasH/100 * 64);

			popTitleTxt.x = canvasW/2;
			popTitleTxt.y = canvasH/100 * 40;
			
			popDescTxt.x = canvasW/2;
			popDescTxt.y = canvasH/100 * 48;

			//room
			$('#roomWrapper').addClass('forPortrait');
			$('#notificationHolder').addClass('forPortrait');
			$('#roomlists').attr('size', 8);
			$('#namelists').attr('size', 8);
			$('#roomLogs').attr('rows', 6);
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
		
		var distanceNum = 65;
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
			
			// buttonFullscreen.x = buttonSettings.x;
			// buttonFullscreen.y = buttonSettings.y+(distanceNum*(nextCount+1));
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
			
			// buttonFullscreen.x = buttonSettings.x;
			// buttonFullscreen.y = buttonSettings.y+(distanceNum*(nextCount+1));
			
			buttonExit.x = buttonSettings.x;
			buttonExit.y = buttonSettings.y+(distanceNum*(nextCount+1));
		}

		resizeGameLayout()
		resizeSocketLog()
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
	updateGame();
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