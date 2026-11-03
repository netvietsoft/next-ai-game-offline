function clearLocalStorage(){
    s_iTotalScore = 0;
    if(s_bStorageAvailable){
        var iCont = 0;
        while(iCont < localStorage.length){
            var szKey = localStorage.key(iCont);
            if(szKey.indexOf(GAME_NAME) !== -1){
                localStorage.removeItem(szKey);
            }else{
                iCont++;
            }
        }
    }
};

// clearLocalStorage();
//FIRST GAME-----------------------------------
function setLocalStorageFirstGame(bFirstGame){
    if(!s_bStorageAvailable){
        return;
    }
    saveItem(GAME_NAME+"_first_game", bFirstGame);
};

function isFirstGame(){
    if(!s_bStorageAvailable){
        return;
    }
    var bFirstGame = getItem(GAME_NAME+"_first_game");
    if(bFirstGame === null){
        return true;
    }else{
        return false;
    }
};

//PLAYED GAMES---------------------------------
function setLocalStoragePlayedGames(iMode,iNum){
    if(!s_bStorageAvailable){
        return;
    }
    saveItem(GAME_NAME+"_played_games_"+iMode, iNum);
};

function getLocalStoragePlayedGames(iMode){
    if(!s_bStorageAvailable){
        return;
    }
    var iPlayedGames = getItem(GAME_NAME+"_played_games_"+iMode);
    if(iPlayedGames === null){
        return 0;
    }else{
        return iPlayedGames;
    }
};

//LOST GAMES---------------------------------
function setLocalStorageLostGames(iMode,iNum){
    if(!s_bStorageAvailable){
        return;
    }
    saveItem(GAME_NAME+"_lost_games_"+iMode, iNum);
};

function getLocalStorageLostGames(iMode){
    if(!s_bStorageAvailable){
        return;
    }
    var iLostGames = getItem(GAME_NAME+"_lost_games_"+iMode);
    if(iLostGames === null){
        return 0;
    }else{
        return iLostGames;
    }
};

//WON GAMES---------------------------------
function setLocalStorageWonGames(iMode,iNum){
    if(!s_bStorageAvailable){
        return;
    }
    saveItem(GAME_NAME+"_won_games_"+iMode, iNum);
};

function getLocalStorageWonGames(iMode){
    if(!s_bStorageAvailable){
        return;
    }
    var iWonGames = getItem(GAME_NAME+"_won_games_"+iMode);
    if(iWonGames === null){
        return 0;
    }else{
        return iWonGames;
    }
};

//CUR STREAK---------------------------------
function setLocalStorageCurStreak(iMode,iNum){
    if(!s_bStorageAvailable){
        return;
    }
    saveItem(GAME_NAME+"_cur_streak_"+iMode, iNum);
};

function getLocalStorageCurStreak(iMode){
    if(!s_bStorageAvailable){
        return;
    }
    var iCurStreak = getItem(GAME_NAME+"_cur_streak_"+iMode);
    if(iCurStreak === null){
        return 0;
    }else{
        return iCurStreak;
    }
};

//BEST STREAK---------------------------------
function setLocalStorageBestStreak(iMode,iNum){
    if(!s_bStorageAvailable){
        return;
    }
    saveItem(GAME_NAME+"_best_streak_"+iMode, iNum);
};

function getLocalStorageBestStreak(iMode){
    if(!s_bStorageAvailable){
        return;
    }
    var iBestStreak = getItem(GAME_NAME+"_best_streak_"+iMode);
    if(iBestStreak === null){
        return 0;
    }else{
        return iBestStreak;
    }
};
