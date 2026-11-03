function CCreditsPanel(){
    var _oListener;
    var _oListenerFade;
    var _oFade;
    var _oPanelContainer;
    var _oButExit;
    var _oLogo;
    var _oPanel;
    
    var _pStartPanelPos;
    
    this._init = function(){
        
        _oFade = new createjs.Shape();
        _oFade.graphics.beginFill("black").drawRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
        _oFade.alpha = 0;
        _oListenerFade = _oFade.on("click",function(){});
        s_oStage.addChild(_oFade);
        
        createjs.Tween.get(_oFade).to({alpha:0.7},500);
        
        _oPanelContainer = new createjs.Container();   
        s_oStage.addChild(_oPanelContainer);
        
        var oPanelSprite = s_oSpriteLibrary.getSprite('msg_box');
        _oPanel = createBitmap(oPanelSprite);        
        _oPanelContainer.addChild(_oPanel);
        _oListener = _oPanel.on("click",this._onLogoButRelease);
        
        _pStartPanelPos = {x: CANVAS_WIDTH/2, y: -oPanelSprite.height/2};
        _oPanelContainer.x = _pStartPanelPos.x;
        _oPanelContainer.y = _pStartPanelPos.y;  
        _oPanelContainer.regX = oPanelSprite.width/2;
        _oPanelContainer.regY = oPanelSprite.height/2;
        createjs.Tween.get(_oPanelContainer).to({y:CANVAS_HEIGHT/2},500, createjs.Ease.backOut);

        var iWidth = oPanelSprite.width-100;
        var iHeight = 70;
        var iX = oPanelSprite.width/2;
        var iY = oPanelSprite.height/2 - 100;
        var oTitle = new CTLText(_oPanelContainer, 
                    iX-iWidth/2, iY-iHeight/2, iWidth, iHeight, 
                    40, "center", TEXT_COLOR_0, s_szCurFont, 1,
                    2, 2,
                    TEXT_DEVELOPED,
                    true, true, false,
                    false );
        
        var iWidth = oPanelSprite.width-100;
        var iHeight = 70;
        var iX = oPanelSprite.width/2;
        var iY = oPanelSprite.height/2 + 100;
        var oLink = new CTLText(_oPanelContainer, 
                    iX-iWidth/2, iY-iHeight/2, iWidth, iHeight, 
                    36, "center", TEXT_COLOR_0, s_szCurFont, 1,
                    2, 2,
                    "WWW.CODETHISLAB.COM",
                    true, true, false,
                    false );

       
        var oSprite = s_oSpriteLibrary.getSprite('ctl_logo');
        _oLogo = createBitmap(oSprite);
        
        _oLogo.regX = oSprite.width/2;
        _oLogo.regY = oSprite.height/2;
        _oLogo.x = oPanelSprite.width/2;
        _oLogo.y = oPanelSprite.height/2;
        _oPanelContainer.addChild(_oLogo);
        
        var oSprite = s_oSpriteLibrary.getSprite('but_exit');

        var iWidth  = 100;
        var iHeight = 20;
        var iX = 20;
        var iY = oPanelSprite.height - 30 - iHeight;
        var oVersion = new CTLText(_oPanelContainer, 
            iX, iY, iWidth, iHeight, 
            15, "left", TEXT_COLOR_0, s_szCurFont, 1,
            0, 0,
            "v.2",
            true, true, true,
            false 
        );

        _oButExit = new CGfxButton(oPanelSprite.width - oSprite.width/2 - 20,oSprite.height/2 + 20, oSprite, _oPanelContainer);
        _oButExit.addEventListener(ON_MOUSE_UP, this.unload, this);
    };
    
    this.unload = function(){
        _oButExit.setActive(false);

        createjs.Tween.get(_oFade).to({alpha:0},500);
        createjs.Tween.get(_oPanelContainer).to({y:_pStartPanelPos.y},500, createjs.Ease.backIn).call(function(){
            s_oStage.removeChild(_oFade);
            s_oStage.removeChild(_oPanelContainer);

            _oButExit.unload();
        }); 
        
        _oFade.off("click",_oListenerFade);
        _oPanel.off("click",_oListener);  
    };
    
    this._onLogoButRelease = function(){
        window.open("https://www.codethislab.it/","_blank");
    };
    
    this._init();
    
    
};


