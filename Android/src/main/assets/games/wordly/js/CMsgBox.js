function CMsgBox(){
    var _iStartY;
    var _oListener;
    var _oButYes;
    var _oFade;
    var _oPanelContainer;
    var _oContainer;
    
    this._init = function () {
        _oContainer = new createjs.Container();
        s_oStage.addChild(_oContainer);

        _oFade = new createjs.Shape();
        _oFade.graphics.beginFill("black").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        _oFade.alpha = 0.5;
        _oListener =_oFade.on("click", function () {});
        _oContainer.addChild(_oFade);
        
        var oSpriteBg = s_oSpriteLibrary.getSprite('msg_box');

        _oPanelContainer = new createjs.Container();   
        _oPanelContainer.regX = oSpriteBg.width/2;
        _oPanelContainer.regY = oSpriteBg.height/2;
        _oContainer.addChild(_oPanelContainer);
        
        var oBg = createBitmap(oSpriteBg);
        _oPanelContainer.addChild(oBg);
        
        _oPanelContainer.x = CANVAS_WIDTH/2;
        _oPanelContainer.y = _iStartY = - oSpriteBg.height/2;    
        
        var iWidth = oSpriteBg.width-100;
        var iHeight = 300;
        var iX = oSpriteBg.width/2;
        var iY = 50;
        var oMsg = new CTLText(_oPanelContainer, 
                    iX-iWidth/2, iY, iWidth, iHeight, 
                    30, "center", TEXT_COLOR_0, s_szCurFont, 1.2,
                    2, 2,
                    TEXT_ERR_LS,
                    true, true, true,
                    false 
        );


        var oSprite = s_oSpriteLibrary.getSprite('but_yes');
        _oButYes = new CGfxButton(oSpriteBg.width/2,oSpriteBg.height - oSprite.height/2 - 50, oSprite, _oPanelContainer);
        _oButYes.addEventListener(ON_MOUSE_UP, this._onButYes, this);
        
        createjs.Tween.get(_oPanelContainer).to({y: CANVAS_HEIGHT/2}, 500, createjs.Ease.cubicOut)//.call(function(){s_oMain.stopUpdateNoBlock();});
    };
    
    
    this._onButYes = function(){
        _oButYes.unload();
        _oFade.off("click",_oListener);
        
        s_oStage.removeChild(_oContainer);
    };
    
    this._init();
}