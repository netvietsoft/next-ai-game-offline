let game;
let GAME_WIDTH = 640;
let GAME_HEIGHT = 960;
var currentLevel = 1;
var sfxactive = true;
var levelReached = null;
var bestScores = null;
var dataExist = null;
var soundBgVolume;

const concreteDensity = 0.005;
const concreteFrictionAir = 0.05;
const concreteFriction = 0.5;

	
window.addEventListener("load", eventWindowLoaded, false);		
function eventWindowLoaded() {
	// our phaser game configuration
	let gameConfig = {
		type: Phaser.AUTO,
		scale: {
			mode: Phaser.Scale.FIT,
			autoCenter: Phaser.Scale.CENTER_BOTH,
			parent: "thegame",
			width: 640,
			height: 960
		},
		physics: {
			// using matter.js engine
			default: 'matter',
			matter: {
				debug: false
			}
		},
		// we use multiple scene for this game, boot, preloader, home/main menu, level scene, and gameplay scene
		// to switch between scenes, you can use "this.scene.start(...)"
		scene: [Boot, Preloader, MainMenu, Level, Gameplay]
	}
	game = new Phaser.Game(gameConfig);
}

// BOOT SCENE //////////////////////////////////////////////////////////////////////////////////// 
class Boot extends Phaser.Scene {
  constructor() {
    super("boot");
  }
  preload() {
	this.load.image('loaderShp','assets/preloader.png');
	this.load.image('loaderBack', 'assets/loaderBack.png');
}
  create() {
	this.input.maxPointers = 1;
	this.scene.start("loader");
  }
}

// PRELOADER SCENE ////////////////////////////////////////////////////////////////////////////////////
class Preloader extends Phaser.Scene {
    constructor() {
        super("loader");
    }
    
    preload() {
		// preloader UI
		this.loaderBackSprite= this.add.sprite(0,0,'loaderBack');
		this.loaderBackSprite.setOrigin(0, 0);
		this.loaderSprite = this.add.sprite(78,GAME_HEIGHT-200, 'loaderShp').setOrigin(0, 0).setScale(0,1);
		
		// load all assets
		this.load.image('back', 'assets/background.png');
		this.load.image('title', 'assets/title.png' );
		this.load.image("ground", 'assets/ground.png');
		this.load.image("grass", 'assets/grass.png');
		this.load.image("concrete_ver", 'assets/concrete_ver.png');
		this.load.image("concrete_ver_sub", 'assets/concrete_ver_sub.png');
		this.load.image("concrete_hor", 'assets/concrete_hor.png');
		this.load.image("concrete_hor_sub", 'assets/concrete_hor_sub.png');
		this.load.image("concrete_ver_min", 'assets/concrete_ver_min.png');
		this.load.image("concrete_hor_min", 'assets/concrete_hor_min.png');
		this.load.image("endscreen", 'assets/endscreen.png');
		this.load.image('metal_hor','assets/metal_hor.png');
		this.load.image('metal_hor_min','assets/metal_hor_min.png');
		this.load.image('metal_ver','assets/metal_ver.png');
		this.load.image('metal_ver_min','assets/metal_ver_min.png');
		this.load.image('hint1','assets/hint1.png');
		this.load.image('hint2','assets/hint2.png');
		this.load.image("sensor", 'assets/sensor.png');
		this.load.image('greenline', 'assets/greenline.png' );
		this.load.image('dynamite', 'assets/dynamite.png' );
		
		this.load.spritesheet('detonator', 'assets/button_detonator.png', {frameWidth:154,frameHeight:197});
		this.load.spritesheet('btn_nextprevious', 'assets/button_nextprevious.png', {frameWidth:52,frameHeight: 72});
		this.load.spritesheet('btn_start', 'assets/button_start.png', {frameWidth:151,frameHeight: 151});
		this.load.spritesheet('btn_levelmenu', 'assets/button_levelmenu.png',	{frameWidth:131,frameHeight: 131});
		this.load.spritesheet('btn_retry', 'assets/button_retry.png', {frameWidth:131,frameHeight: 131});
		this.load.spritesheet('btn_Level', 'assets/button_level.png', {frameWidth:125,frameHeight: 156});
		this.load.spritesheet('btn_mainmenu', 'assets/button_mainmenu.png', {frameWidth:131,frameHeight: 131});
		this.load.spritesheet('btn_sfx', 'assets/button_sfx.png', {frameWidth:131,frameHeight: 131});
		
		this.load.spritesheet('explode', 'assets/explode.png', {frameWidth:160,frameHeight:125});
		this.load.spritesheet('timers', 'assets/timers.png', {frameWidth:84,frameHeight:85});
		this.load.json('myJsonObj', 'script/levels.json');
		
		this.load.bitmapFont('thisfont', 'assets/myfont1.png', 'assets/myfont1.fnt');
		
		this.load.audio('button_sound_1','assets/audio/button_sound.ogg');
		this.load.audio('detonator_sound_1','assets/audio/detonator_sound.ogg');
		this.load.audio('dynamite_sound_1','assets/audio/dynamite_sound.ogg');
		this.load.audio('explode1_1','assets/audio/explode1.ogg');
		this.load.audio('explode2_1','assets/audio/explode2.ogg');
		this.load.audio('explode3_1','assets/audio/explode3.ogg');
		this.load.audio('win_sound_1','assets/audio/win_sound.ogg');
		this.load.audio('woosh_sound_1','assets/audio/woosh_sound.ogg');
		this.load.audio('drum_1','assets/audio/rolldrum.ogg');
		this.load.audio('backsound_1','assets/audio/backsound.ogg');
		
		this.load.on('progress', this.onProgress, this);
		this.load.on('complete', this.onCompleteLoad,this);
    }
	// triggered when you tap/click the screen
	onTapToContinue(){
		soundBgVolume = 1;
		SoundLoop(soundBgVolume);
		this.scene.start('mainmenu');	
	}
	onProgress(){
		var loaderObj = this.load;
		var total = loaderObj.totalToLoad;
		var remainder = loaderObj.list.size + loaderObj.inflight.size;
		var progress = 1 - (remainder / total);
		this.loaderSprite.setScale(progress,1);
	}
	onCompleteLoad(){
		var continueTxt = this.add.bitmapText(170, GAME_HEIGHT-300, 'thisfont',"", 40);
		continueTxt.setText("Tap to continue");
		this.input.on("pointerup", this.onTapToContinue, this);
	}
}

