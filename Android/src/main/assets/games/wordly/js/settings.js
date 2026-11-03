var CANVAS_WIDTH = 1920;
var CANVAS_HEIGHT = 1920;

var EDGEBOARD_X = 0;
var EDGEBOARD_Y = 0;

var GAME_NAME = "get_the_word";

var FONT_LATIN = "Comfortaa";
var FONT_CYRILLIC = "russo_oneregular";
var FONT_OUTLINE = 3;

var TEXT_COLOR_0 = "#fff";

var SOUNDTRACK_VOLUME_IN_GAME = 0.5;

var FPS      = 60;
var DISABLE_SOUND_MOBILE = false;

var STATE_LOADING = 0;
var STATE_MENU    = 1;
var STATE_LEVEL    = 2;
var STATE_GAME    = 3;
var STATE_MODE_MENU    = 4;



var ON_MOUSE_DOWN  = 0;
var ON_MOUSE_UP    = 1;
var ON_MOUSE_OVER  = 2;
var ON_MOUSE_OUT   = 3;
var ON_BUT_YES_DOWN  = 4;
var ON_BACK_MENU = 5;
var ON_RESTART = 6;
var ON_NEXT = 7;
var ON_HELP_EXIT = 8;
var ON_SELECT_LANG  = 9;
var ON_KEY_DOWN = 10;
var ON_KEY_UP = 11;
var ON_BUT_NO_DOWN = 12;
var ON_END_SET_STATE_TWEEN = 13;


var NUM_LANGUAGES = 7;
var LANG_EN = 0;
var LANG_ES = 1;
var LANG_FR = 2;
var LANG_DE = 3;
var LANG_PT = 4;
var LANG_IT = 5;
var LANG_RU = 6;

var CELL_STATE_EMPTY = 0;
var CELL_STATE_FILLED = 1;
var CELL_STATE_WRONG = 2;
var CELL_STATE_WRONG_POSITION = 3;
var CELL_STATE_CORRECT = 4;

var KEYCAP_STATE_DEFAULT = 0;
var KEYCAP_STATE_WRONG = 1;
var KEYCAP_STATE_WRONG_POSITION = 2;
var KEYCAP_STATE_CORRECT = 3;

var BACKSPACE = 8;
var ENTER = 13;
var A = 65;
var Z = 90;

var MODE_EASY = 0;
var MODE_MEDIUM = 1;
var MODE_HARD = 2;

var WORD_LENGTH;
var NUM_TRIES;

var LANG_CODES = {};
LANG_CODES["en"] = LANG_EN;
LANG_CODES["es"] = LANG_ES;
LANG_CODES["fr"] = LANG_FR;
LANG_CODES["de"] = LANG_DE;
LANG_CODES["pt"] = LANG_PT;
LANG_CODES["it"] = LANG_IT;
LANG_CODES["ru"] = LANG_RU;