function CGfxButton(iXPos,iYPos,oSprite,oParentContainer){
    
    var _iScale;
    var _iHeight;
    var _oListenerDown;
    var _oListenerUp;

    var _bActive;
    
    var _aCbCompleted;
    var _aCbOwner;
    var _aParams = [];
    var _oButton;
    var _oParentContainer;
    
    var _oParent = this;
    
    this._init =function(iXPos,iYPos,oSprite){
        
        _bActive = true;
        _iScale = 1;
        
        _aCbCompleted=new Array();
        _aCbOwner =new Array();
        
        _oButton = createBitmap( oSprite);
        _oButton.x = iXPos;
        _oButton.y = iYPos; 
        _oButton.cursor = "pointer";                           
        _oButton.regX = oSprite.width/2;
        _oButton.regY = oSprite.height/2;
       
        _oParentContainer.addChild(_oButton);
        
        _iHeight = oSprite.height;
        
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

        _oButton.scaleX = _iScale;
        _oButton.scaleY = _iScale;

        if(_aCbCompleted[ON_MOUSE_UP]){
            _aCbCompleted[ON_MOUSE_UP].call(_aCbOwner[ON_MOUSE_UP],_aParams);
        }
    };
    
    this.buttonDown = function(){
        if(!_bActive){
            return;
        }
        
        _oButton.scaleX = _iScale*0.9;
        _oButton.scaleY = _iScale*0.9;
       
        playSound("click",1,false);
       
       if(_aCbCompleted[ON_MOUSE_DOWN]){
           _aCbCompleted[ON_MOUSE_DOWN].call(_aCbOwner[ON_MOUSE_DOWN],_aParams);
       }
    };
    
    this.setScale = function(iValue){
        _iScale = iValue;
        _oButton.scaleX = iValue;
        _oButton.scaleY = iValue;
    };

    this.setAlpha = function(iAlpha){
        _oButton.alpha = iAlpha;
    };
    
    this.setPosition = function(iXPos,iYPos){
         _oButton.x = iXPos;
         _oButton.y = iYPos;
    };
    
    this.pulseAnimation = function () {
        createjs.Tween.get(_oButton,{loop:-1}).to({scaleX: _iScale*0.9, scaleY: _iScale*0.9}, 850, createjs.Ease.quadIn).to({scaleX: _iScale, scaleY: _iScale}, 650, createjs.Ease.quadOut);
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

    this.getHeight = function(){
        return _iHeight;
    };
    
    _oParentContainer = oParentContainer;
    
    this._init(iXPos,iYPos,oSprite);
    
    return this;
}