// HOME SCENE / MAIN MENU CLASS ////////////////////////////////////////////////////////////////////////////////////
class MainMenu extends Phaser.Scene {
	constructor() {
		super("mainmenu");
	}
	create() {
		soundBgVolume = 1;
		if (windoW.listSound["backsound"]) {
			windoW.listSound["backsound"].volume = soundBgVolume;
		}
		// Add background and game logo
		this.background=this.add.sprite(0,0, 'back');
		this.background.setOrigin(0,0);
		this.title=this.add.sprite((GAME_WIDTH/2)+20,-200,'title');
		
		// add play button
		this.playBtn = this.add.sprite(-200, 550, 'btn_start')
			.setInteractive({ useHandCursor: true })
			.on("pointerover", 	() =>	this.playBtn.setFrame(1))
			.on("pointerdown", 	() =>	this.playBtn.setFrame(2))
			.on("pointerout", 	() =>	this.playBtn.setFrame(0))
			.on("pointerup",function(){	this.playBtn.setFrame(0); this.clickPlayBtn(); },this);
		
		// In-frame animation for game logo and play button 
		this.tweens.add({
			targets: this.title,
			y: 250,
			ease: 'Bounce',
			duration: 1000
		});
		this.tweens.add({
			targets: this.playBtn,
			x: GAME_WIDTH/2,
			ease: 'Bounce',
			duration: 1500
		});

		// add sound button
		this.soundBtn = this.add.sprite(15, 15, 'btn_sfx')
			.setOrigin(0,0)
			.setScale(0.6,0.6)
			.setInteractive({ useHandCursor: true })
			.on("pointerup", this.onSound,this);
		if (!sfxactive) {this.soundBtn.setFrame(1);}
		
		// Get game data from local storage (level progress and best scores)
		if (typeof(Storage) !== "undefined") {
			dataExist = localStorage.getItem("dataIsExist");
			if (dataExist) {
				levelReached = localStorage.getItem('savedLevelReached');
				bestScores = JSON.parse(localStorage.getItem("savedBestScore"));
				console.log('data exist');
			} else {
				levelReached = 1;//1
				bestScores = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
				dataExist = true;
				console.log('data not exist');
				localStorage.setItem("dataIsExist", dataExist);
				localStorage.setItem("savedLevelReached", levelReached);
				localStorage.setItem("savedBestScore", JSON.stringify(bestScores));
			}
		} else {
			levelReached = 1;//1
			bestScores = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
			console.log('localStorage not exist')
		}
	}
	// Triggered when sound button is clicked
	onSound() {
		if (this.soundBtn.frame.name==1) {
			this.soundBtn.setFrame(0);
			SoundLoop(soundBgVolume);
			sfxactive=true;
		} else {
			this.soundBtn.setFrame(1);
			StopSound();
			sfxactive=false;
		}
	} 
	// Triggered when play button is clicked
	clickPlayBtn() {
		if (sfxactive) {
			Sound("button_sound");
		}
		// out of frame animation for game logo and play button 
		this.tweens.add({
			targets: this.title,
			y: -200,
			ease: 'Back.In',
			duration: 800
		});
		this.tweens.add({
			targets: this.playBtn,
			x: 800,
			ease: 'Back.In',
			duration: 1000,
			onComplete: this.startGame.bind(this)
		});
	}
	// Triggered when play button animation is completed
	startGame() {
		this.soundBtn.destroy();
		this.scene.start('level');
	}
}

//  LEVEL SCENE CLASS ////////////////////////////////////////////////////////////////////////////////////
class Level extends Phaser.Scene {
	constructor() {
		super("level");
	}
	init(){
		
	}
	create(){
		soundBgVolume = 1;
		if (windoW.listSound["backsound"]) {
			windoW.listSound["backsound"].volume = soundBgVolume;
		}
		this.background=this.add.sprite(0,0, 'back').setOrigin(0,0);
		
		this.clickEnabled=true;
	
		this.selectLevelText = this.add.bitmapText(-200,120,'thisfont','Select Level',60).setOrigin(0,0);
		
		// Add level buttons
		this._levelGroup = null;
		this._levelGroup = this.add.group();
		this.createBtn();
		
		// Add navigation buttons for showing level buttons, left to right, or vice versa
		this.nextBtn = this.add.sprite(-200, (GAME_HEIGHT/2)+50, 'btn_nextprevious')
			.setInteractive({ useHandCursor: true })
			.on("pointerover", 	() =>	this.nextBtn.setFrame(1)) 
			.on("pointerdown", 	() =>	this.nextBtn.setFrame(2))
			.on("pointerout", 	() =>	this.nextBtn.setFrame(0))
			.on("pointerup",function(){	this.nextBtn.setFrame(0); this.clickNextBtn(); },this);
		this.previousBtn = this.add.sprite(-200, (GAME_HEIGHT/2)+50, 'btn_nextprevious')
			.setInteractive({ useHandCursor: true })
			.on("pointerover", 	() =>	this.previousBtn.setFrame(1))
			.on("pointerdown", 	() =>	this.previousBtn.setFrame(2))
			.on("pointerout", 	() =>	this.previousBtn.setFrame(0))
			.on("pointerup",function(){	this.previousBtn.setFrame(0); this.clickPreviousBtn(); },this);
			
		this.previousBtn.angle=180;
		
		// add home button
		this.menuBtn = this.add.sprite(105,  -200, 'btn_mainmenu')
			.setOrigin(0,0)
			.setScale(0.6,0.6)
			.setInteractive({ useHandCursor: true })
			.on("pointerover", 	() =>	this.menuBtn.setFrame(1))
			.on("pointerdown", 	() =>	this.menuBtn.setFrame(2))
			.on("pointerout", 	() =>	this.menuBtn.setFrame(0))
			.on("pointerup",function(){	this.menuBtn.setFrame(0); this.onMenu(); },this);
		
		// In-frame animation 
		this.tweens.add({targets: this.menuBtn, y: 15, ease: 'Bounce.Out', duration: 1000 });
		this.tweens.add({targets: this.selectLevelText, x: 130, ease: 'Bounce.Out', duration: 1200 });
		this.tweens.add({targets: this.nextBtn, x: 580, ease: 'Back.Out', duration: 1000 });
		this.tweens.add({targets: this.previousBtn, x: 700, ease: 'Back.Out', duration: 1000 });
		
		// add sound button
		this.soundBtn = this.add.sprite(15, 15, 'btn_sfx')
			.setOrigin(0,0)
			.setScale(0.6,0.6)
			.setInteractive({ useHandCursor: true })
			.on("pointerup", this.onSound,this);
		if (!sfxactive) {this.soundBtn.setFrame(1);}
	}
	
	// Triggered when sound button is clicked
	onSound() {
		if (this.soundBtn.frame.name==1) {
			this.soundBtn.setFrame(0);
			SoundLoop(soundBgVolume);
			sfxactive=true;
		} else {
			this.soundBtn.setFrame(1);
			StopSound();
			sfxactive=false;
		}
	}
	
