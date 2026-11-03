////////////////////////////////////////////////////////////
// GAME v1.2
////////////////////////////////////////////////////////////

/*!
 * 
 * GAME SETTING CUSTOMIZATION START
 * 
 */

//card design
var cardDesign = [
	{
		width:120,
		height:170,
		margin:15,
		cover:'assets/card_cover.png',
		type1:'assets/card_type1.png',
		type2:'assets/card_type2.png',
		type3:'assets/card_type3.png',
		type4:'assets/card_type4.png',
		hit:'assets/card_hit.png',
		focus:'assets/card_focus.png',
		stroke:'assets/card_stroke.png',
		positions:[
			{x:0, y:-75},
			{x:-24, y:75},
			{x:24, y:75}
		],
		icon:{
			x:0,
			y:-8
		},
		name:{
			fontSize:18,
			fontX:0,
			fontY:50
		},
		health:{
			icon:'assets/card_badge_health.png',
			fontSize:15,
			fontX:0,
			fontY:5
		},
		coin:{
			icon:'assets/card_badge_coin.png',
			fontSize:15,
			fontX:0,
			fontY:5
		},
		damage:{
			icon:'assets/card_badge_damage.png',
			fontSize:15,
			fontX:0,
			fontY:5
		},
		shield:{
			icon:'assets/card_badge_shield.png',
			fontSize:15,
			fontX:0,
			fontY:5
		}
	}
];


//characters
var cardCharacter = [
	{
		body:'assets/card_cha_body_1.png',
		leg:'assets/card_cha_leg_1.png',
		icon:'assets/item_player_icon1.png'
	},
	{
		body:'assets/card_cha_body_2.png',
		leg:'assets/card_cha_leg_2.png',
		icon:'assets/item_player_icon2.png'
	}
];

//card types
var cardTypes = [
	{
		icon: 'assets/card_icon_grass1.png',
		iconSecond: '',
		iconWeapon: '',
		iconShield: '',
		iconPlayer: '',
		coin: 0,
		damage: 0,
		shield: 0,
		health: 0,
		type: 'none',
		name: ''
	},
	{
		icon: 'assets/card_icon_grass2.png',
		iconSecond: '',
		iconWeapon: '',
		iconShield: '',
		iconPlayer: '',
		coin: 0,
		damage: 0,
		shield: 0,
		health: 0,
		type: 'none',
		name: ''
	},
	{
		icon: 'assets/card_icon_health.png',
		iconSecond: '',
		iconWeapon: '',
		iconShield: '',
		iconPlayer: '',
		coin: 0,
		damage: 0,
		shield: 0,
		health: 1,
		type: 'health',
		name: 'HEALTH'
	},
	{
		icon: 'assets/card_icon_health.png',
		iconSecond: '',
		iconWeapon: '',
		iconShield: '',
		iconPlayer: '',
		coin: 0,
		damage: 0,
		shield: 0,
		health: 2,
		type: 'health',
		name: 'HEALTH'
	},
	{
		icon: 'assets/card_icon_health.png',
		iconSecond: '',
		iconWeapon: '',
		iconShield: '',
		iconPlayer: '',
		coin: 0,
		damage: 0,
		shield: 0,
		health: 3,
		type: 'health',
		name: 'HEALTH'
	},
	{
		icon: 'assets/card_icon_coin1.png',
		iconSecond: '',
		iconWeapon: '',
		iconShield: '',
		iconPlayer: '',
		coin: 1,
		damage: 0,
		shield: 0,
		health: 0,
		type: 'coin',
		name: ''
	},
	{
		icon: 'assets/card_icon_coin2.png',
		iconSecond: '',
		iconWeapon: '',
		iconShield: '',
		iconPlayer: '',
		coin: 2,
		damage: 0,
		shield: 0,
		health: 0,
		type: 'coin',
		name: ''
	},
	{
		icon: 'assets/card_icon_coin3.png',
		iconSecond: '',
		iconWeapon: '',
		iconShield: '',
		iconPlayer: '',
		coin: 3,
		damage: 0,
		shield: 0,
		health: 0,
		type: 'coin',
		name: ''
	},
	{
		icon: 'assets/card_icon_coin4.png',
		iconSecond: '',
		iconWeapon: '',
		iconShield: '',
		iconPlayer: '',
		coin: 4,
		damage: 0,
		shield: 0,
		health: 0,
		type: 'coin',
		name: ''
	},
	{
		icon: 'assets/card_icon_coin5.png',
		iconSecond: '',
		iconWeapon: '',
		iconShield: '',
		iconPlayer: '',
		coin: 8,
		damage: 0,
		shield: 0,
		health: 0,
		type: 'coin',
		name: ''
	},
	{
		icon: 'assets/card_icon_coin6.png',
		iconSecond: '',
		iconWeapon: '',
		iconShield: '',
		iconPlayer: '',
		coin: 10,
		damage: 0,
		shield: 0,
		health: 0,
		type: 'coin',
		name: ''
	},
	{
		icon: 'assets/card_icon_trap.png',
		iconSecond: '',
		iconWeapon: '',
		iconShield: '',
		iconPlayer: '',
		coin: 0,
		damage: 2,
		shield: 0,
		health: 0,
		type: 'trap',
		name: 'TRAP'
	},
	{
		icon: 'assets/card_icon_spikes.png',
		iconSecond: '',
		iconWeapon: '',
		iconShield: '',
		iconPlayer: '',
		spritesheet: {
			width: 97,
			height: 48,
			count: 2
		},
		coin: 0,
		damage: 1,
		shield: 0,
		health: 0,
		type: 'trap',
		name: ''
	},
	{
		icon: 'assets/card_icon_barrel.png',
		iconSecond: '',
		spritesheet: {
			width: 51,
			height: 65,
			count: 2
		},
		iconWeapon: '',
		iconShield: '',
		iconPlayer: '',
		coin: 0,
		damage: 0,
		shield: 0,
		health: 0,
		type: 'barrel',
		name: 'BARREL'
	},
	{
		icon: 'assets/card_icon_castle.png',
		iconSecond: '',
		spritesheet: {
			width: 84,
			height: 88,
			count: 2
		},
		iconWeapon: '',
		iconShield: '',
		iconPlayer: '',
		coin: 0,
		damage: 0,
		shield: 0,
		health: 0,
		type: 'castle',
		name: 'CASTLE'
	},
	{
		icon: 'assets/card_icon_chest.png',
		iconSecond: '',
		spritesheet: {
			width: 77,
			height: 76,
			count: 2
		},
		iconWeapon: '',
		iconShield: '',
		iconPlayer: '',
		coin: 0,
		damage: 0,
		shield: 0,
		health: 0,
		type: 'chest',
		name: 'CHEST'
	},
	{
		icon: 'assets/card_icon_key1.png',
		iconSecond: '',
		iconWeapon: '',
		iconShield: '',
		iconPlayer: 'assets/card_icon_key_player1.png',
		coin: 0,
		damage: 0,
		shield: 0,
		health: 0,
		type: 'key',
		name: 'KEY'
	},
	{
		icon: 'assets/card_icon_sword.png',
		iconSecond: '',
		iconWeapon: '',
		iconShield: '',
		iconPlayer: 'assets/card_icon_sword_player.png',
		coin: 0,
		damage: 3,
		shield: 0,
		health: 0,
		type: 'weapon',
		name: 'SWORD'
	},
	{
		icon: 'assets/card_icon_sword.png',
		iconSecond: '',
		iconWeapon: '',
		iconShield: '',
		iconPlayer: 'assets/card_icon_sword_player.png',
		coin: 0,
		damage: 2,
		shield: 0,
		health: 0,
		type: 'weapon',
		name: 'SWORD'
	},
	{
		icon: 'assets/card_icon_spear.png',
		iconSecond: '',
		iconWeapon: '',
		iconShield: '',
		iconPlayer: 'assets/card_icon_spear_player.png',
		coin: 0,
		damage: 2,
		shield: 0,
		health: 0,
		type: 'weapon',
		name: 'SPEAR'
	},
	{
		icon: 'assets/card_icon_spear.png',
		iconSecond: '',
		iconWeapon: '',
		iconShield: '',
		iconPlayer: 'assets/card_icon_spear_player.png',
		coin: 0,
		damage: 3,
		shield: 0,
		health: 0,
		type: 'weapon',
		name: 'SPEAR'
	},
	{
		icon: 'assets/card_icon_axe.png',
		iconSecond: '',
		iconWeapon: '',
		iconShield: '',
		iconPlayer: 'assets/card_icon_axe_player.png',
		coin: 0,
		damage: 2,
		shield: 0,
		health: 0,
		type: 'weapon',
		name: 'AXE'
	},
	{
		icon: 'assets/card_icon_axe.png',
		iconSecond: '',
		iconWeapon: '',
		iconShield: '',
		iconPlayer: 'assets/card_icon_axe_player.png',
		coin: 0,
		damage: 3,
		shield: 0,
		health: 0,
		type: 'weapon',
		name: 'AXE'
	},
	{
		icon: 'assets/card_icon_shield1.png',
		iconSecond: '',
		iconWeapon: '',
		iconShield: '',
		iconPlayer: 'assets/card_icon_shield_player1.png',
		coin: 0,
		damage: 0,
		shield: 2,
		health: 0,
		type: 'shield',
		name: 'SHIELD'
	},
	{
		icon: 'assets/card_icon_shield1.png',
		iconSecond: '',
		iconWeapon: '',
		iconShield: '',
		iconPlayer: 'assets/card_icon_shield_player1.png',
		coin: 0,
		damage: 0,
		shield: 3,
		health: 0,
		type: 'shield',
		name: 'SHIELD'
	},
	{
		icon: 'assets/card_icon_shield2.png',
		iconSecond: '',
		iconWeapon: '',
		iconShield: '',
		iconPlayer: 'assets/card_icon_shield_player2.png',
		coin: 0,
		damage: 0,
		shield: 3,
		health: 0,
		type: 'shield',
		name: 'SHIELD'
	},
	{
		icon: 'assets/card_icon_shield2.png',
		iconSecond: '',
		iconWeapon: '',
		iconShield: '',
		iconPlayer: 'assets/card_icon_shield_player2.png',
		coin: 0,
		damage: 0,
		shield: 2,
		health: 0,
		type: 'shield',
		name: 'SHIELD'
	},
	{
		icon: 'assets/card_icon_animal_body_1.png',
		iconSecond: 'assets/card_icon_animal_leg_1.png',
		iconWeapon: '',
		iconShield: '',
		iconPlayer: '',
		coin: 0,
		damage: 0,
		shield: 0,
		health: 1,
		type: 'enemy',
		name: 'WOLF'
	},
	{
		icon: 'assets/card_icon_animal_body_1.png',
		iconSecond: 'assets/card_icon_animal_leg_1.png',
		iconWeapon: '',
		iconShield: '',
		iconPlayer: '',
		coin: 0,
		damage: 0,
		shield: 0,
		health: 2,
		type: 'enemy',
		name: 'WOLF'
	},
	{
		icon: 'assets/card_icon_animal_body_2.png',
		iconSecond: 'assets/card_icon_animal_leg_2.png',
		iconWeapon: '',
		iconShield: '',
		iconPlayer: '',
		coin: 0,
		damage: 0,
		shield: 0,
		health: 1,
		type: 'enemy',
		name: 'BOAR'
	},
	{
		icon: 'assets/card_icon_animal_body_2.png',
		iconSecond: 'assets/card_icon_animal_leg_2.png',
		iconWeapon: '',
		iconShield: '',
		iconPlayer: '',
		coin: 0,
		damage: 0,
		shield: 0,
		health: 2,
		type: 'enemy',
		name: 'BOAR'
	},
	{
		icon: 'assets/card_icon_enemy_body_1.png',
		iconSecond: 'assets/card_icon_enemy_leg.png',
		iconWeapon: '',
		iconShield: '',
		iconPlayer: '',
		coin: 0,
		damage: 0,
		shield: 0,
		health: 1,
		type: 'enemy',
		name: 'KNIGHT1'
	},
	{
		icon: 'assets/card_icon_enemy_body_1.png',
		iconSecond: 'assets/card_icon_enemy_leg.png',
		iconWeapon: '',
		iconShield: '',
		iconPlayer: '',
		coin: 0,
		damage: 0,
		shield: 0,
		health: 2,
		type: 'enemy',
		name: 'KNIGHT1'
	},
	{
		icon: 'assets/card_icon_enemy_body_1.png',
		iconSecond: 'assets/card_icon_enemy_leg.png',
		iconWeapon: 'assets/card_icon_sword_player.png',
		iconShield: '',
		iconPlayer: '',
		coin: 0,
		damage: 2,
		shield: 0,
		health: 2,
		type: 'enemy',
		name: 'KNIGHT2'
	},
	{
		icon: 'assets/card_icon_enemy_body_1.png',
		iconSecond: 'assets/card_icon_enemy_leg.png',
		iconWeapon: 'assets/card_icon_sword_player.png',
		iconShield: '',
		iconPlayer: '',
		coin: 0,
		damage: 2,
		shield: 0,
		health: 3,
		type: 'enemy',
		name: 'KNIGHT2'
	},
	{
		icon: 'assets/card_icon_enemy_body_1.png',
		iconSecond: 'assets/card_icon_enemy_leg.png',
		iconWeapon: 'assets/card_icon_sword_player.png',
		iconShield: 'assets/card_icon_shield_player1.png',
		iconPlayer: '',
		coin: 0,
		damage: 2,
		shield: 1,
		health: 3,
		type: 'enemy',
		name: 'KNIGHT2'
	},
	{
		icon: 'assets/card_icon_enemy_body_1.png',
		iconSecond: 'assets/card_icon_enemy_leg.png',
		iconWeapon: 'assets/card_icon_sword_player.png',
		iconShield: 'assets/card_icon_shield_player1.png',
		iconPlayer: '',
		coin: 0,
		damage: 3,
		shield: 2,
		health: 3,
		type: 'enemy',
		name: 'KNIGHT2'
	},
	{
		icon: 'assets/card_icon_enemy_body_4.png',
		iconSecond: 'assets/card_icon_enemy_leg.png',
		iconWeapon: 'assets/card_icon_sword_player.png',
		iconShield: 'assets/card_icon_shield_player1.png',
		iconPlayer: '',
		coin: 0,
		damage: 2,
		shield: 2,
		health: 5,
		type: 'enemy',
		name: 'KNIGHT3'
	},
	{
		icon: 'assets/card_icon_enemy_body_4.png',
		iconSecond: 'assets/card_icon_enemy_leg.png',
		iconWeapon: 'assets/card_icon_sword_player.png',
		iconShield: 'assets/card_icon_shield_player1.png',
		iconPlayer: '',
		coin: 0,
		damage: 3,
		shield: 2,
		health: 5,
		type: 'enemy',
		name: 'KNIGHT3'
	},
	{
		icon: 'assets/card_icon_cannon.png',
		iconSecond: '',
		iconWeapon: '',
		iconShield: '',
		iconPlayer: 'assets/card_icon_cannon_player.png',
		coin: 0,
		damage: 3,
		shield: 0,
		health: 0,
		type: 'cannon',
		name: 'CANNON'
	},
];

//grass 0,1
//health 2,3,4
//coin 5,6,7,8,9,10
//trap 11,12
//barrel 13
//castle 14
//chest 15
//key 16
//weapon 17,18,19,20,21,22
//shield 23,24,25,26
//animal 27,28,29,30
//knight 31,32,33,34,35,36,37,38
//canno 39

