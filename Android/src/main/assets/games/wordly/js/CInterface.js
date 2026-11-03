function CInterface(iNumTries,iWordLength){

    var _fRequestFullScreen = null;
    var _fCancelFullScreen = null;
    var _oAudioToggle;
    var _oButFullscreen;
    var _oButExit;
    var _oButHelp;
    var _oGUIExpandible;
    var _oKeyBoard;
    var _oGrid;


    var _pStartPosGrid;
    var _pStartPosKeyBoard;
    var _pStartPosExit;
    var _pStartPosHelp;
    var _pStartPosAudio;
    var _pStartPosFullscreen;
    var _pStartPosGUIExpandible;
    
    this._init = function(iNumTries,iWordLength){            
        if(!s_bMobile) {
            //KEY LISTENER
            document.onkeydown   = s_oGame.onKeyDown;
            document.onkeyup   = s_oGame.onKeyUp;
        }

        _pStartPosGrid = {x:CANVAS_WIDTH/2,y:CANVAS_HEIGHT/2}
        _oGrid = new CGrid(s_oStage,iNumTries,iWordLength,_pStartPosGrid.x,_pStartPosGrid.y);
        _oGrid.setRegX(_oGrid.getWidth()/2);
        _oGrid.setRegY(_oGrid.getHeight()/2);
        _oGrid.addEventListener(ON_END_SET_STATE_TWEEN,this.onEndCellsSetStateTween,this);

        _pStartPosKeyBoard = {x:CANVAS_WIDTH/2,y:CANVAS_HEIGHT-20};
        _oKeyBoard = new CKeyBoard(s_oStage,_pStartPosKeyBoard.x,_pStartPosKeyBoard.y);
        _oKeyBoard.addEventListener(ON_KEY_DOWN,this.onKeyDown,this);
        _oKeyBoard.addEventListener(ON_KEY_UP,this.onKeyUp,this);
        _oKeyBoard.setRegX(_oKeyBoard.getWidth()/2);
        _oKeyBoard.setRegY(_oKeyBoard.getHeight());

        var oSprite = s_oSpriteLibrary.getSprite('but_exit');
        _pStartPosExit = {x: CANVAS_WIDTH - (oSprite.height/2)-10, y: (oSprite.height/2)+10 };
        _oButExit = new CGfxButton(_pStartPosExit.x, _pStartPosExit.y, oSprite, s_oStage);
        _oButExit.addEventListener(ON_MOUSE_UP, this._onExit, this);

        var oSprite = s_oSpriteLibrary.getSprite('but_help');
        _pStartPosHelp = {x: _oButExit.getX() - oSprite.width -10, y: (oSprite.height/2)+10 };
        _oButHelp = new CGfxButton(_pStartPosHelp.x, _pStartPosHelp.y, oSprite, s_oStage);
        _oButHelp.addEventListener(ON_MOUSE_UP, this._onHelp, this);

        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            var oSprite = s_oSpriteLibrary.getSprite('audio_icon');
            _pStartPosAudio = {x: _oButHelp.getX() - oSprite.width/2 -10, y: (oSprite.height/2)+10 };
            _oAudioToggle = new CToggle(_pStartPosAudio.x,_pStartPosAudio.y,oSprite,s_bAudioActive,s_oStage);
            _oAudioToggle.addEventListener(ON_MOUSE_UP, this._onAudioToggle, this);          
            
            oSprite = s_oSpriteLibrary.getSprite("but_fullscreen")
            _pStartPosFullscreen = {x: _pStartPosAudio.x - oSprite.width/2 - 10,y:(oSprite.height/2) + 10};
        }else{
            oSprite = s_oSpriteLibrary.getSprite("but_fullscreen")
            _pStartPosFullscreen = {x: _oButHelp.getX() - oSprite.width/2 -10, y: (oSprite.height/2)+10 };
        }
        
        var doc = window.document;
        var docEl = doc.documentElement;
        _fRequestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
        _fCancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

        if(ENABLE_FULLSCREEN === false){
            _fRequestFullScreen = false;
        }

        if (_fRequestFullScreen && screenfull.isEnabled){
            
            _oButFullscreen = new CToggle(_pStartPosFullscreen.x,_pStartPosFullscreen.y,oSprite,s_bFullscreen, s_oStage);
            _oButFullscreen.addEventListener(ON_MOUSE_UP,this._onFullscreenRelease,this);
        }
        
        var oSprite = s_oSpriteLibrary.getSprite('but_settings');
        _pStartPosGUIExpandible = {x: CANVAS_WIDTH - (oSprite.height/2)-10, y: (oSprite.height/2)+10 };
        _oGUIExpandible = new CGUIExpandible(_pStartPosGUIExpandible.x, _pStartPosGUIExpandible.y, oSprite, s_oStage);
        
        _oGUIExpandible.addButton(_oButExit);
        _oGUIExpandible.addButton(_oButHelp);

        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            _oGUIExpandible.addButton(_oAudioToggle);
        }
        
        if (_fRequestFullScreen && screenfull.isEnabled){
            _oGUIExpandible.addButton(_oButFullscreen);
        }
    };

    this.restart = function(){
        _oGrid.restart();
        _oKeyBoard.restart();
    };
    
    this.unload = function(){
        if(!s_bMobile) {
            //KEY LISTENER
            document.onkeydown   = null;
            document.onkeyup   = null;
        }

        _oGrid.unload();
        _oKeyBoard.unload();

        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            _oAudioToggle.unload();
            _oAudioToggle = null;
        }
        if (_fRequestFullScreen && screenfull.isEnabled){
                _oButFullscreen.unload();
        }
        
        _oButExit.unload();
        _oButHelp.unload();

        _oGUIExpandible.unload();

        s_oInterface = null;
    };
        
    this.refreshButtonPos = function(){
        var iKeyBoardScale = 1;
        if (!s_bLandscape) {
            iKeyBoardScale = ((CANVAS_WIDTH-s_iOffsetX*2)-20)/_oKeyBoard.getWidth();
        }else{
            iKeyBoardScale = ((CANVAS_HEIGHT-s_iOffsetY*2)/3)/_oKeyBoard.getHeight();
        }

        if(iKeyBoardScale > 1){
            iKeyBoardScale = 1;
        }
        _oKeyBoard.setScale(iKeyBoardScale);
        _oKeyBoard.setY(_pStartPosKeyBoard.y - s_iOffsetY);

        _oGUIExpandible.refreshPos();

        var iGridScale;
        if (!s_bLandscape) {
            iGridScale = (CANVAS_HEIGHT-_oButExit.getHeight()-(_oKeyBoard.getHeight()*_oKeyBoard.getScale())-s_iOffsetY*2-60)/_oGrid.getHeight();
            _oGrid.setY(((_oKeyBoard.getY()-(_oKeyBoard.getHeight()*_oKeyBoard.getScale()))+(_oButExit.getY()+_oButExit.getHeight()/2))/2);
        }else{
            iGridScale = (CANVAS_HEIGHT-(_oKeyBoard.getHeight()*_oKeyBoard.getScale())-s_iOffsetY*2-60)/_oGrid.getHeight();
            _oGrid.setY(((_oKeyBoard.getY()-(_oKeyBoard.getHeight()*_oKeyBoard.getScale()))+s_iOffsetY)/2);
        }

        if(iGridScale > 1){
            iGridScale = 1;
        }
        if(iGridScale > (CANVAS_HEIGHT-20-s_iOffsetX*2)/_oGrid.getWidth()){
            iGridScale = ((CANVAS_HEIGHT-20-s_iOffsetX*2)/_oGrid.getWidth());
        }
        _oGrid.setScale(iGridScale);

        // _oButHelp.setPosition(_pStartPosHelp.x - s_iOffsetX,s_iOffsetY + _pStartPosHelp.y);

        // if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
        //     _oAudioToggle.setPosition(_pStartPosAudio.x - s_iOffsetX,s_iOffsetY + _pStartPosAudio.y);
        // }   
        // if (_fRequestFullScreen && screenfull.isEnabled){
        //         _oButFullscreen.setPosition(_pStartPosFullscreen.x - s_iOffsetX, _pStartPosFullscreen.y + s_iOffsetY);
        // }
    };

    this.onEndCellsSetStateTween = function(){
        s_oGame.onEndCellsSetStateTween();
    };

    this.pressKeyCap = function(iKeyCode){
        _oKeyBoard.pressKeyCap(iKeyCode);
    };  

    this.releaseKeyCap = function(iKeyCode){
        _oKeyBoard.releaseKeyCap(iKeyCode);
    };

    this.onKeyDown = function(iKeyCode){
        s_oGame.onKeyDown({keyCode:iKeyCode});
    };

    this.onKeyUp = function(iKeyCode){
        s_oGame.onKeyUp({keyCode:iKeyCode});
    }

    this.setKeyCapsStateCorrect = function(aChars){
        var bPlayPulse;
        for(var i=0; i<aChars.length; i++){
            bPlayPulse = false;
            if(_oKeyBoard.getKeyCapState(aChars[i]) != KEYCAP_STATE_CORRECT){
                bPlayPulse = true;
            }
            _oKeyBoard.setKeyCapState(aChars[i],KEYCAP_STATE_CORRECT);
            if(bPlayPulse){
                _oKeyBoard.pulseKeyCapCorrect(aChars[i]);
            }
        }
    };

    this.setKeyCapsStateWrongPosition = function(aChars){
        for(var i=0; i<aChars.length; i++){
            if (_oKeyBoard.getKeyCapState(aChars[i]) != KEYCAP_STATE_CORRECT) {
                _oKeyBoard.setKeyCapState(aChars[i],KEYCAP_STATE_WRONG_POSITION);
            }
        }
    };

    this.setKeyCapsStateWrong = function(aChars){
        var iKeyCapState;
        for(var i=0; i<aChars.length; i++){
            iKeyCapState = _oKeyBoard.getKeyCapState(aChars[i]);
            if (iKeyCapState != KEYCAP_STATE_CORRECT && iKeyCapState != KEYCAP_STATE_WRONG_POSITION) {
                _oKeyBoard.setKeyCapState(aChars[i],KEYCAP_STATE_WRONG);
            }
        }
    };

    this.insertCharGrid = function(szText){
        _oGrid.insertChar(szText);
    };

    this.deleteCharGrid = function(){
        _oGrid.deleteChar();
    };

    this.setGridCellsStates = function(aCellsStates){
        _oGrid.setCellsStates(aCellsStates);
    };

    this.nextGridRow = function(){
        _oGrid.nextRow();
    };

    this._onAudioToggle = function(){
        Howler.mute(s_bAudioActive);
        s_bAudioActive = !s_bAudioActive;
    };
    
    this._onExit = function(){
        s_oGame.onExit();
    };

    this._onHelp = function(){
        s_oGame.showHelp();
    };

    this.stopUpdate = function(){
        _oGrid.stopUpdate();
    };

    this.startUpdate = function(){
        _oGrid.startUpdate();
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
    
    s_oInterface = this;
    
    this._init(iNumTries,iWordLength);
    
    return this;
}

var s_oInterface = null;