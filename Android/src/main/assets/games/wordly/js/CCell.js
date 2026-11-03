var CELL_FONT_COLOR = new Array();
CELL_FONT_COLOR[CELL_STATE_EMPTY] = "#13776b";
CELL_FONT_COLOR[CELL_STATE_FILLED] = "#13776b";
CELL_FONT_COLOR[CELL_STATE_WRONG] = "#9fd1b4";
CELL_FONT_COLOR[CELL_STATE_WRONG_POSITION] = "#b65012";
CELL_FONT_COLOR[CELL_STATE_CORRECT] = "#ffffff";

function CCell(oParentContainer,iX,iY,iRow,iCol){    
    var _oParentContainer = oParentContainer;
    var _oContainer;

    var _aCbCompleted;
    var _aCbOwner;

    var _pCurContainerPos;

    var _iRow;
    var _iCol;
    var _iState;

    var _szText;

    var _bPlayingSetStateTween;
    var _oSprite;
    var _oText;
    var _oSetStateTween;
    var _oThis = this;

    this._init = function(iX,iY,iRow,iCol){
        _aCbCompleted=new Array();
        _aCbOwner =new Array();

        _iRow = iRow;
        _iCol = iCol;

        _bPlayingSetStateTween = false;
        _iState = CELL_STATE_EMPTY;
        _szText = " ";

        _pCurContainerPos = {x:iX,y:iY};

        _oContainer = new createjs.Container();
        _oContainer.x = iX;
        _oContainer.y = iY;
        _oParentContainer.addChild(_oContainer);

        var oSprite = s_oSpriteLibrary.getSprite("cell");
        var oData = {   
            images: [oSprite], 
            // width, height & registration point of each sprite
            frames: {width: oSprite.width/5, height: oSprite.height}, 
            animations: {
                state_0:CELL_STATE_EMPTY,
                state_1:CELL_STATE_FILLED,
                state_2:CELL_STATE_WRONG,
                state_3:CELL_STATE_WRONG_POSITION,
                state_4:CELL_STATE_CORRECT,
            }
        };

        var oSpriteSheet = new createjs.SpriteSheet(oData);

        _oSprite = createSprite(oSpriteSheet, "state_"+_iState,0,0,oSprite.width/5,oSprite.height);
        _oSprite.stop();
        _oContainer.addChild(_oSprite);

        var iWidth = oSprite.width/5;
        var iHeight = oSprite.height-14;
        var iX = 0;
        var iY = 0;
        _oText = new CTLText(_oContainer, 
                    iX, iY, iWidth, iHeight, 
                    60, "center",CELL_FONT_COLOR[_iState], s_szCurFont, 1.2,
                    2, 2,
                    _szText,
                    true, true, false,
                    false );
    };

    this.unload = function(){
        createjs.Tween.removeTweens(_oContainer);
        _oParentContainer.removeChild(_oContainer);
    };

    this.restart = function(){
        createjs.Tween.removeTweens(_oContainer);
        _oContainer.x = _pCurContainerPos.x;
        _oContainer.y = _pCurContainerPos.y;
        _bPlayingSetStateTween = false;

        _oText.refreshText(" ");
        this.setState(CELL_STATE_EMPTY);
    };

    this.getX = function(){
        return _pCurContainerPos.x;
    };
    
    this.getY = function(){
        return _pCurContainerPos.y;
    };

    this.setScale = function(iScale){
        _oContainer.scale = iScale;
    };

    this.getText = function(){
        return _szText;
    };

    this.setState = function(iState){
        _iState = iState;
        _oSprite.gotoAndStop(iState);
        _oText.setColor(CELL_FONT_COLOR[_iState]);
    };

    this.setStateWithTween = function(iState,iTweenWaitTime){
        _bPlayingSetStateTween = true;

        _oSetStateTween = createjs.Tween.get(_oContainer)
        .wait(iTweenWaitTime)
        .to({y:(_pCurContainerPos.y-10)},150,createjs.Ease.cubicOut)
        .call(function(){
            _oThis.setState(iState);
        })
        .to({y:(_pCurContainerPos.y)},150,createjs.Ease.cubicIn)
        .call(function(){
            _bPlayingSetStateTween = false;

            if(_aCbCompleted[ON_END_SET_STATE_TWEEN]){
                _aCbCompleted[ON_END_SET_STATE_TWEEN].call(_aCbOwner[ON_END_SET_STATE_TWEEN],iRow,iCol);
            }
        });
    };

    this.addEventListener = function( iEvent,cbCompleted, cbOwner ){
        _aCbCompleted[iEvent]=cbCompleted;
        _aCbOwner[iEvent] = cbOwner; 
    };

    this.removeEventListener = function( iEvent){
        delete _aCbCompleted[iEvent];
        delete _aCbOwner[iEvent]; 
    };

    this.stopUpdate = function(){
        if(_bPlayingSetStateTween){
            _oSetStateTween.paused = true;
        }
    };

    this.startUpdate = function(){
        if(_bPlayingSetStateTween){
            _oSetStateTween.paused = false;
        }
    };

    this.refreshText = function(szText){
        _szText = szText;
        _oText.refreshText(_szText);
    };

    this._init(iX,iY,iRow,iCol);
}