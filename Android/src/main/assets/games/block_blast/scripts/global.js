var bestscore = 0;
var storageKey = 'rf.jewelblock';
//localStorage.removeItem(storageKey);
loadData();
function loadData(){
	let localData = getData(storageKey);
	if(localData){ //Load existing game data
		bestscore = localData;
	}
}