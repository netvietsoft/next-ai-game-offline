function CFinalGrid(iRows,iCols,iX,iY,aFinalGridPreview,oParentContainer){

    var _oParentContainer = oParentContainer;
    var _oContainer;


    this._init = function(iRows,iCols,iX,iY,aFinalGridPreview){
       
        _oContainer = new createjs.Container();
        _oContainer.x = iX;
        _oContainer.y = iY;
        _oParentContainer.addChild(_oContainer);
        
        
        var oSprite = s_oSpriteLibrary.getSprite("cell");
        var iWidthCell = oSprite.width/5;
        var iHeightCell = oSprite.height;
        var iXPos = 0;
        var iYPos = 0;
        for(var i=0;i<iRows;i++){
            for(var j=0;j<iCols;j++){
                var oCell = new CCell(_oContainer,iXPos,iYPos,i,j);
                oCell.setState(aFinalGridPreview[i][j]);
                iXPos += iWidthCell;
            }
            
            iXPos = 0 ;
            iYPos += iHeightCell;
        }
        
        _oContainer.scale = 0.4;
        _oContainer.regX = (iWidthCell*iCols)/2;
        _oContainer.regY = (iHeightCell*iRows)/2;
    };

   this.unload = function(){
       _oParentContainer.removeChild(_oContainer);
   };

    this._init(iRows,iCols,iX,iY,aFinalGridPreview);
}