	// Create 24 level buttons
	createBtn(){
		var no = 0;
		for (var i=1;i<25;i++) {
			no++;
			var levelBtn;
			if (no <= levelReached){
				levelBtn= this.add.sprite(0,0,'btn_Level',no);
				levelBtn.no=no;
				levelBtn.setInteractive({ useHandCursor: true });
				levelBtn.on("pointerup",this.clickLevelBtn,this);
				this._levelGroup.add(levelBtn);
			} else {
				levelBtn= this.add.sprite(0,0,'btn_Level',0);
				this._levelGroup.add(levelBtn);
			}
			levelBtn.setOrigin(0,0);
			
			if(i<4){
				levelBtn.initX = 100+(140*(i-1));
				levelBtn.y= 200;
			};
			if(i>3 && i<7){
				levelBtn.initX = 100+(140*(i-4));
				levelBtn.y= 200+(170*1);
			};
			if(i>6 && i<10){
				levelBtn.initX = 100+(140*(i-7));
				levelBtn.y= 200+(170*2);
			};
			if(i>9 && i<13){
				levelBtn.initX = 100+(140*(i-10));
				levelBtn.y= 200+(170*3);
			};
			
			if(i>12 && i<16){
				levelBtn.initX = (GAME_WIDTH+140)+(140*(i-13));
				levelBtn.y= 200;
			};
			if(i>15 && i<19){
				levelBtn.initX = (GAME_WIDTH+140)+(140*(i-16));
				levelBtn.y= 200+(170*1);
			};
			if(i>18 && i<22){
				levelBtn.initX = (GAME_WIDTH+140)+(140*(i-19));
				levelBtn.y= 200+(170*2);
			};
			if(i>21 && i<25){
				levelBtn.initX = (GAME_WIDTH+140)+(140*(i-22));
				levelBtn.y= 200+(170*3);
			};
			levelBtn.x= levelBtn.initX-700;
			this._levelGroup.children.iterate(function(item){
				this.tweens.add({targets: item, x: item.initX, ease: 'Back.Out', duration: 1000 });
			}, this);
		};
	}
	
	//Triggered when one of level buttons is clicked
	clickLevelBtn(pointer) {
		if (this.clickEnabled) {
			if (sfxactive) {
				Sound("button_sound");
			}
			this._levelGroup.children.iterate(function(item){
				var boundingBox = item.getBounds();
				if(Phaser.Geom.Rectangle.Contains(boundingBox, pointer.x, pointer.y)){
					currentLevel=item.no;
				}
			}, this);
			
			// out of frame animation 
			this.tweens.add({targets: this.menuBtn, y: -200, ease: 'Back.In', duration: 1000, onComplete: this.playGame.bind(this) });
			this.tweens.add({targets: this.nextBtn, alpha: 0, ease: 'Linear.None', duration: 200 });
			this.tweens.add({targets: this.previousBtn, alpha: 0, ease: 'Linear.None', duration: 200 });
			this.tweens.add({targets: this.selectLevelText, x: -700, ease: 'Back.In', duration: 700 });
			
			this._levelGroup.children.iterate(function(item){
				this.tweens.add({targets: item, x: item.initX+700, ease: 'Back.In', duration: 1000 });
			}, this);
			
			this.clickEnabled = false;
		}
	}
	// Triggered when navigation button is clicked
	clickNextBtn(){
		if (sfxactive) {	
			Sound("woosh_sound");
		}
		this._levelGroup.children.iterate(function(item){
			this.tweens.add({targets: item, x: item.initX-GAME_WIDTH, ease: 'Back.Out', duration: 1000 });
		}, this);
		this.tweens.add({targets: this.nextBtn,  x: (-GAME_WIDTH+580), ease: 'Back.Out', duration: 1000 });
		this.tweens.add({targets: this.previousBtn,  x: (-GAME_WIDTH+700), ease: 'Back.Out', duration: 1000 });
	}
	// Triggered when navigation button is clicked
	clickPreviousBtn(){
		if (sfxactive) {
			Sound("woosh_sound");
		}
		this._levelGroup.children.iterate(function(item){
			this.tweens.add({targets: item, x: item.initX-0, ease: 'Back.Out', duration: 1000 });
		}, this);
		this.tweens.add({targets: this.nextBtn,  x: 580, ease: 'Back.Out', duration: 1000 });
		this.tweens.add({targets: this.previousBtn,  x: 700, ease: 'Back.Out', duration: 1000 });
	}
	// Once the level button is pressed, the game starts.
	playGame() {
		this.nextBtn.destroy();
		this.previousBtn.destroy();
		this.selectLevelText.destroy();
		this._levelGroup.destroy();
		this.menuBtn.destroy();
		this.soundBtn.destroy();
		this.scene.start("gameplay");
	}
	// Triggered when home button is clicked
	onMenu() {
		if (this.clickEnabled) {
			if (sfxactive) {
				Sound("button_sound");
			}
			this.tweens.add({targets: this.menuBtn, y: -200, ease: 'Back.In', duration: 1000, onComplete: this.backToMenu.bind(this)  });
			this.tweens.add({targets: this.nextBtn, alpha: 0, ease: 'Linear.None', duration: 200 });
			this.tweens.add({targets: this.previousBtn, alpha: 0, ease: 'Linear.None', duration: 200 });
			this.tweens.add({targets: this.selectLevelText, x: -300, ease: 'Back.In', duration: 700 });
			this._levelGroup.children.iterate(function(item){
				this.tweens.add({targets: item, x: item.initX+700, ease: 'Back.In', duration: 800 });
			}, this);
			
			this.clickEnabled = false;
		}
	}
	// Once home button animation is completed, the scene back to home menu.
	backToMenu() {
		this.nextBtn.destroy();
		this.previousBtn.destroy();
		this.selectLevelText.destroy();
		this._levelGroup.destroy();
		this.menuBtn.destroy();
		this.soundBtn.destroy();
		this.scene.start("mainmenu");
	}
}



//////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
/////////////////// GAMEPLAY CLASS ///////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////// 
//////////////////////////////////////////////////////////////////////////////////////
 
var boom;
var drag;
const offset=80;
var maxDynamite;
var	highLimit;
var	clickEnabled;
var	init_x;
var	init_y;
var addInput = true;
var isOverDetonator = false;
var isOverBtnSound = false;
var isOverBtnReset = false;

var grass,detonator,scoreTxt,levelTxt, calibrateYellowLine, bestTxt;
		
