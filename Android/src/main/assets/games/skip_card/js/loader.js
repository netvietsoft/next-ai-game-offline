////////////////////////////////////////////////////////////
// CANVAS LOADER
////////////////////////////////////////////////////////////

 /*!
 * 
 * START CANVAS PRELOADER - This is the function that runs to preload canvas asserts
 * 
 */
function initPreload(){
	toggleLoader(true);
	checkMobileEvent();
	
	$(window).resize(function(){
		clearTimeout(resizeTimer);
		resizeTimer = setTimeout(checkMobileOrientation, 1000);
	});
	resizeGameFunc();
	
	loader = new createjs.LoadQueue(false);
	manifest=[
			{src:'assets/background.png', id:'background'},
			{src:'assets/background_p.png', id:'backgroundP'},
			{src:'assets/logo.png', id:'logo'},
			{src:'assets/logo_p.png', id:'logoP'},
			{src:'assets/button_play.png', id:'buttonPlay'},
			{src:'assets/button_start.png', id:'buttonStart'},
			{src:'assets/button_next.png', id:'buttonNext'},
			{src:'assets/button_online.png', id:'buttonOnline'},
			{src:'assets/button_local.png', id:'buttonLocal'},

			{src:'assets/button_back.png', id:'buttonBack'},
			{src:'assets/item_tutorial_1.png', id:'itemTutorial1'},
			{src:'assets/item_tutorial_2.png', id:'itemTutorial2'},
			{src:'assets/item_tutorial_3.png', id:'itemTutorial3'},
			{src:'assets/item_tutorial_4.png', id:'itemTutorial4'},
			{src:'assets/item_tutorial_5.png', id:'itemTutorial5'},
			{src:'assets/item_tutorial_6.png', id:'itemTutorial6'},
			{src:'assets/item_tutorial_7.png', id:'itemTutorial7'},
			{src:'assets/item_tutorial_8.png', id:'itemTutorial8'},
			{src:'assets/item_tutorial_9.png', id:'itemTutorial9'},

			{src:'assets/item_options.png', id:'itemOptions'},
			{src:'assets/button_arrow_left.png', id:'buttonArrowLeft'},
			{src:'assets/button_arrow_right.png', id:'buttonArrowRight'},
			{src:'assets/button_tutorial.png', id:'buttonTutorial'},
			{src:'assets/item_number.png', id:'itemNumber'},
			{src:'assets/item_score.png', id:'itemScore'},
			{src:'assets/item_score_top.png', id:'itemScoreTop'},
			{src:'assets/item_score_divide.png', id:'itemScoreDivide'},

			{src:'assets/item_player.png', id:'itemPlayer'},
			{src:'assets/item_player_bg.png', id:'itemPlayerBg'},
			{src:'assets/item_player_bg_p.png', id:'itemPlayerBgP'},
			{src:'assets/item_player_bg_2.png', id:'itemPlayerBg2'},
			{src:'assets/item_discard.png', id:'itemDiscard'},
			{src:'assets/item_piles.png', id:'itemPiles'},
			{src:'assets/item_status.png', id:'itemStatus'},
		
			{src:'assets/button_share.png', id:'buttonShare'},
			{src:'assets/button_save.png', id:'buttonSave'},
			{src:'assets/social/button_facebook.png', id:'buttonFacebook'},
			{src:'assets/social/button_twitter.png', id:'buttonTwitter'},
			{src:'assets/social/button_whatsapp.png', id:'buttonWhatsapp'},
			{src:'assets/social/button_telegram.png', id:'buttonTelegram'},
			{src:'assets/social/button_reddit.png', id:'buttonReddit'},
			{src:'assets/social/button_linkedin.png', id:'buttonLinkedin'},
			
			{src:'assets/button_continue.png', id:'buttonContinue'},
			{src:'assets/item_pop.png', id:'itemPop'},
			{src:'assets/item_pop_p.png', id:'itemPopP'},
			{src:'assets/button_confirm.png', id:'buttonConfirm'},
			{src:'assets/button_cancel.png', id:'buttonCancel'},
			{src:'assets/button_fullscreen.png', id:'buttonFullscreen'},
			{src:'assets/button_sound_on.png', id:'buttonSoundOn'},
			{src:'assets/button_sound_off.png', id:'buttonSoundOff'},
			{src:'assets/button_music_on.png', id:'buttonMusicOn'},
			{src:'assets/button_music_off.png', id:'buttonMusicOff'},
			{src:'assets/button_exit.png', id:'buttonExit'},
			{src:'assets/button_settings.png', id:'buttonSettings'}
	];

	for(var n=0; n<themes_arr.length; n++){
		manifest.push({src:themes_arr[n].front, id:'cardCover'+n});
		manifest.push({src:themes_arr[n].highlight, id:'cardHighlight'+n});
		manifest.push({src:themes_arr[n].skip, id:'cardSkip'+n});
		for(var p=0; p<themes_arr[n].numbers.length; p++){
			manifest.push({src:themes_arr[n].numbers[p], id:'cardNumber'+n+'_'+p});
		}
		for(var p=0; p<themes_arr[n].skipnumbers.length; p++){
			manifest.push({src:themes_arr[n].skipnumbers[p], id:'cardSkipNumber'+n+'_'+p});
		}
	}
	
	if ( typeof addScoreboardAssets == 'function' ) { 
		addScoreboardAssets();
	}
	
	audioOn = true;
	if(!isDesktop){
		if(!enableMobileAudio){
			audioOn=false;
		}
	}else{
		if(!enableDesktopAudio){
			audioOn=false;
		}
	}
	
	if(audioOn){
		manifest.push({src:'assets/sounds/sound_click.mp3', id:'soundButton'});
		manifest.push({src:'assets/sounds/sound_card_deal.mp3', id:'soundCardDeal'});
		manifest.push({src:'assets/sounds/sound_card_flip.mp3', id:'soundCardFlip'});
		manifest.push({src:'assets/sounds/sound_card_draw.mp3', id:'soundCardDraw'});
		manifest.push({src:'assets/sounds/sound_card_shuffle.mp3', id:'soundCardShuffle'});
		manifest.push({src:'assets/sounds/sound_point.mp3', id:'soundPoint'});
		manifest.push({src:'assets/sounds/sound_result.mp3', id:'soundResult'});
		manifest.push({src:'assets/sounds/sound_alert.mp3', id:'soundAlert'});
		manifest.push({src:'assets/sounds/sound_stack.mp3', id:'soundStack'});
		manifest.push({src:'assets/sounds/sound_stack_complete.mp3', id:'soundStackComplete'});
		manifest.push({src:'assets/sounds/music_game.mp3', id:'musicGame'});
		manifest.push({src:'assets/sounds/music_main.mp3', id:'musicMain'});
		
		loader.installPlugin(createjs.Sound);
	}
	
	loader.addEventListener("complete", handleComplete);
	loader.addEventListener("fileload", fileComplete);
	loader.addEventListener("error",handleFileError);
	loader.on("progress", handleProgress, this);
	loader.loadManifest(manifest);
}

