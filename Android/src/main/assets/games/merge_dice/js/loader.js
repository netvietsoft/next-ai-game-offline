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
			{src:'assets/background.png', id:'bg'},
			{src:'assets/background_p.png', id:'bgP'},
			{src:'assets/bg_main.png', id:'bgMain'},
			{src:'assets/bg_main_p.png', id:'bgMainP'},
			{src:'assets/logo.png', id:'logo'},
			{src:'assets/logo_p.png', id:'logoP'},
			{src:'assets/button_play.png', id:'buttonPlay'},

			{src:'assets/item_board.png', id:'itemBoard'},
			{src:'assets/item_highlight.png', id:'itemHighlight'},
			{src:'assets/item_rotate.png', id:'itemRotate'},
			{src:'assets/item_score.png', id:'itemScore'},
			{src:'assets/item_timer.png', id:'itemTimer'},
			{src:'assets/item_status.png', id:'itemStatus'},
			{src:'assets/item_destroy.png', id:'itemDestroy'},
		
			{src:'assets/button_facebook.png', id:'buttonFacebook'},
			{src:'assets/button_twitter.png', id:'buttonTwitter'},
			{src:'assets/button_whatsapp.png', id:'buttonWhatsapp'},
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

	for(var n=0; n<dicesArr.length; n++){
		for(var a=0; a<dicesArr[n].assets.length; a++){
			manifest.push({src:dicesArr[n].assets[a], id:'dice'+n+'_'+a});
		}
		for(var a=0; a<dicesArr[n].particles.length; a++){
			manifest.push({src:dicesArr[n].particles[a], id:'particle'+n+'_'+a});
		}
	}
	
	if ( typeof addScoreboardAssets == 'function' ) { 
		addScoreboardAssets();
	}
	
	soundOn = true;
	if($.browser.mobile || isTablet){
		if(!enableMobileSound){
			soundOn=false;
		}
	}else{
		if(!enableDesktopSound){
			soundOn=false;
		}
	}
	
	if(soundOn){
		manifest.push({src:'assets/sounds/sound_click.ogg', id:'soundButton'});
		manifest.push({src:'assets/sounds/sound_result.ogg', id:'soundResult'});
		manifest.push({src:'assets/sounds/sound_start.ogg', id:'soundStart'});
		manifest.push({src:'assets/sounds/sound_error.ogg', id:'soundError'});
		manifest.push({src:'assets/sounds/sound_timer_end.ogg', id:'soundTimerEnd'});
		manifest.push({src:'assets/sounds/sound_timer.ogg', id:'soundTimer'});
		manifest.push({src:'assets/sounds/sound_dice.ogg', id:'soundDice'});
		manifest.push({src:'assets/sounds/sound_dice_drag.ogg', id:'soundDiceDrag'});
		manifest.push({src:'assets/sounds/sound_dice_absorb.ogg', id:'soundDiceAbsorb'});
		manifest.push({src:'assets/sounds/sound_dice_destroy.ogg', id:'soundDiceDestroy'});
		manifest.push({src:'assets/sounds/sound_dice_drop.ogg', id:'soundDiceDrop'});
		manifest.push({src:'assets/sounds/sound_dice_revert.ogg', id:'soundDiceRevert'});
		manifest.push({src:'assets/sounds/sound_dice_rotate.ogg', id:'soundDiceRotate'});
		manifest.push({src:'assets/sounds/sound_score.ogg', id:'soundScore'});
		manifest.push({src:'assets/sounds/sound_destroy.ogg', id:'soundDestroy'});
		manifest.push({src:'assets/sounds/sound_glass.ogg', id:'soundGlass'});
		manifest.push({src:'assets/sounds/music_main.ogg', id:'musicMain'});
		manifest.push({src:'assets/sounds/music_game.ogg', id:'musicGame'});
		
		createjs.Sound.alternateExtensions = ["mp3"];
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
	//console.log("Event Callback file loaded ", evt.item.id);
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
function handleComplete() {
	toggleLoader(false);
	initMain();
};

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