class Gameplay extends Phaser.Scene {
	constructor() {
		super("gameplay");
	}
	init(){
		addInput = true;
	}
	create() {
		Android.levelStartInGame(currentLevel);
		// Android.levelStartInGame(currentLevel);
		soundBgVolume = 0.5;
		if (windoW.listSound["backsound"]) {
			windoW.listSound["backsound"].volume = soundBgVolume;
		}
		boom=true;
		drag=false;
		maxDynamite=null;
		highLimit=null;
		clickEnabled=true;
		
		isOverDetonator = false;
		isOverBtnSound = false;
		isOverBtnReset = false;
		
		this.concretes=[];
		this.concretesHeight= [];
		this.usedDynamite=0;
		this.timerStep=null;
		this.dynamite_id=[];
		this.dynamite_point_x= [];
		this.dynamite_point_y= [];
		this.dynamiteOnConcrete= [];
		this.dynamiteOnTop = [];
		this.end=false;
		this.endstep=0;
		this.score=0;
		calibrateYellowLine=0;
		
		var TotalBom =  [3,   4,   3,   3,   5,   3,   3,   3,   3,   2,   4,   3,   3,   6,   4,   4,   5,   3,   3,   5,   5,   3,   6,   4]
		var MaxHeight = [600, 620, 620, 630, 620, 630, 630, 600, 620, 620, 600, 620, 600, 590, 600, 630, 610, 650, 600, 630, 620, 630, 610, 620]
		
		this.background=this.add.sprite(0,0, 'back').setOrigin(0,0);
		
		// Define the physics world
		this.matter.world.setBounds(-1600, -300, 3200, 1500);
		this.matter.world.resume();
		
		//Add ground
		this.ground = this.matter.add.image(GAME_WIDTH/2,GAME_HEIGHT-75, 'ground', null, { isStatic: true });
		
		// Retrieve json data for building structure, total dynamites and the height limit
		var JsonData = this.cache.json.get('myJsonObj');
		var totalConcrete = JsonData['level_'+currentLevel].totalConcrete;
		maxDynamite = TotalBom[currentLevel-1];
		
		// Add height limit
		highLimit = MaxHeight[currentLevel-1];
		this.limit =this.add.sprite(0,highLimit,'greenline').setOrigin(0,0);
		
		var stone;
		// Add concretes
		for (var i=0; i<totalConcrete ;i++) {
		 	var concreteName = JsonData['level_'+currentLevel].name[i];
			if (concreteName=='ver'){
				stone = this.matter.add.sprite(JsonData['level_'+currentLevel].x[i], JsonData['level_'+currentLevel].y[i], "concrete_ver");
			}
			if (concreteName=='hor'){
				stone = this.matter.add.sprite(JsonData['level_'+currentLevel].x[i], JsonData['level_'+currentLevel].y[i], "concrete_hor");
			}
			if (concreteName=='ver_min'){
				stone = this.matter.add.sprite(JsonData['level_'+currentLevel].x[i], JsonData['level_'+currentLevel].y[i], "concrete_ver_min");
			}
			if (concreteName=='hor_min'){
				stone = this.matter.add.sprite(JsonData['level_'+currentLevel].x[i], JsonData['level_'+currentLevel].y[i], "concrete_hor_min");
			}
			if (concreteName=='m_ver'){
				stone = this.matter.add.sprite(JsonData['level_'+currentLevel].x[i], JsonData['level_'+currentLevel].y[i], "metal_ver");
			}
			if (concreteName=='m_hor'){
				stone = this.matter.add.sprite(JsonData['level_'+currentLevel].x[i], JsonData['level_'+currentLevel].y[i], "metal_hor");
			}
			if (concreteName=='m_ver_min'){
				stone = this.matter.add.sprite(JsonData['level_'+currentLevel].x[i], JsonData['level_'+currentLevel].y[i], "metal_ver_min");
			}
			if (concreteName=='m_hor_min'){
				stone = this.matter.add.sprite(JsonData['level_'+currentLevel].x[i], JsonData['level_'+currentLevel].y[i], "metal_hor_min");
			}
			stone.name = concreteName;
			stone.z = i;
			stone.untagged = true;
						
			stone.setFriction(concreteFriction);
			stone.setFrictionAir(concreteFrictionAir);
			stone.setDensity(concreteDensity);
			stone.setAngle(JsonData['level_'+currentLevel].rot[i]);
			
			if (concreteName=='m_ver'||concreteName=='m_hor'||concreteName=='m_ver_min'||concreteName=='m_hor_min') {
				//stone.body.mass=2;
			}
			this.concretes.push(stone);
		}
		
		// Add grass sprite
		grass=this.add.sprite(100,760, 'grass').setOrigin(0,0);
		
		// Add detonator
		detonator=this.add.sprite(480,20, 'detonator').setOrigin(0,0)
			.setInteractive({ useHandCursor: true })
			.on("pointerover"	,function(){detonator.setFrame(0); isOverDetonator = true;}, this)
			.on("pointerout"	,function(){detonator.setFrame(0); isOverDetonator = false;}, this)
			.on("pointerdown"	,function(){detonator.setFrame(1); isOverDetonator = true; this.onBoom();}, this)
			.on("pointerup",function(){isOverDetonator = false; this.onBoomUp();}, this);
		
		// add reset button
		this.resetBtn = this.add.sprite(105,  15, 'btn_retry')
			.setOrigin(0,0)
			.setScale(0.6,0.6)
			.setInteractive({ useHandCursor: true })
			.on("pointerover"	,function(){this.resetBtn.setFrame(1); isOverBtnReset = true;}, this)
			.on("pointerout"	,function(){this.resetBtn.setFrame(0); isOverBtnReset = false;}, this)
			.on("pointerdown", 	function(){this.resetBtn.setFrame(2); isOverBtnReset = true;}, this)
			.on("pointerup",function(){	this.resetBtn.setFrame(0); isOverBtnReset = false; this.onResetGameplay(); },this);
		
		// add sound button
		this.soundBtn = this.add.sprite(15, 15, 'btn_sfx')
			.setOrigin(0,0)
			.setScale(0.6,0.6)
			.setInteractive({ useHandCursor: true })
			.on("pointerover", function(){isOverBtnSound = true;})
			.on("pointerout", function(){isOverBtnSound = false;})
         .on("pointerdown", function(){isOverBtnSound = true;})
			.on("pointerup", function(){isOverBtnSound = false; this.onSound()}, this);
		if (!sfxactive) {this.soundBtn.setFrame(1);}
		
		// add yellow line
		this.sensor =this.add.sprite(0,-100,'sensor').setOrigin(0,0);
		
		// Add tutorial texts
		if (currentLevel == 1) this.hint1 =this.add.sprite(0,0,'hint1').setOrigin(0,0);
		if (currentLevel == 3) this.hint1 =this.add.sprite(0,0,'hint2').setOrigin(0,0);
		
		// Add dynamits
		for (var m=maxDynamite; m>0 ;m--) {
			var dynamite=this.add.sprite(220+(35*m),40, 'dynamite');
			dynamite.initX = 220+(35*m);
			dynamite.initY = 40;
			this.dynamiteOnTop.push(dynamite);
		}
		// Set the input for taking the dynamits
		if (addInput) {
			this.input.on("pointerdown",this.onInputDown,this);
			this.input.on("pointerup",this.onInputUp, this);
			addInput = false;
		}
		
		// Add score text and current level text
		scoreTxt = this.add.bitmapText(30, this.sensor.y-40, 'thisfont',"", 40);
		levelTxt = this.add.bitmapText(35, 880, 'thisfont',"", 40).setOrigin(0,0);
		levelTxt.setText('LEVEL '+currentLevel.toString());	
	}
	
