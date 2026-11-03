function CKeyCapSpecial(iXPos,iYPos,oSprite,oParentContainer){
    
    var _iScale;
    var _iWidth;
    var _iHeight;
    var _oListenerDown;
    var _oListenerUp;

    var _bPressed;
    var _bActive;
    
    var _aCbCompleted;
    var _aCbOwner;
    var _aParams = [];
    var _oButtonBg;
    var _oButton;
    var _oParentContainer = oParentContainer;
    
    var _oParent = this;
    
    this._init =function(iXPos,iYPos,oSprite){
        
        _bActive = true;
        _bPressed = false;
        _iScale = 1;
        
        _aCbCompleted=new Array();
        _aCbOwner =new Array();

        _iWidth = oSprite.width/2;
        _iHeight = oSprite.height;

        _oButton = new createjs.Container();
        _oButton.x = iXPos;
        _oButton.y = iYPos; 
        _oButton.cursor = "pointer";                           
        _oButton.regX = _iWidth/2;
        _oButton.regY = _iHeight/2;
        _oParentContainer.addChild(_oButton);

        var oData = {   
            images: [oSprite], 
            // width, height & registration point of each sprite
            frames: {width: _iWidth, height: _iHeight}, 
            animations: {
                idle:0,
                pressed:1,
            }
        };

        var oSpriteSheet = new createjs.SpriteSheet(oData);

        _oButtonBg = createSprite(oSpriteSheet, "idle",0,0,_iWidth,_iHeight);
        _oButtonBg.stop();
        _oButton.addChild(_oButtonBg);
        
        this._initListener();
    };
    
    this.unload = function(){
        createjs.Tween.removeTweens(_oButton);
        
       _oButton.off("mousedown", _oListenerDown);
       _oButton.off("pressup" , _oListenerUp); 
       
       _oParentContainer.removeChild(_oButton);
    };
    
    this.setVisible = function(bVisible){
        _oButton.visible = bVisible;
    };
    
    this.setScale = function(iScale){
        _iScale = iScale;
        _oButton.scaleX = _oButton.scaleY = _iScale;
    };
    
    this._initListener = function(){
       _oListenerDown = _oButton.on("mousedown", this.buttonDown);
       _oListenerUp = _oButton.on("pressup" , this.buttonRelease);      
    };
    
    this.addEventListener = function( iEvent,cbCompleted, cbOwner ){
        _aCbCompleted[iEvent]=cbCompleted;
        _aCbOwner[iEvent] = cbOwner; 
    };
    
    this.addEventListenerWithParams = function(iEvent,cbCompleted, cbOwner,aParams){
        _aCbCompleted[iEvent]=cbCompleted;
        _aCbOwner[iEvent] = cbOwner;
        _aParams = aParams;
    };
    
    this.buttonRelease = function(){
        if(!_bActive){
            return;
        }

        _oParent.release();

        if(_aCbCompleted[ON_MOUSE_UP]){
            _aCbCompleted[ON_MOUSE_UP].call(_aCbOwner[ON_MOUSE_UP],_aParams);
        }
    };
    
    this.buttonDown = function(){
        if(!_bActive){
            return;
        }
        
        _oParent.press();
       
        if(_aCbCompleted[ON_MOUSE_DOWN]){
            _aCbCompleted[ON_MOUSE_DOWN].call(_aCbOwner[ON_MOUSE_DOWN],_aParams);
        }
    };

    this.press = function(){
        if(_bPressed == true){
            return;
        }
        _bPressed = true;
        
        playSound("click",1,false);

        _oButtonBg.gotoAndStop("pressed");
    };

    this.release = function(){
        if(_bPressed == false){
            return;
        }
        _bPressed = false;

        _oButtonBg.gotoAndStop("idle");
    };
    
    this.setScale = function(iValue){
        _iScale = iValue;
        _oButton.scaleX = iValue;
        _oButton.scaleY = iValue;
    };
    
    this.setPosition = function(iXPos,iYPos){
         _oButton.x = iXPos;
         _oButton.y = iYPos;
    };
    
    this.setActive = function(bActive){
        _bActive = bActive;
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

    this.getWidth = function(){
        return _iWidth;
    };

    this.getHeight = function(){
        return _iHeight;
    };
    
    this._init(iXPos,iYPos,oSprite);
    
    return this;
}