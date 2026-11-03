function CModeMenu(){
    
    var _fRequestFullScreen = null;
    var _fCancelFullScreen = null;

    var _oFade;
    var _oListenerFade;
    var _oBg;
    var _oButExit;
    var _oAudioToggle;
    var _oButFullscreen;
    var _oTitle;
    var _oButEasy;
    var _oButMedium;
    var _oButHard;

    var _pStartPosExit;
    var _pStartPosAudio;
    var _pStartPosFullscreen;
    
    this._init = function(){
        _oBg = createBitmap(s_oSpriteLibrary.getSprite('bg_mode_menu'));
        s_oStage.addChild(_oBg);
        
        var iWidth = 750;
        var iHeight = 200;
        var iX = CANVAS_WIDTH/2;
        var iY = CANVAS_HEIGHT/2-200;
        _oTitle = new CTLText(s_oStage, 
                    iX-iWidth/2, iY-iHeight/2, iWidth, iHeight, 
                    80, "center", "#fff", s_szCurFont, 1.2,
                    2, 2,
                    TEXT_SELECT,
                    true, true, true,
                    false 
        );

        var oSprite = s_oSpriteLibrary.getSprite("but_easy");
        _oButEasy = new CGfxButton(CANVAS_WIDTH/2 - 300, CANVAS_HEIGHT/2 + 200, oSprite, s_oStage);
        _oButEasy.addEventListenerWithParams(ON_MOUSE_UP,this._onModeButton,this,MODE_EASY);

        var oSprite = s_oSpriteLibrary.getSprite("but_medium");
        _oButMedium = new CGfxButton(CANVAS_WIDTH/2, CANVAS_HEIGHT/2 + 200, oSprite, s_oStage);
        _oButMedium.addEventListenerWithParams(ON_MOUSE_UP,this._onModeButton,this,MODE_MEDIUM);

        var oSprite = s_oSpriteLibrary.getSprite("but_hard");
        _oButHard = new CGfxButton(CANVAS_WIDTH/2 + 300, CANVAS_HEIGHT/2 + 200, oSprite, s_oStage);
        _oButHard.addEventListenerWithParams(ON_MOUSE_UP,this._onModeButton,this,MODE_HARD);

        var oSprite = s_oSpriteLibrary.getSprite('but_exit');
        _pStartPosExit = {x: CANVAS_WIDTH - (oSprite.width/2) - 10, y: (oSprite.height/2) + 10};
        _oButExit = new CGfxButton(_pStartPosExit.x, _pStartPosExit.y, oSprite, s_oStage);
        _oButExit.addEventListener(ON_MOUSE_UP, this._onExit, this);

        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            var oSprite = s_oSpriteLibrary.getSprite('audio_icon');
            _pStartPosAudio = {x: _pStartPosExit.x - (oSprite.width/2) - 10, y: (oSprite.height/2) + 10};
            
            _oAudioToggle = new CToggle(_pStartPosAudio.x,_pStartPosAudio.y,oSprite,s_bAudioActive,s_oStage);
            _oAudioToggle.addEventListener(ON_MOUSE_UP, this._onAudioToggle, this);    
        }
        
        var doc = window.document;
        var docEl = doc.documentElement;
        _fRequestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
        _fCancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

        if(ENABLE_FULLSCREEN === false){
            _fRequestFullScreen = false;
        }

        if (_fRequestFullScreen && screenfull.isEnabled){
            oSprite = s_oSpriteLibrary.getSprite("but_fullscreen")
            _pStartPosFullscreen = {x:oSprite.width/4 + 10,y:(oSprite.height/2) + 10};
            _oButFullscreen = new CToggle(_pStartPosFullscreen.x,_pStartPosFullscreen.y,oSprite,s_bFullscreen, s_oStage);
            _oButFullscreen.addEventListener(ON_MOUSE_UP,this._onFullscreenRelease,this);
        }

        this.refreshButtonPos();

        _oFade = new createjs.Shape();
        _oFade.graphics.beginFill("black").drawRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
        _oListenerFade = _oFade.on("click",function(){});
        s_oStage.addChild(_oFade);
        
        createjs.Tween.get(_oFade).to({alpha:0}, 300).call(function(){_oFade.visible = false;}); 
    };  
    
    this.unload = function(){
        _oButExit.unload();
        _oButEasy.unload();
        _oButMedium.unload();
        _oButHard.unload();
        _oFade.off("click",_oListenerFade);

        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            _oAudioToggle.unload();
            _oAudioToggle = null;
        }
        
        if (_fRequestFullScreen && screenfull.isEnabled){
            _oButFullscreen.unload();
        }

        s_oModeMenu = null;
        createjs.Tween.removeAllTweens();
        s_oStage.removeAllChildren();        
    };
    
    this.refreshButtonPos = function(){
        _oButExit.setPosition(_pStartPosExit.x - s_iOffsetX,s_iOffsetY + _pStartPosExit.y);

        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            _oAudioToggle.setPosition(_pStartPosAudio.x - s_iOffsetX,s_iOffsetY + _pStartPosAudio.y);
        }        
        
        if (_fRequestFullScreen && screenfull.isEnabled){
            _oButFullscreen.setPosition(_pStartPosFullscreen.x + s_iOffsetX, _pStartPosFullscreen.y + s_iOffsetY);
        }
    };

    this._onExit = function(){    
        _oFade.visible = true;        
        createjs.Tween.get(_oFade).to({alpha:1}, 300).call(function(){
            s_oModeMenu.unload();
            s_oMain.gotoMenu();
        }); 
    };

    this._onModeButton = function(iMode){
        _oFade.visible = true;        
        createjs.Tween.get(_oFade).to({alpha:1}, 300).call(function(){
            s_oModeMenu.unload();
            s_oMain.gotoGame(iMode);
        }); 
    };
    
    this._onAudioToggle = function(){
        Howler.mute(s_bAudioActive);
        s_bAudioActive = !s_bAudioActive;
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
    
    s_oModeMenu = this;        
    this._init();
};

var s_oModeMenu = null;