//card play settings
var cardPlaySettings = {
	maxHealth:10,
	layout:[
		{
			row:3,
			column:3,
			player:[{r:1,c:1,side:1}]
		},
		{
			row:4,
			column:4,
			player:[{r:1,c:1,side:1}]
		}
	],
	stage:[
		{
			move:15,
			play:[0,0,1,1,2],
			event:[0,1,12,12,13,13],
			items:[2,17,18,25,26],
			enemy:[27,28,29,30],
			enemyReveal:[5,6,7,8],
			chestReveal:[5,6,7,8,10],
			barrelReveal:[2,3,4,5,6,7,8,11],
			castleReveal:[9,10,9,10,9,10,31,32,33,34,35,36,37,38],
			showChest:-1,
			chest:[15],
			key:[16]
		},
		{
			move:30,
			play:[0,0,1,1,2,2],
			event:[0,1,12,12,13,13,14,39],
			items:[2,3,4,17,18,19,20,23,24,25,26],
			enemy:[31,32,33,34],
			enemyReveal:[5,6,7,8],
			chestReveal:[5,6,7,8,10],
			barrelReveal:[2,3,4,5,6,7,8,9,11],
			castleReveal:[9,10,9,10,9,10,31,32,33,34,35,36,37,38],
			showChest:15,
			chest:[15],
			key:[16]
		},
		{
			move:50,
			play:[0,0,1,2,2],
			event:[0,1,12,12,13,13,14,39],
			items:[2,3,4,2,3,4,17,18,19,20,21,22,23,24,25,26],
			enemy:[31,32,33,34,35,36,37,38],
			enemyReveal:[5,6,7,8],
			chestReveal:[5,6,7,8,10],
			barrelReveal:[2,3,4,5,6,7,8,9,11],
			castleReveal:[9,10,9,10,9,10,31,32,33,34,35,36,37,38],
			showChest:20,
			chest:[15],
			key:[16]
		},
		{
			move:80,
			play:[0,0,1,2,2,2],
			event:[0,1,12,12,13,13,14,39],
			items:[2,3,4,2,3,4,17,18,19,20,21,22,23,24,25,26],
			enemy:[31,32,33,34,35,36,37,38],
			enemyReveal:[5,6,7,8],
			chestReveal:[5,6,7,8,10],
			barrelReveal:[2,3,4,5,6,7,8,9,11],
			castleReveal:[9,10,9,10,9,10,31,32,33,34,35,36,37,38],
			showChest:30,
			chest:[15],
			key:[16]
		}
	]
};

//card multiplayer settings
var cardPlayMultiplayerSettings = {
	maxHealth:10,
	layout:[
		{
			row:4,
			column:4,
			player:[{r:1,c:0,side:1},{r:2,c:3,side:-1}]
		},
		{
			row:5,
			column:5,
			player:[{r:2,c:0,side:1}, {r:2,c:4,side:-1}]
		}
	],
	stage:[
		{
			move:15,
			play:[0,0,1,1,2],
			event:[0,1,12,12,13,13],
			items:[2,17,18,25,26],
			enemy:[27,28,29,30],
			enemyReveal:[5,6,7,8],
			chestReveal:[5,6,7,8,10],
			barrelReveal:[2,3,4,5,6,7,8,11],
			castleReveal:[9,10,9,10,9,10,31,32,33,34,35,36,37,38],
			showChest:-1,
			chest:[15],
			key:[16]
		},
		{
			move:30,
			play:[0,0,1,1,2,2],
			event:[0,1,12,12,13,13,14,39],
			items:[2,3,4,17,18,19,20,23,24,25,26],
			enemy:[31,32,33,34],
			enemyReveal:[5,6,7,8],
			chestReveal:[5,6,7,8,10],
			barrelReveal:[2,3,4,5,6,7,8,9,11],
			castleReveal:[9,10,9,10,9,10,31,32,33,34,35,36,37,38],
			showChest:15,
			chest:[15],
			key:[16]
		},
		{
			move:50,
			play:[0,0,1,2,2],
			event:[0,1,12,12,13,13,14,39],
			items:[2,3,4,2,3,4,17,18,19,20,21,22,23,24,25,26],
			enemy:[31,32,33,34,35,36,37,38],
			enemyReveal:[5,6,7,8],
			chestReveal:[5,6,7,8,10],
			barrelReveal:[2,3,4,5,6,7,8,9,11],
			castleReveal:[9,10,9,10,9,10,31,32,33,34,35,36,37,38],
			showChest:20,
			chest:[15],
			key:[16]
		},
		{
			move:80,
			play:[0,0,1,2,2,2],
			event:[0,1,12,12,13,13,14,39],
			items:[2,3,4,2,3,4,17,18,19,20,21,22,23,24,25,26],
			enemy:[31,32,33,34,35,36,37,38],
			enemyReveal:[5,6,7,8],
			chestReveal:[5,6,7,8,10],
			barrelReveal:[2,3,4,5,6,7,8,9,11],
			castleReveal:[9,10,9,10,9,10,31,32,33,34,35,36,37,38],
			showChest:30,
			chest:[15],
			key:[16]
		}
	]
};

var gameSettings = {
	cardMoveSpeed:.5,
	cardFlipSpeed:.2,
	hitFlashSpeed:.1,
	hitFlashAlpha:.4,
	playerIdleSpeed:.2,
	playeridleDistant:-3,
	swooshSpeed:.2,
	bombSpeed:1,
	numberSpeed:.5,
	healtColor:"#BF1313",
	damageColor:"#DB7112",
	shieldColor:"#133F7F",
	keyboard:{ //keyboard code
		left:[37,65],
		right:[39,68],
		up:[38,87],
		down:[40,83],
	}
}

//game text display
var textDisplay = {
					tutorialTitle:"HOW TO PLAY?",
					tutorial:{
						step1:"PRESS RIGHT KEY OR SWIPE RIGHT TO MOVE YOUR CARD\n(OPTIONALLY CAN CLICK ANY CARDS FOR DIRECTION)",
						step2:"THERE ARE MANY ITEMS LIKE SWORD CAN HELP YOU SURVIVE\nNOW GO LEFT",
						step3:"AND ALSO THERE ARE ENEMY LIKE WOLF COULD KILL YOU,\nGO GET YOUR SWORD",
						step4:"NOW YOU GOT A SWORD WITH DAMAGE STATS \nGO KILL THE WOLF",
						step5:"REWARD WILL REVEAL WHEN YOU KILL ENEMY WITH ITEMS\nNOW GET YOUR REWARD",
						step6:"SOME ENEMY COME WITH DAMAGE AND SHIELD STATS\nMOVE RIGHT TO ATTACK THE KNIGHT",
						step7:"YOUR CARD STATS WILL DEDUCT EVERYTIME YOU ATTACK\nNOW KILL THE KNIGHT",
						step8:"YOUR HEALTH IS LOW\nCOLLECT HEALING POTION TO RESTORE YOUR HEALTH",
						step9:"THAT'S IT\nYOU'RE READY TO PLAY THE GAME",
					},
					mobileTutorial:{
						step1:"SWIPE RIGHT OR TAP THE CARD ON THE RIGHT TO MOVE YOUR CARD",
						step2:"THERE ARE MANY ITEMS LIKE SWORD CAN HELP YOU SURVIVE\nNOW GO LEFT",
						step3:"AND ALSO THERE ARE ENEMY LIKE WOLF COULD KILL YOU,\nGO GET YOUR SWORD",
						step4:"NOW YOU GOT A SWORD WITH DAMAGE STATS \nGO KILL THE WOLF",
						step5:"REWARD WILL REVEAL WHEN YOU KILL ENEMY WITH ITEMS\nNOW GET YOUR REWARD",
						step6:"SOME ENEMY COME WITH DAMAGE AND SHIELD STATS\nMOVE RIGHT TO ATTACK THE KNIGHT",
						step7:"YOUR CARD STATS WILL DEDUCT EVERYTIME YOU ATTACK\nNOW KILL THE KNIGHT",
						step8:"YOUR HEALTH IS LOW\nCOLLECT HEALING POTION TO RESTORE YOUR HEALTH",
						step9:"THAT'S IT\nYOU'RE READY TO PLAY THE GAME",
					},
					sizeTitle:"CHOOSE SIZE",
					playerName:"PLAYER[NUMBER]",
					score:"[NUMBER]",
					kill:"[NUMBER]",
					gameOver:"GAME OVER",
					yourTurn:"YOUR TURN TO MOVE",
					playerTurn:"[PLAYER] TURN TO MOVE",
					yourDead:"YOUR ARE DEAD",
					playerDead:"[PLAYER] IS DEAD",
					exitTitle:"EXIT GAME",
					exitMessage:'ARE YOU SURE\nYOU WANT TO\nQUIT THE GAME?',
					resultTitle:"GAME OVER",
					share:'SHARE YOUR SCORE',
					resultKill:"TOTAL KILL: [NUMBER]",
					resultDesc:'COIN: [NUMBER]'
				}

//Social share, [SCORE] will replace with game score
var shareEnable = true; //toggle share
var shareTitle = 'Highscore on Card Attack is [SCORE]';//social share score title
var shareMessage = '[SCORE] is mine new highscore on Card Attack game! Try it now!'; //social share score message

/*!
 *
 * GAME SETTING CUSTOMIZATION END
 *
 */
$.editor = {enable:false};
var playerData = {score:0, kill:0};
var gameData = {paused:true, player:0, layoutIndex:0, cardIndex:0, stageIndex:0, side:false, moveCard:false, playCard:false, over:false, tutorialMode:false, tutorialIndex:0, tutorialCardIndex:0 };
var protonData = {proton:null, emitter:[], objects:[]};
var tweenData = {score:0, tweenScore:0};
var timeData = {enable:false, startDate:null, nowDate:null, timer:0, oldTimer:0};
var gestureData = {pX:'', pY:'', pX2:'', pY2:'', lastDirection:-1, curDirection:-1, directionArr:[]};

/*!
 * 
 * GAME BUTTONS - This is the function that runs to setup button event
 * 
 */
function buildGameButton(){
	$(window).focus(function() {
		if(!buttonSoundOn.visible){
			toggleSoundInMute(false);
		}

		if (typeof buttonMusicOn != "undefined") {
			if(!buttonMusicOn.visible){
				toggleMusicInMute(false);
			}
		}
	});
	
	$(window).blur(function() {
		if(!buttonSoundOn.visible){
			toggleSoundInMute(true);
		}

		if (typeof buttonMusicOn != "undefined") {
			if(!buttonMusicOn.visible){
				toggleMusicInMute(true);
			}
		}
	});

	if($.browser.mobile || isTablet){

	}else{

		var isInIframe = (window.location != window.parent.location) ? true : false;
		if(isInIframe){
			this.document.onkeydown = keydown;
			this.document.onkeyup = keyup;
		
			$(window).blur(function() {
				appendFocusFrame();
			});
			appendFocusFrame();
        }else{
            this.document.onkeydown = keydown;
			this.document.onkeyup = keyup;
        }
	}

	buttonLocal.cursor = "pointer";
	buttonLocal.addEventListener("click", function(evt) {
		playSound('soundButton');
		socketData.online = false;
		if(cardPlaySettings.layout.length == 1){
			goPage('game');
		}else{
			goPage('size');
		}
	});

	buttonOnline.cursor = "pointer";
	buttonOnline.addEventListener("click", function(evt) {
		playSound('soundButton');
		checkQuickGameMode();
	});

	buttonPlay.cursor = "pointer";
	buttonPlay.addEventListener("click", function(evt) {
		playSound('soundButton');
		gameData.tutorialMode = false;
		if ( typeof initSocket == 'function' && multiplayerSettings.enable) {
			if(multiplayerSettings.localPlay){
				toggleMainButton('local');
			}else{
				checkQuickGameMode();
			}
		}else{
			if(cardPlaySettings.layout.length == 1){
				goPage('game');
			}else{
				goPage('size');
			}
		}
	});

	buttonTutorial.cursor = "pointer";
	buttonTutorial.addEventListener("click", function(evt) {
		playSound('soundButton');
		gameData.tutorialMode = true;
		gameData.layout = {
			row:1,
			column:3,
			player:[{r:0,c:1,side:1}]
		}

		//grass 0,1
		//health 2,3,4
		//coin 5,6,7,8,9,10
		//trap 11,12
		//barrel 13
		//castle 14
		//chest 15
		//key 16
		//weapon 17,18,19,20,21,22
		//shield 23,24,25,26
		//animal 27,28,29,30
		//knight 31,32,33,34,35,36,37,38
		//canno 39

		gameData.tutorialIndex = 0;
		gameData.tutorialCardIndex = 0;
		gameData.tutorialArr = [0,1,17,27,38,5,4,0,1];
		gameData.tutorialDirectionArr = ["","right","left","left","right","right","right","right","left"];
		goPage("game");
	});

	buttonSizePlay.cursor = "pointer";
	buttonSizePlay.addEventListener("click", function(evt) {
		playSound('soundButton');
		if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
			postSocketUpdate('start');
		}else{
			goPage('game');
		}
	});

	buttonArrowLeft.cursor = "pointer";
	buttonArrowLeft.addEventListener("click", function(evt) {
		playSound('soundButton');
		toggleSize(false);
	});

	buttonArrowRight.cursor = "pointer";
	buttonArrowRight.addEventListener("click", function(evt) {
		playSound('soundButton');
		toggleSize(true);
	});

	itemExit.addEventListener("click", function(evt) {
	});
	
	buttonContinue.cursor = "pointer";
	buttonContinue.addEventListener("click", function(evt) {
		playSound('soundButton');
		stopGame();
		goPage('main');
		if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
			exitSocketRoom();
		}
	});
	
	buttonFacebook.cursor = "pointer";
	buttonFacebook.addEventListener("click", function(evt) {
		share('facebook');
	});
	
	buttonTwitter.cursor = "pointer";
	buttonTwitter.addEventListener("click", function(evt) {
		share('twitter');
	});
	buttonWhatsapp.cursor = "pointer";
	buttonWhatsapp.addEventListener("click", function(evt) {
		share('whatsapp');
	});
	
	buttonSoundOff.cursor = "pointer";
	buttonSoundOff.addEventListener("click", function(evt) {
		toggleSoundMute(true);
	});
	
	buttonSoundOn.cursor = "pointer";
	buttonSoundOn.addEventListener("click", function(evt) {
		toggleSoundMute(false);
	});

	if (typeof buttonMusicOff != "undefined") {
		buttonMusicOff.cursor = "pointer";
		buttonMusicOff.addEventListener("click", function(evt) {
			toggleMusicMute(true);
		});
	}
	
	if (typeof buttonMusicOn != "undefined") {
		buttonMusicOn.cursor = "pointer";
		buttonMusicOn.addEventListener("click", function(evt) {
			toggleMusicMute(false);
		});
	}
	
	buttonFullscreen.cursor = "pointer";
	buttonFullscreen.addEventListener("click", function(evt) {
		toggleFullScreen();
	});
	
	buttonExit.cursor = "pointer";
	buttonExit.addEventListener("click", function(evt) {
		togglePop(true);
		toggleOption();
	});
	
	buttonSettings.cursor = "pointer";
	buttonSettings.addEventListener("click", function(evt) {
		toggleOption();
	});
	
	buttonConfirm.cursor = "pointer";
	buttonConfirm.addEventListener("click", function(evt) {
		playSound('soundButton');
		togglePop(false);
		
		stopAudio();
		stopGame();
		goPage('main');
	});
	
	buttonCancel.cursor = "pointer";
	buttonCancel.addEventListener("click", function(evt) {
		playSound('soundButton');
		togglePop(false);
	});

	buildGameGesture();
	preventScrolling();
}

function preventScrolling(){
	var keys = [32,38,37,40,39];
    $(window).on( "keydown", function(event) {
      if(keys.indexOf(event.keyCode) != -1){
        event.preventDefault();
      }
    });
}

function appendFocusFrame(){
	$('#mainHolder').prepend('<div id="focus" style="position:absolute; width:100%; height:100%; z-index:1000;"></div');
	$('#focus').click(function(){
		$('#focus').remove();
	});	
}