	// Triggered when sound button is clicked
	onSound(){
		drag = false;
		if (this.soundBtn.frame.name==1) {
			this.soundBtn.setFrame(0);
			SoundLoop(soundBgVolume);
			sfxactive=true;
		} else {
			this.soundBtn.setFrame(1);
			StopSound();
			sfxactive=false;
		}
	}
	
	// Triggered when reset button is clicked
	onResetGameplay(){
		drag = false;
		if (this.endstep==0) {
			if (sfxactive) {
				Sound("button_sound");
			}
			
			detonator.input.enable = false;
	
			this.limit.destroy();
			this.sensor.destroy();
			if (currentLevel == 1 || currentLevel == 3) this.hint1.destroy();

			for (var i=0; i<this.concretes.length ;i++) {
				this.concretes[i].destroy();
			}
			for (var j=0; j<this.dynamiteOnConcrete.length ;j++) {
				this.dynamiteOnConcrete[j].destroy();
			}
			for (var h=0; h<this.dynamiteOnTop.length ;h++) {
				this.dynamiteOnTop[h].destroy();
			}
			detonator.destroy();
			scoreTxt.destroy();
			levelTxt.destroy();
			this.background.destroy();
			grass.destroy();
			this.ground.destroy();
			this.soundBtn.destroy();
			this.resetBtn.input.enable = false;
			this.resetBtn.destroy();
			
			this.create();
		}
	}
	// Looping condition
	update() {
		if (calibrateYellowLine<20) calibrateYellowLine++;
		if (calibrateYellowLine==10){
			
			this.matter.world.pause();

			for (var i=0; i<this.concretes.length ;i++){
				this.concretesHeight.push(Math.round(this.concretes[i].getBounds().y));
			}
			this.sensor.y=Math.min.apply(Math, this.concretesHeight);
		}
		if (!this.end) {
			if (drag) {				
				this.dynamiteOnTop[this.usedDynamite].x=this.input.x-offset;
				this.dynamiteOnTop[this.usedDynamite].y=this.input.y-offset;
			}
		}
		if (this.end) {
			if (this.timerStep==this.usedDynamite) {
				for (var j=0; j<this.concretes.length ;j++){
					this.concretesHeight.push(Math.round(this.concretes[j].getBounds().y));
				}
				this.sensor.y=Math.min.apply(Math, this.concretesHeight);
				
				var scoretext = GAME_HEIGHT-this.sensor.y;
				scoreTxt.setText(scoretext.toString());
				this.concretesHeight=[];

			}
			scoreTxt.y=this.sensor.y-45;
			this.endstep++;
		}
		
		// add circle timer
		if (this.endstep==30) {
			this.anims.create({
				key: "timerstart",
				frameRate: 4,
				frames: this.anims.generateFrameNumbers("timers", { start: 0, end: 29 }),
				repeat: 0
			});
			this.endtimer = this.add.sprite(320,300, 'timers').setAlpha(0);
			this.tweens.add({targets: this.endtimer, alpha: 1, ease: 'Linear.None', duration: 500});
			this.endtimer.play("timerstart");
		}
		if (this.endstep==500) {
			this.matter.world.pause();
		}
		
		// Show game over scene
		if (this.endstep>550) {
			this.showEndScreen();
			this.end=false;
			this.endstep=1;
		}
	}
	
	// Triggered when the stage is pressed, pickup a dynamite
	onInputDown(){
		if (isOverDetonator || isOverBtnSound || isOverBtnReset) return;
		if (this.endstep>0) return;
		if (this.usedDynamite == maxDynamite) return;
		this.children.bringToTop(this.dynamiteOnTop[this.usedDynamite]);
		drag=true;
	}
	
	// Check the condition, when the dynamite is placed on the concrete
	onInputUp(pointer){
		if (isOverDetonator || isOverBtnSound || isOverBtnReset) return;
		if (this.endstep>0) return;
		if (this.usedDynamite == maxDynamite) return;
		drag = false;
		this.dynamiteOnTop[this.usedDynamite].x = this.dynamiteOnTop[this.usedDynamite].initX;
		this.dynamiteOnTop[this.usedDynamite].y = this.dynamiteOnTop[this.usedDynamite].initY;;
		var dynamitePosition = {'x': pointer.x-offset, 'y': pointer.y-offset};
		var bodiesUnderPointer = Phaser.Physics.Matter.Matter.Query.point(this.matter.world.localWorld.bodies, dynamitePosition);

		if (bodiesUnderPointer.length==0 ){
			
		} else {
			var bodySprite = bodiesUnderPointer[0].gameObject;
			if (boom && bodySprite.untagged && !bodySprite.unbreakable && (bodySprite.name=='hor' || bodySprite.name=='ver' || bodySprite.name=='hor_min' || bodySprite.name=='ver_min')){
				if (sfxactive) {
					Sound("dynamite_sound");
				}
				
				this.dynamiteOnTop[this.usedDynamite].destroy();
				
				var px=pointer.x-offset;
				var py=pointer.y-offset;
				var sx=bodySprite.x;
				var sy=bodySprite.y;
				
				if (bodySprite.name=='ver') {
					if ((py<(sy+45))&&(py>(sy-45))) {
						var dynamite=this.add.sprite(sx, py, 'dynamite');
					} else {
						if (py>=(sy+45)) {dynamite=this.add.sprite(sx, sy+45, 'dynamite');}//bawah
						if (py<=(sy-45)) {dynamite=this.add.sprite(sx, sy-45, 'dynamite');}//atas
					}
				}
				if (bodySprite.name=='hor') {
					if ((px<(sx+105))&&(px>(sx-105))) {
						dynamite=this.add.sprite(px, sy, 'dynamite');
					} else {
						if (px>=(sx+105)) {dynamite=this.add.sprite(sx+105,sy, 'dynamite');}//bawah
						if (px<=(sx-105)) {dynamite=this.add.sprite(sx-105,sy, 'dynamite');}//atas
					}
					dynamite.setAngle(90);
				}
				if (bodySprite.name=='ver_min') {
					if ((py<(sy+15))&&(py>(sy-15))) {
						dynamite=this.add.sprite(sx, py, 'dynamite');
					} else {
						if (py>=(sy+15)) {dynamite=this.add.sprite(sx, sy+15, 'dynamite');}//bawah
						if (py<=(sy-15)) {dynamite=this.add.sprite(sx, sy-15, 'dynamite');}//atas
					}
				}
				if (bodySprite.name=='hor_min') {
					if ((px<(sx+45))&&(px>(sx-45))) {
						dynamite=this.add.sprite(px, sy, 'dynamite');
					} else {
						if (px>=(sx+45)) {dynamite=this.add.sprite(sx+45,sy, 'dynamite');}//bawah
						if (px<=(sx-45)) {dynamite=this.add.sprite(sx-45,sy, 'dynamite');}//atas
					}
					dynamite.setAngle(90);
				}
				var rot=Math.abs(bodySprite.angle);
				
				this.dynamiteOnConcrete.push(dynamite);
				this.dynamite_id.push(bodySprite.z);
				this.dynamite_point_x.push(px);
				this.dynamite_point_y.push(py);
				bodySprite.untagged=false;
				this.usedDynamite++;
			};
		}
	}
	// Triggered when the detonator is pressed
	onBoom(){
		drag = false;
	}
	
