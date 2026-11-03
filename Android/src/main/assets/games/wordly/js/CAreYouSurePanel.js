function CAreYouSurePanel(oParentContainer) {
    var _iStartY;
    var _aCbCompleted;
    var _aCbOwner;
    var _oListener;
    
    var _oBg;
    var _oMsg;
    var _oButYes;
    var _oButNo;
    var _oContainer;
    var _oParentContainer;
    var _oFade;
    var _oPanelContainer;
    
    var _oThis = this;

    this._init = function () {
        _aCbCompleted = new Array();
        _aCbOwner = new Array();
        
        _oContainer = new createjs.Container();
        _oContainer.visible = false;
        _oParentContainer.addChild(_oContainer);

        _oFade = new createjs.Shape();
        _oFade.graphics.beginFill("black").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        _oFade.alpha = 0.5;
        _oListener = _oFade.on("click", function () {});
        _oContainer.addChild(_oFade);
        
        var oSpriteBg = s_oSpriteLibrary.getSprite('msg_box');

        _oPanelContainer = new createjs.Container();   
        _oPanelContainer.regX = oSpriteBg.width/2;
        _oPanelContainer.regY = oSpriteBg.height/2;
        _oContainer.addChild(_oPanelContainer);
        
        _oBg = createBitmap(oSpriteBg);
        _oPanelContainer.addChild(_oBg);
        
        _oPanelContainer.x = CANVAS_WIDTH/2;
        _oPanelContainer.y = _iStartY = - oSpriteBg.height/2;    
        
        var iWidth = oSpriteBg.width-100;
        var iHeight = 200;
        var iX = oSpriteBg.width/2;
        var iY = 100;
        _oMsg = new CTLText(_oPanelContainer, 
                    iX-iWidth/2, iY, iWidth, iHeight, 
                    40, "center", TEXT_COLOR_0, s_szCurFont, 1.1,
                    2, 2,
                    " ",
                    true, true, true,
                    false 
        );
        
        var oSprite = s_oSpriteLibrary.getSprite('but_yes');
        _oButYes = new CGfxButton(oSpriteBg.width - oSprite.width/2 - 100,oSpriteBg.height - oSprite.height/2 - 100, oSprite, _oPanelContainer);
        _oButYes.addEventListener(ON_MOUSE_UP, this._onButYes, this);

        var oSprite = s_oSpriteLibrary.getSprite('but_no');
        _oButNo = new CGfxButton(oSprite.width/2 + 100,oSpriteBg.height - oSprite.height/2 - 100, oSprite, _oPanelContainer);
        _oButNo.addEventListener(ON_MOUSE_UP, this._onButNo, this);
    };
    
    this.addEventListener = function (iEvent, cbCompleted, cbOwner) {
        _aCbCompleted[iEvent] = cbCompleted;
        _aCbOwner[iEvent] = cbOwner;
    };
    
    this.show = function (szText,iSize) {
        _oMsg.refreshText( szText );
        _oMsg.setFontSize( iSize );
        _oPanelContainer.y = _iStartY;
        
        _oContainer.visible = true;
        createjs.Tween.get(_oPanelContainer)
        .to({y: CANVAS_HEIGHT/2}, 500, createjs.Ease.backOut);
    };
    
    this.hide = function(){
        _oContainer.visible = false;
    };

    this.unload = function () {
        _oButNo.unload();
        _oButYes.unload();
        _oFade.off("click",_oListener);
    };

    this._onButYes = function () {
        _oThis.hide();
        
        if (_aCbCompleted[ON_BUT_YES_DOWN]) {
            _aCbCompleted[ON_BUT_YES_DOWN].call(_aCbOwner[ON_BUT_YES_DOWN]);
        }
    };

    this._onButNo = function () {
        _oThis.hide();

        if (_aCbCompleted[ON_BUT_NO_DOWN]) {
            _aCbCompleted[ON_BUT_NO_DOWN].call(_aCbOwner[ON_BUT_NO_DOWN]);
        }
    };

    _oParentContainer = oParentContainer;

    this._init();
}