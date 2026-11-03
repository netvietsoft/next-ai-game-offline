
// max: 0 will use default max type
var rf_stage = [
	{col: 2, row: 2, max: 0}, // Stage 1
	{col: 3, row: 2, max: 0}, // Stage 2
	{col: 3, row: 4, max: 0}, // Stage 3
	{col: 4, row: 4, max: 0}, // Stage 4
	{col: 5, row: 4, max: 0}, // Stage 5
	{col: 6, row: 5, max: 0}, // Stage 6
	{col: 6, row: 6, max: 0},
	{col: 7, row: 6, max: 0},
	{col: 6, row: 7, max: 0}
	// Next level/stage is using default_stage
];
var default_stage = {col: 7, row: 8, max: 0};

// Stages odd checking
for(let i=0; i<rf_stage.length; i++){
	if((rf_stage[i].row * rf_stage[i].col) % 2 == 1){
		alert('Error! stage '+(i+1)+' is odd!');
		break;
	}
}
if((default_stage.row * default_stage.col) % 2 == 1){
	alert('Error! default_stage is odd!');
}