function toggleSize(con){
	var sizeMax = cardPlaySettings.layout.length-1;

	if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
		sizeMax = cardPlayMultiplayerSettings.layout.length-1;
	}

	if(con){
		gameData.layoutIndex++;
		gameData.layoutIndex = gameData.layoutIndex > sizeMax ? sizeMax : gameData.layoutIndex;
	}else{
		gameData.layoutIndex--;
		gameData.layoutIndex = gameData.layoutIndex < 0 ? 0 : gameData.layoutIndex;
	}

	displayPlaySize();
	if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
		postSocketUpdate('updatesize', {index:gameData.layoutIndex}, true);
	}
}

function displayPlaySize(){
	if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
		gameData.layout = {
			row:cardPlayMultiplayerSettings.layout[gameData.layoutIndex].row,
			column:cardPlayMultiplayerSettings.layout[gameData.layoutIndex].column,
			player:cardPlayMultiplayerSettings.layout[gameData.layoutIndex].player,
		}
	}else{
		gameData.layout = {
			row:cardPlaySettings.layout[gameData.layoutIndex].row,
			column:cardPlaySettings.layout[gameData.layoutIndex].column,
			player:cardPlaySettings.layout[gameData.layoutIndex].player,
		}
	}

	sizePlayTxt.text = gameData.layout.row + ' X ' + gameData.layout.column;
}

/*!
 * 
 * TOGGLE GAME TYPE - This is the function that runs to toggle game type
 * 
 */
function toggleMainButton(con){
	if ( typeof initSocket == 'function' && multiplayerSettings.enable) {
		gameLogsTxt.visible = true;
		gameLogsTxt.text = '';
	}

	buttonPlay.visible = false;
	buttonTutorial.visible = false;
	buttonLocalContainer.visible = false;

	if(con == 'start'){
		buttonPlay.visible = true;
		buttonTutorial.visible = true;
	}else if(con == 'local'){
		buttonLocalContainer.visible = true;
	}
}

function checkQuickGameMode(){
	socketData.online = true;
	if(!multiplayerSettings.enterName){
		buttonPlay.visible = false;
		buttonTutorial.visible = false;
		buttonLocalContainer.visible = false;

		addSocketRandomUser();
	}else{
		goPage('name');
	}
}

function resizeSocketLog(){
	if(curPage == 'main'){
		if(viewport.isLandscape){
			gameLogsTxt.x = canvasW/2;
			gameLogsTxt.y = canvasH/100 * 77;
		}else{
			gameLogsTxt.x = canvasW/2;
			gameLogsTxt.y = canvasH/100 * 76;
		}
	}else if(curPage == 'size'){
		if(viewport.isLandscape){
			gameLogsTxt.x = canvasW/2;
			gameLogsTxt.y = canvasH/100 * 70;
		}else{
			gameLogsTxt.x = canvasW/2;
			gameLogsTxt.y = canvasH/100 * 64;
		}
	}
}

/*!
 * 
 * KEYBOARD EVENTS - This is the function that runs for keyboard events
 * 
 */
function keydown(event) {
	if(curPage == "game"){
		if(gameData.playCard){
			if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
				if(gameData.player != socketData.gameIndex){
					return;
				}
			}

			var direction = "";
			if(gameSettings.keyboard.left.indexOf(event.keyCode) != -1){
				direction = "left";
			}else if(gameSettings.keyboard.right.indexOf(event.keyCode) != -1){
				direction = "right";
			}else if(gameSettings.keyboard.up.indexOf(event.keyCode) != -1){
				direction = "up";
			}else if(gameSettings.keyboard.down.indexOf(event.keyCode) != -1){
				direction = "down";
			}

			if(direction != ""){
				if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
					if(gameData.moveCard){
						socketData.loaded = [];
						moveCard(gameData.player, direction);
						postSocketUpdate('moveCard', {player:gameData.player, direction:direction}, true);
					}
				}else{
					if(gameData.moveCard){
						moveCard(gameData.player, direction);
					}else{
						gameData.nextDir = direction;
					}
				}
			}
		}
	}
}

function keyup(event) {
	
}

/*!
 * 
 * GAME GESTURE EVENTS - This is the function that runs to build game gesture events
 * 
 */
function buildGameGesture(){
	stage.addEventListener("stagemousedown", handleMouseDown);
	stage.addEventListener("stagemouseup", handleMouseUp);
}

function handleMouseDown(event) {
	if (!event.primary) { return; }
	
	gestureData.curDirection=-1;
	gestureData.lastDirection=-1;
	gestureData.pX=gestureData.pX2=stage.mouseX;
	gestureData.pY=gestureData.pY2=stage.mouseY;
	gestureData.directionArr = [];
	
	stage.addEventListener("stagemousemove", handleMouseMove);
}

function handleMouseMove(event) {
	if (!event.primary) { return; }
	
	var dX=gestureData.pX-stage.mouseX;
	var dY=gestureData.pY-stage.mouseY;
	var distance=dX*dX+dY*dY;
	if (distance>400) {
		var angle=Math.atan2(dY,dX)*57.2957795;
		var refinedAngle;
		var directionString;
		if (angle>=22*-1&&angle<23) {
			refinedAngle=0;
			directionString="left";
		}
		if (angle>=68&&angle<113) {
			refinedAngle=Math.PI/2;
			directionString="up";
		}
		if (angle>=158||angle<157*-1) {
			refinedAngle=Math.PI;
			directionString="right";
		}
		if (angle>=112*-1&&angle<67*-1) {
			refinedAngle=- Math.PI/2;
			directionString="down";
		}
		gestureData.pX2-=Math.sqrt(distance)*Math.cos(refinedAngle);
		gestureData.pY2-=Math.sqrt(distance)*Math.sin(refinedAngle);
		if (refinedAngle!=gestureData.lastDirection) {
			gestureData.lastDirection=refinedAngle;
		}
		else {
			if (gestureData.curDirection!=gestureData.lastDirection) {
				gestureData.directionArr.push(directionString);
				gestureData.curDirection=gestureData.lastDirection;
			}
		}
		gestureData.pX=stage.mouseX;
		gestureData.pY=stage.mouseY;
	}
}

function handleMouseUp(event) {
	if (!event.primary) { return; }
	stage.removeEventListener("stagemousemove", handleMouseMove);

	if(gestureData.directionArr.length > 0){
		var direction = gestureData.directionArr[0];
		if(gameData.playCard){
			if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
				if(gameData.player != socketData.gameIndex){
					return;
				}
			}

			if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
				if(gameData.moveCard){
					socketData.loaded = [];
					moveCard(gameData.player, direction);
					postSocketUpdate('moveCard', {player:gameData.player, direction:direction}, true);
				}
			}else{
				if(gameData.moveCard){
					moveCard(gameData.player, direction);
				}else{
					gameData.nextDir = direction;
				}
			}
		}
	}
}


/*!
 * 
 * TOGGLE POP - This is the function that runs to toggle popup overlay
 * 
 */
function togglePop(con){
	confirmContainer.visible = con;
}


/*!
 * 
 * DISPLAY PAGES - This is the function that runs to display pages
 * 
 */
var curPage=''
function goPage(page){
	curPage=page;
	
	$('#roomWrapper').hide();
	$('#roomWrapper .innerContent').hide();
	gameLogsTxt.visible = false;
	bgRoom.visible = false;

	mainContainer.visible = false;
	sizeContainer.visible = false;
	gameContainer.visible = false;
	resultContainer.visible = false;
	
	var targetContainer = null;
	switch(page){
		case 'main':
			targetContainer = mainContainer;
			toggleMainButton("start");
			stopMusicLoop("musicGame");
			playMusicLoop("musicMain");
		break;

		case 'name':
			targetContainer = nameContainer;
			$('#roomWrapper').show();
			$('#roomWrapper .nameContent').show();
			$('#roomWrapper .fontNameError').html('');
			$('#enterName').show();
			bgRoom.visible = true;
		break;
			
		case 'room':
			targetContainer = roomContainer;
			$('#roomWrapper').show();
			$('#roomWrapper .roomContent').show();
			switchSocketRoomContent('lists');
			bgRoom.visible = true;
		break;

		case 'size':
			targetContainer = sizeContainer;

			if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
				buttonSizePlay.visible = false;
				buttonArrowLeft.visible = buttonArrowRight.visible = false;

				if(socketData.host){
					buttonSizePlay.visible = true;
					buttonArrowLeft.visible = buttonArrowRight.visible = true;
				}
			}else{
				buttonSizePlay.visible = true;
				buttonArrowLeft.visible = buttonArrowRight.visible = true;
			}
			gameData.layoutIndex = 0;
			displayPlaySize();
		break;
		
		case 'game':
			targetContainer = gameContainer;
			stopMusicLoop("musicMain");
			playMusicLoop("musicGame");
			startGame();
		break;
		
		case 'result':
			targetContainer = resultContainer;
			togglePop(false);
			playSound('soundResult');

			if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
				playerData.score = $.status["icon"+socketData.gameIndex].score;
				playerData.kill = $.status["icon"+socketData.gameIndex].kill;
			}

			resultKillTxt.text = textDisplay.resultKill.replace("[NUMBER]", playerData.kill);

			tweenData.tweenScore = 0;
			TweenMax.to(tweenData, .5, {tweenScore:playerData.score, overwrite:true, onUpdate:function(){
				resultDescTxt.text = textDisplay.resultDesc.replace('[NUMBER]', addCommas(Math.floor(tweenData.tweenScore)));
			}});

			saveGame(playerData.score);
		break;
	}
	
	if(targetContainer != null){
		targetContainer.visible = true;
		targetContainer.alpha = 0;
		TweenMax.to(targetContainer, .5, {alpha:1, overwrite:true});
	}
	
	resizeCanvas();
}

/*!
 * 
 * START GAME - This is the function that runs to start game
 * 
 */
function startGame(){
	gameStatusContainer.alpha = 0;

	displayPlayerIcon();
	prepareSettings();
	prepareStage();

	if(gameData.tutorialMode){
		tutorialTitleTxt.visible = true;
		tutorialDescTxt.visible = true;
		tutorialDescTxt.text = "";
	}else{
		tutorialTitleTxt.visible = false;
		tutorialDescTxt.visible = false;
	}

	if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
		if(socketData.host){
			gameData.player = 0;
			prepareCardContent(true);
		}
	}else{
		prepareCardContent(true);
	}
}

 /*!
 * 
 * STOP GAME - This is the function that runs to stop play game
 * 
 */
function stopGame(){
	destoryProton();
	TweenMax.killAll(false, true, false);
	gameData.paused = true;
}

function saveGame(score){
	if ( typeof toggleScoreboardSave == 'function' ) { 
		$.scoreData.score = score;
		if(typeof type != 'undefined'){
			$.scoreData.type = type;
		}
		toggleScoreboardSave(true);
	}

	/*$.ajax({
      type: "POST",
      url: 'saveResults.php',
      data: {score:score},
      success: function (result) {
          console.log(result);
      }
    });*/
}

/*!
 * 
 * RESIZE GAME LAYOUT - This is the function that runs for resize game layout
 * 
 */
function resizeGameLayout(){
	if(viewport.isLandscape){
		cardsWrapContainer.x = canvasW/2;
		cardsWrapContainer.y = canvasH/2;

		$.status[0].x = canvasW/100 * 10;
		$.status[0].y = canvasH/100 * 82;

		$.status[1].x = canvasW/100 * 90;
		$.status[1].y = canvasH/100 * 82;

		tutorialTitleTxt.x = canvasW/2;
		tutorialTitleTxt.y = canvasH/100 * 30;

		tutorialDescTxt.x = canvasW/2;
		tutorialDescTxt.y = canvasH/100 * 70;
	}else{
		cardsWrapContainer.x = canvasW/2;
		cardsWrapContainer.y = canvasH/100 * 45;

		$.status[0].x = canvasW/100 * 12;
		$.status[0].y = canvasH/100 * 89;

		$.status[1].x = canvasW/100 * 88;
		$.status[1].y = canvasH/100 * 89;

		tutorialTitleTxt.x = canvasW/2;
		tutorialTitleTxt.y = canvasH/100 * 35;

		tutorialDescTxt.x = canvasW/2;
		tutorialDescTxt.y = canvasH/100 * 65;
	}
}

/*!
 * 
 * PREPARE STAGE - This is the function that runs for prepage stage
 * 
 */
function displayPlayerIcon(){
	$.status["iconHilight"+0].alpha = 0;
	$.status["iconHilight"+1].alpha = 0;

	if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
		$.status["icon"+0].removeAllChildren();
		$.status["icon"+1].removeAllChildren();

		var newPlayerIcon = new createjs.Bitmap(loader.getResult('cardChaIcon_'+0));
		centerReg(newPlayerIcon);
		$.status["icon"+0].addChild(newPlayerIcon);

		var newPlayerIcon = new createjs.Bitmap(loader.getResult('cardChaIcon_'+1));
		centerReg(newPlayerIcon);
		$.status["icon"+1].addChild(newPlayerIcon);

		$.status["icon"+0].score = 0;
		$.status["icon"+0].kill = 0;
		$.status["icon"+1].score = 0;
		$.status["icon"+1].kill = 0;
	}else{
		if(gameData.tutorialMode){
			$.status[0].visible = false;
			$.status[1].visible = false;
		}else{
			$.status["icon"+0].removeAllChildren();

			var newPlayerIcon = new createjs.Bitmap(loader.getResult('cardChaIcon_'+0));
			centerReg(newPlayerIcon);
			$.status["icon"+0].addChild(newPlayerIcon);

			$.status["statsName"+0].visible = false;
			$.status["playerNameTxt"+0].visible = false;

			$.status[0].visible = true;
			$.status[1].visible = false;
		}
	}
}

function prepareSettings(){
	tweenData.tweenScore = 0;
	playerData.score = 0;
	playerData.kill = 0;
	updateGameDisplay();

	gameData.stageIndex = 0;
	gameData.playCard = true;
	gameData.moveCard = false;
	gameData.moveCount = 0;
	gameData.nextDir = "";
	gameData.nextCard = null;
	gameData.playArr = [];
	gameData.eventArr = [];
	gameData.itemsArr = [];
	gameData.enemyArr = [];
	gameData.enemyRevealArr = [];
	gameData.chestRevealArr = [];
	gameData.barrelRevealArr = [];
	gameData.castleRevealArr = [];
	gameData.chestArr = [];
	gameData.keyArr = [];
	gameData.chestCountArr = [];
	gameData.side = false;
	gameData.cannonIndex = -1;
	gameData.over = false;
	gameData.tween = {
		movement:{
			value:0
		}
	}

	gameData.chestKeyArr = [0,1];
	gameData.chestKeyArrIndex = 0;

	gameData.chestCount = 0;
	gameData.chestNextCount = 0;
	gameData.chestComplete = 0;

	shuffle(gameData.chestArr);
}

function prepareStage(){
	gameData.stage = {
		move:cardPlaySettings.stage[gameData.stageIndex].move,
		play:cardPlaySettings.stage[gameData.stageIndex].play,
		event:cardPlaySettings.stage[gameData.stageIndex].event,
		items:cardPlaySettings.stage[gameData.stageIndex].items,
		enemy:cardPlaySettings.stage[gameData.stageIndex].enemy,
		enemyReveal:cardPlaySettings.stage[gameData.stageIndex].enemyReveal,
		chestReveal:cardPlaySettings.stage[gameData.stageIndex].chestReveal,
		barrelReveal:cardPlaySettings.stage[gameData.stageIndex].barrelReveal,
		castleReveal:cardPlaySettings.stage[gameData.stageIndex].castleReveal,
		showChest:cardPlaySettings.stage[gameData.stageIndex].showChest,
		chest:cardPlaySettings.stage[gameData.stageIndex].chest,
		key:cardPlaySettings.stage[gameData.stageIndex].key,
	}
}

