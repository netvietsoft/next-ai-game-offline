function CHelpPanel(oParentContainer,iWordLength){

    var _aCbCompleted;
    var _aCbOwner;
    var _aPages;

    var _oParentContainer = oParentContainer;
    var _oContainer;
    var _oContainerPanel;
    var _oFade;
    var _oListenerFade;
    
    var _oButExit;
    var _oButLeft;
    var _oButRight;

    var _bButtonsEnabled;
    var _iCurPage;
    var _iWordLength;

    var _pStartPosButExitLandscape;
    var _pStartPosButExit;

    var _oThis = this;

    this._init = function(iWordLength){
        _aCbCompleted = new Array();
        _aCbOwner = new Array();

        _bButtonsEnabled = true;
        _iCurPage = 0;
        _iWordLength = iWordLength;

        _oContainer = new createjs.Container();
        _oContainer.visible = false;
        _oParentContainer.addChild(_oContainer);

        _oFade = new createjs.Shape();
        _oFade.graphics.beginFill("black").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        _oFade.alpha = 0.5;
        _oListenerFade = _oFade.on("click", function () {});
        _oContainer.addChild(_oFade);

        var oSpriteBg = s_oSpriteLibrary.getSprite("bg_help");

        _oContainerPanel = new createjs.Container();
        _oContainerPanel.x = CANVAS_WIDTH/2;
        _oContainerPanel.y = CANVAS_HEIGHT/2;
        _oContainerPanel.regX = oSpriteBg.width/2;
        _oContainerPanel.regY = oSpriteBg.height/2;
        _oContainer.addChild(_oContainerPanel);
        
        var oSprite = s_oSpriteLibrary.getSprite("but_yes");
        _pStartPosButExitLandscape = {x:CANVAS_WIDTH-oSprite.width/2-10,y:CANVAS_HEIGHT-oSprite.height/2-10};
        _pStartPosButExit = {x:_oContainerPanel.x,y:_oContainerPanel.y+oSpriteBg.height/2+oSprite.height/2+5};
        _oButExit = new CGfxButton(_pStartPosButExit.x,_pStartPosButExit.y,oSprite,_oContainer);
        _oButExit.addEventListener(ON_MOUSE_UP,this.onExit,this);

        var oSprite = s_oSpriteLibrary.getSprite("but_left");
        _oButLeft = new CGfxButton(-oSprite.width/2-5,oSpriteBg.height/2,oSprite,_oContainerPanel);
        _oButLeft.addEventListener(ON_MOUSE_UP,this.onLeft,this);

        var oSprite = s_oSpriteLibrary.getSprite("but_right");
        _oButRight = new CGfxButton(oSpriteBg.width+oSprite.width/2+5,oSpriteBg.height/2,oSprite,_oContainerPanel);
        _oButRight.addEventListener(ON_MOUSE_UP,this.onRight,this);

        this.createPages();

        _oButLeft.setVisible(false);
        _oButRight.setVisible(false);
        if(_aPages.length > 1){
            _oButRight.setVisible(true);
        }
    };

    this.addEventListener = function( iEvent,cbCompleted, cbOwner ){
        _aCbCompleted[iEvent]=cbCompleted;
        _aCbOwner[iEvent] = cbOwner; 
    };

    this.setButtonsEnabled = function(bEnabled){
        _bButtonsEnabled = bEnabled;
    };

    this.show = function(){
        _oContainer.visible = true;

        this.setButtonsEnabled(false);
        _oButExit.setVisible(true);

        _oContainerPanel.scale = 0;
        _oContainerPanel.visible = true;

        _oFade.alpha = 0;
        _oFade.visible = true;

        createjs.Tween.get(_oFade)
        .to({alpha:0.5},500);

        createjs.Tween.get(_oContainerPanel)
        .to({scale:1},500,createjs.Ease.backOut)
        .call(function(){
            _oThis.setButtonsEnabled(true);
        });
    };

    this.createPages = function(){
        _aPages = new Array();

        _aPages[0] = new createjs.Container();
        _oContainerPanel.addChild(_aPages[0]);

        var oSpriteBg = s_oSpriteLibrary.getSprite("bg_help");
        var oBg = createBitmap(oSpriteBg);
        _aPages[0].addChild(oBg);

        var iWidth = oSpriteBg.width-100;
        var iHeight = 240;
        var iX = oSpriteBg.width/2;
        var iY = 40;
        var oText = new CTLText(_aPages[0], 
                    iX-iWidth/2, iY, iWidth, iHeight, 
                    40, "center", "#fff", s_szCurFont, 1.2,
                    2, 2,
                    TEXT_HELP[0],
                    true, true, true,
                    false 
        );
        
        var oCellsContainer = new createjs.Container();
        _aPages[0].addChild(oCellsContainer);
    
        var oCellSprite = s_oSpriteLibrary.getSprite("cell");
        var iCellWidth = oCellSprite.width/5;
        var iCellHeight = oCellSprite.height;
        var iCellPadding = 10; 

        oCellsContainer.regX = ((iCellWidth*_iWordLength)+(iCellPadding*(_iWordLength-1)))/2;
        oCellsContainer.regY = oCellSprite.height/2;
        oCellsContainer.scale = iWidth/((iCellWidth*_iWordLength)+(iCellPadding*(_iWordLength-1)));
        if(oCellsContainer.scale > 1){
            oCellsContainer.scale = 1;
        }
        oCellsContainer.x = oSpriteBg.width/2;
        oCellsContainer.y = oSpriteBg.height-40-iCellHeight;
        

        var iX = 0;
        var oCell;
        var szRandomWord = s_oWordList.getRandCommonWord(s_iCurLang,_iWordLength).toUpperCase();
        for(var i=0; i<_iWordLength; i++){
            oCell = new CCell(oCellsContainer,iX,0);
            oCell.refreshText(szRandomWord[i]);
            iX += iCellWidth+iCellPadding;
        }

        _aPages[1] = new createjs.Container();
        _aPages[1].visible = false;
        _oContainerPanel.addChild(_aPages[1]);

        var oBg = createBitmap(oSpriteBg);
        _aPages[1].addChild(oBg);

        var iWidth = oSpriteBg.width-100;
        var iHeight = 100;
        var iX = oSpriteBg.width/2;
        var iY = 40;
        var oText = new CTLText(_aPages[1], 
                    iX-iWidth/2, iY, iWidth, iHeight, 
                    40, "center", "#fff", s_szCurFont, 1.2,
                    2, 2,
                    TEXT_HELP[1],
                    true, true, true,
                    false 
        );

        var iCellScale = 0.70;
        var iCellWidth = oCellSprite.width/_iWordLength*iCellScale;
        var iCellHeight = oCellSprite.height*iCellScale;
        var iX = oSpriteBg.width/2 - (oSpriteBg.width-120)/2;
        var iTextX = iX+iCellWidth+20;
        var iTextWidth = (oSpriteBg.width -20)-iTextX;
        var iY = 30+iHeight+40;
        oCell = new CCell(_aPages[1],iX,iY);
        oCell.setState(CELL_STATE_WRONG);
        oCell.setScale(iCellScale);
        var oText = new CTLText(_aPages[1], 
            iTextX, iY, iTextWidth, iCellHeight, 
            40, "left", "#fff", s_szCurFont, 1.2,
            2, 2,
            TEXT_HELP[2],
            true, true, true,
            false 
        );

        iY = (((iY+iCellHeight)+(oSpriteBg.height-40-iCellHeight))/2)-iCellHeight/2;
        oCell = new CCell(_aPages[1],iX,iY);
        oCell.setState(CELL_STATE_WRONG_POSITION);
        oCell.setScale(iCellScale);
        oText = new CTLText(_aPages[1], 
            iTextX, iY, iTextWidth, iCellHeight, 
            40, "left", "#fff", s_szCurFont, 1.2,
            2, 2,
            TEXT_HELP[3],
            true, true, true,
            false 
        );

        iY = oSpriteBg.height-40-iCellHeight;
        oCell = new CCell(_aPages[1],iX,iY);
        oCell.setState(CELL_STATE_CORRECT);
        oCell.setScale(iCellScale);
        oText = new CTLText(_aPages[1], 
            iTextX, iY, iTextWidth, iCellHeight, 
            40, "left", "#fff", s_szCurFont, 1.2,
            2, 2,
            TEXT_HELP[4],
            true, true, true,
            false 
        );
    };

    this.onExit = function(){
        if(!_bButtonsEnabled){
            return;
        }

        this.setButtonsEnabled(false);

        _oButExit.setVisible(false);

        createjs.Tween.get(_oFade)
        .to({alpha:0},1000);

        createjs.Tween.get(_oContainerPanel)
        .to({scale:0,visible:false},1000,createjs.Ease.backIn)
        .call(function(){
            _oContainer.visible = false;

            if(_aCbCompleted[ON_HELP_EXIT]){
                _aCbCompleted[ON_HELP_EXIT].call(_aCbOwner[ON_HELP_EXIT]);
            }
        });
    };  

    this.onLeft = function(){
        if(!_bButtonsEnabled){
            return;
        }

        _oButRight.setVisible(true);

        _aPages[_iCurPage].visible = false;

        _iCurPage--;

        if(_iCurPage === 0){
            _oButLeft.setVisible(false);
        }

        _aPages[_iCurPage].visible = true;
    };

    this.onRight = function(){
        if(!_bButtonsEnabled){
            return;
        }

        _aPages[_iCurPage].visible = false;

        _iCurPage++;

        _aPages[_iCurPage].visible = true;
        
        _oButLeft.setVisible(true);

        if(_iCurPage === _aPages.length-1){
            _oButRight.setVisible(false);
        }
    };

    this.refreshPos = function(){
        if(s_bLandscape){
            _oButExit.setPosition(_pStartPosButExitLandscape.x-s_iOffsetX,_pStartPosButExitLandscape.y-s_iOffsetY);
        }else{
            _oButExit.setPosition(_pStartPosButExit.x,_pStartPosButExit.y);
        }
    }

    this.unload = function(){
        _oFade.off("click",_oListenerFade);

        _oButExit.unload();
        _oButLeft.unload();
        _oButRight.unload();

        _oParentContainer.removeChild(_oContainer);
    };

    this._init(iWordLength);
}