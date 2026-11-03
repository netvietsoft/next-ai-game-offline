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
			{src:'assets/logo.png', id:'logo'},
			{src:'assets/logo_p.png', id:'logoP'},
			{src:'assets/button_play.png', id:'buttonPlay'},
			{src:'assets/button_local.png', id:'buttonLocal'},
			{src:'assets/button_online.png', id:'buttonOnline'},
			{src:'assets/button_tutorial.png', id:'buttonTutorial'},

			{src:'assets/item_pop_size.png', id:'itemPopSize'},
			{src:'assets/button_arrow_left.png', id:'buttonArrowLeft'},
			{src:'assets/button_arrow_right.png', id:'buttonArrowRight'},
			{src:'assets/item_stats.png', id:'itemStats'},
			{src:'assets/item_stats_name.png', id:'itemStatsName'},
			{src:'assets/item_game_status.png', id:'itemGameStatus'},
			{src:'assets/icon_coin.png', id:'iconCoin'},
			{src:'assets/icon_kill.png', id:'iconKill'},
			{src:'assets/item_particle1_1.png', id:'itemParticle1'},
			{src:'assets/item_particle1_2.png', id:'itemParticle2'},
			{src:'assets/item_particle1_3.png', id:'itemParticle3'},
			{src:'assets/item_game_status.png', id:'itemGameStatus'},
			{src:'assets/item_swoosh.png', id:'itemSwoosh'},
		
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

	for(var n=0; n<cardDesign.length; n++){
		manifest.push({src:cardDesign[n].cover, id:'cardCover_'+n});
		manifest.push({src:cardDesign[n].type1, id:'cardType1_'+n});
		manifest.push({src:cardDesign[n].type2, id:'cardType2_'+n});
		manifest.push({src:cardDesign[n].type3, id:'cardType3_'+n});
		manifest.push({src:cardDesign[n].type4, id:'cardType4_'+n});
		manifest.push({src:cardDesign[n].hit, id:'cardHit_'+n});
		manifest.push({src:cardDesign[n].focus, id:'cardFocus_'+n});
		manifest.push({src:cardDesign[n].stroke, id:'cardStroke_'+n});
		manifest.push({src:cardDesign[n].health.icon, id:'cardIconHealth_'+n});
		manifest.push({src:cardDesign[n].coin.icon, id:'cardIconCoin_'+n});
		manifest.push({src:cardDesign[n].damage.icon, id:'cardIconDamage_'+n});
		manifest.push({src:cardDesign[n].shield.icon, id:'cardIconShield_'+n});
	}

	for(var n=0; n<cardCharacter.length; n++){
		manifest.push({src:cardCharacter[n].body, id:'cardChaBody_'+n});
		manifest.push({src:cardCharacter[n].leg, id:'cardChaLeg_'+n});
		manifest.push({src:cardCharacter[n].icon, id:'cardChaIcon_'+n});
	}

	for(var n=0; n<cardTypes.length; n++){
		manifest.push({src:cardTypes[n].icon, id:'cardTypesIcon_'+n});
		if(cardTypes[n].iconSecond != ''){
			manifest.push({src:cardTypes[n].iconSecond, id:'cardTypesIconSecond_'+n});
		}
		if(cardTypes[n].iconWeapon != ''){
			manifest.push({src:cardTypes[n].iconWeapon, id:'cardTypesIconWeapon_'+n});
		}
		if(cardTypes[n].iconShield != ''){
			manifest.push({src:cardTypes[n].iconShield, id:'cardTypesIconShield_'+n});
		}
		if(cardTypes[n].iconPlayer != ''){
			manifest.push({src:cardTypes[n].iconPlayer, id:'cardTypesIconPlayer_'+n});
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
		manifest.push({src:'assets/sounds/sound_card_deal.ogg', id:'soundCardDeal'});
		manifest.push({src:'assets/sounds/sound_card_flip.ogg', id:'soundCardFlip'});
		manifest.push({src:'assets/sounds/sound_card_error.ogg', id:'soundCardError'});
		manifest.push({src:'assets/sounds/sound_card_cancel.ogg', id:'soundCardCancel'});
		manifest.push({src:'assets/sounds/sound_card_move.ogg', id:'soundCardMove'});
		manifest.push({src:'assets/sounds/sound_coin.ogg', id:'soundCoin'});
		manifest.push({src:'assets/sounds/sound_equip.ogg', id:'soundEquip'});
		manifest.push({src:'assets/sounds/sound_fail.ogg', id:'soundFail'});
		manifest.push({src:'assets/sounds/sound_result.ogg', id:'soundResult'});
		manifest.push({src:'assets/sounds/sound_unlock.ogg', id:'soundUnlock'});
		manifest.push({src:'assets/sounds/sound_reveal_good.ogg', id:'soundRevealGood'});
		manifest.push({src:'assets/sounds/sound_reveal_bad.ogg', id:'soundRevealBad'});
		manifest.push({src:'assets/sounds/sound_hit1.ogg', id:'soundHit1'});
		manifest.push({src:'assets/sounds/sound_hit2.ogg', id:'soundHit2'});
		manifest.push({src:'assets/sounds/sound_hit3.ogg', id:'soundHit3'});
		manifest.push({src:'assets/sounds/sound_sword.ogg', id:'soundSword'});
		manifest.push({src:'assets/sounds/sound_shield.ogg', id:'soundShield'});
		manifest.push({src:'assets/sounds/sound_heal.ogg', id:'soundHeal'});
		manifest.push({src:'assets/sounds/sound_trap_spike.ogg', id:'soundTrapSpike'});
		manifest.push({src:'assets/sounds/sound_trap.ogg', id:'soundTrap'});
		manifest.push({src:'assets/sounds/sound_barrel.ogg', id:'soundBarrel'});
		manifest.push({src:'assets/sounds/sound_castle.ogg', id:'soundCastle'});
		manifest.push({src:'assets/sounds/sound_cannon.ogg', id:'soundCannon'});
		manifest.push({src:'assets/sounds/music_main.ogg', id:'musicMain'});
		manifest.push({src:'assets/sounds/music_game.ogg', id:'musicGame'});
		
		// createjs.Sound.alternateExtensions = ["mp3"];
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