/*!
 * 
 * CREATE CARDS - This is the function that runs for create cards
 * 
 */
function createCards(){
	cardsContainer.removeAllChildren();
	particlesContainer.removeAllChildren();
	bombContainer.removeAllChildren();
	numbersContainer.removeAllChildren();
	
	var pos = {startX:0, startY:0, x:0, y:0, width:0, height:0};
	pos.width = ((gameData.layout.column-1) * cardDesign[gameData.cardIndex].width);
	pos.width += ((gameData.layout.column-1) * cardDesign[gameData.cardIndex].margin);
	pos.height = ((gameData.layout.row-1) * cardDesign[gameData.cardIndex].height);
	pos.height += ((gameData.layout.row-1) * cardDesign[gameData.cardIndex].margin);
	pos.startX = -(pos.width/2);
	pos.startY = -(pos.height/2);
	pos.x = pos.startX;
	pos.y = pos.startY;

	gameData.pos = [];
	for(var r=0; r<gameData.layout.row; r++){
		for(var c=0; c<gameData.layout.column; c++){
			var newCard = createSingleCard(r,c)

			$.card[r+'_'+c] = new createjs.Container();
			$.card[r+'_'+c].row = r;
			$.card[r+'_'+c].column = c;
			$.card[r+'_'+c].x = pos.x;
			$.card[r+'_'+c].y = pos.y;
			$.card[r+'_'+c].target = newCard;
			newCard.x = pos.x;
			newCard.y = pos.y;
			
			pos.x += cardDesign[gameData.cardIndex].width + cardDesign[gameData.cardIndex].margin;
		}

		pos.x = pos.startX;
		pos.y += cardDesign[gameData.cardIndex].height + cardDesign[gameData.cardIndex].margin;
	}

	gameData.mapW = ((gameData.layout.column) * cardDesign[gameData.cardIndex].width);
	gameData.mapW += ((gameData.layout.column-1) * cardDesign[gameData.cardIndex].margin);
	gameData.mapH = ((gameData.layout.row) * cardDesign[gameData.cardIndex].height);
	gameData.mapH += ((gameData.layout.row-1) * cardDesign[gameData.cardIndex].margin);

	animateTweenMovement();
}

function createSingleCard(r,c){
	var newCard = new createjs.Container();
	var newCover = new createjs.Bitmap(loader.getResult('cardCover_'+gameData.cardIndex));
	centerReg(newCover);

	var newInner = new createjs.Container();
	var newType1 = new createjs.Bitmap(loader.getResult('cardType1_'+gameData.cardIndex));
	centerReg(newType1);
	newType2 = new createjs.Bitmap(loader.getResult('cardType2_'+gameData.cardIndex));
	centerReg(newType2);
	newType3 = new createjs.Bitmap(loader.getResult('cardType3_'+gameData.cardIndex));
	centerReg(newType3);
	newType4 = new createjs.Bitmap(loader.getResult('cardType4_'+gameData.cardIndex));
	centerReg(newType4);
	newHit = new createjs.Bitmap(loader.getResult('cardHit_'+gameData.cardIndex));
	centerReg(newHit);
	newFocus = new createjs.Bitmap(loader.getResult('cardFocus_'+gameData.cardIndex));
	centerReg(newFocus);
	newFocus.alpha = 0;
	newStroke = new createjs.Bitmap(loader.getResult('cardStroke_'+gameData.cardIndex));
	centerReg(newStroke);
	newStroke.alpha = 0;

	var newText = new createjs.Text();
	newText.font = cardDesign[gameData.cardIndex].name.fontSize + "px australiatitle";
	newText.color = '#fff';
	newText.textAlign = "center";
	newText.textBaseline='alphabetic';
	newText.x = cardDesign[gameData.cardIndex].name.fontX;
	newText.y = cardDesign[gameData.cardIndex].name.fontY;

	newIcon = new createjs.Container();
	newIconA = new createjs.Container();
	newIconB = new createjs.Container();
	newBadges = new createjs.Container();
	newWeapon = new createjs.Container();
	newShield = new createjs.Container();
	newKey = new createjs.Container();
	newNumbers = new createjs.Container();
	newSwoosh = new createjs.Container();
	newIconA.x = newIconB.x = cardDesign[gameData.cardIndex].icon.x;
	newIconA.y = newIconB.y = cardDesign[gameData.cardIndex].icon.y;
	newIcon.addChild(newIconB, newIconA, newWeapon, newShield, newKey);
	newInner.addChild(newType1, newType2, newType3, newType4, newHit, newFocus, newBadges, newIcon, newStroke, newSwoosh, newText, newNumbers);
	
	newCard.row = r;
	newCard.column = c;
	newCard.cover = newCover;
	newCard.inner = newInner;
	newCard.type1 = newType1;
	newCard.type2 = newType2;
	newCard.type3 = newType3;
	newCard.type4 = newType4;
	newCard.hit = newHit;
	newCard.focus = newFocus;
	newCard.stroke = newStroke;
	newCard.icon = newIcon;
	newCard.iconA = newIconA;
	newCard.iconB = newIconB;
	newCard.weapon = newWeapon;
	newCard.shield = newShield;
	newCard.swoosh = newSwoosh;
	newCard.key = newKey;
	newCard.numbers = newNumbers;
	newCard.name = newText;
	newCard.badges = newBadges;
	newCard.toggleSide = false;
	newCard.cardType = '';
	newCard.isNew = true;

	newCard.hit.alpha = 0;
	newCard.addChild(newCover, newInner);
	cardsContainer.addChild(newCard);

	newCard.addEventListener("click", function(evt) {
		if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
			if(gameData.player != socketData.gameIndex){
				return;
			}
		}
		
		var direction = '';
		if($.card["player"+gameData.player].x > evt.currentTarget.x){
			direction = "left";
		}else if($.card["player"+gameData.player].x < evt.currentTarget.x){
			direction = "right";
		}else if($.card["player"+gameData.player].y > evt.currentTarget.y){
			direction = "up";
		}else if($.card["player"+gameData.player].y < evt.currentTarget.y){
			direction = "down";
		}

		if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
			if(gameData.moveCard){
				socketData.loaded = [];
				moveCard(gameData.player, direction);
				postSocketUpdate('moveCard', {player:gameData.player, direction:direction}, true);
			}
		}else{
			if(gameData.moveCard){
				moveCard(gameData.player, direction);
			}else{
				gameData.nextCard = evt.currentTarget;
			}
		}
	});
	return newCard;
}

function shuffleCards(){
	//grass 0,1
	//health 2,3,4
	//coin 5,6,7,8,9,10
	//trap 11,12
	//barrel 13
	//castle 14
	//chest 15
	//key 16
	//weapon 17,18,19,20,21,22
	//shield 23,24,25,26
	//animal 27,28,29,30
	//knight 31,32,33,34,35,36,37,38

	var presetCard = false;
	var cardTypeIndex = 0;
	var cardType = [
		{type:"card", index:13},
		{type:"card", index:27},
		{type:"card", index:36},
		{type:"card", index:37},
		{type:"player", index:0},
		{type:"card", index:33},
		{type:"card", index:24},
		{type:"card", index:39},
		{type:"card", index:26},
		{type:"card", index:12},
		{type:"card", index:39},
		{type:"card", index:12},
		{type:"card", index:12},
		{type:"card", index:39},
		{type:"card", index:12},
		{type:"card", index:12},
		{type:"card", index:39},
		{type:"card", index:12},
		{type:"card", index:12},
		{type:"card", index:39},
		{type:"card", index:12},
		{type:"card", index:12},
	];

	gameData.dealCard = true;
	gameData.totalFlip = 0;
	var delayMoveNum = (gameData.layout.row * gameData.layout.column) * .2;
	for(var r=0; r<gameData.layout.row; r++){
		for(var c=0; c<gameData.layout.column; c++){
			if(presetCard){
				setCardContent(cardType[cardTypeIndex].type, cardType[cardTypeIndex].index, r, c);
			}else{
				var cardType = getCardContent("play",r,c);
				setCardContent(cardType.type, cardType.index, r, c, cardType.side);
			}
			
			animateMoveCard($.card[r+'_'+c].target, delayMoveNum, 0, true);
			delayMoveNum -= .2;
			cardTypeIndex++;
		}
	}

	gameData.paused = false;
}

/*!
 * 
 * CARD ANIMATEION - This is the function that runs for card animation
 * 
 */
function animateMoveCard(thisCard, delay){
	gameData.totalFlip++;
	thisCard.lastX = thisCard.x;
	thisCard.lastY = thisCard.y;

	thisCard.visible = false;
	thisCard.inner.visible = false;

	thisCard.x = 0;
	thisCard.y = -(canvasH/100 * 50);

	TweenMax.to(thisCard, gameSettings.cardMoveSpeed, {delay:delay, alpha:1, x:thisCard.lastX, y:thisCard.lastY, overwrite:true, onStart:function(){
		playSound("soundCardDeal");
		thisCard.visible = true;
	}, onComplete:function(){
		animateMoveCardComplete();
	}});
}

function animateMoveCardComplete(){
	gameData.totalFlip--;
	if(gameData.totalFlip <= 0){
		for(var r=0; r<gameData.layout.row; r++){
			for(var c=0; c<gameData.layout.column; c++){
				var thisCard = $.card[r+'_'+c].target;
				if(thisCard.isNew){
					thisCard.isNew = false;
					animateFlipCard(thisCard);
				}
			}
		}
		tryNextMove();
	}
}

function animateFlipCard(thisCard){
	playSound("soundCardFlip");
	thisCard.inner.visible = true;
	thisCard.inner.scaleX = 0;
	TweenMax.to(thisCard.cover, gameSettings.cardFlipSpeed, {scaleX:0, ease:Sine.easeIn, overwrite:true, onComplete:function(){
		TweenMax.to(thisCard.inner, gameSettings.cardFlipSpeed, {scaleX:1, ease:Sine.easeOut, overwrite:true});
	}});
}

function animateIconHit(thisCard){
	TweenMax.to(thisCard.hit, gameSettings.hitFlashSpeed, {alpha:gameSettings.hitFlashAlpha, overwrite:true, onComplete:function(){
		TweenMax.to(thisCard.hit, gameSettings.hitFlashSpeed, {alpha:0, overwrite:true, onComplete:function(){
			TweenMax.to(thisCard.hit, gameSettings.hitFlashSpeed, {alpha:gameSettings.hitFlashAlpha, overwrite:true, onComplete:function(){
				TweenMax.to(thisCard.hit, gameSettings.hitFlashSpeed, {alpha:0, overwrite:true, onComplete:function(){
					
				}});
			}});
		}});
	}});
}

function animateTweenMovement(){
	TweenMax.to(gameData.tween.movement, gameSettings.playerIdleSpeed, {value:gameSettings.playeridleDistant, ease:Sine.easeOut, overwrite:true, onComplete:function(){
		TweenMax.to(gameData.tween.movement, gameSettings.playerIdleSpeed, {value:0, overwrite:true, ease:Sine.easeIn, onComplete:animateTweenMovement});		
	}});
}

function animateSwoosh(thisCard){
	thisCard.swoosh.removeAllChildren();

	var newSwoosh = new createjs.Bitmap(loader.getResult('itemSwoosh'));
	centerReg(newSwoosh);
	thisCard.swoosh.addChild(newSwoosh);

	var cardW = cardDesign[gameData.cardIndex].width;
	var cardH = cardDesign[gameData.cardIndex].height;
	newSwoosh.x = cardW/6;
	newSwoosh.y = -(cardH/6);
	newSwoosh.alpha = 1;
	TweenMax.to(newSwoosh, gameSettings.swooshSpeed, {alpha:1, x:-(cardW/6), y:cardH/6, overwrite:true, onComplete:function(){
		TweenMax.to(newSwoosh, gameSettings.swooshSpeed, {delay:.2, alpha:0, overwrite:true});		
	}});
}

function animateNumbers(thisCard, type, side, delay, number){
	var textColor = "";
	if(type == "health"){
		textColor = gameSettings.healtColor
	}else if(type == "damage"){
		textColor = gameSettings.damageColor
	}else if(type == "shield"){
		textColor = gameSettings.shieldColor
	}

	var newText = new createjs.Container();
	var newDisplayNumber = new createjs.Text();
	newDisplayNumber.font = "35px australiatitle";
	newDisplayNumber.color = textColor;
	newDisplayNumber.textAlign = "center";
	newDisplayNumber.textBaseline='alphabetic';
	newDisplayNumber.text = number;

	var newDisplayNumberShadow = new createjs.Text();
	newDisplayNumberShadow.font = "35px australiatitle";
	newDisplayNumberShadow.color = "#EDECD1";
	newDisplayNumberShadow.textAlign = "center";
	newDisplayNumberShadow.textBaseline='alphabetic';
	newDisplayNumberShadow.text = number;
	newDisplayNumberShadow.y = 1;

	newText.alpha = 0;
	newText.addChild(newDisplayNumberShadow, newDisplayNumber);
	numbersContainer.addChild(newText);

	var cardX = thisCard.x;
	var cardY = thisCard.y;
	if(thisCard.cardType == "player"){
		cardX = thisCard.nextX;
		cardY = thisCard.nextY;
	}

	var cardW = cardDesign[gameData.cardIndex].width;
	var cardH = cardDesign[gameData.cardIndex].height;
	newText.x = cardX + randomIntFromInterval(0, (cardW/5));
	newText.y = cardY + -(cardH/4);
	if(side){
		newText.x = cardX + randomIntFromInterval(0, -(cardW/5));
	}
	var moveY = cardY + (-(cardH/2) + randomIntFromInterval(0, 10));
	TweenMax.to(newText, gameSettings.numberSpeed, {delay:delay, alpha:1, y:moveY, ease:Sine.easeeIn, overwrite:true, onComplete:function(){
		TweenMax.to(newText, gameSettings.numberSpeed/2, {delay:.2, alpha:0, ease:Sine.easeeOut, overwrite:true, onComplete:function(){
			numbersContainer.removeChild(newText);	
		}});
	}});
}

/*!
 * 
 * CARD CONTENT - This is the function that runs for card content
 * 
 */
