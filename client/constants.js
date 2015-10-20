// width in pixels of a small planet tile
var sWid = 212;
var agtWid = 100;
var agtSpace = 5;

var offline = false; // checked by loader when creating settings for LoadQueue
var s3url = 'https://s3-us-west-2.amazonaws.com/alien-empire/';
// var s3url = 'images/'; // set s3url to this if testing offline

var MOVE_DISTANCE = 5;
var MENU_ON = 1;
var MENU_OFF = 2;

var GAME_CLOSED = 0;
var GAME_STAGING = 1;
var GAME_PROGRESS = 2;

var NUM_FLEETS = 3;

var RES_METAL = 0;
var RES_WATER = 1;
var RES_FUEL = 2;
var RES_FOOD = 3;
var RES_NONE = 4;

// Border status constants
var BRD_UNEXPLORED = 0;
var BRD_OPEN = 1;
var BRD_BLOCKED = 2;

// Action type values. All normal game actions must be greater than 0,
// Or certain logic (like updateTileInteractivity) will fail
var ACT_LOADED_ASSETS = 0;
var ACT_TURN_DONE = 1;
var ACT_PLACE = 2; // build anywhere, no payment
var ACT_BUILD = 3;
var ACT_RECRUIT = 4;
// var ACT_DOWNGRADE = 5;
// var ACT_REMOVE = 6;
// var ACT_RETIRE = 7;
// var ACT_MOVE = 8;
// var ACT_LAUNCHMISSION = 9;

var PNT_STRUCTURES = 0;
var PNT_EXPLORE = 1;
var PNT_ENVOY = 2;
var PNT_DESTROY = 3;
var PNT_TOTAL = 4;

var OBJ_MINE = 1;
var OBJ_FACTORY = 2;
var OBJ_EMBASSY = 3;
var OBJ_BASE = 4;
var OBJ_FLEET = 5;

var AGT_EXPLORER = 1;
var AGT_MINER = 2;
var AGT_SURVEYOR = 3;
var AGT_AMBASSADOR = 4;
var AGT_ENVOY = 5;
var AGT_SPY = 6;
var AGT_SMUGGLER = 7;
var AGT_SABATEUR = 8;

var AGT_STATUS_OFF = 0;
var AGT_STATUS_ON = 1;
var AGT_STATUS_DEAD = 2;

var AGT_ENGLISH = {
					1: "explorer",
					2: "miner",
					3: "surveyor",
					4: "ambassador",
					5: "envoy",
					6: "spy",
					7: "smuggler",
					8: "sabateur"
};

var ACT_ENGLISH = {
					1: 'End Turn',
					2: 'Place',
					3: 'Build',
					4: 'Recruit'
					};

var RES_ENGLISH = { 
					0: "metal", 
					1: "water", 
					2: "fuel", 
					3: "food",
					4: "" 
				};

var OBJ_ENGLISH = {
					1: "mine",
					2: "factory",
					3: "embassy",
					4: "base",
					5: "fleet"
				};

var COL_ENGLISH = {
					0: "Red",
					1: "Blue",
					2: "Green",
					3: "Yellow"
				};

// lists of required parameters to be met for each action type
var ACTION_REQUIREMENTS = {
	1: [],
	2: ['actiontype','objecttype','planetid','resourceid'],
	3: ['actiontype','objecttype','planetid','resourceid'],
	4: ['actiontype','agenttype','planetid']
};

// var AGT_OBJTYPE = {
// 	1: OBJ_FACTORY,
// 	2: OBJ_FACTORY,
// 	3: OBJ_FACTORY,
// 	4: OBJ_EMBASSY,
// 	5: OBJ_EMBASSY,
// 	6: OBJ_EMBASSY,
// 	7: OBJ_BASE,
// 	8: OBJ_BASE
// };

var STRUCT_REQS = {

	OBJ_MINE: {

		build: {
			RES_METAL: 1,
			RES_FUEL: 1,
			RES_FOOD: 1 
		},
		upkeep: {}
	}, 
	OBJ_FACTORY: {

		build: {
			RES_METAL: 1,
			RES_FUEL: 2,
			RES_WATER: 1
		},
		upkeep: {
			RES_METAL: 1
		}
	},
	OBJ_EMBASSY: {
		build: {
			RES_METAL: 2,
			RES_WATER: 2,
			RES_FOOD: 1
		},
		upkeep: {
			RES_WATER: 1
		}
	},
	OBJ_BASE: {
		build: {
			RES_METAL: 3,
			RES_FUEL: 1,
			RES_WATER: 1,
			RES_FOOD: 1
		},
		upkeep: {
			RES_FUEL: 1
		}
	},
	OBJ_FLEET: {
		build: {
			RES_METAL: 1,
			RES_FUEL: 1,
			RES_WATER: 1
		},
		upkeep: {
			RES_FUEL: 1
		}
	}
};