	// Triggered when the detonator is released
	onBoomUp(){
		detonator.setFrame(1);
		setTimeout(function(){
			detonator.setFrame(0); 
		},200)
		if (boom && this.usedDynamite>0) {
			if (currentLevel == 1 || currentLevel == 3) this.hint1.destroy();
			
			this.matter.world.resume();
			drag=false;
			this.timerStep=0;
			
			// Execute the dynamite explosion every 0.1 seconds
			this.delay = setInterval(this.exploding.bind(this),100);
			
			this.tweens.add({targets: this.resetBtn, y: -200, ease: 'Back.In', duration: 100 });
			boom = false;
		}
	}
	// Dynamite explosion
	exploding(){
		if (sfxactive) {
			var explodingType = 1+Math.round(Math.random()*2);
			if (explodingType==1){ Sound("explode1");};
			if (explodingType==2){ Sound("explode2");};
			if (explodingType==3){ Sound("explode3");};
		}
		this.anims.create({
			key: "start",
			frameRate: 30,
			frames: this.anims.generateFrameNumbers("explode", { start: 0, end: 10 }),
			repeat: 0
		});
		var tc=this.timerStep;
		for (var i=0; i<this.concretes.length ;i++) {
			if (this.concretes[i].z == this.dynamite_id[tc]) {
				
				this.bom = this.add.sprite(this.dynamite_point_x[tc],this.dynamite_point_y[tc], 'explode');
				this.bom.play('start');
				
				this.onBoomActive(this.concretes[i].name,this.concretes[i].angle,this.concretes[i].x,this.concretes[i].y,this.dynamite_point_x[tc],this.dynamite_point_y[tc]);
								
				this.concretes[i].destroy();
				this.dynamiteOnConcrete[tc].destroy();
				var k=i;
				break;
			}
		}
		this.concretes.splice(k, 1);
		
		this.timerStep++;
		if (this.timerStep==this.usedDynamite) {
			// All dynamites exploded
			if (sfxactive) {
				soundBgVolume = 0;
				if (windoW.listSound["backsound"]) {
					windoW.listSound["backsound"].volume = soundBgVolume;
				}
				Sound("rolldrum");
			}
			clearInterval(this.delay);
			this.end=true;
		}
	}
	
	// When the dynamite explode, the concrete attached to the dynamite will be destroyed, replaced with 1 or 2 new concrete with a new position 
	onBoomActive(name,rot,x,y,pxx,pyy){
		var sx=x;
		var sy=y;
		var px=Math.round(pxx);
		var py=Math.round(pyy);
		var td=30; // Dynamite height
		var stone;
		if (name=="ver"){
			if ((py<(sy+45))&&(py>(sy-45))) {
				var tinggi= (sy-60)+(120-(py+(td/2)));
				var yy= (py+(td/2))+(tinggi/2);
				
				stone = this.matter.add.sprite(sx, yy, "concrete_ver_sub");
				stone.displayHeight=tinggi;
				this.concretes.push(stone);
				
				tinggi= 120-(120-((py-(sy-60))+(td/2)))-td;
				yy= (sy-60)+(tinggi/2);
				
				stone = this.matter.add.sprite(sx, yy, "concrete_ver_sub");
				stone.displayHeight = tinggi;
				this.concretes.push(stone);
			
			} else {
				if (py>=(sy+45)) { tinggi=90; yy=(sy-60)+45; }
				if (py<=(sy-45)) { tinggi=90; yy=(sy-60)+75; }
				
				stone = this.matter.add.sprite(sx, yy, "concrete_ver_sub");
				stone.displayHeight = tinggi;
				this.concretes.push(stone);
			}
		}
		if (name=="hor"){
			if ((px<(sx+105))&&(px>(sx-105))) {
				var lebar= (sx-120)+(240-(px+(td/2)));
				var xx= (px+(td/2))+(lebar/2);
				
			stone = this.matter.add.sprite(xx,sy, "concrete_hor_sub");
				stone.displayWidth = lebar;
				this.concretes.push(stone);
				
				lebar= 240-(240-((px-(sx-120))+(td/2)))-td;
				xx= (sx-120)+(lebar/2);
				
				stone = this.matter.add.sprite(xx,sy, "concrete_hor_sub");
				stone.displayWidth = lebar;
				this.concretes.push(stone);
			
			} else {
				if (px>=(sx+105)) { lebar=210; xx=(sx-120)+105; }
				if (px<=(sx-105)) { lebar=210; xx=(sx-120)+135; }
				
				stone = this.matter.add.sprite(xx,sy, "concrete_hor_sub");
				stone.displayWidth = lebar;
				this.concretes.push(stone);
			}
		}////////////////////////////////
		if (name=="ver_min"){
			if ((py<(sy+15))&&(py>(sy-15))) {
				tinggi= (sy-30)+(60-(py+(td/2)));
				yy= (py+(td/2))+(tinggi/2);
				
				stone = this.matter.add.sprite(sx, yy, "concrete_ver_min");
				stone.displayHeight = tinggi;
				this.concretes.push(stone);
				
				tinggi= 60-(60-((py-(sy-30))+(td/2)))-td;
				yy= (sy-30)+(tinggi/2);
				
				stone = this.matter.add.sprite(sx, yy, "concrete_ver_min");
				stone.displayHeight = tinggi;
				this.concretes.push(stone);
			
			} else {
				if (py>=(sy+15)) { tinggi=30; yy=(sy-30)+15; }
				if (py<=(sy-15)) { tinggi=30; yy=(sy-30)+45; }
				
				stone = this.matter.add.sprite(sx, yy, "concrete_ver_min");
				stone.displayHeight = tinggi;
				this.concretes.push(stone);
			}
		}
		if (name=="hor_min"){
			if ((px<(sx+45))&&(px>(sx-45))) {
				lebar= (sx-60)+(120-(px+(td/2)));
				xx= (px+(td/2))+(lebar/2);
				
				stone = this.matter.add.sprite(xx,sy, "concrete_hor_min");
				stone.displayWidth = lebar;
				this.concretes.push(stone);
				
				lebar= 120-(120-((px-(sx-60))+(td/2)))-td;
				xx= (sx-60)+(lebar/2);
				
				stone = this.matter.add.sprite(xx,sy, "concrete_hor_min");
				stone.displayWidth = lebar;
				this.concretes.push(stone);
			
			} else {
				if (px>=(sx+45)) { lebar=90; xx=(sx-60)+45; }
				if (px<=(sx-45)) { lebar=90; xx=(sx-60)+75; }
				
				stone = this.matter.add.sprite(xx,sy, "concrete_hor_min");
				stone.displayWidth = lebar;
				this.concretes.push(stone);
			}
		}
	}
	
	
	//Triggered when retry button in game over scene is clicked
	onRetryBtn_GameOver(){
		if (clickEnabled) {
			if (sfxactive) {
				Sound("button_sound");
				Sound("woosh_sound");
			}
			// retry button out of frame
			this.tweens.add({targets: this.retyrBtn, y:-200, ease: 'Back.In', duration: 1100,  onComplete: this.retryLevel.bind(this) });
			this.gameoverOutFrame();
			clickEnabled=false;
			Android.levelRestartInGame(currentLevel);
			// alert("levelRestartInGame " + currentLevel);
		}
	}
	