function prepareCardContent(dealCard){
	var totalPrepareCards = gameData.layout.row * gameData.layout.column;
	var totalLoop = 10;
	var totalArray = 8;
	var totalComplete = 0;
	var playIndex = gameData.playArr.length;

	for(var l=0; l<totalLoop; l++){
		totalComplete = 0;

		if(gameData.playArr.length < totalPrepareCards*2){
			var tempArr = [];
			shuffle(gameData.stage.play);
			shuffle(gameData.stage.event);
			shuffle(gameData.stage.items);
			shuffle(gameData.stage.enemy);

			for(var n=0; n<gameData.stage.play.length; n++){
				if(gameData.stage.play[n] == 0){
					//events
					if(gameData.eventArr.length == 0){
						for(var i=0; i<gameData.stage.event.length; i++){
							gameData.eventArr.push(gameData.stage.event[i]);
						}
						shuffle(gameData.eventArr);
					}
					tempArr.push({type:"card", index:gameData.eventArr[0]});
					gameData.eventArr.shift();
				}else if(gameData.stage.play[n] == 1){
					//items
					if(gameData.itemsArr.length == 0){
						for(var i=0; i<gameData.stage.items.length; i++){
							gameData.itemsArr.push(gameData.stage.items[i]);
						}
						shuffle(gameData.itemsArr);
					}
					tempArr.push({type:"card", index:gameData.itemsArr[0]});
					gameData.itemsArr.shift();
				}else if(gameData.stage.play[n] == 2){
					//enemy
					if(gameData.enemyArr.length == 0){
						for(var i=0; i<gameData.stage.enemy.length; i++){
							gameData.enemyArr.push(gameData.stage.enemy[i]);
						}
						shuffle(gameData.enemyArr);
					}
					tempArr.push({type:"card", index:gameData.enemyArr[0]});
					gameData.enemyArr.shift();
				}
			}

			shuffle(tempArr);
			insertCardArr(gameData.playArr, tempArr);
		}else{
			totalComplete++;
		}

		if(gameData.enemyRevealArr.length < totalPrepareCards){
			var tempArr = [];
			for(var n=0; n<gameData.stage.enemyReveal.length; n++){
				tempArr.push({type:"card", index:gameData.stage.enemyReveal[n]});
			}
			shuffle(tempArr);
			insertCardArr(gameData.enemyRevealArr, tempArr);
		}else{
			totalComplete++;
		}

		if(gameData.chestRevealArr.length < totalPrepareCards){
			var tempArr = [];
			for(var n=0; n<gameData.stage.chestReveal.length; n++){
				tempArr.push({type:"card", index:gameData.stage.chestReveal[n]});
			}
			shuffle(tempArr);
			insertCardArr(gameData.chestRevealArr, tempArr);
		}else{
			totalComplete++;
		}

		if(gameData.barrelRevealArr.length < totalPrepareCards){
			var tempArr = [];
			for(var n=0; n<gameData.stage.barrelReveal.length; n++){
				tempArr.push({type:"card", index:gameData.stage.barrelReveal[n]});
			}
			shuffle(tempArr);
			insertCardArr(gameData.barrelRevealArr, tempArr);
		}else{
			totalComplete++;
		}

		if(gameData.castleRevealArr.length < totalPrepareCards){
			var tempArr = [];
			for(var n=0; n<gameData.stage.castleReveal.length; n++){
				tempArr.push({type:"card", index:gameData.stage.castleReveal[n]});
			}
			shuffle(tempArr);
			insertCardArr(gameData.castleRevealArr, tempArr);
		}else{
			totalComplete++;
		}

		if(gameData.chestArr.length < totalPrepareCards){
			var tempArr = [];
			for(var n=0; n<gameData.stage.chest.length; n++){
				tempArr.push({type:"card", index:gameData.stage.chest[n]});
			}
			shuffle(tempArr);
			insertCardArr(gameData.chestArr, tempArr);
		}else{
			totalComplete++;
		}

		if(gameData.keyArr.length < totalPrepareCards){
			var tempArr = [];
			for(var n=0; n<gameData.stage.key.length; n++){
				tempArr.push({type:"card", index:gameData.stage.key[n]});
			}
			shuffle(tempArr);
			insertCardArr(gameData.keyArr, tempArr);
		}else{
			totalComplete++;
		}

		if(gameData.chestCountArr.length < totalPrepareCards){
			var tempArr = [];
			for(var n=0; n<gameData.stage.key.length; n++){
				tempArr.push(randomIntFromInterval(1,3));
			}
			shuffle(tempArr);
			insertCardArr(gameData.chestCountArr, tempArr);
		}else{
			totalComplete++;
		}

		if(totalComplete == totalArray){
			l = totalLoop;
		}
	}

	//insert chest 
	for(var n=playIndex; n<gameData.playArr.length; n++){
		var showKeyChest = false;
		if(gameData.chestCount >= gameData.stage.showChest && gameData.stage.showChest != -1){
			if(gameData.chestNextCount == 0){
				gameData.chestNextCount = gameData.chestCountArr[0];
				gameData.chestCountArr.shift();

				if(gameData.chestKeyArrIndex < gameData.chestKeyArr.length){
					showKeyChest = true;
				}else{
					gameData.chestKeyArrIndex = 0;
				}
			}else{
				gameData.chestNextCount--;
			}
		}

		if(showKeyChest){
			if(gameData.chestKeyArr[gameData.chestKeyArrIndex] == 0){
				gameData.playArr.splice(n, 0, {type:gameData.chestArr[0].type, index:gameData.chestArr[0].index});
				gameData.chestArr.shift();
			}else if(gameData.chestKeyArr[gameData.chestKeyArrIndex] == 1){
				gameData.playArr.splice(n, 0, {type:gameData.keyArr[0].type, index:gameData.keyArr[0].index});
				gameData.keyArr.shift();
			}
			gameData.chestKeyArrIndex++;
			gameData.chestComplete++;
			if(gameData.chestComplete == 2){
				gameData.chestComplete = 0;
				gameData.chestCount = 0;
			}
		}
		gameData.chestCount++;
	}

	if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
		if(socketData.host){
			postSocketUpdate('updatecard', {
				playArr:gameData.playArr,
				enemyRevealArr:gameData.enemyRevealArr, 
				chestRevealArr:gameData.chestRevealArr, 
				barrelRevealArr:gameData.barrelRevealArr, 
				castleRevealArr:gameData.castleRevealArr, 
				chestArr:gameData.chestArr, 
				keyArr:gameData.keyArr, 
				chestCountArr:gameData.chestCountArr,
				dealCard:dealCard,
				player:gameData.player,
				moveCount:gameData.moveCount,
				stage:gameData.stage
			});
		}
	}else{
		if(dealCard){
			createCards();
			shuffleCards();
		}	
	}
}

function insertCardArr(arr, tempArr){
	for(var n=0; n<tempArr.length; n++){
		arr.push(tempArr[n]);
	}
}

function getCardContent(type,r,c){
	var returnValue;

	var isPlayer = false;
	var playerIndex = -1;
	var playerSide = -1;

	for(var n=0; n<gameData.layout.player.length; n++){
		if(r == gameData.layout.player[n].r && c == gameData.layout.player[n].c && gameData.dealCard){
			isPlayer = true;
			playerIndex = n;
			playerSide = gameData.layout.player[n].side;
		}
	}

	if(isPlayer){
		return {type:"player", index:playerIndex, side:playerSide};
	}else if(gameData.tutorialMode){
		var cardIndex = gameData.tutorialArr[gameData.tutorialCardIndex];
		gameData.tutorialCardIndex++;

		return {type:"card", index:cardIndex};
	}else if(type == "play"){
		returnValue = {type:gameData.playArr[0].type, index:gameData.playArr[0].index};
		gameData.playArr.shift();
		return returnValue;
	}else if(type == "enemy"){
		returnValue = {type:gameData.enemyRevealArr[0].type, index:gameData.enemyRevealArr[0].index};
		gameData.enemyRevealArr.shift();
		return returnValue;
	}else if(type == "chest"){
		returnValue = {type:gameData.chestRevealArr[0].type, index:gameData.chestRevealArr[0].index};
		gameData.chestRevealArr.shift();
		return returnValue;
	}else if(type == "barrel"){
		returnValue = {type:gameData.barrelRevealArr[0].type, index:gameData.barrelRevealArr[0].index};
		gameData.barrelRevealArr.shift();
		return returnValue;
	}else if(type == "castle"){
		returnValue = {type:gameData.castleRevealArr[0].type, index:gameData.castleRevealArr[0].index};
		gameData.castleRevealArr.shift();
		return returnValue;
	}
}

function setCardContent(type, index, r, c, side){
	var thisCard = $.card[r+'_'+c].target;
	thisCard.iconA.removeAllChildren();
	thisCard.iconB.removeAllChildren();
	thisCard.badgesArr = [];
	thisCard.iconA.spritesheet = null;
	thisCard.iconB.spritesheet = null;
	thisCard.cardType = type;
	thisCard.cardIndex = index;
	
	if(type == "player"){
		var newPlayerBody = getSpritesheet("player", index, 'cardChaBody_'+index);
		thisCard.iconA.spritesheet = newPlayerBody;
		thisCard.iconA.addChild(newPlayerBody);

		var newPlayerLeg = getSpritesheet("player", index, 'cardChaLeg_'+index);
		thisCard.iconB.spritesheet = newPlayerLeg;
		thisCard.iconB.addChild(newPlayerLeg);

		thisCard.badgesArr.push({type:"health", value:10, max:cardPlaySettings.maxHealth});
		//thisCard.badgesArr.push({type:"shield", value:3, max:-1});
		//thisCard.badgesArr.push({type:"damage", value:3, max:-1});
		
		if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
			thisCard.name.text = $.status["playerNameTxt"+index].player;
		}else{
			thisCard.name.text = textDisplay.playerName.replace("[NUMBER]", index+1);
		}

		thisCard.cardType = "player";
		thisCard.keyArr = [];

		if(side != undefined){
			thisCard.icon.scaleX = side;
		}

		$.card["player"+index] = thisCard;
	}else{
		if(cardTypes[index].icon != ""){
			var newIcon = getSpritesheet("card", index, 'cardTypesIcon_'+index);
			thisCard.iconA.spritesheet = newIcon;
			thisCard.iconA.addChild(newIcon);
		}

		if(cardTypes[index].iconSecond != ""){
			var newIconSecond = getSpritesheet("card", index, 'cardTypesIconSecond_'+index);
			thisCard.iconB.spritesheet = newIconSecond;
			thisCard.iconB.addChild(newIconSecond);	
		}

		if(cardTypes[index].iconWeapon != ""){
			var newIconWeapon = getSpritesheet("card", index, 'cardTypesIconWeapon_'+index);
			thisCard.weapon.addChild(newIconWeapon);	
		}

		if(cardTypes[index].iconShield != ""){
			var newIconShield = getSpritesheet("card", index, 'cardTypesIconShield_'+index);
			thisCard.shield.addChild(newIconShield);	
		}

		var checkHealth = false;
		var checkDamage = false;
		var checkShield = false;
		var checkCoin = false;

		if(cardTypes[index].type == "enemy"){
			if(cardTypes[index].health > 0){
				checkHealth = true;
			}
			if(cardTypes[index].damage > 0){
				checkDamage = true;
			}
			if(cardTypes[index].shield > 0){
				checkShield = true;
			}
			if(cardTypes[index].coin > 0){
			}
		}else if(cardTypes[index].type == "coin"){
			if(cardTypes[index].coin > 0){
				checkCoin = true;
			}
		}else if(cardTypes[index].type == "health"){
			if(cardTypes[index].health > 0){
				checkHealth = true;
			}
		}else if(cardTypes[index].type == "weapon"){
			if(cardTypes[index].damage > 0){
				checkDamage = true;
			}
		}else if(cardTypes[index].type == "shield"){
			if(cardTypes[index].shield > 0){
				checkShield = true;
			}
		}else if(cardTypes[index].type == "trap"){
			if(cardTypes[index].damage > 0){
				checkDamage = true;
			}
			if(cardTypes[index].spritesheet != undefined){
				thisCard.toggleSide = true;
			}
		}else if(cardTypes[index].type == "chest"){
			thisCard.unlock = false;
		}else if(cardTypes[index].type == "cannon"){
			if(cardTypes[index].damage > 0){
				checkDamage = true;
			}
		}

		if(checkHealth){
			thisCard.badgesArr.push({type:"health", value:cardTypes[index].health, max:-1});
		}
		if(checkDamage){
			thisCard.badgesArr.push({type:"damage", value:cardTypes[index].damage, max:-1});
		}
		if(checkShield){
			thisCard.badgesArr.push({type:"shield", value:cardTypes[index].shield, max:-1});
		}
		if(checkCoin){
			thisCard.badgesArr.push({type:"coin", value:cardTypes[index].coin, max:-1});
		}

		thisCard.name.text = cardTypes[index].name;
		thisCard.cardType = cardTypes[index].type;
	}

	updateBadgeDisplay(thisCard);
	updateNumbersDisplay(thisCard);
}

function updateNumbersDisplay(thisCard){
	if(thisCard.badges.lastBadgesArr != undefined){
		var delayNum = 0;
		var showSide = randomBoolean();
		if(thisCard.cardType == "enemy" || thisCard.cardType == "player"){
			for(var l=0; l<thisCard.badges.lastBadgesArr.length; l++){
				for(var n=0; n<thisCard.badgesArr.length; n++){
					if(thisCard.badges.lastBadgesArr[l].type == thisCard.badgesArr[n].type){
						var numberDisplay = thisCard.badges.lastBadgesArr[l].value - thisCard.badgesArr[n].value;
						if(numberDisplay > 0){
							animateNumbers(thisCard, thisCard.badgesArr[n].type, showSide, delayNum, "-"+numberDisplay);
						}else if(numberDisplay < 0){
							animateNumbers(thisCard, thisCard.badgesArr[n].type, showSide, delayNum, "+"+Math.abs(numberDisplay));
						}
						delayNum += .2;
						showSide = showSide == true ? false : true;
					}
				}
			}
			//remove
			for(var l=0; l<thisCard.badges.lastBadgesArr.length; l++){
				var removeBadge = false;
				for(var n=0; n<thisCard.badgesArr.length; n++){
					if(thisCard.badges.lastBadgesArr[l].type == thisCard.badgesArr[n].type){
						removeBadge = true;
					}
				}
				if(!removeBadge){
					animateNumbers(thisCard, thisCard.badges.lastBadgesArr[l].type, showSide, delayNum, "-"+thisCard.badges.lastBadgesArr[l].value);
					delayNum += .2;
					showSide = showSide == true ? false : true;
				}
			}

			//new
			for(var n=0; n<thisCard.badgesArr.length; n++){
				var exitBadge = false;
				for(var l=0; l<thisCard.badges.lastBadgesArr.length; l++){
					if(thisCard.badges.lastBadgesArr[l].type == thisCard.badgesArr[n].type){
						exitBadge = true;
					}
				}
				if(!exitBadge){
					animateNumbers(thisCard, thisCard.badgesArr[n].type, showSide, delayNum, "+"+thisCard.badgesArr[n].value);
					delayNum += .2;
					showSide = showSide == true ? false : true;
				}
			}
		}
	}
	
	thisCard.badges.lastBadgesArr = [];
	for(var n=0; n<thisCard.badgesArr.length; n++){
		thisCard.badges.lastBadgesArr.push({type:thisCard.badgesArr[n].type, value:thisCard.badgesArr[n].value});
	}
}

function createBadge(thisCard){
	thisCard.badges.removeAllChildren();

	if(thisCard.toggleSide && !gameData.side){
		return;
	}

	sortOnObject(thisCard.badgesArr, "type");
	if(thisCard.badgesArr.length > 2){
		var tempBadge = thisCard.badgesArr[0];
		thisCard.badgesArr[0] = thisCard.badgesArr[1];
		thisCard.badgesArr[1] = tempBadge;
	}else if(thisCard.badgesArr.length == 2 && thisCard.badgesArr[0].type == "damage" && thisCard.badgesArr[1].type == "health"){
		var tempBadge = thisCard.badgesArr[0];
		thisCard.badgesArr[0] = thisCard.badgesArr[1];
		thisCard.badgesArr[1] = tempBadge;
	}
	
	for(var n=0; n<thisCard.badgesArr.length; n++){
		var badgeAsset = "";
		var badgeValue = "";
		if(thisCard.badgesArr[n].type == "health"){
			badgeAsset = "Health";
			badgeValue = "health";
			if(thisCard.badgesArr[n].value <= 0){
				thisCard.stroke.alpha = 1;
			}
		}else if(thisCard.badgesArr[n].type == "damage"){
			badgeAsset = "Damage";
			badgeValue = "damage";
		}else if(thisCard.badgesArr[n].type == "shield"){
			badgeAsset = "Shield";
			badgeValue = "shield";
		}else if(thisCard.badgesArr[n].type == "coin"){
			badgeAsset = "Coin";
			badgeValue = "coin";
		}

		var newIcon = new createjs.Bitmap(loader.getResult('cardIcon'+badgeAsset+'_'+gameData.cardIndex));
		centerReg(newIcon);
		newIcon.x = cardDesign[gameData.cardIndex].positions[n].x;
		newIcon.y = cardDesign[gameData.cardIndex].positions[n].y;

		var newIconText = new createjs.Text();
		newIconText.font = cardDesign[gameData.cardIndex][badgeValue].fontSize + "px australiatitle";
		newIconText.color = '#fff';
		newIconText.textAlign = "center";
		newIconText.textBaseline='alphabetic';
		if(thisCard.badgesArr[n].max == -1){
			newIconText.text = thisCard.badgesArr[n].value;
		}else{
			newIconText.text = thisCard.badgesArr[n].value +'/'+ thisCard.badgesArr[n].max;
		}
		newIconText.x = newIcon.x + cardDesign[gameData.cardIndex][badgeValue].fontX;
		newIconText.y = newIcon.y + cardDesign[gameData.cardIndex][badgeValue].fontY;

		thisCard.badges.addChild(newIcon, newIconText);
	}
}

