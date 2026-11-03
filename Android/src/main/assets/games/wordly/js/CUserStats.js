function CUserStats(oParentContainer){
    var _aBars;
    var _oListener;
    
    var _iCurModeStats;

    var _oButExit;
    var _oButEasy;
    var _oButMedium;
    var _oButHard;
    var _oSpriteBg;
    var _oTextWins;
    var _oTextLosses;
    var _oTextPerc;
    var _oTextCurStreak;
    var _oTextBestStreak;
    var _oFade;
    var _oContainer;
    var _oContainerPanel;
    var _oParentContainer = oParentContainer;
    
    var _pStartPos;
    var _pEndPos;

    var _oThis = this;
    
    this._init = function(){
        _iCurModeStats = MODE_EASY;

        _oContainer = new createjs.Container();
        _oContainer.visible=false;
        _oParentContainer.addChild(_oContainer);
        
        _oFade = new createjs.Shape();
        _oFade.graphics.beginFill("black").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        _oListener = _oFade.on("click", function () {});
        _oContainer.addChild(_oFade);
        
        _oSpriteBg = s_oSpriteLibrary.getSprite("msg_box");

        _pStartPos = {x:CANVAS_WIDTH/2,y:-_oSpriteBg.height/2};
        _pEndPos = {x:CANVAS_WIDTH/2,y:CANVAS_HEIGHT/2};

        _oContainerPanel = new createjs.Container();
        _oContainerPanel.x = _pStartPos.x;
        _oContainerPanel.y = _pStartPos.y;
        _oContainerPanel.regX = _oSpriteBg.width/2;
        _oContainerPanel.regY = _oSpriteBg.height/2;
        _oContainer.addChild(_oContainerPanel);
        
        var oBg = createBitmap(_oSpriteBg);
        _oContainerPanel.addChild(oBg);
        
        var iWidth = _oSpriteBg.width/2-20;
        var iHeight = 85;
        var iX = 20;
        var iY = _oSpriteBg.height-40-(iHeight+20)*4;
        _oTextWins = new CTLText(_oContainerPanel, 
            iX, iY-iHeight, iWidth, iHeight, 
            44, "right", "#fff", s_szCurFont, 1.1,
            0, 0,
            " ",
            true, true, false,
            false 
        );
        
        iY = _oSpriteBg.height-60-(iHeight+20)*3;
        _oTextLosses =  new CTLText(_oContainerPanel, 
            iX, iY-iHeight, iWidth, iHeight, 
            44, "right", "#fff", s_szCurFont, 1.1,
            0, 0,
            " ",
            true, true, false,
            false 
        );

        iWidth = _oSpriteBg.width-40;
        iX = _oSpriteBg.width/2;
        iY = _oSpriteBg.height-80-(iHeight+20)*2;
        _oTextPerc =  new CTLText(_oContainerPanel, 
            iX-iWidth/2, iY-iHeight, iWidth, iHeight, 
            48, "center", "#fff", s_szCurFont, 1.1,
            0, 0,
            " ",
            true, true, false,
            false 
        );

        iY = _oSpriteBg.height-40-iHeight-20;
        _oTextCurStreak =  new CTLText(_oContainerPanel, 
            iX-iWidth/2, iY-iHeight, iWidth, iHeight, 
            48, "center", "#fff", s_szCurFont, 1.1,
            0, 0,
            " ",
            true, true, false,
            false 
        );

        iY = _oSpriteBg.height-40;        
        _oTextBestStreak =  new CTLText(_oContainerPanel, 
            iX-iWidth/2, iY-iHeight, iWidth, iHeight, 
            48, "center", "#fff", s_szCurFont, 1.1,
            0, 0,
            " ",
            true, true, false,
            false 
        );

        var iButScale = 1;

        var oSpriteExit = s_oSpriteLibrary.getSprite("but_exit");  
        _oButExit = new CGfxButton(_oSpriteBg.width-((oSpriteExit.width/2)*iButScale)-20,((oSpriteExit.height/2)*iButScale)+20,oSpriteExit,_oContainerPanel);
        _oButExit.setScale(iButScale);
        _oButExit.addEventListener(ON_MOUSE_UP,this._onExit,this);

        var oSprite = s_oSpriteLibrary.getSprite("but_easy");  
        var iButScale = ((oSpriteExit.height*iButScale)/oSprite.height);
        _oButEasy = new CGfxButton(((oSprite.width/2)*iButScale)+20,((oSprite.height/2)*iButScale)+20,oSprite,_oContainerPanel);
        _oButEasy.setScale(iButScale);
        _oButEasy.setAlpha(0.6);
        _oButEasy.addEventListener(ON_MOUSE_UP,this._onButEasy,this);

        var oSprite = s_oSpriteLibrary.getSprite("but_medium");  
        _oButMedium = new CGfxButton(((oSprite.width/2)*iButScale)+40+(oSprite.width*iButScale),((oSprite.height/2)*iButScale)+20,oSprite,_oContainerPanel);
        _oButMedium.setScale(iButScale);
        _oButMedium.addEventListener(ON_MOUSE_UP,this._onButMedium,this);

        var oSprite = s_oSpriteLibrary.getSprite("but_hard");  
        _oButHard = new CGfxButton(((oSprite.width/2)*iButScale)+60+(oSprite.width*iButScale)*2,((oSprite.height/2)*iButScale)+20,oSprite,_oContainerPanel);
        _oButHard.setScale(iButScale);
        _oButHard.addEventListener(ON_MOUSE_UP,this._onButHard,this);

        this.show();
    };
    
    this.unload = function(){
        _oFade.off("click",_oListener);

        for(var i=0; i<_aBars.length; i++){
            _aBars[i].unload();
        }

        _oButExit.unload();
        _oButEasy.unload();
        _oButMedium.unload();
        _oButHard.unload();

        _oParentContainer.removeChild(_oContainer);
    };

    this.setButtonsActive = function(bActive){
        _oButExit.setActive(bActive);
        _oButEasy.setActive(bActive);
        _oButMedium.setActive(bActive);
        _oButHard.setActive(bActive);
    };
    
    this.show = function(){
        this.setButtonsActive(false);
        
        var iPerc = 0;
      
        var iPlayedGames = getLocalStoragePlayedGames(_iCurModeStats);
        var iWonGames = getLocalStorageWonGames(_iCurModeStats);
        if(iWonGames > 0){
            iPerc = iWonGames/iPlayedGames;
            iPerc *=100;
            iPerc = parseFloat(iPerc.toFixed(2));
        }

        
        _oTextWins.refreshText(TEXT_WON_GAMES);
        _oTextLosses.refreshText(TEXT_LOST_GAMES);
        _oTextPerc.refreshText(TEXT_WIN_PERC+iPerc);
        _oTextCurStreak.refreshText(sprintf(TEXT_CUR_STREAK,getLocalStorageCurStreak(_iCurModeStats)));
        _oTextBestStreak.refreshText(sprintf(TEXT_BEST_STREAK,getLocalStorageBestStreak(_iCurModeStats)));
        
        _oContainer.visible = true;
        _oFade.alpha = 0;
        createjs.Tween.get(_oFade)
        .to({alpha:0.7}, 400, createjs.Ease.cubicOut);
        
        _aBars = new Array();

        _oContainerPanel.y = _pStartPos.y;
        createjs.Tween.get(_oContainerPanel)
        .wait(400)
        .to({y:_pEndPos.y}, 500, createjs.Ease.backOut)
        .call(function(){
            _oThis.setButtonsActive(true);
            _oThis.createAllStats();
        });
    };

    this._onButEasy = function(){
        if(_iCurModeStats == MODE_EASY){
            return;
        }
        _iCurModeStats = MODE_EASY;

        _oButEasy.setAlpha(0.6);
        _oButMedium.setAlpha(1);
        _oButHard.setAlpha(1);

        this.refreshBars();
    };

    this._onButMedium = function(){
        if(_iCurModeStats == MODE_MEDIUM){
            return;
        }
        _iCurModeStats = MODE_MEDIUM;

        _oButEasy.setAlpha(1);
        _oButMedium.setAlpha(0.6);
        _oButHard.setAlpha(1);

        this.refreshBars();
    };

    this._onButHard = function(){
        if(_iCurModeStats == MODE_HARD){
            return;
        }
        _iCurModeStats = MODE_HARD;

        _oButEasy.setAlpha(1);
        _oButMedium.setAlpha(1);
        _oButHard.setAlpha(0.6);

        this.refreshBars();
    };
    
    this.createAllStats = function(){
        var iPlayedGames = getLocalStoragePlayedGames(_iCurModeStats);
        var iWonGames = getLocalStorageWonGames(_iCurModeStats);
        var iLostGames = getLocalStorageLostGames(_iCurModeStats);

        _oThis._createGraph(
            _oSpriteBg.width/2+10,
            _oTextWins.getY()+85/2,
            iWonGames,
            "#00f10b",
            iWonGames>0?iWonGames/iPlayedGames:0,
            _oContainerPanel
        );

        _oThis._createGraph(
            _oSpriteBg.width/2+10,
            _oTextLosses.getY()+85/2,
            iLostGames,
            "#ff1800",
            iLostGames>0?iLostGames/iPlayedGames:0,
            _oContainerPanel
        );

        var iPerc = 0;
        if(iWonGames > 0){
            iPerc = iWonGames/iPlayedGames;
            iPerc *=100;
            iPerc = parseFloat(iPerc.toFixed(2));
        }
        _oTextPerc.refreshText(TEXT_WIN_PERC+iPerc);
        _oTextCurStreak.refreshText(sprintf(TEXT_CUR_STREAK,getLocalStorageCurStreak(_iCurModeStats)));
        _oTextBestStreak.refreshText(sprintf(TEXT_BEST_STREAK,getLocalStorageBestStreak(_iCurModeStats)));
    };
    
    this._createGraph = function(iX,iY,iAmount,szColor,iPerc){
        _aBars.push( new CStatsBar(iX,iY,szColor,iAmount ,iPerc,_oContainerPanel));
    };
    
    this.refreshBars = function(){
        for(var k=0;k<_aBars.length;k++){
            _aBars[k].unload();
        }
        
        this.createAllStats();
    };
    
    this._onExit = function(){
        _oButExit.setActive(false);
        
        createjs.Tween.get(_oFade).to({alpha:0}, 500, createjs.Ease.cubicOut);
        createjs.Tween.get(_oContainerPanel)
        .to({y:_pStartPos.y}, 500, createjs.Ease.backIn)
        .call(function(){
            _oThis.unload();
        });
    };
    
    this._init();
    
}