var KEYCAP_FONT_COLOR = new Array();
KEYCAP_FONT_COLOR[KEYCAP_STATE_DEFAULT] = "#13776b";
KEYCAP_FONT_COLOR[KEYCAP_STATE_WRONG] = "#9fd1b4";
KEYCAP_FONT_COLOR[KEYCAP_STATE_WRONG_POSITION] = "#b65012";
KEYCAP_FONT_COLOR[KEYCAP_STATE_CORRECT] = "#ffffff";

function CKeyCap(iXPos,iYPos,oSprite,szText,oParentContainer){
    var _bDisable;
    var _bPressed;

    var _iCurScale;
    var _iWidth;
    var _iHeight;
    var _iState;
    var _iTextY;
    var _iTextYOnPress;

    var _aCbCompleted;
    var _aCbOwner;

    var _oListenerDown;
    var _oListenerUp;
    var _oParams;
    
    var _oButton;

    var _oText;
    var _oButtonBg;
    var _oListenerButtonBg;
    var _oParentContainer = oParentContainer;

    var _oParent = this;
    
    this._init =function(iXPos,iYPos,oSprite,szText){
        _bDisable = false;
        _iCurScale = 1;
        _aCbCompleted=new Array();
        _aCbOwner =new Array();
        _bPressed = false;

        _iState = KEYCAP_STATE_DEFAULT;

        var oSprite = s_oSpriteLibrary.getSprite("keycap");
        _iWidth = oSprite.width/4;
        _iHeight = oSprite.height/2;

        _oButton = new createjs.Container();
        _oButton.x = iXPos;
        _oButton.y = iYPos;
        _oButton.regX = _iWidth/2;
        _oButton.regY = _iHeight/2;
        _oButton.cursor = "pointer";
        _oParentContainer.addChild(_oButton);

        var aPulseCorrectFrames = new Array();
        var iStatePulse = KEYCAP_STATE_DEFAULT;
        for(var i=0; i<10;i++){
            aPulseCorrectFrames.push(iStatePulse);
            if(iStatePulse === KEYCAP_STATE_DEFAULT){
                iStatePulse = KEYCAP_STATE_CORRECT;
            }else{
                iStatePulse = KEYCAP_STATE_DEFAULT;
            }
        }

        var oData = {   
            images: [oSprite], 
            // width, height & registration point of each sprite
            frames: {width: _iWidth, height: _iHeight}, 
            animations: {
                state_0:KEYCAP_STATE_DEFAULT,
                state_1:KEYCAP_STATE_WRONG,
                state_2:KEYCAP_STATE_WRONG_POSITION,
                state_3:KEYCAP_STATE_CORRECT,
                state_0_pressed:KEYCAP_STATE_DEFAULT+4,
                state_1_pressed:KEYCAP_STATE_WRONG+4,
                state_2_pressed:KEYCAP_STATE_WRONG_POSITION+4,
                state_3_pressed:KEYCAP_STATE_CORRECT+4,
                pulse_correct:{
                    frames:aPulseCorrectFrames,
                    next:"state_3",
                    speed:0.08
                }
            }
        };

        var oSpriteSheet = new createjs.SpriteSheet(oData);

        _oButtonBg = createSprite(oSpriteSheet, "state_"+_iState,0,0,_iWidth,_iHeight);
        _oButtonBg.stop();
        _oListenerButtonBg = _oButtonBg.on("change",this._changeTextColor);
        _oButton.addChild(_oButtonBg);
        
        _iTextY = 0;
        _iTextYOnPress = _iTextY+13;
        var iWidth = _iWidth-40;
        var iHeight = _iHeight-7;
        _oText = new CTLText(_oButton, 
            _iWidth/2 - iWidth/2, _iTextY, iWidth, iHeight, 
            50, "center", KEYCAP_FONT_COLOR[_iState], s_szCurFont, 1,
            2, 2,
            szText,
            true, true, false,
            false 
        );
                    
        this._initListener();
    };
    
    this.unload = function(){
       _oButton.off("mousedown", _oListenerDown);
       _oButton.off("pressup" , _oListenerUp); 

       _oButtonBg.off("change",_oListenerButtonBg);
       
       _oParentContainer.removeChild(_oButton);
    };
    
    this.setVisible = function(bVisible){
        _oButton.visible = bVisible;
    };
    
    this.setAlign = function(szAlign){
        _oText.textAlign = szAlign;
    };
    
    this.setTextX = function(iX){
        _oText.x = iX;
    };
    
    this.setScale = function(iScale){
        _oButton.scaleX = _oButton.scaleY = iScale;
        _iCurScale = iScale;
    };
    
    this.enable = function(){
        _bDisable = false;
    };
    
    this.disable = function(){
        _bDisable = true;
    };

    this.getState = function(){
        return _iState;
    };

    this.setState = function(iState){
        _iState = iState;
        _oButtonBg.gotoAndStop("state_"+_iState);
    };

    this._initListener = function(){
       _oListenerDown = _oButton.on("mousedown", this.buttonDown);
       _oListenerUp = _oButton.on("pressup" , this.buttonRelease);      
    };
    
    this.addEventListener = function( iEvent,cbCompleted, cbOwner ){
        _aCbCompleted[iEvent]=cbCompleted;
        _aCbOwner[iEvent] = cbOwner; 
    };
    
    this.addEventListenerWithParams = function(iEvent,cbCompleted, cbOwner,oParams){
        _aCbCompleted[iEvent]=cbCompleted;
        _aCbOwner[iEvent] = cbOwner;
        
        _oParams = oParams;
    };
    
    this.buttonRelease = function(){
        if(_bDisable){
            return;
        }

        _oParent.release();

        if(_aCbCompleted[ON_MOUSE_UP]){
            _aCbCompleted[ON_MOUSE_UP].call(_aCbOwner[ON_MOUSE_UP],_oParams);
        }
    };
    
    this.buttonDown = function(){
        if(_bDisable){
            return;
        }

        _oParent.press();

        if(_aCbCompleted[ON_MOUSE_DOWN]){
            _aCbCompleted[ON_MOUSE_DOWN].call(_aCbOwner[ON_MOUSE_DOWN],_oParams);
        }
    };

    this.release = function(){
        if(_bPressed == false){
            return;
        }

        _bPressed = false;
        
        _oButtonBg.gotoAndStop("state_"+_iState);
        _oText.setY(_iTextY);
    };

    this.press = function(){
        if(_bPressed == true){
            return;
        }

        _bPressed = true;

        playSound("click",1,false);

        _oButtonBg.gotoAndStop("state_"+_iState+"_pressed");
        _oText.setY(_iTextYOnPress);
    };

    this._changeTextColor = function(){
        var iState = _oButtonBg.currentFrame;
        if(_bPressed){
            iState -= 4;
        }

        _oText.setColor(KEYCAP_FONT_COLOR[iState]);
    };
    
    this.pulseCorrect = function(){
        _oButtonBg.gotoAndPlay("pulse_correct");
    };

    this.setPosition = function(iXPos,iYPos){
        _oButton.x = iXPos;
        _oButton.y = iYPos;
    };
    
    this.refreshTextText = function(szText){
        _oText.refreshText(szText);
    };
    
    this.setX = function(iXPos){
        _oButton.x = iXPos;
    };
    
    this.setY = function(iYPos){
        _oButton.y = iYPos;
    };
    
    this.getButtonImage = function(){
        return _oButton;
    };

    this.getX = function(){
        return _oButton.x;
    };
    
    this.getY = function(){
        return _oButton.y;
    };
    
    this.getSprite = function(){
        return _oButton;
    };
    
    this.getScale = function(){
        return _oButton.scaleX;
    };

    this._init(iXPos,iYPos,oSprite,szText);
}