function toggleCardBg(thisCard){
	thisCard.type1.visible = false;
	thisCard.type2.visible = false;
	thisCard.type3.visible = false;
	thisCard.type4.visible = false;

	if(thisCard.toggleSide && !gameData.side){
		thisCard.type1.visible = true;
		return;
	}

	if(thisCard.badgesArr.length == 0){
		thisCard.type1.visible = true;
	}else if(thisCard.badgesArr.length == 1){
		thisCard.type2.visible = true;
	}else if(thisCard.badgesArr.length == 2){
		thisCard.type3.visible = true;
	}else if(thisCard.badgesArr.length == 3){
		thisCard.type4.visible = true;
	}
}

function createPlayerItem(thisCard, type, index){
	var newItem = new createjs.Bitmap(loader.getResult('cardTypesIconPlayer_'+index));
	centerReg(newItem);
	
	if(type == "weapon"){
		thisCard.weapon.removeAllChildren();
		thisCard.weapon.addChild(newItem);
	}else if(type == "shield"){
		thisCard.shield.removeAllChildren();
		thisCard.shield.addChild(newItem);
	}else if(type == "key"){
		thisCard.key.removeAllChildren();
		thisCard.key.addChild(newItem);	
	}
}

function removePlayerItem(thisCard, type){	
	if(type == "weapon"){
		thisCard.weapon.removeAllChildren();
	}else if(type == "shield"){
		thisCard.shield.removeAllChildren();
	}else if(type == "key"){
		thisCard.key.removeAllChildren();
	}
}

/*!
 * 
 * GET SPRITESHEET - This is the function that runs to get spritesheet
 * 
 */
function getSpritesheet(type, index, assetID){
	var _speed = 1;
	var _frameW = 0;
	var _frameH = 0;
	var _regX = 0;
	var _regY = 0;
	var _count = 0;
	var _animations;
	var _default;
	
	if(type == "player"){
		if(cardCharacter[index].spritesheet == undefined){
			newSpritesheet = new createjs.Bitmap(loader.getResult(assetID));
			newSpritesheet.isSprite = false;
			centerReg(newSpritesheet);
		}else{
			_frameW = cardCharacter[index].spritesheet.width;
			_frameH = cardCharacter[index].spritesheet.height;
			_regX = (_frameW/2);
			_regY = (_frameH/2);
			_count = cardCharacter[index].spritesheet.count;

			var frameCount = [];
			var frameCountReverse = [];
			for(var n=0; n<_count; n++){
				frameCount.push(n);
				frameCountReverse.push(n);
			}
			frameCountReverse.reverse();

			_animations = {
				on:{frames: frameCount, speed:_speed, next:"onIdle"},
				onIdle:{frames: [_count-1], speed:_speed},
				off:{frames: frameCountReverse, speed:_speed, next:"offIdle"},
				offIdle:{frames: [0], speed:_speed},
			};

			_default = "offIdle";

			var _frame = {"regX": _regX, "regY": _regY, "height": _frameH, "width": _frameW, "count": _count};					
			spritesheetData = new createjs.SpriteSheet({
				"images": [loader.getResult(assetID).src],
				"frames": _frame,
				"animations": _animations
			});

			var newSpritesheet = new createjs.Sprite(spritesheetData, _default);
			newSpritesheet.framerate = 20;
			newSpritesheet.isSprite = true;
		}
	}else if(type == "card"){
		if(cardTypes[index].spritesheet == undefined){
			newSpritesheet = new createjs.Bitmap(loader.getResult(assetID));
			newSpritesheet.isSprite = false;
			centerReg(newSpritesheet);
		}else{
			_frameW = cardTypes[index].spritesheet.width;
			_frameH = cardTypes[index].spritesheet.height;
			_regX = (_frameW/2);
			_regY = (_frameH/2);
			_count = cardTypes[index].spritesheet.count;

			var frameCount = [];
			var frameCountReverse = [];
			for(var n=0; n<_count; n++){
				frameCount.push(n);
				frameCountReverse.push(n);
			}
			frameCountReverse.reverse();

			_animations = {
				on:{frames: frameCount, speed:_speed, next:"onIdle"},
				onIdle:{frames: [_count-1], speed:_speed},
				off:{frames: frameCountReverse, speed:_speed, next:"offIdle"},
				offIdle:{frames: [0], speed:_speed},
			};

			_default = "offIdle";

			var _frame = {"regX": _regX, "regY": _regY, "height": _frameH, "width": _frameW, "count": _count};					
			spritesheetData = new createjs.SpriteSheet({
				"images": [loader.getResult(assetID).src],
				"frames": _frame,
				"animations": _animations
			});

			var newSpritesheet = new createjs.Sprite(spritesheetData, _default);
			newSpritesheet.framerate = 20;
			newSpritesheet.isSprite = true;
		}
	}

	return newSpritesheet;
}

/*!
 * 
 * MOVE CARD - This is the function that runs for move card
 * 
 */
function moveCard(player, direction){
	if(gameData.tutorialMode){
		if(direction != gameData.tutorialDirectionArr[gameData.tutorialIndex]){
			return;
		}
	}

	gameData.lastDirection = direction;
	gameData.nextDir = "";
	gameData.nextCard = null;

	var playerCard = $.card["player"+player];
	var currentR = playerCard.row;
	var currentC = playerCard.column;
	var nextR = currentR;
	var nextC = currentC;

	if(direction == "left"){
		nextC--;
		nextC = nextC < 0 ? 0 : nextC;
	}else if(direction == "right"){
		nextC++;
		nextC = nextC > gameData.layout.column-1 ? gameData.layout.column-1 : nextC;
	}else if(direction == "up"){
		nextR--;
		nextR = nextR < 0 ? 0 : nextR;
	}else if(direction == "down"){
		nextR++;
		nextR = nextR > gameData.layout.row-1 ? gameData.layout.row-1 : nextR;
	}

	if(currentR == nextR && currentC == nextC){
		playSound("soundCardError");
		if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
			postSocketUpdate('movecomplete', {index:socketData.gameIndex, con:false});
		}else{
			checkNextStage();
		}
		return;
	}else{
		var nextCard = $.card[nextR+'_'+nextC].target;
		var proceedMove = false;
		var proceedBounce = false;

		if(direction == "left"){
			playerCard.icon.scaleX = -1;
		}else if(direction == "right"){
			playerCard.icon.scaleX = 1;
		}

		gameData.moveCard = false;
		playerCard.lastX = playerCard.x;
		playerCard.lastY = playerCard.y;
		playerCard.nextX = playerCard.x;
		playerCard.nextY = playerCard.y;
		cardsContainer.setChildIndex(playerCard, cardsContainer.numChildren-1);

		if(updateCardBounce(playerCard, nextCard)){
			proceedBounce = true;
		}else{
			proceedMove = true;
		}

		if(proceedBounce){
			var centerPos = getCenterPosition(playerCard.x, playerCard.y, nextCard.x, nextCard.y);
			TweenMax.to(playerCard, gameSettings.cardMoveSpeed/4, {x:centerPos.x, y:centerPos.y, ease:Sine.easeOut, overwrite:true, onComplete:function(){
				TweenMax.to(playerCard, gameSettings.cardMoveSpeed, {x:playerCard.lastX, y:playerCard.lastY, ease:Bounce.easeOut, overwrite:true, onComplete:function(){
					bounceCardComplete(playerCard, nextCard);
				}});
			}});
		}else if(proceedMove){
			playSound("soundCardMove");
			moveCards(playerCard, direction);
			TweenMax.to(nextCard, gameSettings.cardMoveSpeed/2, {delay:gameSettings.cardMoveSpeed/2, alpha:0, overwrite:true, onStart:function(){
				playerCard.row = nextCard.row;
				playerCard.column = nextCard.column;
				$.card[playerCard.row+'_'+playerCard.column].target = playerCard;
				updateCardBadge(playerCard, nextCard);
			}});
			playerCard.nextX = nextCard.x;
			playerCard.nextY = nextCard.y;
			TweenMax.to(playerCard, gameSettings.cardMoveSpeed, {x:nextCard.x, y:nextCard.y, overwrite:true, onComplete:function(){
				moveCardComplete(playerCard, nextCard);
				updateNumbersDisplay(playerCard);
			}});
		}
	}
}

function moveCards(playerCard, direction){
	var moveR = playerCard.row;
	var moveC = playerCard.column;
	gameData.lastX = playerCard.lastX;
	gameData.lastY = playerCard.lastY;
	var moveX, moveY;

	gameData.lastR = moveR;
	gameData.lastC = moveC;

	if(direction == "up" || direction == "down"){
		for(var l=0; l<gameData.layout.row; l++){
			var proceedMove = false;
			if(direction == "up"){
				moveR++;
				if(moveR > gameData.layout.row-1){
					gameData.lastR = gameData.layout.row-1;
				}else{
					proceedMove = true;	
				}
			}else if(direction == "down"){
				moveR--;
				if(moveR < 0){
					gameData.lastR = 0;
				}else{
					proceedMove = true;	
				}
			}

			if(proceedMove){
				moveX = gameData.lastX;
				moveY = gameData.lastY;

				var moveCard = $.card[moveR+'_'+moveC].target;
				if(direction == "down"){
					moveCard.row = moveR+1;
					moveCard.column = moveC;
				}else if(direction == "up"){
					moveCard.row = moveR-1;
					moveCard.column = moveC;
				}
				$.card[moveCard.row+'_'+moveCard.column].target = moveCard;

				gameData.lastX = moveCard.x;
				gameData.lastY = moveCard.y;
				TweenMax.to(moveCard, gameSettings.cardMoveSpeed, {x:moveX, y:moveY, overwrite:true});
			}
		}
	}else if(direction == "left" || direction == "right"){
		for(var l=0; l<gameData.layout.column; l++){
			var proceedMove = false;
			if(direction == "left"){
				moveC++;
				if(moveC > gameData.layout.column-1){
					gameData.lastC = gameData.layout.column-1;
				}else{
					proceedMove = true;	
				}
			}else if(direction == "right"){
				moveC--;
				if(moveC < 0){
					gameData.lastC = 0;
				}else{
					proceedMove = true;	
				}
			}

			if(proceedMove){
				moveX = gameData.lastX;
				moveY = gameData.lastY;

				var moveCard = $.card[moveR+'_'+moveC].target;
				if(direction == "left"){
					moveCard.row = moveR;
					moveCard.column = moveC-1;
				}else if(direction == "right"){
					moveCard.row = moveR;
					moveCard.column = moveC+1;
				}
				$.card[moveCard.row+'_'+moveCard.column].target = moveCard;
				if(moveCard.cardType == "enemy"){
					if(direction == "left"){
						moveCard.icon.scaleX = -1;
					}else{
						moveCard.icon.scaleX = 1;
					}
				}
				gameData.lastX = moveCard.x;
				gameData.lastY = moveCard.y;
				TweenMax.to(moveCard, gameSettings.cardMoveSpeed, {x:moveX, y:moveY, overwrite:true});
			}
		}
	}
}

function moveCardComplete(playerCard, nextCard){
	var lastR = gameData.lastR;
	var lastC = gameData.lastC;

	//remove
	cardsContainer.removeChild(nextCard);

	//create
	var newCard = createSingleCard(lastR,lastC);
	$.card[lastR+'_'+lastC].target = newCard;

	var cardType = getCardContent("play",lastR,lastC);
	setCardContent(cardType.type, cardType.index, lastR,lastC);
	newCard.x = gameData.lastX;
	newCard.y = gameData.lastY;
	animateMoveCard(newCard, 0);

	//check
	checkGameTurn();
}

function bounceCardComplete(playerCard, nextCard){
	var dealNewCard = false;

	if(nextCard.cardType == "enemy"){
		var healthValue = findBadgeValue(nextCard, "health");
		if(healthValue <= 0){
			dealNewCard = true;
		}
	}else if(nextCard.cardType == "chest"){
		if(nextCard.unlock){
			dealNewCard = true;
		}
	}else if(nextCard.cardType == "barrel"){
		dealNewCard = true;
	}else if(nextCard.cardType == "castle"){
		dealNewCard = true;
	}

	if(dealNewCard){
		revealCardReward(playerCard, nextCard, true);	
	}else{
		//check
		checkGameTurn();
		endPlayerTurn();
	}
}

function revealCardReward(playerCard, nextCard){
	var lastR = nextCard.row;
	var lastC = nextCard.column;
	playSound("soundCardFlip");

	TweenMax.to(nextCard.inner, gameSettings.cardFlipSpeed, {scaleX:0, ease:Sine.easeIn, overwrite:true, onComplete:function(){
		TweenMax.to(nextCard.cover, gameSettings.cardFlipSpeed, {scaleX:1, ease:Sine.easeOut, overwrite:true, onComplete:function(){
			var newCard = createSingleCard(lastR,lastC);
			$.card[lastR+'_'+lastC].target = newCard;

			var cardType = getCardContent(nextCard.cardType,lastR,lastC);
			setCardContent(cardType.type, cardType.index, lastR,lastC);
			newCard.isNew = false;
			newCard.x = nextCard.x;
			newCard.y = nextCard.y;

			if(gameData.lastDirection == "right"){
				newCard.icon.scaleX = -1;
			}else if(gameData.lastDirection == "left"){
				newCard.icon.scaleX = 1;
			}
			
			//remove
			cardsContainer.removeChild(nextCard);

			//flip
			playSound("soundCardFlip");
			newCard.inner.scaleX = 0;
			TweenMax.to(newCard.cover, gameSettings.cardFlipSpeed, {scaleX:0, ease:Sine.easeIn, overwrite:true, onComplete:function(){
				if(newCard.cardType == "enemy"){
					playSound("soundRevealBad");
				}else{
					playSound("soundRevealGood");
				}
				TweenMax.to(newCard.inner, gameSettings.cardFlipSpeed, {scaleX:1, ease:Sine.easeOut, overwrite:true, onComplete:function(){
					tryNextMove();
				}});
			}});
		}});
	}});
}

/*!
 * 
 * BOMB ANIMATION - This is the function that runs for bomb animation
 * 
 */
