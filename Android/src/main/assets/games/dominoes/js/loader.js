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
			// {src:'assets/background.png', id:'background'},
			{src:'assets/background_p.png', id:'backgroundP'},
			{src:'assets/logo.png', id:'logo'},
			{src:'assets/logo_p.png', id:'logoP'},
			{src:'assets/button_play.png', id:'buttonPlay'},
			{src:'assets/button_start.png', id:'buttonStart'},
			{src:'assets/button_next.png', id:'buttonNext'},
			{src:'assets/button_online.png', id:'buttonOnline'},
			{src:'assets/button_local.png', id:'buttonLocal'},

			{src:'assets/button_arrow_left.png', id:'buttonArrowLeft'},
			{src:'assets/button_arrow_right.png', id:'buttonArrowRight'},
			{src:'assets/button_plus.png', id:'buttonPlus'},
			{src:'assets/button_minus.png', id:'buttonMinus'},
			{src:'assets/item_number.png', id:'itemNumber'},

			{src:'assets/item_player_stats.png', id:'itemPlayerStats'},
			{src:'assets/item_player_stats_highlight.png', id:'itemPlayerStatsHighlight'},
			{src:'assets/item_status.png', id:'itemStatus'},
			{src:'assets/item_draw_bg.png', id:'itemDrawBg'},
			{src:'assets/item_draw_bg_p.png', id:'itemDrawBgP'},
			{src:'assets/item_tile_highlight.png', id:'itemTileHighlight'},
			{src:'assets/item_score.png', id:'itemScore'},
			{src:'assets/item_score_top.png', id:'itemScoreTop'},
			{src:'assets/item_score_divide.png', id:'itemScoreDivide'},
		
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

	for(var n=0; n<themes_arr.length; n++){
		manifest.push({src:themes_arr[n].bg.front, id:'themeBgFront'+n});
		manifest.push({src:themes_arr[n].bg.back, id:'themeBgBack'+n});
		manifest.push({src:themes_arr[n].highlight.image, id:'themeHighlight'+n});
		manifest.push({src:themes_arr[n].shadow.image, id:'themeShadow'+n});
		manifest.push({src:themes_arr[n].numbers.image, id:'themeNumbers'+n});
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
		manifest.push({src:'assets/sounds/sound_domino_pick.ogg', id:'soundDominoPick'});
		manifest.push({src:'assets/sounds/sound_domino1.ogg', id:'soundDomino1'});
		manifest.push({src:'assets/sounds/sound_domino2.ogg', id:'soundDomino2'});
		manifest.push({src:'assets/sounds/sound_domino3.ogg', id:'soundDomino3'});
		manifest.push({src:'assets/sounds/sound_point.ogg', id:'soundPoint'});
		manifest.push({src:'assets/sounds/sound_round.ogg', id:'soundRound'});
		manifest.push({src:'assets/sounds/sound_winner.ogg', id:'soundWinner'});
		manifest.push({src:'assets/sounds/sound_shuffle_in.ogg', id:'soundShuffleIn'});
		manifest.push({src:'assets/sounds/sound_shuffle_out.ogg', id:'soundShuffleOut'});
		manifest.push({src:'assets/sounds/sound_result.ogg', id:'soundResult'});
		manifest.push({src:'assets/sounds/sound_alert.ogg', id:'soundAlert'});
		manifest.push({src:'assets/sounds/music_game.ogg', id:'musicGame'});
		manifest.push({src:'assets/sounds/music_main.ogg', id:'musicMain'});
		
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