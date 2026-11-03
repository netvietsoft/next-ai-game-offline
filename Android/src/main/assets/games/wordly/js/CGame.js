function CGame(iMode){
    var _bUpdate;
    var _bEnabledKeyBoard;

    var _aKeyPressed;

    var _iMode;
    var _iScore;   
    var _iCurTry;
    
    var _szCurWord;
    var _szWordToGuess;

    var _oInterface;
    var _oAlert;
    var _oHelpPanel;
    var _oAreYouSurePanel;
    var _oGameOverPanel;
    var _oFade;
    var _oListenerFade;
    var _aFinalGridPreview;
    
    this._init = function(iMode){
        _iMode = iMode;
        _iCurTry = 0;
        _iScore = 0;
        _bEnabledKeyBoard = true;
        
        _aFinalGridPreview = new Array();
        for(var k=0;k<NUM_TRIES[_iMode];k++){
            _aFinalGridPreview[k] = new Array();
            for(var i=0;i<WORD_LENGTH[_iMode];i++){
                _aFinalGridPreview[k][i] = CELL_STATE_EMPTY;
            }
        }
        
        _aKeyPressed = new Array();

        
        _szWordToGuess = s_oWordList.getRandCommonWord(s_iCurLang,WORD_LENGTH[iMode]).toUpperCase();
        _szCurWord = "";

        setVolume("soundtrack",SOUNDTRACK_VOLUME_IN_GAME);
        
        var oBg = createBitmap(s_oSpriteLibrary.getSprite('bg_game'));
        s_oStage.addChild(oBg); 

        _oInterface = new CInterface(NUM_TRIES[_iMode],WORD_LENGTH[_iMode]);
        
        _oAlert = new CAlert(s_oStage,CANVAS_WIDTH/2,CANVAS_HEIGHT/2);

        _oHelpPanel = new CHelpPanel(s_oStage,WORD_LENGTH[_iMode]);
        _oHelpPanel.addEventListener(ON_HELP_EXIT,this.startUpdate,this);
        
        _oAreYouSurePanel = new CAreYouSurePanel(s_oStage);
        _oAreYouSurePanel.addEventListener(ON_BUT_YES_DOWN,this.onConfirmExit,this);
        _oAreYouSurePanel.addEventListener(ON_BUT_NO_DOWN,this.onDenyExit,this);
        
        _oGameOverPanel = new CEndPanel();
        _oGameOverPanel.addEventListener(ON_BACK_MENU,this.exitFromGame,this);
        _oGameOverPanel.addEventListener(ON_RESTART,this.restart,this);
        
        //_oGameOverPanel.show(_iMode);
        this.refreshButtonPos();

        _oFade = new createjs.Shape();
        _oFade.graphics.beginFill("black").drawRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
        _oListenerFade = _oFade.on("click",function(){});
        s_oStage.addChild(_oFade);
        
        createjs.Tween.get(_oFade)
        .to({alpha:0}, 300)
        .call(function(){
            s_oGame.startUpdate();

            _oFade.visible = false;
            
            if(isFirstGame()){
                s_oGame.showHelp();
            }

            setLocalStorageFirstGame(false);
        }); 


        document.dispatchEvent(new CustomEvent("start_level", {detail: { mode: _iMode } }));
    };

    this.restart = function(){
        if (!isPlayingSound("soundtrack")) {
            playSound("soundtrack", SOUNDTRACK_VOLUME_IN_GAME,true);
        }
        
        _szWordToGuess = s_oWordList.getRandCommonWord(s_iCurLang,WORD_LENGTH[iMode]).toUpperCase();
        _szCurWord = "";
        _iCurTry = 0;
        _iScore = 0;
        _oInterface.restart();
        _bEnabledKeyBoard = true;
        
        _aFinalGridPreview = new Array();
        for(var k=0;k<NUM_TRIES[_iMode];k++){
            _aFinalGridPreview[k] = new Array();
        }
        
        _oFade.alpha = 1;
        _oFade.visible = true;
        createjs.Tween.get(_oFade)
        .to({alpha:0}, 300)
        .call(function(){
            s_oGame.startUpdate();
            _oFade.visible = false;
        }); 

        document.dispatchEvent(new CustomEvent("restart_level", {detail: { mode: _iMode } }));
    };
    
    this.unload = function(){
        _oInterface.unload();
        _oGameOverPanel.unload();
        _oHelpPanel.unload();
        _oAlert.unload();
        _oFade.off("click",_oListenerFade);
        
        
        s_oGame = null;
        createjs.Tween.removeAllTweens();
        s_oStage.removeAllChildren(); 
    };

    this.onKeyDown = function(evt){
        if(!_bEnabledKeyBoard){
            return;
        }

        if(KEYBOARD_ALPHABET.includes(String.fromCharCode(evt.keyCode))){
            _aKeyPressed[evt.keyCode] = true;
            _oInterface.pressKeyCap(evt.keyCode);

            if(_szCurWord.length >= _szWordToGuess.length){
                return;
            }
            
            _szCurWord += String.fromCharCode(evt.keyCode);
            _oInterface.insertCharGrid(String.fromCharCode(evt.keyCode));

            if (evt.preventDefault) {
                evt.preventDefault();
            }
        }else if(evt.keyCode == BACKSPACE){
            _aKeyPressed[evt.keyCode] = true;
            _oInterface.pressKeyCap(evt.keyCode);

            if(_szCurWord.length > 0){
                _szCurWord = _szCurWord.slice(0,-1);
                _oInterface.deleteCharGrid();
            }

            if (evt.preventDefault) {
                evt.preventDefault();
            }

        }else if(evt.keyCode == ENTER){
            _oInterface.pressKeyCap(evt.keyCode);

            if (!_aKeyPressed[evt.keyCode]) {
                _aKeyPressed[evt.keyCode] = true;
                s_oGame.onEnter();
            }

            if (evt.preventDefault) {
                evt.preventDefault();
            }
        }
    };

    this.onKeyUp = function(evt) { 
        if( KEYBOARD_ALPHABET.includes(String.fromCharCode(evt.keyCode)) || 
            evt.keyCode == BACKSPACE ||
            evt.keyCode == ENTER
        ){
            _oInterface.releaseKeyCap(evt.keyCode);
            _aKeyPressed[evt.keyCode] = false;
        }
    };

    this.onEnter = function(){
        if(_szCurWord.length < _szWordToGuess.length){
            this.showAlert(TEXT_SHORT_WORD);
        }else{
            if(!s_oWordList.isWordIncluded(s_iCurLang,_szCurWord.toLowerCase())){
                this.showAlert(TEXT_WORD_NOT_FOUND);
                return;
            }

            _bEnabledKeyBoard = false;

            var aCellStates = this.matchWord();
            _aFinalGridPreview[_iCurTry] = aCellStates;
            
            var aKeyCapsStateCorrect = new Array();
            for(var i=0; i<aCellStates.length; i++){
                if(aCellStates[i] == CELL_STATE_CORRECT){
                    aKeyCapsStateCorrect.push(_szCurWord[i]);
                }
            };
            _oInterface.setKeyCapsStateCorrect(aKeyCapsStateCorrect);

            var aKeyCapsStateWrongPosition = new Array();
            for(var i=0; i<aCellStates.length; i++){
                if(aCellStates[i] == CELL_STATE_WRONG_POSITION){
                    aKeyCapsStateWrongPosition.push(_szCurWord[i]);
                }
            };
            _oInterface.setKeyCapsStateWrongPosition(aKeyCapsStateWrongPosition);

            var aKeyCapsStateWrong = new Array();
            for(var i=0; i<aCellStates.length; i++){
                if(aCellStates[i] == CELL_STATE_WRONG){
                    aKeyCapsStateWrong.push(_szCurWord[i]);
                }
            };
            _oInterface.setKeyCapsStateWrong(aKeyCapsStateWrong);
            
            _oInterface.setGridCellsStates(aCellStates);

        }
    };

    this.checkWin = function(){
        for(var i=0; i<_szWordToGuess.length; i++){
            if(_szCurWord[i] != _szWordToGuess[i]){
                return false;
            }
        }

        return true;
    };

    this.matchWord = function(){        
        var aResult = new Array();
        for(var i=0; i<_szWordToGuess.length; i++){
            aResult.push(CELL_STATE_WRONG);
        }

        var aWordToGuessChars = new Array();
        KEYBOARD_ALPHABET.forEach(element => {
            aWordToGuessChars[element.charCodeAt(0)] = 0;
        });

        for(var i=0; i<_szWordToGuess.length; i++){
            aWordToGuessChars[_szWordToGuess.charCodeAt(i)]++;
        }

        // CHECK CORRECT CHARS
        for(var i=0; i<_szWordToGuess.length; i++){
            if(_szCurWord[i] == _szWordToGuess[i]){

                aResult[i] = CELL_STATE_CORRECT;
                aWordToGuessChars[_szCurWord.charCodeAt(i)]--;

            }
        }

        // CHECK WRONG POSITION CHARS
        for(var i=0; i<_szWordToGuess.length; i++){
            if(aWordToGuessChars[_szCurWord.charCodeAt(i)] > 0 && (_szCurWord[i] != _szWordToGuess[i])){
                aResult[i] = CELL_STATE_WRONG_POSITION;
                aWordToGuessChars[_szCurWord.charCodeAt(i)]--;
            }
        }

        return aResult;
    };

    this.onEndCellsSetStateTween = function(){
        if(this.checkWin()){
            this.gameOver(true);
        }else if(_iCurTry < NUM_TRIES[_iMode]-1){
            _oInterface.nextGridRow();
            _szCurWord = "";
            _iCurTry++;
            _bEnabledKeyBoard = true;
        }else{
            this.gameOver(false);
        }
    };

    this.showAlert = function(szText){
        _oAlert.show(szText);
    };
    
    this.refreshButtonPos = function(){        
        _oInterface.refreshButtonPos();
        _oHelpPanel.refreshPos();
    };
    
    this.onExit = function(){
        this.stopUpdate();
        _oAreYouSurePanel.show(TEXT_ARE_YOU_SURE,90);
    };

    this.showHelp = function(){
        s_oGame.stopUpdate();
        _oHelpPanel.show();
    };
    
    this.stopUpdate = function(){
        _bUpdate = false;

        _oInterface.stopUpdate();
    };  

    this.startUpdate = function(){
        _bUpdate = true;

        _oInterface.startUpdate();
    };  


    this.onConfirmExit = function(){
        _oFade.alpha = 0.5;
        _oFade.visible = true;
        createjs.Tween.get(_oFade)
        .to({alpha:1}, 300)
        .call(function(){
            s_oGame.exitFromGame();
        }); 
    };

    this.onDenyExit = function(){
        s_oGame.startUpdate();
    };

    this.exitFromGame = function(){
        s_oGame.unload();
        
        document.dispatchEvent(new CustomEvent("show_interlevel_ad"));
        document.dispatchEvent(new CustomEvent("end_session"));

        
        s_oMain.gotoMenu();
    };

    this.gameOver = function(bWin){  
        this.stopUpdate();
        
        document.dispatchEvent(new CustomEvent("end_level", {detail: { mode: _iMode } }));

        var iBestStreak = getLocalStorageBestStreak(_iMode);
        var iCurStreak = getLocalStorageCurStreak(_iMode);

        var iPlayedGames = getLocalStoragePlayedGames(_iMode);
        iPlayedGames++;
        setLocalStoragePlayedGames(_iMode,iPlayedGames);

        if(bWin){
            var iWonGames = getLocalStorageWonGames(_iMode);
            iWonGames++;
            setLocalStorageWonGames(_iMode,iWonGames);

            iCurStreak++;
        }else{
            var iLostGames = getLocalStorageLostGames(_iMode);
            iLostGames++;
            setLocalStorageLostGames(_iMode,iLostGames);

            iCurStreak = 0;
        }

        setLocalStorageCurStreak(_iMode,iCurStreak);

        if(iBestStreak < iCurStreak){
            setLocalStorageBestStreak(_iMode,iCurStreak);
        }
        document.dispatchEvent(new CustomEvent("save_score", {detail: {score:getLocalStorageBestStreak(_iMode),mode:_iMode}}));

        if(bWin){
            _oGameOverPanel.show(_iMode,_aFinalGridPreview);
        }else{
            _oGameOverPanel.show(_iMode,null,_szWordToGuess);
        }
    };
    
    this.update = function(){
        if(!_bUpdate){
            return;
        }
    };

    s_oGame = this;
    
    this._init(iMode);
}

var s_oGame = null;
