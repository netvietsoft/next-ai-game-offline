function CMenu(){

    var _oButPlay;
    var _oCreditsBut;
    var _oFade;
    var _oListenerFade;
    
    var _fRequestFullScreen = null;
    var _fCancelFullScreen = null;
    var _oBg;
    var _oLogo;
    var _oAudioToggle;
    var _oButFullscreen;
    var _oButLang;
    var _oButStats;
    
    var _pStartPosPlayPortrate;
    var _pStartPosPlayLandscape;
    var _pStartPosLang;
    var _pStartPosStats;
    var _pStartPosAudio;
    var _pStartPosCredits;
    var _pStartPosFullscreen;

    
    this._init = function(){

        if (!isPlayingSound("soundtrack")) {
            playSound("soundtrack", 1,true);
        }else{
            setVolume("soundtrack",1);
        }

        _oBg = createBitmap(s_oSpriteLibrary.getSprite('bg_menu'));
        s_oStage.addChild(_oBg);

        var oSprite = s_oSpriteLibrary.getSprite('logo_menu');
        _oLogo = createBitmap(oSprite);
        _oLogo.x = CANVAS_WIDTH/2;
        _oLogo.y = CANVAS_HEIGHT/2;
        _oLogo.regX = oSprite.width/2;
        _oLogo.regY = oSprite.height/2;
        s_oStage.addChild(_oLogo);
        
        
        var oSpriteStart = s_oSpriteLibrary.getSprite('but_play');
        _pStartPosPlayPortrate = {x:CANVAS_WIDTH/2,y:CANVAS_HEIGHT/2 + 400};
        _pStartPosPlayLandscape = {x:CANVAS_WIDTH-oSpriteStart.width/2-20,y:CANVAS_HEIGHT-oSpriteStart.height/2-20};
        _oButPlay = new CGfxButton(_pStartPosPlayPortrate.x,_pStartPosPlayPortrate.y,oSpriteStart,s_oStage);
        _oButPlay.addEventListener(ON_MOUSE_UP, this._onStart, this);
        _oButPlay.pulseAnimation();
        
        var oSpriteLang = s_oSpriteLibrary.getSprite("but_lang")
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            var oSprite = s_oSpriteLibrary.getSprite('audio_icon');
            _pStartPosAudio = {x: CANVAS_WIDTH - (oSprite.height/2) - 10, y: (oSprite.height/2) + 10};
            
            _oAudioToggle = new CToggle(_pStartPosAudio.x,_pStartPosAudio.y,oSprite,s_bAudioActive,s_oStage);
            _oAudioToggle.addEventListener(ON_MOUSE_UP, this._onAudioToggle, this);    
            _pStartPosLang = {x:_pStartPosAudio.x - (oSpriteLang.width/NUM_LANGUAGES)-10,y:_pStartPosAudio.y};
        }else{
            _pStartPosLang = {x: CANVAS_WIDTH - (oSprite.width/4) - 10, y: (oSprite.height/2) + 10};       
        }
        
        _oButLang = new CButLang(_pStartPosLang.x,_pStartPosLang.y,NUM_LANGUAGES,s_iCurLang,oSpriteLang,s_oStage);
        _oButLang.addEventListener(ON_SELECT_LANG,this._onChangeLang,this);

        var oSprite = s_oSpriteLibrary.getSprite("but_stats");
        _pStartPosStats = {x:_pStartPosLang.x-oSprite.width-10,y:_pStartPosLang.y}
        _oButStats = new CGfxButton(_pStartPosStats.x,_pStartPosStats.y,oSprite,s_oStage);
        _oButStats.addEventListener(ON_MOUSE_UP,this._showUserStats,this);
        
        var oSprite = s_oSpriteLibrary.getSprite('but_credits');
        _pStartPosCredits = {x: (oSprite.width/2) + 10, y: (oSprite.height/2) + 10};            
        _oCreditsBut = new CGfxButton(_pStartPosCredits.x,_pStartPosCredits.y,oSprite, s_oStage);
        _oCreditsBut.addEventListener(ON_MOUSE_UP, this._onCreditsBut, this);
        
        var doc = window.document;
        var docEl = doc.documentElement;
        _fRequestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
        _fCancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

        if(ENABLE_FULLSCREEN === false){
            _fRequestFullScreen = false;
        }

        if (_fRequestFullScreen && screenfull.isEnabled){
            oSprite = s_oSpriteLibrary.getSprite("but_fullscreen")
            _pStartPosFullscreen = {x:_pStartPosCredits.x + oSprite.width/2 + 10,y:(oSprite.height/2) + 10};
            _oButFullscreen = new CToggle(_pStartPosFullscreen.x,_pStartPosFullscreen.y,oSprite,s_bFullscreen, s_oStage);
            _oButFullscreen.addEventListener(ON_MOUSE_UP,this._onFullscreenRelease,this);
        }

        this.refreshButtonPos();

        if(!s_bStorageAvailable){
            new CMsgBox();
        }

        _oFade = new createjs.Shape();
        _oFade.graphics.beginFill("black").drawRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
        _oListenerFade = _oFade.on("click",function(){});
        s_oStage.addChild(_oFade);
        
        createjs.Tween.get(_oFade).to({alpha:0}, 300).call(function(){_oFade.visible = false;}); 
    };  
    
    this.unload = function(){
        _oButLang.unload();
        _oButPlay.unload();
        _oCreditsBut.unload();
        _oFade.off("click",_oListenerFade);
        
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            _oAudioToggle.unload();
            _oAudioToggle = null;
        }
        
        if (_fRequestFullScreen && screenfull.isEnabled){
                _oButFullscreen.unload();
        }

        s_oMenu = null;
        createjs.Tween.removeAllTweens();
        s_oStage.removeAllChildren();        
    };
    
    this.refreshButtonPos = function(){
        if(s_bLandscape){
            _oButPlay.setPosition(_pStartPosPlayLandscape.x - s_iOffsetX,_pStartPosPlayLandscape.y - s_iOffsetY);
        }else{
            _oButPlay.setPosition(_pStartPosPlayPortrate.x,_pStartPosPlayPortrate.y);
        }

        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            _oAudioToggle.setPosition(_pStartPosAudio.x - s_iOffsetX,s_iOffsetY + _pStartPosAudio.y);
        }        
        
        if (_fRequestFullScreen && screenfull.isEnabled){
                _oButFullscreen.setPosition(_pStartPosFullscreen.x + s_iOffsetX, _pStartPosFullscreen.y + s_iOffsetY);
        }
        
        _oCreditsBut.setPosition(_pStartPosCredits.x + s_iOffsetX,s_iOffsetY + _pStartPosCredits.y);
        _oButLang.setPosition(_pStartPosLang.x - s_iOffsetX,_pStartPosLang.y+s_iOffsetY);
        _oButStats.setPosition(_pStartPosStats.x - s_iOffsetX,_pStartPosStats.y+s_iOffsetY);
    };
    
   
    this._onStart = function(){
        _oFade.visible = true;        
        createjs.Tween.get(_oFade).to({alpha:1}, 300).call(function(){
            document.dispatchEvent(new CustomEvent("start_session"));

            s_oMenu.unload();
            s_oMain.gotoModeMenu();
        }); 
    };

    this._showUserStats = function(){
        var oUserStats = new CUserStats(s_oStage);
    };  
    
    this._onAudioToggle = function(){
        Howler.mute(s_bAudioActive);
        s_bAudioActive = !s_bAudioActive;
    };
    
    this._onCreditsBut = function(){
        new CCreditsPanel();
    };
    
    this.resetFullscreenBut = function(){
        if (_fRequestFullScreen && screenfull.isEnabled){
            _oButFullscreen.setActive(s_bFullscreen);
        }
    };
        
    this._onFullscreenRelease = function(){
	if(s_bFullscreen) { 
		_fCancelFullScreen.call(window.document);
	}else{
		_fRequestFullScreen.call(window.document.documentElement);
	}
	
	sizeHandler();
    };

    
    this._onChangeLang = function(iLang){
        s_iCurLang = iLang;

        if(s_iCurLang == LANG_RU){
            s_szCurFont = FONT_CYRILLIC;
        }else{
            s_szCurFont = FONT_LATIN;
        }
        
        refreshLanguage();
    };
    
    s_oMenu = this;        
    this._init();
    
    
};

var s_oMenu = null;