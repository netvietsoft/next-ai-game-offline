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

$.players = {};
$.domino = {};

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
	dominoOptionsContainer = new createjs.Container();
	gameContainer = new createjs.Container();
	statusContainer = new createjs.Container();
	boardContainer = new createjs.Container();
	boardTileContainer = new createjs.Container();
	boardHighlightContainer = new createjs.Container();
	boardPlayersContainer = new createjs.Container();
	boardDrawContainer = new createjs.Container();
	boardScoreContainer = new createjs.Container();
	boardScoreListContainer = new createjs.Container();
	resultContainer = new createjs.Container();
	confirmContainer = new createjs.Container();
	
	
	// bg = new createjs.Bitmap(loader.getResult('background'));
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
	itemOptions = new createjs.Bitmap(loader.getResult('itemPop'));
	itemOptionsP = new createjs.Bitmap(loader.getResult('itemPopP'));

	optionsTitleTxt = new createjs.Text();
	optionsTitleTxt.font = "60px bpreplaybold";
	optionsTitleTxt.color = '#fff';
	optionsTitleTxt.textAlign = "center";
	optionsTitleTxt.textBaseline='alphabetic';
	optionsTitleTxt.text = textDisplay.optionsTitle;

	itemPlayerNumbers = new createjs.Bitmap(loader.getResult('itemNumber'));
	centerReg(itemPlayerNumbers);

	totalPlayersTxt = new createjs.Text();
	totalPlayersTxt.font = "28px bpreplaybold";
	totalPlayersTxt.color = '#27C610';
	totalPlayersTxt.textAlign = "center";
	totalPlayersTxt.textBaseline='alphabetic';

	buttonPlayersL = new createjs.Bitmap(loader.getResult('buttonArrowLeft'));
	centerReg(buttonPlayersL);
	buttonPlayersR = new createjs.Bitmap(loader.getResult('buttonArrowRight'));
	centerReg(buttonPlayersR);

	itemPoints = new createjs.Bitmap(loader.getResult('itemNumber'));
	centerReg(itemPoints);

	pointsTxt = new createjs.Text();
	pointsTxt.font = "28px bpreplaybold";
	pointsTxt.color = '#27C610';
	pointsTxt.textAlign = "center";
	pointsTxt.textBaseline='alphabetic';

	buttonPointsL = new createjs.Bitmap(loader.getResult('buttonArrowLeft'));
	centerReg(buttonPointsL);
	buttonPointsR = new createjs.Bitmap(loader.getResult('buttonArrowRight'));
	centerReg(buttonPointsR);

	itemType = new createjs.Bitmap(loader.getResult('itemNumber'));
	centerReg(itemType);

	typeTxt = new createjs.Text();
	typeTxt.font = "28px bpreplaybold";
	typeTxt.color = '#27C610';
	typeTxt.textAlign = "center";
	typeTxt.textBaseline='alphabetic';

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

	//game
	itemStatus = new createjs.Bitmap(loader.getResult('itemStatus'));
	centerReg(itemStatus);

	statusTxt = new createjs.Text();
	statusTxt.font = "25px bpreplaybold";
	statusTxt.color = '#fff';
	statusTxt.textAlign = "center";
	statusTxt.textBaseline='alphabetic';
	statusTxt.y = 23;

	statusPlayerTxt = new createjs.Text();
	statusPlayerTxt.font = "26px bpreplaybold";
	statusPlayerTxt.color = '#fff';
	statusPlayerTxt.textAlign = "center";
	statusPlayerTxt.textBaseline='alphabetic';
	statusPlayerTxt.y = -15;

	statusContainer.addChild(itemStatus, statusTxt, statusPlayerTxt);

	// itemDrawBg = new createjs.Bitmap(loader.getResult('itemDrawBg'));
	// centerReg(itemDrawBg);
	itemDrawBgP = new createjs.Bitmap(loader.getResult('itemDrawBgP'));
	centerReg(itemDrawBgP);

	drawTitleTxt = new createjs.Text();
	drawTitleTxt.font = "35px bpreplaybold";
	drawTitleTxt.color = '#fff';
	drawTitleTxt.textAlign = "center";
	drawTitleTxt.textBaseline='alphabetic';

	boardDrawContainer.addChild( itemDrawBgP, drawTitleTxt);

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

	boardScoreContainer.addChild(itemScoreTop, itemScore, roundStatusTxt, boardScoreListContainer);
	
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
	resultDescTxt.color = '#FFFF00';
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
	gameLogsTxt.font = "20px bpreplaybold";
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
	dominoOptionsContainer.addChild(itemOptions, itemOptionsP, optionsTitleTxt, itemPlayerNumbers, totalPlayersTxt, buttonPlayersL, buttonPlayersR, itemPoints, pointsTxt, buttonPointsL, buttonPointsR, itemType, typeTxt, buttonTypeL, buttonTypeR, themeContainer, buttonThemeL, buttonThemeR, buttonStart, buttonNext);
	
	boardContainer.addChild(boardHighlightContainer, boardTileContainer);
	gameContainer.addChild(boardContainer, boardPlayersContainer, statusContainer, boardScoreContainer);
	
	resultContainer.addChild(itemResult, itemResultP, buttonContinue, resultTitleTxt, resultDescTxt);
	
	if(shareEnable){
		resultContainer.addChild(resultShareTxt, buttonFacebook, buttonTwitter, buttonWhatsapp);
	}
	
	canvasContainer.addChild(bgP, mainContainer, nameContainer, roomContainer, dominoOptionsContainer, gameContainer, gameLogsTxt, resultContainer, confirmContainer, optionsContainer, buttonSettings, guideline);
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
		boardContainer.x = canvasW/2;
		boardContainer.y = canvasH/2;

		if(viewport.isLandscape){
			// bg.visible = true;
			bgP.visible = false;

			logo.visible = true;
			logoP.visible = false;

			buttonPlay.x = (canvasW/2);
			buttonPlay.y = canvasH/100 * 75;

			buttonLocal.x = canvasW/2 - 140;
			buttonLocal.y = canvasH/100 * 75;

			buttonOnline.x = canvasW/2 + 140;
			buttonOnline.y = canvasH/100 * 75;

			//options
			itemOptions.visible = true;
			itemOptionsP.visible = false;

			optionsTitleTxt.x = canvasW/2;
			optionsTitleTxt.y = canvasH/100 * 37;

			itemType.x = canvasW/2;
			itemType.y = canvasH/100 * 45;
			typeTxt.x = itemType.x;
			typeTxt.y = itemType.y + 10;
			buttonTypeL.x = canvasW/2 - 200;
			buttonTypeR.x = canvasW/2 + 200;
			buttonTypeL.y = buttonTypeR.y = itemType.y;

			itemPoints.x = canvasW/2;
			itemPoints.y = canvasH/100 * 56;
			pointsTxt.x = itemPoints.x;
			pointsTxt.y = itemPoints.y + 10;
			buttonPointsL.x = canvasW/2 - 200;
			buttonPointsR.x = canvasW/2 + 200;
			buttonPointsL.y = buttonPointsR.y = itemPoints.y;

			buttonNext.x = canvasW/2;
			buttonNext.y = canvasH/100 * 68;

			buttonStart.x = canvasW/2;
			buttonStart.y = canvasH/100 * 68;

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
			boardContainer.x = canvasW/2;
			boardContainer.y = canvasH/100 * 50;

			// bg.visible = false;
			bgP.visible = true;

			logo.visible = false;
			logoP.visible = true;

			buttonPlay.x = (canvasW/2);
			buttonPlay.y = canvasH/100 * 73;
			
			buttonLocal.x = canvasW/2;
			buttonLocal.y = canvasH/100 * 73;

			buttonOnline.x = canvasW/2;
			buttonOnline.y = canvasH/100 * 85;

			//players
			itemOptions.visible = false;
			itemOptionsP.visible = true;

			optionsTitleTxt.x = canvasW/2;
			optionsTitleTxt.y = canvasH/100 * 40;

			itemType.x = canvasW/2;
			itemType.y = canvasH/100 * 46;
			typeTxt.x = itemType.x;
			typeTxt.y = itemType.y + 10;
			buttonTypeL.x = canvasW/2 - 200;
			buttonTypeR.x = canvasW/2 + 200;
			buttonTypeL.y = buttonTypeR.y = itemType.y;

			itemPoints.x = canvasW/2;
			itemPoints.y = canvasH/100 * 54;
			pointsTxt.x = itemPoints.x;
			pointsTxt.y = itemPoints.y + 10;
			buttonPointsL.x = canvasW/2 - 200;
			buttonPointsR.x = canvasW/2 + 200;
			buttonPointsL.y = buttonPointsR.y = itemPoints.y;

			buttonNext.x = canvasW/2;
			buttonNext.y = canvasH/100 * 64;

			buttonStart.x = canvasW/2;
			buttonStart.y = canvasH/100 * 64;

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