//v1.0.1
var game_options = {
	sound: true
}
function play_sound(id, scope){
	if(game_options.sound){
		scope.sound.play(id);
	}
}
function switch_audio(obj){
	if(game_options[obj.name]){
		game_options[obj.name] = false;
		obj.setTexture('btn_sound_off');
	} else {
		game_options[obj.name] = true;
		obj.setTexture('btn_sound_on');
	}
}
function check_audio(obj){
	if(game_options[obj.name]){
		obj.setTexture('btn_sound_on');
	} else {
		obj.setTexture('btn_sound_off');
	}
}
function draw_button(x, y, id, scope){
	var o = scope.add.sprite(x, y, 'btn_'+id).setInteractive();
	o.button = true;
	if(id == 'sound_on' || id == 'sound_off'){
		id = 'sound';
	}
	o.name = id;
	return o;
}
function get_data(key){
	let local_data = localStorage.getItem(key);
	if(local_data){ // Data is exist
		return local_data;
	} else {
		return null; //Not exist
	}
}
function save_data(key, value){
	localStorage.setItem(key, value);
}
function remove_data(key){
	localStorage.removeItem(key);
}