	//Triggered when home button in game over scene is clicked
	onMenuBtn_GameOver(){
		if (clickEnabled) {
			if (sfxactive) {
				Sound("button_sound");
				Sound("woosh_sound");
			}
			// retry button out of frame
			this.tweens.add({targets: this.retyrBtn, y:-200, ease: 'Back.In', duration: 1100,  onComplete: this.backToLevelMenu.bind(this) });
			this.gameoverOutFrame();
			clickEnabled=false;
		}
	}
	
	//Triggered when next level button in game over scene is clicked
	onNextBtn_GameOver(){
		if (clickEnabled) {
			if (sfxactive) {
				Sound("button_sound");
				Sound("woosh_sound");
			}
			// retry button out of frame
			this.tweens.add({targets: this.retyrBtn, y:-200, ease: 'Back.In', duration: 1100,  onComplete: this.nextLevel.bind(this) });
			this.gameoverOutFrame();
			clickEnabled=false;
		}
	}
	
	// out of frame animation for gameover scene items
	gameoverOutFrame(){
		this.tweens.add({targets: this.levelMenuBtn, y:-200, ease: 'Back.In', duration: 900});
		this.tweens.add({targets: this.nextLevelBtn, y:-200, ease: 'Back.In', duration: 1000});
		this.tweens.add({targets: this.endScreen, y:-200, ease: 'Back.In', duration: 800});
		this.tweens.add({targets: this.winTxt, y:-200, ease: 'Bounce.Out', duration: 800});
		this.tweens.add({targets: scoreTxt, y:-200, ease: 'Back.In', duration: 800});
		this.tweens.add({targets: bestTxt, y:-150, ease: 'Back.In', duration: 800});
		// disable retry button, level menu button, and next level button
		this.retyrBtn.input.enable = false;
		this.levelMenuBtn.input.enable = false;
		this.nextLevelBtn.input.enable = false;
	}
	
	// replay the gameplay
	retryLevel() {
		this.cleartherest();
		this.create();
	}
	// back to level scene from gameover scene
	backToLevelMenu() {
		this.cleartherest();
		this.scene.start('level');
	}
	// go to the next level
	nextLevel() {
		Android.levelCompleteInGame(currentLevel);
		if (currentLevel==24){
			this.CongratulationScreen();
		}
		if (currentLevel<24){
			this.cleartherest();
			currentLevel++;
			this.create();
		}
	}
	// triggered when you win the final level
	CongratulationScreen(){
		scoreTxt.destroy();
		bestTxt.destroy();
		for (var h=0; h<this.dynamiteOnTop.length ;h++) {
			this.dynamiteOnTop[h].destroy();
		}
		this.endScreen.destroy();
		this.retyrBtn.destroy();
		this.levelMenuBtn.destroy();
		this.nextLevelBtn.destroy();
		this.winTxt.destroy();
		
		clickEnabled=true;
		
		this.winGameTxt = this.add.bitmapText(GAME_WIDTH/2, -200, 'thisfont',"", 40,1).setOrigin(0.5,0.5);
		this.winGameTxt.setText("Finally, you have finished\nthe game and destroyed\nall the towers\n\nThanks for playing");
			
		this.mainMenuBtn = this.add.sprite(-100, 600, 'btn_mainmenu')
			.setInteractive({ useHandCursor: true })
			.on("pointerover", 	() =>	this.mainMenuBtn.setFrame(1))
			.on("pointerdown", 	() =>	this.mainMenuBtn.setFrame(2))
			.on("pointerout", 	() =>	this.mainMenuBtn.setFrame(0))
			.on("pointerup",function(){	this.mainMenuBtn.setFrame(0); this.onCongratScreenToMenu(); },this);
		
		this.tweens.add({targets: this.winGameTxt, y: 300, ease: 'Bounce.Out', duration: 1000 });
		this.tweens.add({targets: this.mainMenuBtn, x: GAME_WIDTH/2, ease: 'Bounce.Out', duration: 800 });
	}
	
