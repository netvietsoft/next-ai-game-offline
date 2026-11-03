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

$.card = {};
$.status = {};

/*!
 * 
 * BUILD GAME CANVAS ASSERTS - This is the function that runs to build game canvas asserts
 * 
 */
function buildGameCanvas(){
	canvasContainer = new createjs.Container();
	mainContainer = new createjs.Container();
	buttonLocalContainer = new createjs.Container();
	sizeContainer = new createjs.Container();
	gameContainer = new createjs.Container();
	cardsContainer = new createjs.Container();
	numbersContainer = new createjs.Container();
	cardsWrapContainer = new createjs.Container();
	cardsMoveContainer = new createjs.Container();
	bombContainer = new createjs.Container();
	particlesContainer = new createjs.Container();
	playerStatusContainer = new createjs.Container();
	gameStatusContainer = new createjs.Container();

	resultContainer = new createjs.Container();
	confirmContainer = new createjs.Container();
	
	bg = new createjs.Bitmap(loader.getResult('bg'));
	bgP = new createjs.Bitmap(loader.getResult('bgP'));
	logo = new createjs.Bitmap(loader.getResult('logo'));
	logoP = new createjs.Bitmap(loader.getResult('logoP'));
	
	buttonPlay = new createjs.Bitmap(loader.getResult('buttonPlay'));
	centerReg(buttonPlay);

	buttonTutorial = new createjs.Bitmap(loader.getResult('buttonTutorial'));
	centerReg(buttonTutorial);

	buttonLocal = new createjs.Bitmap(loader.getResult('buttonLocal'));
	centerReg(buttonLocal);

	buttonOnline = new createjs.Bitmap(loader.getResult('buttonOnline'));
	centerReg(buttonOnline);

	//size
	itemPopSize = new createjs.Bitmap(loader.getResult('itemPopSize'));
	centerReg(itemPopSize);

	buttonArrowLeft = new createjs.Bitmap(loader.getResult('buttonArrowLeft'));
	centerReg(buttonArrowLeft);

	buttonArrowRight = new createjs.Bitmap(loader.getResult('buttonArrowRight'));
	centerReg(buttonArrowRight);

	buttonSizePlay = new createjs.Bitmap(loader.getResult('buttonPlay'));
	centerReg(buttonSizePlay);

	sizeTitleTxt = new createjs.Text();
	sizeTitleTxt.font = "65px australiatitle";
	sizeTitleTxt.color = "#fff";
	sizeTitleTxt.textAlign = "center";
	sizeTitleTxt.textBaseline='alphabetic';
	sizeTitleTxt.text = textDisplay.sizeTitle;

	sizePlayTxt = new createjs.Text();
	sizePlayTxt.font = "55px australiatitle";
	sizePlayTxt.color = '#fff';
	sizePlayTxt.textAlign = "center";
	sizePlayTxt.textBaseline='alphabetic';
	sizePlayTxt.text = "3 X 3";

	sizeTitleTxt.y = -100;
	sizePlayTxt.y = 28;
	buttonArrowLeft.x = -180;
	buttonArrowRight.x = 180;
	buttonArrowLeft.y = buttonArrowRight.y = 20;
	buttonSizePlay.y = 140

	sizeContainer.addChild(itemPopSize, buttonArrowLeft, buttonArrowRight, buttonSizePlay, sizeTitleTxt, sizePlayTxt);

	//game
	for(var n=0; n<2; n++){
		$.status[n] = new createjs.Container();
		$.status["bg"+n] = new createjs.Bitmap(loader.getResult('itemStats'));
		centerReg($.status["bg"+n]);
		$.status["bg"+n].regX = 0;

		$.status["icon"+n] = new createjs.Container();

		$.status["coin"+n] = new createjs.Bitmap(loader.getResult('iconCoin'));
		centerReg($.status["coin"+n]);

		$.status["coinTxt"+n] = new createjs.Text();
		$.status["coinTxt"+n].font = "25px australiatitle";
		$.status["coinTxt"+n].color = '#fff';
		$.status["coinTxt"+n].textAlign = "center";
		$.status["coinTxt"+n].textBaseline='alphabetic';
		$.status["coinTxt"+n].text = "000";

		$.status["kill"+n] = new createjs.Bitmap(loader.getResult('iconKill'));
		centerReg($.status["kill"+n]);

		$.status["killTxt"+n] = new createjs.Text();
		$.status["killTxt"+n].font = "25px australiatitle";
		$.status["killTxt"+n].color = '#fff';
		$.status["killTxt"+n].textAlign = "center";
		$.status["killTxt"+n].textBaseline='alphabetic';
		$.status["killTxt"+n].text = "000";

		$.status["playerNameTxt"+n] = new createjs.Text();
		$.status["playerNameTxt"+n].font = "20px australiatitle";
		$.status["playerNameTxt"+n].color = '#fff';
		$.status["playerNameTxt"+n].textAlign = "center";
		$.status["playerNameTxt"+n].textBaseline='alphabetic';
		$.status["playerNameTxt"+n].text = "PLAYER1";

		$.status["iconHilight"+n] = new createjs.Shape();	
		$.status["iconHilight"+n].graphics.beginFill('#FF9700').drawCircle(0, 0, 33);

		$.status["statsName"+n] = new createjs.Bitmap(loader.getResult('itemStatsName'));
		centerReg($.status["statsName"+n]);

		if(n == 0){
			$.status["icon"+n].x = $.status["iconHilight"+n].x =46;
			$.status["coin"+n].x = 110;
			$.status["coinTxt"+n].x = $.status["coin"+n].x + 35;
			$.status["coinTxt"+n].y = 9;
			$.status["kill"+n].x = 180;
			$.status["killTxt"+n].x = $.status["kill"+n].x + 35;
			$.status["killTxt"+n].y = 9;
			$.status["statsName"+n].x = 160;
			$.status["statsName"+n].y = -35;
			$.status["playerNameTxt"+n].x = $.status["statsName"+n].x;
			$.status["playerNameTxt"+n].y = $.status["statsName"+n].y+3;
		}else if(n == 1){
			$.status["bg"+n].scaleX = -1;
			$.status["icon"+n].scaleX = -1;

			$.status["icon"+n].x = $.status["iconHilight"+n].x = -46;
			$.status["coin"+n].x = -145;
			$.status["coinTxt"+n].x = $.status["coin"+n].x + 35;
			$.status["coinTxt"+n].y = 9;
			$.status["kill"+n].x = -215;
			$.status["killTxt"+n].x = $.status["kill"+n].x + 35;
			$.status["killTxt"+n].y = 9;
			$.status["statsName"+n].x = -160;
			$.status["statsName"+n].y = -35;
			$.status["playerNameTxt"+n].x = $.status["statsName"+n].x;
			$.status["playerNameTxt"+n].y = $.status["statsName"+n].y+5;
		}

		$.status[n].addChild($.status["statsName"+n], $.status["bg"+n], $.status["coin"+n], $.status["coinTxt"+n], $.status["kill"+n], $.status["killTxt"+n], $.status["iconHilight"+n], $.status["icon"+n], $.status["playerNameTxt"+n]);
		playerStatusContainer.addChild($.status[n]);
	}

	itemParticle1 = new createjs.Bitmap(loader.getResult('itemParticle1'));
	centerReg(itemParticle1);
	itemParticle2 = new createjs.Bitmap(loader.getResult('itemParticle2'));
	centerReg(itemParticle2);
	itemParticle3 = new createjs.Bitmap(loader.getResult('itemParticle3'));
	centerReg(itemParticle3);

	itemGameStatus = new createjs.Bitmap(loader.getResult('itemGameStatus'));
	centerReg(itemGameStatus);

	gameStatusTxt = new createjs.Text();
	gameStatusTxt.font = "35px australiatitle";
	gameStatusTxt.color = "#fff";
	gameStatusTxt.textAlign = "center";
	gameStatusTxt.textBaseline='alphabetic';
	gameStatusTxt.text = textDisplay.sizeTitle;
	gameStatusTxt.y = 13;

	gameStatusContainer.addChild(itemGameStatus, gameStatusTxt);

	//tutorial
	tutorialTitleTxt = new createjs.Text();
	tutorialTitleTxt.font = "65px australiatitle";
	tutorialTitleTxt.color = "#fff";
	tutorialTitleTxt.textAlign = "center";
	tutorialTitleTxt.textBaseline='alphabetic';
	tutorialTitleTxt.text = textDisplay.tutorialTitle;

	tutorialDescTxt = new createjs.Text();
	tutorialDescTxt.font = "30px australiatitle";
	tutorialDescTxt.lineHeight = 30;
	tutorialDescTxt.color = '#fff';
	tutorialDescTxt.textAlign = "center";
	tutorialDescTxt.textBaseline='alphabetic';
	tutorialDescTxt.text = textDisplay.share;
	
	//result
	itemResult = new createjs.Bitmap(loader.getResult('itemPop'));
	itemResultP = new createjs.Bitmap(loader.getResult('itemPopP'));
	
	buttonContinue = new createjs.Bitmap(loader.getResult('buttonContinue'));
	centerReg(buttonContinue);
	
	resultShareTxt = new createjs.Text();
	resultShareTxt.font = "30px australiatitle";
	resultShareTxt.color = '#fff';
	resultShareTxt.textAlign = "center";
	resultShareTxt.textBaseline='alphabetic';
	resultShareTxt.text = textDisplay.share;

	resultKillTxt = new createjs.Text();
	resultKillTxt.font = "35px australiatitle";
	resultKillTxt.color = '#ea4946';
	resultKillTxt.textAlign = "center";
	resultKillTxt.textBaseline='alphabetic';
	resultKillTxt.text = textDisplay.share;
	
	resultDescTxt = new createjs.Text();
	resultDescTxt.font = "75px australiatitle";
	resultDescTxt.color = '#e48524';
	resultDescTxt.textAlign = "center";
	resultDescTxt.textBaseline='alphabetic';
	resultDescTxt.text = '';

	resultTitleTxt = new createjs.Text();
	resultTitleTxt.font = "65px australiatitle";
	resultTitleTxt.color = "#fff";
	resultTitleTxt.textAlign = "center";
	resultTitleTxt.textBaseline='alphabetic';
	resultTitleTxt.text = textDisplay.resultTitle;
	
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
	popDescTxt.font = "35px australiatitle";
	popDescTxt.lineHeight = 40;
	popDescTxt.color = "#fff";
	popDescTxt.textAlign = "center";
	popDescTxt.textBaseline='alphabetic';
	popDescTxt.text = textDisplay.exitMessage;

	exitTitleTxt = new createjs.Text();
	exitTitleTxt.font = "65px australiatitle";
	exitTitleTxt.color = "#fff";
	exitTitleTxt.textAlign = "center";
	exitTitleTxt.textBaseline='alphabetic';
	exitTitleTxt.text = textDisplay.exitTitle;
	
	confirmContainer.addChild(itemExit, itemExitP, popDescTxt, exitTitleTxt, buttonConfirm, buttonCancel);
	confirmContainer.visible = false;

	//room
	roomContainer = new createjs.Container();
	nameContainer = new createjs.Container();
	bgRoom = new createjs.Shape();
	bgRoom.graphics.beginFill('#000').drawRect(-(landscapeSize.w/2), -(portraitSize.h/2), landscapeSize.w, portraitSize.h);
	bgRoom.alpha = .6;

	gameLogsTxt = new createjs.Text();
	gameLogsTxt.font = "25px russo_oneregular";
	gameLogsTxt.color = "#fff";
	gameLogsTxt.textAlign = "center";
	gameLogsTxt.textBaseline='alphabetic';
	gameLogsTxt.text = '';
	
	if(guide){
		guideline = new createjs.Shape();	
		guideline.graphics.setStrokeStyle(2).beginStroke('red').drawRect((stageW-contentW)/2, (stageH-contentH)/2, contentW, contentH);
	}
	
	buttonLocalContainer.addChild(buttonLocal, buttonOnline);
	mainContainer.addChild(logo, logoP, buttonPlay, buttonTutorial, buttonLocalContainer);
	cardsMoveContainer.addChild(cardsContainer, particlesContainer, bombContainer, numbersContainer);
	cardsWrapContainer.addChild(cardsMoveContainer);
	gameContainer.addChild(cardsWrapContainer, playerStatusContainer, gameStatusContainer, tutorialDescTxt, tutorialTitleTxt);

	resultContainer.addChild(itemResult, itemResultP, buttonContinue, resultDescTxt, resultTitleTxt, resultKillTxt);
	
	if(shareEnable){
		resultContainer.addChild(resultShareTxt, buttonFacebook, buttonTwitter, buttonWhatsapp);
	}
	
	canvasContainer.addChild(bg, bgP, mainContainer, sizeContainer, gameContainer, gameLogsTxt, resultContainer, confirmContainer, optionsContainer, buttonSettings, guideline);
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
		gameStatusContainer.x = canvasW/2;
		gameStatusContainer.y = canvasH/2;

		if(viewport.isLandscape){
			bg.visible = true;
			bgP.visible = false;

			logo.visible = true;
			logoP.visible = false;

			buttonPlay.x = canvasW/2 - 110;
			buttonPlay.y = canvasH/100 * 80;

			buttonTutorial.x = canvasW/2 + 110;
			buttonTutorial.y = canvasH/100 * 80;

			buttonLocal.x = canvasW/2 - 110;
			buttonLocal.y = canvasH/100 * 80;

			buttonOnline.x = canvasW/2 + 110;
			buttonOnline.y = canvasH/100 * 80;

			//game
			sizeContainer.x = canvasW/2;
			sizeContainer.y = canvasH/2;
			
			//result
			itemResult.visible = true;
			itemResultP.visible = false;
			
			buttonFacebook.x = canvasW/100*43;
			buttonFacebook.y = canvasH/100*60;
			buttonTwitter.x = canvasW/2;
			buttonTwitter.y = canvasH/100*60;
			buttonWhatsapp.x = canvasW/100*57;
			buttonWhatsapp.y = canvasH/100*60;
			
			buttonContinue.x = canvasW/2;
			buttonContinue.y = canvasH/100 * 71;
	
			resultShareTxt.x = canvasW/2;
			resultShareTxt.y = canvasH/100 * 54;
	
			resultDescTxt.x = canvasW/2;
			resultDescTxt.y = canvasH/100 * 48;

			resultKillTxt.x = canvasW/2;
			resultKillTxt.y = canvasH/100 * 39;

			resultTitleTxt.x = canvasW/2;
			resultTitleTxt.y = canvasH/100 * 33;
			
			//exit
			itemExit.visible = true;
			itemExitP.visible = false;

			buttonConfirm.x = (canvasW/2);
			buttonConfirm.y = (canvasH/100 * 63);
			
			buttonCancel.x = (canvasW/2);
			buttonCancel.y = (canvasH/100 * 73);
			
			popDescTxt.x = canvasW/2;
			popDescTxt.y = canvasH/100 * 41;

			exitTitleTxt.x = canvasW/2;
			exitTitleTxt.y = canvasH/100 * 33;

			//room
			$('#roomWrapper').removeClass('forPortrait');
			$('#notificationHolder').removeClass('forPortrait');
			$('#roomlists').attr('size', 10);
			$('#namelists').attr('size', 10);
			$('#roomLogs').attr('rows', 10);
		}else{
			bg.visible = false;
			bgP.visible = true;

			logo.visible = false;
			logoP.visible = true;

			buttonPlay.x = canvasW/2;
			buttonPlay.y = canvasH/100 * 70;

			buttonTutorial.x = canvasW/2;
			buttonTutorial.y = canvasH/100 * 78;

			buttonLocal.x = canvasW/2;
			buttonLocal.y = canvasH/100 * 70;

			buttonOnline.x = canvasW/2;
			buttonOnline.y = canvasH/100 * 78;

			//game
			sizeContainer.x = canvasW/2;
			sizeContainer.y = canvasH/2;
			
			//result
			itemResult.visible = false;
			itemResultP.visible = true;
			
			buttonFacebook.x = canvasW/100*39;
			buttonFacebook.y = canvasH/100*58;
			buttonTwitter.x = canvasW/2;
			buttonTwitter.y = canvasH/100*58;
			buttonWhatsapp.x = canvasW/100*61;
			buttonWhatsapp.y = canvasH/100*58;
			
			buttonContinue.x = canvasW/2;
			buttonContinue.y = canvasH/100 * 67;
	
			resultShareTxt.x = canvasW/2;
			resultShareTxt.y = canvasH/100 * 53;
	
			resultDescTxt.x = canvasW/2;
			resultDescTxt.y = canvasH/100 * 49;

			resultKillTxt.x = canvasW/2;
			resultKillTxt.y = canvasH/100 * 42;

			resultTitleTxt.x = canvasW/2;
			resultTitleTxt.y = canvasH/100 * 38;
			
			//exit
			itemExit.visible = false;
			itemExitP.visible = true;

			buttonConfirm.x = (canvasW/2);
			buttonConfirm.y = (canvasH/100 * 60);
			
			buttonCancel.x = (canvasW/2);
			buttonCancel.y = (canvasH/100 * 67);
			
			popDescTxt.x = canvasW/2;
			popDescTxt.y = canvasH/100 * 45;

			exitTitleTxt.x = canvasW/2;
			exitTitleTxt.y = canvasH/100 * 38;

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

		resizeGameLayout();
		resizeSocketLog();
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