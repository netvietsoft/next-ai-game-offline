function CGrid(oParentContainer,iRows,iCols,iX,iY){

    var _oParentContainer = oParentContainer;
    var _oContainer;
    var _oCellsContainer;

    var _aCells;

    var _aCbCompleted;
    var _aCbOwner;

    var _iRows;
    var _iCols;
    var _iWidth;
    var _iHeight;
    var _iCurChar;
    var _iCurRow;

    this._init = function(iRows,iCols,iX,iY){
        _aCbCompleted=new Array();
        _aCbOwner =new Array();

        _iRows = iRows;
        _iCols = iCols;
        _iWidth = 0;
        _iHeight = 0;
        _iCurChar = 0;
        _iCurRow = 0;

        _oContainer = new createjs.Container();
        _oContainer.x = iX;
        _oContainer.y = iY;
        _oParentContainer.addChild(_oContainer);

        this._initCells();
    };

    this._initCells = function(){
        _oCellsContainer = new createjs.Container();
        _oContainer.addChild(_oCellsContainer);

        _aCells = new Array();

        var oCellSprite = s_oSpriteLibrary.getSprite("cell");

        var iCellWidth = oCellSprite.width/5;
        var iCellHeight = oCellSprite.height;
        var iCellPaddingX = 15;
        var iCellPaddingY = 15;
        var iY=0;
        var oRow;
        var oCell;
        var iX;
        for(var r = 0; r<_iRows; r++){
            _aCells[r] = new Array();
            iX=0;
            for(var c = 0; c<_iCols; c++){
                oCell = new CCell(_oCellsContainer,iX,iY,r,c);
                _aCells[r].push(oCell);

                iX += iCellWidth + iCellPaddingX;
            }

            iY += iCellHeight + iCellPaddingY;
        }

        _iWidth = (iCellWidth + iCellPaddingX)*_iCols - iCellPaddingX;
        _iHeight = (iCellHeight + iCellPaddingY)*_iRows - iCellPaddingY;
    }

    this.restart = function(){
        _iCurRow = 0;
        _iCurChar = 0;
        _aCells.forEach(element => {
            element.forEach(element => {
                element.restart();
            });
        });
    };

    this.addEventListener = function( iEvent,cbCompleted, cbOwner ){
        _aCbCompleted[iEvent]=cbCompleted;
        _aCbOwner[iEvent] = cbOwner; 
    };

    this.insertChar = function(szText){
        if(_iCurChar >= _iCols){
            return;
        }

        _aCells[_iCurRow][_iCurChar].refreshText(szText);
        _aCells[_iCurRow][_iCurChar].setState(CELL_STATE_FILLED);

        _iCurChar++;
    };

    this.deleteChar = function(){
        if(_iCurChar === 0){
            return;
        }

        _iCurChar--;

        _aCells[_iCurRow][_iCurChar].refreshText(" ");
        _aCells[_iCurRow][_iCurChar].setState(CELL_STATE_EMPTY);
    };

    this.getCurrentWord = function(){
        var szWord = "";

        for(var i=0; i<_iCols; i++){
            szWord += _aCells[_iCurRow][i].getText();
        }
        
        return szWord.toUpperCase();
    };

    this.setCellsStates = function(aCellsStates){
        var iTweenWaitTime = 0;
        for(var i=0; i<_iCols-1; i++){
            _aCells[_iCurRow][i].setStateWithTween(aCellsStates[i],iTweenWaitTime);
            iTweenWaitTime += 100;
        }

        _aCells[_iCurRow][_iCols-1].addEventListener(ON_END_SET_STATE_TWEEN,this.onEndCellsSetStateTween,this);
        _aCells[_iCurRow][_iCols-1].setStateWithTween(aCellsStates[_iCols-1],iTweenWaitTime);
    };

    this.onEndCellsSetStateTween = function(iCellRow,iCellCol){
        _aCells[iCellRow][iCellCol].removeEventListener(ON_END_SET_STATE_TWEEN);

        if(_aCbCompleted[ON_END_SET_STATE_TWEEN]){
            _aCbCompleted[ON_END_SET_STATE_TWEEN].call(_aCbOwner[ON_END_SET_STATE_TWEEN]);
        }
    };

    this.nextRow = function(){
        _iCurRow++;
        _iCurChar = 0;
    };

    this.getWidth = function(){
        return _iWidth;
    };

    this.getHeight = function(){
        return _iHeight;
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

    this.stopUpdate = function(){
        for(var r=0; r<_aCells.length; r++){
            for(var c=0; c<_aCells[r].length; c++){
                _aCells[r][c].stopUpdate();
            }
        }
    };

    this.startUpdate = function(){
        for(var r=0; r<_aCells.length; r++){
            for(var c=0; c<_aCells[r].length; c++){
                _aCells[r][c].startUpdate();
            }
        }
    };

    this.unload = function(){
        _oParentContainer.removeChild(_oContainer);
    };

    this._init(iRows,iCols,iX,iY);
}