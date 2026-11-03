function CKeyBoard(oParentContainer,iX,iY){

    var _oParentContainer = oParentContainer;
    var _oContainer;

    var _aCbCompleted;
    var _aCbOwner;

    var _iWidth;
    var _iHeight;
    var _iKeyCapWidth;
    var _iKeyCapHeight;
    var _aButtons;

    this._init = function(iX,iY){
        _aCbCompleted=new Array();
        _aCbOwner =new Array();

        _oContainer = new createjs.Container();
        _oContainer.x = iX;
        _oContainer.y = iY;
        _oParentContainer.addChild(_oContainer);

        _aButtons = new Array();

        if (s_iCurLang == LANG_RU) {
            this.initKeyCapsCyrillic();
        }else{
            this.initKeyCapsLatin();
        }
    };

    this.initKeyCapsLatin = function(){
        // QWERTYUIOP
        var oSprite = s_oSpriteLibrary.getSprite("keycap");

        _iKeyCapWidth = oSprite.width/4;
        _iKeyCapHeight = oSprite.height/2;

        var iX = _iKeyCapWidth/2;
        var iY = _iKeyCapHeight/2;
        var oButton;
        for(var i=0; i<10; i++){
            oButton = new CKeyCap(iX,iY,oSprite,KEYBOARD_ALPHABET[i],_oContainer);
            oButton.addEventListenerWithParams(ON_MOUSE_DOWN,this.onKeyDown,this,KEYBOARD_ALPHABET[i].charCodeAt(0));
            oButton.addEventListenerWithParams(ON_MOUSE_UP,this.onKeyUp,this,KEYBOARD_ALPHABET[i].charCodeAt(0));
            _aButtons.push(oButton);

            iX += _iKeyCapWidth;
        }

        // ASDFGHJKL(ENTER)
        iX = _iKeyCapWidth/2;
        iY += _iKeyCapHeight;
        for(var i=10; i<19; i++){
            oButton = new CKeyCap(iX,iY,oSprite,KEYBOARD_ALPHABET[i],_oContainer);
            oButton.addEventListenerWithParams(ON_MOUSE_DOWN,this.onKeyDown,this,KEYBOARD_ALPHABET[i].charCodeAt(0));
            oButton.addEventListenerWithParams(ON_MOUSE_UP,this.onKeyUp,this,KEYBOARD_ALPHABET[i].charCodeAt(0));
            _aButtons.push(oButton);

            iX += _iKeyCapWidth;
        }

        var oSpriteEnter = s_oSpriteLibrary.getSprite("keycap_enter");
        var iXKeyCapEnter = iX;
        var iYKeyCapEnter = iY+_iKeyCapHeight/2;

        // ZXCVBNM(BACKSPACE)
        iX = _iKeyCapWidth/2;
        iY += _iKeyCapHeight;
        for(var i=19; i<26; i++){
            oButton = new CKeyCap(iX,iY,oSprite,KEYBOARD_ALPHABET[i],_oContainer);
            oButton.addEventListenerWithParams(ON_MOUSE_DOWN,this.onKeyDown,this,KEYBOARD_ALPHABET[i].charCodeAt(0));
            oButton.addEventListenerWithParams(ON_MOUSE_UP,this.onKeyUp,this,KEYBOARD_ALPHABET[i].charCodeAt(0));
            _aButtons.push(oButton);

            iX += _iKeyCapWidth;
        }

        
        var oSpriteBackspace = s_oSpriteLibrary.getSprite("keycap_backspace");
        oButton = new CKeyCapSpecial(iX+_iKeyCapWidth/2,iY,oSpriteBackspace,_oContainer);
        oButton.addEventListenerWithParams(ON_MOUSE_DOWN,this.onKeyDown,this,BACKSPACE);
        oButton.addEventListenerWithParams(ON_MOUSE_UP,this.onKeyUp,this,BACKSPACE);
        _aButtons.push(oButton); 
        
        oButton = new CKeyCapSpecial(iXKeyCapEnter,iYKeyCapEnter,oSpriteEnter,_oContainer);
        oButton.addEventListenerWithParams(ON_MOUSE_DOWN,this.onKeyDown,this,ENTER);
        oButton.addEventListenerWithParams(ON_MOUSE_UP,this.onKeyUp,this,ENTER);
        _aButtons.push(oButton); 

        _iWidth = _iKeyCapWidth*10;
        _iHeight = _iKeyCapHeight*3;
    };

    this.initKeyCapsCyrillic = function(){
        // ЙЦУКЕНГШЩЗХЪ
        var oSprite = s_oSpriteLibrary.getSprite("keycap");

        _iKeyCapWidth = oSprite.width/4;
        _iKeyCapHeight = oSprite.height/2;

        var iX = _iKeyCapWidth/2;
        var iY = _iKeyCapHeight/2;
        var oButton;
        for(var i=0; i<12; i++){
            oButton = new CKeyCap(iX,iY,oSprite,KEYBOARD_ALPHABET[i],_oContainer);
            oButton.addEventListenerWithParams(ON_MOUSE_DOWN,this.onKeyDown,this,KEYBOARD_ALPHABET[i].charCodeAt(0));
            oButton.addEventListenerWithParams(ON_MOUSE_UP,this.onKeyUp,this,KEYBOARD_ALPHABET[i].charCodeAt(0));
            _aButtons.push(oButton);

            iX += _iKeyCapWidth;
        }

        // "Ф","Ы","В","А","П","Р","О","Л","Д","Ж","Э","Ё",
        iX = _iKeyCapWidth/2;
        iY += _iKeyCapHeight;
        for(var i=12; i<24; i++){
            oButton = new CKeyCap(iX,iY,oSprite,KEYBOARD_ALPHABET[i],_oContainer);
            oButton.addEventListenerWithParams(ON_MOUSE_DOWN,this.onKeyDown,this,KEYBOARD_ALPHABET[i].charCodeAt(0));
            oButton.addEventListenerWithParams(ON_MOUSE_UP,this.onKeyUp,this,KEYBOARD_ALPHABET[i].charCodeAt(0));
            _aButtons.push(oButton);

            iX += _iKeyCapWidth;
        }

        // "Я","Ч","С","М","И","Т","Ь","Б","Ю"
        iX = _iKeyCapWidth/2;
        iY += _iKeyCapHeight;
        for(var i=24; i<33; i++){
            oButton = new CKeyCap(iX,iY,oSprite,KEYBOARD_ALPHABET[i],_oContainer);
            oButton.addEventListenerWithParams(ON_MOUSE_DOWN,this.onKeyDown,this,KEYBOARD_ALPHABET[i].charCodeAt(0));
            oButton.addEventListenerWithParams(ON_MOUSE_UP,this.onKeyUp,this,KEYBOARD_ALPHABET[i].charCodeAt(0));
            _aButtons.push(oButton);

            iX += _iKeyCapWidth;
        }

        var oSpriteBackspace = s_oSpriteLibrary.getSprite("keycap_backspace_cyrillic");
        var iBackspaceButX = iX-_iKeyCapWidth/2+oSpriteBackspace.width/4;
        oButton = new CKeyCapSpecial(iBackspaceButX,iY,oSpriteBackspace,_oContainer);
        oButton.addEventListenerWithParams(ON_MOUSE_DOWN,this.onKeyDown,this,BACKSPACE);
        oButton.addEventListenerWithParams(ON_MOUSE_UP,this.onKeyUp,this,BACKSPACE);
        _aButtons.push(oButton); 
        
        
        var oSpriteEnter = s_oSpriteLibrary.getSprite("keycap_enter_cyrillic");
        oButton = new CKeyCapSpecial(iBackspaceButX+oSpriteBackspace.width/2,iY,oSpriteEnter,_oContainer);
        oButton.addEventListenerWithParams(ON_MOUSE_DOWN,this.onKeyDown,this,ENTER);
        oButton.addEventListenerWithParams(ON_MOUSE_UP,this.onKeyUp,this,ENTER);
        _aButtons.push(oButton); 

        _iWidth = _iKeyCapWidth*12;
        _iHeight = _iKeyCapHeight*3;
    };

    this.addEventListener = function(iEvent,cbCompleted, cbOwner){
        _aCbCompleted[iEvent]=cbCompleted;
        _aCbOwner[iEvent] = cbOwner;
    };

    this.onKeyDown = function(iKeyCode){
        if (_aCbCompleted[ON_KEY_DOWN]) {
            _aCbCompleted[ON_KEY_DOWN].call(_aCbOwner[ON_KEY_DOWN],iKeyCode);
        }
    };

    this.onKeyUp = function(iKeyCode){
        if (_aCbCompleted[ON_KEY_UP]) {
            _aCbCompleted[ON_KEY_UP].call(_aCbOwner[ON_KEY_UP],iKeyCode);
        }
    };

    this.restart = function(){
        for(var i=0; i<_aButtons.length-2; i++){
            _aButtons[i].setState(KEYCAP_STATE_DEFAULT);
        }
    };

    this.pulseKeyCapCorrect = function(szChar){
        _aButtons[(KEYBOARD_ALPHABET.indexOf(szChar))].pulseCorrect();
    };

    this.pressKeyCap = function(iKeyCode){
        if(iKeyCode == BACKSPACE){
            _aButtons[_aButtons.length-2].press();
            return;
        }else if(iKeyCode == ENTER){
            _aButtons[_aButtons.length-1].press();
            return;
        }

        _aButtons[(KEYBOARD_ALPHABET.indexOf(String.fromCharCode(iKeyCode)))].press();
    };

    this.releaseKeyCap = function(iKeyCode){
        if(iKeyCode == BACKSPACE){
            _aButtons[_aButtons.length-2].release();
            return;
        }else if(iKeyCode == ENTER){
            _aButtons[_aButtons.length-1].release();
            return;
        }

        _aButtons[(KEYBOARD_ALPHABET.indexOf(String.fromCharCode(iKeyCode)))].release();
    };

    this.getKeyCapState = function(szChar){
        return _aButtons[(KEYBOARD_ALPHABET.indexOf(szChar))].getState();
    };

    this.setKeyCapState = function(szChar,iState){
        _aButtons[(KEYBOARD_ALPHABET.indexOf(szChar))].setState(iState);
    };

    this.getWidth = function(){
        return _iWidth;
    };

    this.getHeight = function(){
        return _iHeight;
    };
    
    this.getScale = function(){
        return _oContainer.scale;
    };

    this.getKeyCapWidth = function(){
        return _iKeyCapWidth;
    };

    this.getKeyCapHeight = function(){
        return _iKeyCapHeight;
    };

    this.getX = function(){
        return _oContainer.x;
    };

    this.getY = function(){
        return _oContainer.y;
    };

    this.setRegX = function(iRegX){
        _oContainer.regX = iRegX;
    };

    this.setRegY = function(iRegY){
        _oContainer.regY = iRegY;
    };

    this.setX = function(iX){
        _oContainer.x = iX;
    };

    this.setY = function(iY){
        _oContainer.y = iY;
    };

    this.setScale = function(iScale){
        _oContainer.scale = iScale;
    };

    this.unload = function(){
        _aButtons.forEach(element => {
            element.unload();
        });

        _oParentContainer.removeChild(_oContainer);
    };

    this._init(iX,iY);
}