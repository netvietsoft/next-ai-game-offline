function CEndPanel(){
    var _iStartY;
    var _iEventToLaunch;
    var _aCbCompleted;
    var _aCbOwner;
    var _oListener;
    var _oBg;
    
    var _oFade;
    var _oText;
    var _oLevelClearedText;
    var _oTextBestStreak;
    var _oButHome;
    var _oButRestart;
    var _oContainer;
    var _oContainerPanel;
    var _oFinalGrid = null;
    var _oSpriteBg;
    
    var _oSfx;
    
    var _iSpriteBgWidth;
    var _iSpriteBgHeight;

    var _oThis = this;

    
    this._init = function(){
        _aCbCompleted=new Array();
        _aCbOwner =new Array();
        
        _oContainer = new createjs.Container();
        _oContainer.visible = false;
        s_oStage.addChild(_oContainer);
        
        _oFade = new createjs.Shape();
        _oFade.graphics.beginFill("black").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        _oFade.alpha = 0.5;
        _oListener = _oFade.on("click", function () {});
        _oContainer.addChild(_oFade);
        
        _oBg = createBitmap(s_oSpriteLibrary.getSprite("bg_game_over"));
        _oContainer.addChild(_oBg);
        
        _oContainerPanel = new createjs.Container();
        _oContainerPanel.x = CANVAS_WIDTH/2;
        _oContainer.addChild(_oContainerPanel);
        
        _oSpriteBg = s_oSpriteLibrary.getSprite("end_panel");
        var oBg = createBitmap(_oSpriteBg);
        _oContainerPanel.addChild(oBg);

        _iSpriteBgWidth = _oSpriteBg.width;
        _iSpriteBgHeight = _oSpriteBg.height;
        
        var iWidth = _oSpriteBg.width-100;
        var iHeight = 90;
        var iX = _oSpriteBg.width/2;
     
        _oLevelClearedText = new CTLText(_oContainerPanel, 
                    iX-iWidth/2, 30, iWidth, iHeight, 
                    70, "center", "#fff", s_szCurFont, 1,
                    2, 2,
                    " ",
                    true, true, true,
                    false );
        
        var iWidth = _oSpriteBg.width-100;
        var iHeight = 120;
        var iY = _oSpriteBg.height/2 + 30;
        _oText = new CTLText(_oContainerPanel, 
                    iX-iWidth/2, iY, iWidth, iHeight, 
                    50, "center", "#fff", s_szCurFont, 1,
                    2, 2,
                    " ",
                    true, true, false,
                    false );

        iY = _oSpriteBg.height/2 + 100;
        _oTextBestStreak = new CTLText(_oContainerPanel, 
                    iX-iWidth/2, iY, iWidth, iHeight, 
                    50, "center", "#fff", s_szCurFont, 1,
                    2, 2,
                    " ",
                    true, true, false,
                    false 
        );

        var oSprite = s_oSpriteLibrary.getSprite("but_home");
        _oButHome = new CGfxButton(_oSpriteBg.width/2 - 100,_oSpriteBg.height-40-oSprite.height/2,oSprite,_oContainerPanel);
        _oButHome.addEventListener(ON_MOUSE_UP,this._onHome,this);
        
        var oSprite = s_oSpriteLibrary.getSprite("but_restart");
        _oButRestart = new CGfxButton(_oSpriteBg.width/2 + 100,_oSpriteBg.height-40-oSprite.height/2,oSprite,_oContainerPanel);
        _oButRestart.addEventListener(ON_MOUSE_UP,this._onRestart,this);

        _iStartY = -_oSpriteBg.height/2;
        
        _oContainerPanel.regX = _oSpriteBg.width/2;
        _oContainerPanel.regY = _oSpriteBg.height/2;
    };
    
    this.unload = function(){
        _oButHome.unload();
        _oButRestart.unload();
        
        _oFade.off("click", _oListener);
    };
    
    this.addEventListener = function( iEvent,cbCompleted, cbOwner ){
        _aCbCompleted[iEvent]=cbCompleted;
        _aCbOwner[iEvent] = cbOwner; 
    };
    
    this.show = function(iMode,aFinalGridPreview,szWordToGuess){
        stopSound("soundtrack");

        var bWin = szWordToGuess?false:true;
        
        if(bWin){
            _oText.setY(_oSpriteBg.height/2 + 30);
            
            _oSfx = playSound("game_over_win",1,false);
            _oLevelClearedText.refreshText( TEXT_GAME_OVER_WIN );
            _oText.refreshText( sprintf( TEXT_CUR_STREAK,  getLocalStorageCurStreak(iMode)) );
            
            _oFinalGrid = new CFinalGrid(NUM_TRIES[iMode],WORD_LENGTH[iMode],_iSpriteBgWidth/2,_iSpriteBgHeight/2-130,aFinalGridPreview,_oContainerPanel)
        }else{
            _oText.setY(_oSpriteBg.height/2 - 130);
            
            _oSfx = playSound("game_over_lose",1,false);
            _oLevelClearedText.refreshText( TEXT_GAME_OVER_LOSE );
            _oText.refreshText( sprintf( TEXT_WORD_TO_GUESS,  szWordToGuess) );
            
            _oFinalGrid = null;
        }

        _oSfx.on('end', function(){
            playSound("soundtrack",SOUNDTRACK_VOLUME_IN_GAME,true);
        });
        
        _oTextBestStreak.refreshText(sprintf( TEXT_BEST_STREAK,  getLocalStorageBestStreak(iMode)) );
        

        _oBg.alpha = 0;
        _oFade.alpha = 0;
        _oContainerPanel.y = _iStartY;
        _oContainer.visible = true;
        
        createjs.Tween.get(_oBg).wait(300).to({alpha:1}, 400);
        createjs.Tween.get(_oFade).wait(300).to({alpha:1}, 400);
        createjs.Tween.get(_oContainerPanel).wait(700).to({y:CANVAS_HEIGHT/2}, 500,createjs.Ease.cubicOut);
    };
    
    this.hide = function(){
        _oButHome.setActive(false);

        createjs.Tween.get(_oContainerPanel)
        .to({y:_iStartY}, 1000,createjs.Ease.backIn)
        .call(function(){
            createjs.Tween.get(_oBg)
            .to({alpha:0}, 400,createjs.Ease.cubicOut)
            .call(function(){
                _oButHome.setActive(true);
                if(_oFinalGrid !== null){
                    _oFinalGrid.unload();
                }
                _oContainer.visible = false;

                if(_aCbCompleted[_iEventToLaunch]){
                    _aCbCompleted[_iEventToLaunch].call(_aCbOwner[_iEventToLaunch]);
                }
            })
        });
    };
    
    this._onHome = function(){
        _oSfx.off("end");

        _iEventToLaunch = ON_BACK_MENU;
        
        _oThis.hide();
    };
    
    this._onRestart = function(){
        _oSfx.off("end");

        document.dispatchEvent(new CustomEvent("show_interlevel_ad"));

        _iEventToLaunch = ON_RESTART;
        
        _oThis.hide();
    };
    
    this._init();
}
