var bestscore = 0;
var storageKey = 'rf.knife-shot';
var firstLoad = true;
var bgTexture = 'bg_sky';
loadData();
function loadData() {
    let localData = getData(storageKey);
    if (localData) { //Load existing game data
        bestscore = localData;
    }
}