	// Congratulation scene to home scene
	onCongratScreenToMenu(){
		if (clickEnabled) {
			if (sfxactive) {
				Sound("button_sound");
			}
			// out of frame animation and remove all items
			this.tweens.add({targets: grass, alpha: 0, ease: 'Linear.None', duration: 200 });
			this.tweens.add({targets: this.ground, alpha: 0, ease: 'Linear.None', duration: 200 });
			this.tweens.add({targets: this.mainMenuBtn, x: -100, ease: 'Linear.None', duration: 800 });
			this.tweens.add({targets: this.winGameTxt, y: -200, ease: 'Linear.None', duration: 800 });
			var _t = this;
			setTimeout(function(){
				detonator.destroy();
				levelTxt.destroy();
				_t.winGameTxt.destroy();
				grass.destroy();
				_t.ground.destroy();
				_t.mainMenuBtn.destroy();
				_t.soundBtn.destroy();
				_t.scene.start('mainmenu');
			},1000)
			clickEnabled=false;
		}
	}
	// remove all items in gameplay and gameover screen
	cleartherest(){
		detonator.destroy();
		levelTxt.destroy();
		scoreTxt.destroy();
		bestTxt.destroy();
		for (var h=0; h<this.dynamiteOnTop.length ;h++) {
			this.dynamiteOnTop[h].destroy();
		}
		this.background.destroy();
		grass.destroy();
		this.ground.destroy();
		this.endScreen.destroy();
		this.retyrBtn.destroy();
		this.soundBtn.destroy();
		this.levelMenuBtn.destroy();
		this.nextLevelBtn.destroy();
		this.winTxt.destroy();
	}
	
	// show the gameover scene
	showEndScreen(){
		
		
		if (sfxactive) {
			Sound("win_sound");
			Sound("woosh_sound");
			soundBgVolume = 1;
			if (windoW.listSound["backsound"]) {
				windoW.listSound["backsound"].volume = soundBgVolume;
			}
		}
		scoreTxt.x=350;
		scoreTxt.y=-100;
		scoreTxt.setText(this.sensor.y.toString());
		
		// remove and disable some items in gameplay scene 
		detonator.input.enable = false;
		this.resetBtn.input.enable = false;
		this.limit.destroy();
		this.sensor.destroy();
		this.endtimer.destroy();
		this.resetBtn.destroy();
		for (var i=0; i<this.concretes.length ;i++) {
			this.concretes[i].destroy();
		}
		for (var j=0; j<this.dynamiteOnConcrete.length ;j++) {
			this.dynamiteOnConcrete[j].destroy();
		}
		this.tweens.add({targets: detonator, alpha: 0, ease: 'Linear.None', duration: 200});
		this.tweens.add({targets: levelTxt, alpha: 0, ease: 'Linear.None', duration: 200});
		
		// add gameover background ang gameover text
		this.endScreen= this.add.sprite(GAME_WIDTH/2, -200,'endscreen');
		this.winTxt = this.add.bitmapText(120, -200, 'thisfont','',60).setOrigin(0,0);
		
		// add buttons
		this.retyrBtn = this.add.sprite(100, -200, 'btn_retry')
			.setOrigin(0,0)
			.setInteractive({ useHandCursor: true })
			.on("pointerover", 	() =>	this.retyrBtn.setFrame(1))
			.on("pointerdown", 	() =>	this.retyrBtn.setFrame(2))
			.on("pointerout", 	() =>	this.retyrBtn.setFrame(0))
			.on("pointerup",function(){	this.retyrBtn.setFrame(0); this.onRetryBtn_GameOver(); },this);
			
		this.levelMenuBtn = this.add.sprite(250, -200, 'btn_levelmenu')
			.setOrigin(0,0)
			.setInteractive({ useHandCursor: true })
			.on("pointerover", 	() =>	this.levelMenuBtn.setFrame(1))
			.on("pointerdown", 	() =>	this.levelMenuBtn.setFrame(2))
			.on("pointerout", 	() =>	this.levelMenuBtn.setFrame(0))
			.on("pointerup",function(){	this.levelMenuBtn.setFrame(0); this.onMenuBtn_GameOver(); },this);
		this.nextLevelBtn = this.add.sprite(400, -200, 'btn_start')
			.setOrigin(0,0)
			.setInteractive({ useHandCursor: true })
			.on("pointerover", 	() =>	this.nextLevelBtn.setFrame(1))
			.on("pointerdown", 	() =>	this.nextLevelBtn.setFrame(2))
			.on("pointerout", 	() =>	this.nextLevelBtn.setFrame(0))
			.on("pointerup",function(){	this.nextLevelBtn.setFrame(0); this.onNextBtn_GameOver(); },this);
		this.nextLevelBtn.displayWidth=131;
		this.nextLevelBtn.displayHeight=131;
		
		//check winning status
		var win = false;
		if (this.sensor.y>=this.limit.y) {
			win = true;
		}
		if (win && currentLevel<24 && currentLevel==levelReached) {
			levelReached++;
		}
		if (win) {
			this.winTxt.setText("Level Cleared");
		} else {
			this.winTxt.setText("   You Failed");
			this.nextLevelBtn.visible = false;
			this.levelMenuBtn.x = 400;
			Android.levelLoseInGame(currentLevel);
		}
		// set best score for this level
		if (bestScores[currentLevel-1] < this.sensor.y) {
			bestScores[currentLevel-1] = this.sensor.y;
		}
		
		// set local storage for best score and level reached		
		if (typeof(Storage) !== "undefined") {
			localStorage.setItem("savedLevelReached", levelReached);
			localStorage.setItem("savedBestScore", JSON.stringify(bestScores));
		}
		
		// get best score from local storage and show the best score text
		var bestScore = JSON.parse(localStorage.getItem("savedBestScore"));
		bestTxt = this.add.bitmapText(350, -100, 'thisfont',"", 40).setOrigin(0,0);
		bestTxt.setText(bestScore[currentLevel-1].toString());
		
		// in frame animation
		this.tweens.add({targets: this.retyrBtn, y: GAME_HEIGHT-360, ease: 'Bounce.Out', duration: 1100});
		this.tweens.add({targets: this.levelMenuBtn, y: GAME_HEIGHT-360, ease: 'Bounce.Out', duration: 1200});
		this.tweens.add({targets: this.nextLevelBtn, y: GAME_HEIGHT-360, ease: 'Bounce.Out', duration: 1300});
		this.tweens.add({targets: this.endScreen, y: (GAME_HEIGHT/2)-75, ease: 'Bounce.Out', duration: 1000});
		this.tweens.add({targets: this.winTxt, y: 170, ease: 'Bounce.Out', duration: 1000});
		
		this.children.bringToTop(scoreTxt);
		
		this.tweens.add({targets: scoreTxt, props:{ x:350,y: 310 }, ease: 'Bounce.Out', duration: 1000});
		this.tweens.add({targets: bestTxt, props:{ x:350,y: 400 }, ease: 'Bounce.Out', duration: 1000});
		
	}
}