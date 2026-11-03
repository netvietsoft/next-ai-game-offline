const MAX_WIDTH = 230;

function CStatsBar(iX,iY,szColor,iAmount,iPerc,oParentContainer){
    var _iIntervalID;
    var _iFinalWidth;
    var _iCurWidth;
    var _iCurAmount;
    var _iAmount = iAmount;
    var _pStartPos;
    
    var _oTextAmount;
    var _oGraph;
    var _oParentContainer = oParentContainer;
    
    this._init = function(iX,iY,szColor,iPerc){
        _pStartPos = {x:iX,y:iY-25};
        _iFinalWidth = Math.round(MAX_WIDTH*iPerc);


        _iCurWidth = 0;
        _iCurAmount = 0;
        
        _oGraph = new createjs.Shape();
        _oGraph.graphics.beginFill(szColor).drawRoundRectComplex( _pStartPos.x,_pStartPos.y, 0,50,0,4,4,0 );
        _oParentContainer.addChild(_oGraph);
        
        _oTextAmount =  new CTLText(_oParentContainer, 
            _pStartPos.x,_pStartPos.y, 70, 50, 
            44, "left", "#fff", s_szCurFont, 1.1,
            0, 0,
            " ",
            true, true, false,
            false 
        );
                    
        _iIntervalID = setInterval(this.update,20/* FPS_TIME */);
    };
    
    this.unload = function(){
        _oParentContainer.removeChild(_oGraph);
        _oTextAmount.unload();
    };
    
    this.update = function(){
        _iCurWidth += 4;
        var iPerc = _iCurWidth/_iFinalWidth;
        _iCurAmount = Math.round(_iAmount*iPerc);
        
        _oGraph.graphics.clear();
        
        if(_iCurWidth >= _iFinalWidth){
            _iCurWidth = _iFinalWidth;
            _iCurAmount = _iAmount;
            clearInterval(_iIntervalID);
            if(_iFinalWidth<=0){
                _oTextAmount.refreshText(_iCurAmount);
                return;
            }
        }
        
        _oGraph.graphics.beginFill(szColor).drawRoundRectComplex( _pStartPos.x,_pStartPos.y, _iCurWidth,50,0,8,8,0 );
        _oTextAmount.refreshText(_iCurAmount);
        _oTextAmount.setX(_pStartPos.x + _iCurWidth+10);
    };
    
    this._init(iX,iY,szColor,iPerc); 
}