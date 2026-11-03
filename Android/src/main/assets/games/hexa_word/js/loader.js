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
			{src:'assets/button_start.png', id:'buttonStart'},
			{src:'assets/button_category.png', id:'buttonCategory'},
			{src:'assets/button_letter.png', id:'buttonLetter'},
			{src:'assets/button_arrow.png', id:'buttonArrow'},

			{src:'assets/button_reset.png', id:'buttonReset'},
			{src:'assets/button_enter.png', id:'buttonEnter'},
			{src:'assets/button_clear.png', id:'buttonClear'},
			{src:'assets/item_dir.png', id:'itemDir'},
		
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
			{src:'assets/button_exit.png', id:'buttonExit'},
			{src:'assets/button_settings.png', id:'buttonSettings'}
	];
	
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
		manifest.push({src:'assets/sounds/sound_complete.ogg', id:'soundComplete'});
		manifest.push({src:'assets/sounds/sound_pop1.ogg', id:'soundPop1'});
		manifest.push({src:'assets/sounds/sound_pop2.ogg', id:'soundPop2'});
		manifest.push({src:'assets/sounds/sound_pop3.ogg', id:'soundPop3'});
		manifest.push({src:'assets/sounds/sound_pop_revert.ogg', id:'soundPopRevert'});
		manifest.push({src:'assets/sounds/sound_score.ogg', id:'soundScore'});
		manifest.push({src:'assets/sounds/sound_timer.ogg', id:'soundTimer'});
		manifest.push({src:'assets/sounds/sound_timer_end.ogg', id:'soundTimerEnd'});
		manifest.push({src:'assets/sounds/sound_result.ogg', id:'soundResult'});
		manifest.push({src:'assets/sounds/sound_error.ogg', id:'soundError'});
		manifest.push({src:'assets/sounds/sound_error2.ogg', id:'soundError2'});
		manifest.push({src:'assets/sounds/sound_clear.ogg', id:'soundClear'});
		manifest.push({src:'assets/sounds/sound_start.ogg', id:'soundStart'});
		manifest.push({src:'assets/sounds/sound_select.ogg', id:'soundSelect'});
		manifest.push({src:'assets/sounds/sound_release.ogg', id:'soundRelease'});
		manifest.push({src:'assets/sounds/sound_click2.ogg', id:'soundButton2'});
		manifest.push({src:'assets/sounds/sound_reset.ogg', id:'soundReset'});
		
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