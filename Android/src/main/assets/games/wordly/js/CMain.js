function CMain(oData){
    var _bUpdate;
    var _iCurResource = 0;
    var RESOURCE_TO_LOAD = 0;
    var _iState = STATE_LOADING;
    var _oData;
    
    var _oPreloader;
    var _oMenu;
    var _oModeMenu;
    var _oGame;

    this.initContainer = function(){
        s_oCanvas = document.getElementById("canvas");
        s_oStage = new createjs.Stage(s_oCanvas);
        
        s_oStage.preventSelection = false;
		
	s_bMobile = isMobile();
        if(s_bMobile === false){
            s_oStage.enableMouseOver(20);  
            
        }else{
            createjs.Touch.enable(s_oStage, true);
        }
		
        s_iPrevTime = new Date().getTime();

	createjs.Ticker.addEventListener("tick", this._update);
        createjs.Ticker.framerate = FPS;
        createjs.Ticker.timingMode = createjs.Ticker.RAF_SYNCHED;

        
        if(navigator.userAgent.match(/Windows Phone/i)){
                DISABLE_SOUND_MOBILE = true;
        }
        
        s_oSpriteLibrary  = new CSpriteLibrary();

        s_oWordList = new CWordlist();
        //ADD PRELOADER
        _oPreloader = new CPreloader();
        
    };
    
    this.preloaderReady = function(){
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            this._initSounds();
        }
        
        this._loadImages();
        _bUpdate = true;
    };
    
    this.soundLoaded = function(){
        _iCurResource++;
        var iPerc = Math.floor(_iCurResource/RESOURCE_TO_LOAD *100);
        _oPreloader.refreshLoader(iPerc);
    };
    
    this._initSounds = function(){
        Howler.mute(!s_bAudioActive);
        
        s_aSoundsInfo = new Array();
        s_aSoundsInfo.push({path: './sounds/',filename:'game_over_win',loop:false,volume:1, ingamename: 'game_over_win'});
        s_aSoundsInfo.push({path: './sounds/',filename:'game_over_lose',loop:false,volume:1, ingamename: 'game_over_lose'});
        s_aSoundsInfo.push({path: './sounds/',filename:'click',loop:false,volume:1, ingamename: 'click'});
        s_aSoundsInfo.push({path: './sounds/',filename:'alert',loop:false,volume:1, ingamename: 'alert'});
        s_aSoundsInfo.push({path: './sounds/',filename:'soundtrack',loop:true,volume:1, ingamename: 'soundtrack'});
        
        RESOURCE_TO_LOAD += s_aSoundsInfo.length;

        s_aSounds = new Array();
        for(var i=0; i<s_aSoundsInfo.length; i++){
            this.tryToLoadSound(s_aSoundsInfo[i], false);
        }
    };

    this.tryToLoadSound = function(oSoundInfo, bDelay){
        
        setTimeout(function(){        
            s_aSounds[oSoundInfo.ingamename] = new Howl({ 
                                                            src: [oSoundInfo.path+oSoundInfo.filename+'.mp3'],
                                                            autoplay: false,
                                                            preload: true,
                                                            loop: oSoundInfo.loop, 
                                                            volume: oSoundInfo.volume,
                                                            onload: s_oMain.soundLoaded,
                                                            onloaderror: function(szId,szMsg){
                                                                                for(var i=0; i < s_aSoundsInfo.length; i++){
                                                                                     if ( szId === s_aSounds[s_aSoundsInfo[i].ingamename]._sounds[0]._id){
                                                                                         s_oMain.tryToLoadSound(s_aSoundsInfo[i], true);
                                                                                         break;
                                                                                     }
                                                                                }
                                                                        },
                                                            onplayerror: function(szId) {
                                                                for(var i=0; i < s_aSoundsInfo.length; i++){
                                                                                     if ( szId === s_aSounds[s_aSoundsInfo[i].ingamename]._sounds[0]._id){
                                                                                          s_aSounds[s_aSoundsInfo[i].ingamename].once('unlock', function() {
                                                                                            s_aSounds[s_aSoundsInfo[i].ingamename].play();
                                                                                            if(s_aSoundsInfo[i].ingamename === "soundtrack" && s_oGame !== null){
                                                                                                setVolume("soundtrack",SOUNDTRACK_VOLUME_IN_GAME);
                                                                                            }

                                                                                          });
                                                                                         break;
                                                                                     }
                                                                                 }
                                                                       
                                                            } 
                                                        });

            
        }, (bDelay ? 200 : 0) );
    };

    this._loadImages = function(){
        s_oSpriteLibrary.init( this._onImagesLoaded,this._onAllImagesLoaded, this );

        s_oSpriteLibrary.addSprite("but_play","./sprites/but_play.png");
        s_oSpriteLibrary.addSprite("but_home","./sprites/but_home.png");
        s_oSpriteLibrary.addSprite("but_restart","./sprites/but_restart.png");
        s_oSpriteLibrary.addSprite("msg_box","./sprites/msg_box.png");
        s_oSpriteLibrary.addSprite("bg_menu","./sprites/bg_menu.jpg");
        s_oSpriteLibrary.addSprite("bg_game","./sprites/bg_game.jpg");
        s_oSpriteLibrary.addSprite("bg_help","./sprites/bg_help.png");
        s_oSpriteLibrary.addSprite("but_exit","./sprites/but_exit.png");
        s_oSpriteLibrary.addSprite("audio_icon","./sprites/audio_icon.png");   
        s_oSpriteLibrary.addSprite("but_credits","./sprites/but_credits.png");
        s_oSpriteLibrary.addSprite("but_fullscreen","./sprites/but_fullscreen.png");
        s_oSpriteLibrary.addSprite("ctl_logo","./sprites/ctl_logo.png");
        s_oSpriteLibrary.addSprite("but_yes","./sprites/but_yes.png");
        s_oSpriteLibrary.addSprite("but_no","./sprites/but_no.png");
        s_oSpriteLibrary.addSprite("but_next","./sprites/but_next.png");
        s_oSpriteLibrary.addSprite("but_lang","./sprites/but_lang.png");
        s_oSpriteLibrary.addSprite("but_left","./sprites/but_left.png");
        s_oSpriteLibrary.addSprite("but_right","./sprites/but_right.png");
        s_oSpriteLibrary.addSprite("but_help","./sprites/but_help.png");
        s_oSpriteLibrary.addSprite("but_settings","./sprites/but_settings.png");
        s_oSpriteLibrary.addSprite("but_easy","./sprites/but_easy.png");
        s_oSpriteLibrary.addSprite("but_medium","./sprites/but_medium.png");
        s_oSpriteLibrary.addSprite("but_hard","./sprites/but_hard.png");
        s_oSpriteLibrary.addSprite("but_stats","./sprites/but_stats.png");
        s_oSpriteLibrary.addSprite("logo_menu","./sprites/logo_menu.png");

        s_oSpriteLibrary.addSprite("cell","./sprites/cell.png");
        s_oSpriteLibrary.addSprite("keycap","./sprites/keycap.png");
        s_oSpriteLibrary.addSprite("keycap_enter","./sprites/keycap_enter.png");
        s_oSpriteLibrary.addSprite("keycap_backspace","./sprites/keycap_backspace.png");
        s_oSpriteLibrary.addSprite("keycap_enter_cyrillic","./sprites/keycap_enter_cyrillic.png");
        s_oSpriteLibrary.addSprite("keycap_backspace_cyrillic","./sprites/keycap_backspace_cyrillic.png");
        s_oSpriteLibrary.addSprite("bg_alert","./sprites/bg_alert.png");
        s_oSpriteLibrary.addSprite("end_panel","./sprites/end_panel.png");
        s_oSpriteLibrary.addSprite("bg_mode_menu","./sprites/bg_mode_menu.jpg");
        s_oSpriteLibrary.addSprite("bg_game_over","./sprites/bg_game_over.jpg");
        
        RESOURCE_TO_LOAD += s_oSpriteLibrary.getNumSprites();
        s_oSpriteLibrary.loadSprites();
    };
    
    this._onImagesLoaded = function(){
        _iCurResource++;
        var iPerc = Math.floor(_iCurResource/RESOURCE_TO_LOAD *100);
        //console.log("PERC: "+iPerc);
        _oPreloader.refreshLoader(iPerc);
    };
    
    this._onRemovePreloader = function(){
        try{
            saveItem("ls_available","ok");
        }catch(evt){
            // localStorage not defined
            s_bStorageAvailable = false;
        }

        _oPreloader.unload();

        this.gotoMenu();
    };
    
    this._onAllImagesLoaded = function(){
        
    };
    
    this.onAllPreloaderImagesLoaded = function(){
        this._loadImages();
    };
    
    
    this.gotoMenu = function(){
        _oMenu = new CMenu();
        _iState = STATE_MENU;
    }; 

    this.gotoModeMenu = function(){
        _oModeMenu = new CModeMenu();
        _iState = STATE_MODE_MENU;
    }; 
    
    this.gotoGame = function(iMode){
        _oGame = new CGame(iMode);   						
        _iState = STATE_GAME;
    };

    this.stopUpdateNoBlock = function(){
        _bUpdate = false;
        createjs.Ticker.paused = true;
    };

    this.startUpdateNoBlock = function(){
        s_iPrevTime = new Date().getTime();
        _bUpdate = true;
        createjs.Ticker.paused = false; 
    };

    this.stopUpdate = function(){
        _bUpdate = false;
        createjs.Ticker.paused = true;
        document.querySelector("#block_game").style.display = "block";
        
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            Howler.mute(true);
        }
        
    };

    this.startUpdate = function(){
        s_iPrevTime = new Date().getTime();
        _bUpdate = true;
        createjs.Ticker.paused = false;
        document.querySelector("#block_game").style.display = "none";
        
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            if(s_bAudioActive){
                Howler.mute(false);
            }
        }
        
    };
    
    this._update = function(event){
        if(_bUpdate === false){
                return;
        }
        var iCurTime = new Date().getTime();
        s_iTimeElaps = iCurTime - s_iPrevTime;
        s_iCntTime += s_iTimeElaps;
        s_iCntFps++;
        s_iPrevTime = iCurTime;

        if ( s_iCntTime >= 1000 ){
            s_iCurFps = s_iCntFps;
            s_iCntTime-=1000;
            s_iCntFps = 0;
        }

        
        if(_iState === STATE_GAME){
            _oGame.update();
        }

        s_oStage.update(event);
       
    };
    
    s_oMain = this;
    
    _oData = oData;
    
    ENABLE_FULLSCREEN = oData.fullscreen;

    WORD_LENGTH = oData.word_length;
    NUM_TRIES = oData.num_tries;
    
    s_bAudioActive = oData.audio_enable_on_startup;
    
    var iLang = navigator.language.split("-")[0];
    if(LANG_CODES[iLang] === undefined){
        iLang = "en";
    }
    s_iCurLang = LANG_CODES[iLang];

    if(s_iCurLang == LANG_RU){
        s_szCurFont = FONT_CYRILLIC;
    }else{
        s_szCurFont = FONT_LATIN;
    }

    refreshLanguage();
    
    this.initContainer();
}
var s_bMobile;
var s_bAudioActive = false;
var s_iCntTime = 0;
var s_iTimeElaps = 0;
var s_iPrevTime = 0;
var s_iCntFps = 0;
var s_iCurFps = 0;

var s_oDrawLayer;
var s_oStage;
var s_oMain;
var s_oSpriteLibrary;
var s_oCanvas;
var s_bFullscreen = false;
var s_aSounds;
var s_aSoundsInfo;
var s_bStorageAvailable = true;
var s_iBestScore = 0;
var s_iCurLang = LANG_EN;
var s_oWordList;
var s_szCurFont;