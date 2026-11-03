function CAlert(oParentContainer,iX,iY){

    var _oParentContainer = oParentContainer;
    var _oContainer;

    var _oMsg;

    this._init = function(iX,iY){
        _oContainer = new createjs.Container();
        _oContainer.x = iX;
        _oContainer.y = iY;
        _oContainer.visible = false;
        _oParentContainer.addChild(_oContainer);

        var oSpriteBg = s_oSpriteLibrary.getSprite("bg_alert");
        var oBg = createBitmap(oSpriteBg);
        _oContainer.addChild(oBg);

        _oContainer.regX = oSpriteBg.width/2;
        _oContainer.regY = oSpriteBg.height/2;

        var iWidth = oSpriteBg.width-40;
        var iHeight = oSpriteBg.height-40;
        var iX = 20;
        var iY = oSpriteBg.height/2-5-iHeight/2;
        _oMsg = new CTLText(_oContainer, 
                    iX, iY, iWidth, iHeight, 
                    40, "center", "#fff", s_szCurFont, 1.2,
                    2, 2,
                    " ",
                    true, true, true,
                    false );
    };

    this.show = function(szText){
        _oContainer.visible = true;
        _oContainer.scale = 0;

        playSound("alert",1);

        _oMsg.refreshText(szText);

        createjs.Tween.get(_oContainer,{override:true})
        .to({scale:1},300,createjs.Ease.backOut)
        .wait(800)
        .to({scale:0,visible:false},300,createjs.Ease.backIn);

    };

    this.unload = function(){
        createjs.Tween.removeTweens(_oContainer);
        _oParentContainer.removeChild(_oContainer);
    };

    this._init(iX,iY);
}