function startBombAnimation(){
	gameData.moveCard = false;
	bombContainer.removeAllChildren();

	var directionArr = ["left","right","up","down"];
	var playerCard = $.card["player"+gameData.player];
	var playerR = playerCard.row;
	var playerC = playerCard.column;

	gameData.bombCardArr = [];
	var totalLoop = gameData.layout.row * gameData.layout.column;
	for(var n=0; n<directionArr.length; n++){
		var nextR = playerR;
		var nextC = playerC;
		for(var l=0; l<totalLoop; l++){
			if(directionArr[n] == "left"){
				nextC--;
				nextC = nextC < 0 ? 0 : nextC;
			}else if(directionArr[n] == "right"){
				nextC++;
				nextC = nextC > gameData.layout.column-1 ? gameData.layout.column-1 : nextC;
			}else if(directionArr[n] == "up"){
				nextR--;
				nextR = nextR < 0 ? 0 : nextR;
			}else if(directionArr[n] == "down"){
				nextR++;
				nextR = nextR > gameData.layout.row-1 ? gameData.layout.row-1 : nextR;
			}

			if(nextR == playerR && nextC == playerC){
				l = totalLoop;
			}else{
				var thisCard = $.card[nextR+'_'+nextC].target;
				if(thisCard.cardType == "enemy" || thisCard.cardType == "player"){
					l = totalLoop;
					gameData.bombCardArr.push(thisCard);
				}
			}
		}
	}
	
	gameData.totalBomb = 0;
	protonData.objects = [];
	protonData.emitter = [];
	if(gameData.bombCardArr.length > 0){
		playSound("soundCannon")
		for(var n=0; n<gameData.bombCardArr.length; n++){
			var thisCard = gameData.bombCardArr[n];
			gameData.totalBomb++;

			var newBomb = new createjs.Bitmap(loader.getResult("cardTypesIconPlayer_" + gameData.cannonIndex));
			centerReg(newBomb);
			newBomb.x = playerCard.x;
			newBomb.y = playerCard.y;
			bombContainer.addChild(newBomb);

			protonData.objects.push(newBomb);
			TweenMax.to(newBomb, gameSettings.bombSpeed, {x:thisCard.x, y:thisCard.y, ease:Sine.easeIn, overwrite:true, onComplete:bombAnimationComplete, onCompleteParams:[playerCard, thisCard]});
		}

		createProton(playerCard);
	}else{
		endPlayerTurn();
		gameData.cannonIndex = -1;
	}
}

function bombAnimationComplete(playerCard, nextCard){
	bombContainer.removeAllChildren();
		
	var healthValue = findBadgeValue(nextCard, "health");
	var shieldValue = findBadgeValue(nextCard, "shield");
	var overallValue = cardTypes[gameData.cannonIndex].damage;

	if(shieldValue > 0){
		playSoundHit();
		animateIconHit(nextCard);
		shieldValue -= overallValue;
		if(shieldValue > 0){
			overallValue = 0;
			updateBadgeValue(nextCard, "shield", shieldValue);
		}else{
			overallValue = Math.abs(shieldValue);
			removeBadge(nextCard, "shield");
			removePlayerItem(nextCard,"shield");
		}
	}

	if(healthValue > 0){
		playSoundHit();
		animateIconHit(nextCard);
		healthValue -= overallValue;
		if(healthValue > 0){
			overallValue = 0;
			updateBadgeValue(nextCard, "health", healthValue);
		}else{
			overallValue = Math.abs(healthValue);
			if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
				var oppPlayer = gameData.player == 0 ? 1 : 0;
				$.status["icon"+oppPlayer].kill++;
			}else{
				playerData.kill++;
			}
			updateGameDisplay();
			healthValue = 0;
			updateBadgeValue(nextCard, "health", healthValue);
		}
	}
	
	gameData.totalBomb--;
	if(gameData.totalBomb <= 0){
		var revealCard = false;
		for(var n=0; n<gameData.bombCardArr.length; n++){
			var thisCard = gameData.bombCardArr[n];
			var healthValue = findBadgeValue(thisCard, "health");
			if(healthValue <= 0){
				revealCard = true;
				revealCardReward(playerCard, thisCard, false);
			}
			updateNumbersDisplay(thisCard);
		}
		gameData.cannonIndex = -1;
		if(!revealCard){
			endPlayerTurn();
		}
	}
}

/*!
 * 
 * CREATE PROTON - This is the function that runs to create proton particles
 * 
 */
function createProton(playerCard) {
	if(protonData.proton == null){
		protonData.proton = new Proton();

		var renderer = new Proton.EaselRenderer(particlesContainer);
		protonData.proton.addRenderer(renderer);
	}
	
	for(var n=0; n < protonData.objects.length;n++){
		protonData.emitter[n] = new Proton.Emitter();
		protonData.emitter[n].rate = new Proton.Rate(new Proton.Span(5, 10), new Proton.Span(.01, .015));
		
		var textures = [];
		textures.push(itemParticle1);
		textures.push(itemParticle2);
		textures.push(itemParticle3);
	
		protonData.emitter[n].addInitialize(new Proton.Mass(1));
		protonData.emitter[n].addInitialize(new Proton.Life(0, .5));
		protonData.emitter[n].addInitialize(new Proton.Body(textures));
		
		protonData.emitter[n].addBehaviour(new Proton.Alpha(1, 0));
		protonData.emitter[n].addBehaviour(new Proton.Scale(1.2, 1));
	
		protonData.emitter[n].p.x = playerCard.x;
		protonData.emitter[n].p.y = playerCard.y;

		protonData.emitter[n].emit(gameSettings.bombSpeed/1.2);
		protonData.proton.addEmitter(protonData.emitter[n]);
	}
}

function loopProton(){
	if (protonData.proton) {
		protonData.proton.update();
		
		for(var n=0; n < protonData.emitter.length;n++){
			var targetBall = protonData.objects[n];
			protonData.emitter[n].p.x = targetBall.x;
			protonData.emitter[n].p.y = targetBall.y;
		}
	}
}

function destoryProton(){
	if (protonData.proton) {
		protonData.proton.destroy();
		protonData.proton = null;
	}
}

/*!
 * 
 * CARD CHECK END - This is the function that runs for card end
 * 
 */
function tryNextMove(){
	if(!gameData.over){
		if(gameData.dealCard){
			gameData.dealCard = false;
			gameData.moveCard = true;
			focusPlayerCard();
			showTutorialText();
		}else{
			if(gameData.cannonIndex != -1){
				startBombAnimation();
			}else{
				endPlayerTurn();
			}
		}
	}
}

function checkGameTurn(){
	gameData.side = gameData.side == true ? false : true;
	var trapSound = false;
	var trapSpikeSound = false;
	for(var r=0; r<gameData.layout.row; r++){
		for(var c=0; c<gameData.layout.column; c++){
			var thisCard = $.card[r+'_'+c].target;
			if(thisCard.toggleSide){
				trapSound = true;
				var sideAnimation = "off";
				if(gameData.side){
					trapSpikeSound = true;
					sideAnimation = "on";
				}
				updateBadgeDisplay(thisCard);

				if(thisCard.iconA.spritesheet != null && thisCard.iconA.spritesheet.isSprite){
					thisCard.iconA.spritesheet.gotoAndPlay(sideAnimation);
				}
				if(thisCard.iconB.spritesheet != null && thisCard.iconB.spritesheet.isSprite){
					thisCard.iconB.spritesheet.gotoAndPlay(sideAnimation);
				}
			}
		}
	}

	if(trapSound){
		playSound("soundTrap");
	}
	if(trapSpikeSound){
		playSound("soundTrapSpike");
	}
}

function endPlayerTurn(){
	if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
		postSocketUpdate('movecomplete', {index:socketData.gameIndex, con:false});
	}else{
		var playerHealth = findBadgeValue($.card["player"+gameData.player], "health");
		if(playerHealth <= 0){
			if(!gameData.over){
				showGameStatus("gameover", 3);
				endGame();
			}
		}else{
			if(gameData.nextDir != ""){
				moveCard(gameData.player, gameData.nextDir);
			}else if(gameData.nextCard != null){
				var direction = '';
				if($.card["player"+gameData.player].x > gameData.nextCard.x){
					direction = "left";
				}else if($.card["player"+gameData.player].x < gameData.nextCard.x){
					direction = "right";
				}else if($.card["player"+gameData.player].y > gameData.nextCard.y){
					direction = "up";
				}else if($.card["player"+gameData.player].y < gameData.nextCard.y){
					direction = "down";
				}

				moveCard(gameData.player, direction);
			}else{
				showTutorialText();
				checkNextStage();
			}
		}
	}
}

/*!
 * 
 * FOCUS PLAYER - This is the function that runs for focus player
 * 
 */
function focusPlayerCard(){
	if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
		var player1 = $.card["player"+0];
		var player2 = $.card["player"+1];

		TweenMax.killTweensOf(player1.focus);
		TweenMax.killTweensOf(player2.focus);
		TweenMax.killTweensOf($.status["iconHilight"+0]);
		TweenMax.killTweensOf($.status["iconHilight"+1]);

		player1.focus.alpha = player2.focus.alpha = 0;
		$.status["iconHilight"+0].alpha = $.status["iconHilight"+0].alpha = 0;

		if(!gameData.over){
			animateFocusBlink($.card["player"+gameData.player].focus);
			animateFocusBlink($.status["iconHilight"+gameData.player]);
			showGameStatus("turn", 1);
		}
	}
}

function animateFocusBlink(obj){
	obj.alpha = 1;
	TweenMax.to(obj, .3, {alpha:.5, overwrite:true, onComplete:function(){
		TweenMax.to(obj, .3, {alpha:1, overwrite:true, onComplete:animateFocusBlink, onCompleteParams:[obj]});
	}});
}

/*!
 * 
 * UPDATE CARD VALUE - This is the function that runs for card value update
 * 
 */
function updateCardBadge(playerCard, nextCard){
	var playerHealth = findBadgeValue(playerCard, "health");
	var playerDamage = findBadgeValue(playerCard, "damage");
	var playerShield = findBadgeValue(playerCard, "shield");

	if(nextCard.cardType == "coin"){
		playSound("soundCoin");
		var coinValue = findBadgeValue(nextCard, "coin");
		if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
			$.status["icon"+gameData.player].score += coinValue;
		}else{
			playerData.score += coinValue;
		}
		updateGameDisplay();
	}else if(nextCard.cardType == "trap"){
		var damageValue = findBadgeValue(nextCard, "damage");
		if(nextCard.toggleSide){
			if(gameData.side){
				playSoundHit();
				animateIconHit(playerCard);
				playerHealth -= damageValue;
			}
		}else{
			playerHealth -= damageValue;
			playSoundHit();
			animateIconHit(playerCard);
		}

		updateBadgeValue(playerCard, "health", playerHealth);
	}else if(nextCard.cardType == "health"){
		playSound("soundHeal");
		var healthValue = findBadgeValue(nextCard, "health");
		playerHealth += healthValue;
		playerHealth = playerHealth > cardPlaySettings.maxHealth ? cardPlaySettings.maxHealth : playerHealth;

		updateBadgeValue(playerCard, "health", playerHealth);
	}else if(nextCard.cardType == "weapon"){
		playSound("soundEquip");
		var badgeValue = findBadgeValue(nextCard, "damage");

		if(playerDamage < badgeValue){
			removeBadge(playerCard, "damage");
			playerCard.badgesArr.push({type:"damage", value:badgeValue, max:-1});
			updateBadgeDisplay(playerCard);
			createPlayerItem(playerCard, "weapon", nextCard.cardIndex);
		}
	}else if(nextCard.cardType == "shield"){
		playSound("soundEquip");
		var badgeValue = findBadgeValue(nextCard, "shield");

		if(playerShield < badgeValue){
			removeBadge(playerCard, "shield");
			playerCard.badgesArr.push({type:"shield", value:badgeValue, max:-1});
			updateBadgeDisplay(playerCard);
			createPlayerItem(playerCard, "shield", nextCard.cardIndex);
		}
	}else if(nextCard.cardType == "key"){
		playSound("soundEquip");
		playerCard.keyArr.push(nextCard.cardIndex);
		createPlayerItem(playerCard, "key", nextCard.cardIndex);
	}else if(nextCard.cardType == "cannon"){
		gameData.cannonIndex = nextCard.cardIndex;
	}else if(nextCard.cardType == "enemy" || nextCard.cardType == "player"){
		var healthValue = findBadgeValue(nextCard, "health");
		var damageValue = findBadgeValue(nextCard, "damage");
		var shieldValue = findBadgeValue(nextCard, "shield");
		var overallValue = healthValue + damageValue + shieldValue;
		
		if(playerShield > 0){
			playSoundHit();
			playerShield -= overallValue;
			if(playerShield > 0){
				overallValue = 0;
				updateBadgeValue(playerCard, "shield", playerShield);
			}else{
				overallValue = Math.abs(playerShield);
				removeBadge(playerCard, "shield");
				removePlayerItem(playerCard,"shield");
			}
		}

		if(playerDamage > 0){
			playSoundHit();
			playerDamage -= overallValue;
			if(playerDamage > 0){
				overallValue = 0;
				updateBadgeValue(playerCard, "damage", playerDamage);
			}else{
				overallValue = Math.abs(playerDamage);
				playerDamage = 0;
				removeBadge(playerCard, "damage");
				removePlayerItem(playerCard,"weapon");
			}
		}

		if(playerHealth > 0){
			playSoundHit();
			animateIconHit(playerCard);
			playerHealth -= overallValue;
			if(playerHealth > 0){
				if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
					$.status["icon"+gameData.player].kill++;
				}else{
					playerData.kill++;
				}
				updateGameDisplay();

				overallValue = 0;
				updateBadgeValue(playerCard, "health", playerHealth);
			}else{
				overallValue = Math.abs(playerHealth);
				playerHealth = 0;
				updateBadgeValue(playerCard, "health", playerHealth);
			}
		}
	}
}

function playSoundHit(){
	var randomSound = Math.floor(Math.random()*3)+1;
	playSound("soundHit"+randomSound);
}