/*!
 * 
 * CANVAS FILE COMPLETE EVENT - This is the function that runs to update when file loaded complete
 * 
 */
function fileComplete(evt) {
	var item = evt.item;
	//console.log("Event Callback file loaded ", item.id);
}

/*!
 * 
 * CANVAS FILE HANDLE EVENT - This is the function that runs to handle file error
 * 
 */
function handleFileError(evt) {
	console.log("error ", evt);
}

/*!
 * 
 * CANVAS PRELOADER UPDATE - This is the function that runs to update preloder progress
 * 
 */
function handleProgress() {
	$('#mainLoader span').html(Math.round(loader.progress/1*100)+'%');
}

/*!
 * 
 * CANVAS PRELOADER COMPLETE - This is the function that runs when preloader is complete
 * 
 */
function sendEvent(typeVar,valueVar){
    try {
        var messageBody = {type: typeVar, value: valueVar}
        window.webkit.messageHandlers.ports.postMessage(messageBody);
    } catch (err) {
        console.log(err);
    }
}

function handleComplete() {
	toggleLoader(false);
	sendEvent("gameLoaded",0);
	initMain();
	forceRetinaViewport();
};

function forceRetinaViewport(){
	setTimeout(() => {
		var isiOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
		if(!isiOS){
			return;
		}
		var metaViewport = document.querySelector('meta[name=viewport]');
		if(!metaViewport){
			return;
		}
		var dpr = window.devicePixelRatio || 1;
		metaViewport.setAttribute("content", "width=device-width, initial-scale=" + (1 / dpr) + ", user-scalable=no");
		metaViewport.setAttribute("content", "width=device-width, initial-scale=1, user-scalable=no");
	}, 500);
}


/*!
 * 
 * TOGGLE LOADER - This is the function that runs to display/hide loader
 * 
 */
function toggleLoader(con){
	if(con){
		$('#mainLoader').show();
	}else{
		$('#mainLoader').hide();
	}
}