function updateCardBounce(playerCard, nextCard){
	var playerHealth = findBadgeValue(playerCard, "health");
	var playerDamage = findBadgeValue(playerCard, "damage");
	var playerShield = findBadgeValue(playerCard, "shield");

	if(nextCard.cardType == "chest"){
		if(playerCard.keyArr.length == 0){
			playSound("soundCardCancel");
			return true;
		}else{
			if(nextCard.iconA.spritesheet != null && nextCard.iconA.spritesheet.isSprite){
				nextCard.iconA.spritesheet.gotoAndPlay("on");
			}
			if(nextCard.iconB.spritesheet != null && nextCard.iconB.spritesheet.isSprite){
				nextCard.iconB.spritesheet.gotoAndPlay("on");
			}

			playSound("soundUnlock");
			playerCard.keyArr.length = 0;
			removePlayerItem(playerCard, "key");
			nextCard.unlock = true;
			return true;
		}
	}else if(nextCard.cardType == "barrel"){
		if(nextCard.iconA.spritesheet != null && nextCard.iconA.spritesheet.isSprite){
			nextCard.iconA.spritesheet.gotoAndPlay("on");
		}
		if(nextCard.iconB.spritesheet != null && nextCard.iconB.spritesheet.isSprite){
			nextCard.iconB.spritesheet.gotoAndPlay("on");
		}
		playSound("soundBarrel");
		return true;
	}else if(nextCard.cardType == "castle"){
		if(nextCard.iconA.spritesheet != null && nextCard.iconA.spritesheet.isSprite){
			nextCard.iconA.spritesheet.gotoAndPlay("on");
		}
		if(nextCard.iconB.spritesheet != null && nextCard.iconB.spritesheet.isSprite){
			nextCard.iconB.spritesheet.gotoAndPlay("on");
		}
		playSound("soundCastle");
		return true;
	}else if(nextCard.cardType == "enemy" || nextCard.cardType == "player"){
		var bounce = false;
		var loopValue = [
			{type:"shield", item:"shield", value:playerShield, sound:"soundShield"},
			{type:"damage", item:"weapon", value:playerDamage, sound:"soundSword"},
		];
		
		for(var n=0; n<loopValue.length; n++){
			var repeatLoop = false;
			var healthValue = findBadgeValue(nextCard, "health");
			var damageValue = findBadgeValue(nextCard, "damage");
			var shieldValue = findBadgeValue(nextCard, "shield");

			if(loopValue[n].value > 0){
				if(shieldValue > 0){
					animateSwoosh(nextCard);
					playSound(loopValue[n].sound);
					loopValue[n].value -= shieldValue;
					if(loopValue[n].value > 0){
						shieldValue = 0;
						updateBadgeValue(playerCard, loopValue[n].type, loopValue[n].value);
						updateBadgeValue(nextCard, "shield", 0);
						removeBadge(nextCard, "shield");
						removePlayerItem(nextCard,"shield");
						if(loopValue[n].value > 0){
							repeatLoop = true;
						}else{
							removePlayerItem(playerCard,loopValue[n].item);
						}
					}else{
						if(loopValue[n].value < 0){
							shieldValue = Math.abs(loopValue[n].value);
							updateBadgeValue(nextCard, "shield", shieldValue);
						}else{
							shieldValue = 0;
							removeBadge(nextCard, "shield");
							updateBadgeValue(nextCard, "shield", shieldValue);
							removePlayerItem(nextCard,"shield");
						}
						removeBadge(playerCard, loopValue[n].type);
						removePlayerItem(playerCard,loopValue[n].item);
					}
					bounce = true;
				}else if(damageValue > 0){
					animateSwoosh(nextCard);
					playSound(loopValue[n].sound);
					loopValue[n].value -= damageValue;
					if(loopValue[n].value > 0){
						damageValue = 0;
						updateBadgeValue(playerCard, loopValue[n].type, loopValue[n].value);
						updateBadgeValue(nextCard, "damage", 0);
						removeBadge(nextCard, "damage");
						removePlayerItem(nextCard,"weapon");
						if(loopValue[n].value > 0){
							repeatLoop = true;
						}else{
							removePlayerItem(playerCard,loopValue[n].item);
						}
					}else{
						if(loopValue[n].value < 0){
							damageValue = Math.abs(loopValue[n].value);
							updateBadgeValue(nextCard, "damage", damageValue);
						}else{
							damageValue = 0;
							removeBadge(nextCard, "damage");
							updateBadgeValue(nextCard, "damage", damageValue);
							removePlayerItem(nextCard,"weapon");
						}
						removeBadge(playerCard, loopValue[n].type);
						removePlayerItem(playerCard,loopValue[n].item);
					}
					bounce = true;
				}else if(healthValue > 0){
					animateSwoosh(nextCard);
					playSound(loopValue[n].sound);
					loopValue[n].value -= healthValue;
					if(loopValue[n].value > 0){
						if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
							var oppPlayer = gameData.player == 0 ? 1 : 0;
							$.status["icon"+oppPlayer].kill++;
						}else{
							playerData.kill++;
						}
						updateGameDisplay();
						healthValue = 0;
						updateBadgeValue(playerCard, loopValue[n].type, loopValue[n].value);
						updateBadgeValue(nextCard, "health", 0);
						playSoundHit();
						animateIconHit(nextCard);
						if(loopValue[n].value > 0){
							repeatLoop = true;
						}else{
							removePlayerItem(playerCard,loopValue[n].item);
						}
					}else{
						if(loopValue[n].value < 0){
							healthValue = Math.abs(loopValue[n].value);
							updateBadgeValue(nextCard, "health", healthValue);
						}else{
							if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
								var oppPlayer = gameData.player == 0 ? 1 : 0;
								$.status["icon"+oppPlayer].kill++;
							}else{
								playerData.kill++;
							}
							updateGameDisplay();
							healthValue = 0;
							updateBadgeValue(nextCard, "health", healthValue);
						}
						removeBadge(playerCard, loopValue[n].type);
						removePlayerItem(playerCard,loopValue[n].item);
						playSoundHit();
						animateIconHit(nextCard);
					}
					bounce = true;
				}

				if(repeatLoop){
					n--;
				}
			}
		}

		if(nextCard.cardType == "player" && !bounce){
			//only health
			var overallValue = playerHealth + playerDamage + playerShield;
			if(shieldValue > 0){
				playSoundHit();
				shieldValue -= overallValue;
				if(shieldValue > 0){
					overallValue = 0;
					updateBadgeValue(nextCard, "shield", shieldValue);
				}else{
					overallValue = Math.abs(shieldValue);
					removeBadge(nextCard, "shield");
					removePlayerItem(nextCard,"shield");
				}
				bounce = true;
			}

			if(damageValue > 0){
				playSoundHit();
				damageValue -= overallValue;
				if(damageValue > 0){
					overallValue = 0;
					updateBadgeValue(nextCard, "damage", damageValue);
				}else{
					overallValue = Math.abs(damageValue);
					damageValue = 0;
					removeBadge(nextCard, "damage");
					removePlayerItem(nextCard,"weapon");
				}
				bounce = true;
			}

			if(healthValue > 0){
				playSoundHit();
				animateIconHit(nextCard);
				healthValue -= overallValue;
				if(healthValue > 0){
					if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
						var oppPlayer = gameData.player == 0 ? 1 : 0;
						$.status["icon"+oppPlayer].kill++;
					}else{
						playerData.kill++;
					}
					updateGameDisplay();

					overallValue = 0;
					updateBadgeValue(nextCard, "health", healthValue);
					updateBadgeValue(playerCard, "health", overallValue);
				}else{
					if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
						$.status["icon"+gameData.player].kill++;
					}else{
						playerData.kill++;
					}
					overallValue = Math.abs(healthValue);
					healthValue = 0;
					updateBadgeValue(nextCard, "health", healthValue);
					updateBadgeValue(playerCard, "health", overallValue);
				}
				bounce = true;
			}
		}

		updateNumbersDisplay(playerCard);
		updateNumbersDisplay(nextCard);
		return bounce;
	}

	return false;
}

function findBadgeValue(nextCard, type){
	var badgeIndex = nextCard.badgesArr.findIndex(x => x.type === type);
	if(badgeIndex != -1){
		return nextCard.badgesArr[badgeIndex].value;
	}else{
		return 0;
	}
}

function updateBadgeValue(card, type, value){
	var badgeIndex = card.badgesArr.findIndex(x => x.type === type);
	if(badgeIndex != -1){
		card.badgesArr[badgeIndex].value = value;
	}

	var thisCard = $.card[card.row+'_'+card.column].target;
	thisCard.badges.removeAllChildren();
	
	updateBadgeDisplay(card);
}

function removeBadge(card, type){
	var badgeIndex = card.badgesArr.findIndex(x => x.type === type);
	if(badgeIndex != -1){
		card.badgesArr.splice(badgeIndex, 1);
	}

	updateBadgeDisplay(card);
}

function updateBadgeDisplay(card){
	createBadge(card);
	toggleCardBg(card);
}

/*!
 * 
 * CHECK NEXT STAGE - This is the function that runs for check next stage
 * 
 */
function checkNextStage(){
	gameData.moveCount++;

	var lastStageIndex = gameData.stageIndex;
	if(gameData.moveCount > gameData.stage.move){
		gameData.stageIndex++;
		gameData.stageIndex = gameData.stageIndex > cardPlaySettings.stage.length-1 ? cardPlaySettings.stage.length-1 : gameData.stageIndex;
	}

	if(lastStageIndex != gameData.stageIndex){
		prepareStage();
		gameData.playArr = [];
		gameData.eventArr = [];
		gameData.itemsArr = [];
		gameData.enemyArr = [];
		gameData.enemyRevealArr = [];
		gameData.chestRevealArr = [];
		gameData.barrelRevealArr = [];
		gameData.castleRevealArr = [];
		gameData.chestArr = [];
		gameData.keyArr = [];
		gameData.chestCountArr = [];
	}

	if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
		prepareCardContent(false);
	}else{
		prepareCardContent(false);
		gameData.moveCard = true;
	}
}

/*!
 * 
 * UPDATE GAME - This is the function that runs to loop game update
 * 
 */
function updateGame(event){
	if(!gameData.paused){
		var deltaS = event.delta / 1000;

		loopPlayerMovement();
		loopProton();
		focusPlayerCamera();
	}
}

function loopPlayerMovement(){
	for(var r=0; r<gameData.layout.row; r++){
		for(var c=0; c<gameData.layout.column; c++){
			var thisCard = $.card[r+'_'+c].target;
			if(thisCard.cardType == "player" || thisCard.cardType == "enemy"){
				thisCard.iconA.y = gameData.tween.movement.value;
				thisCard.weapon.y = gameData.tween.movement.value;
				thisCard.shield.y = gameData.tween.movement.value;
			}
		}
	}
}

/*!
 * 
 * GAME MISC LOOP - This is the function that runs for game loop
 * 
 */
function focusPlayerCamera(){
	if(gameData.dealCard){
		cardsMoveContainer.x = 0;
		cardsMoveContainer.y = 0;
	}else{
		if(viewport.isLandscape){
			gameData.mask = {
				row:3,
				column:6
			}
		}else{
			gameData.mask = {
				row:4,
				column:4
			}
		}

		gameData.maskW = ((gameData.mask.column) * cardDesign[gameData.cardIndex].width);
		gameData.maskW += ((gameData.mask.column-1) * cardDesign[gameData.cardIndex].margin);
		gameData.maskH = ((gameData.mask.row) * cardDesign[gameData.cardIndex].height);
		gameData.maskH += ((gameData.mask.row-1) * cardDesign[gameData.cardIndex].margin);

		var playerCard = $.card["player"+gameData.player];
		var newX = 0 - playerCard.x;
		var newY = 0 - playerCard.y;

		var startX = (gameData.mapW - gameData.maskW)/2;
		var endX = -startX;
		var startY = (gameData.mapH - gameData.maskH)/2;
		var endY = -startY;
		
		if(gameData.mapW > gameData.maskW){
			newX = newX > startX ? startX : newX;
			newX = newX < endX ? endX : newX;
		}else{
			newX = 0;
		}

		if(gameData.mapH > gameData.maskH){
			newY = newY > startY ? startY : newY;
			newY = newY < endY ? endY : newY;
		}else{
			newY = 0;
		}

		var speed = .2;
		TweenMax.to(cardsMoveContainer, speed, {x:newX, y:newY, overwrite:true});
	}
}

/*!
 * 
 * UPDATE GAME DISPLAY - This is the function that runs for game display
 * 
 */
function updateGameDisplay(){
	if ( typeof initSocket == 'function' && multiplayerSettings.enable && socketData.online) {
		$.status["coinTxt"+0].text = textDisplay.kill.replace("[NUMBER]", $.status["icon"+0].score);
		$.status["coinTxt"+1].text = textDisplay.kill.replace("[NUMBER]", $.status["icon"+1].score);

		$.status["killTxt"+0].text = textDisplay.kill.replace("[NUMBER]", $.status["icon"+0].kill);
		$.status["killTxt"+1].text = textDisplay.kill.replace("[NUMBER]", $.status["icon"+1].kill);
	}else{
		TweenMax.to(tweenData, .5, {tweenScore:playerData.score, overwrite:true, onUpdate:function(){
			$.status["coinTxt"+0].text = textDisplay.score.replace("[NUMBER]", Math.floor(tweenData.tweenScore));
		}});
		$.status["killTxt"+0].text = textDisplay.kill.replace("[NUMBER]", playerData.kill);
	}
}

/*!
 * 
 * GAME STATUS - This is the function that runs for game status
 * 
 */
function showGameStatus(status, delay, player){
	var textStatus = "";
	if(status == "gameover"){
		textStatus = textDisplay.gameOver;
	}else if(status == "turn"){
		if(gameData.player == socketData.gameIndex){
			textStatus = textDisplay.yourTurn;
		}else{
			textStatus = textDisplay.playerTurn.replace("[PLAYER]", $.status["playerNameTxt"+gameData.player].player);
		}
	}else if(status == "youdead"){
		textStatus = textDisplay.yourDead;
	}else if(status == "playerdead"){
		textStatus = textDisplay.playerDead.replace("[PLAYER]", $.status["playerNameTxt"+player].player);
	}

	gameStatusTxt.text = textStatus;
	TweenMax.to(gameStatusContainer, .5, {alpha:1, overwrite:true, onComplete:function(){
		TweenMax.to(gameStatusContainer, .5, {delay:delay, alpha:0, overwrite:true});
	}});
}

function showTutorialText(){
	if(!gameData.tutorialMode){
		return;
	}
	tutorialDescTxt.text = textDisplay.tutorial["step"+(gameData.tutorialIndex+1)];
	gameData.tutorialIndex++;

	if(gameData.tutorialIndex >= gameData.tutorialDirectionArr.length){
		gameData.moveCard = false;
		TweenMax.to(gameContainer, 4, {overwrite:true, onComplete:function(){
			stopGame();
			goPage('main')
		}});
	}
}

/*!
 * 
 * END GAME - This is the function that runs for game end
 * 
 */
function endGame(){
	gameData.over = true;
	gameData.moveCard = false;
	focusPlayerCard();
	playSound("soundFail");

	TweenMax.to(gameContainer, 4, {overwrite:true, onComplete:function(){
		goPage('result')
	}});
}

/*!
 * 
 * MILLISECONDS CONVERT - This is the function that runs to convert milliseconds to time
 * 
 */
function millisecondsToTimeGame(milli) {
	var milliseconds = milli % 1000;
	var seconds = Math.floor((milli / 1000) % 60);
	var minutes = Math.floor((milli / (60 * 1000)) % 60);
	
	if(seconds<10){
		seconds = '0'+seconds;  
	}
	
	if(minutes<10){
		minutes = '0'+minutes;  
	}
	
	return seconds;
}

/*!
 * 
 * OPTIONS - This is the function that runs to toggle options
 * 
 */

function toggleOption(){
	if(optionsContainer.visible){
		optionsContainer.visible = false;
	}else{
		optionsContainer.visible = true;
	}
}


/*!
 * 
 * OPTIONS - This is the function that runs to mute and fullscreen
 * 
 */
function toggleSoundMute(con){
	buttonSoundOff.visible = false;
	buttonSoundOn.visible = false;
	toggleSoundInMute(con);
	if(con){
		buttonSoundOn.visible = true;
	}else{
		buttonSoundOff.visible = true;	
	}
}

function toggleMusicMute(con){
	buttonMusicOff.visible = false;
	buttonMusicOn.visible = false;
	toggleMusicInMute(con);
	if(con){
		buttonMusicOn.visible = true;
	}else{
		buttonMusicOff.visible = true;	
	}
}

function toggleFullScreen() {
  if (!document.fullscreenElement &&    // alternative standard method
      !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement ) {  // current working methods
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    } else if (document.documentElement.msRequestFullscreen) {
      document.documentElement.msRequestFullscreen();
    } else if (document.documentElement.mozRequestFullScreen) {
      document.documentElement.mozRequestFullScreen();
    } else if (document.documentElement.webkitRequestFullscreen) {
      document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  }
}

/*!
 * 
 * SHARE - This is the function that runs to open share url
 * 
 */
function share(action){
	gtag('event','click',{'event_category':'share','event_label':action});
	
	var loc = location.href
	loc = loc.substring(0, loc.lastIndexOf("/") + 1);
	
	var title = '';
	var text = '';
	
	title = shareTitle.replace("[SCORE]", addCommas(playerData.score));
	text = shareMessage.replace("[SCORE]", addCommas(playerData.score));
	
	var shareurl = '';
	
	if( action == 'twitter' ) {
		shareurl = 'https://twitter.com/intent/tweet?url='+loc+'&text='+text;
	}else if( action == 'facebook' ){
		shareurl = 'https://www.facebook.com/sharer/sharer.php?u='+encodeURIComponent(loc+'share.php?desc='+text+'&title='+title+'&url='+loc+'&thumb='+loc+'share.jpg&width=590&height=300');
	}else if( action == 'google' ){
		shareurl = 'https://plus.google.com/share?url='+loc;
	}else if( action == 'whatsapp' ){
		shareurl = "whatsapp://send?text=" + encodeURIComponent(text) + " - " + encodeURIComponent(loc);
	}
}