(function() {
	// a lot of these are duplicated by constants.js. I'm sure this is a stupid way to
	// export constants, but I'm doing it this way until I come up with a better fix.
	// Ideally the same file should be given to both the client and server
	// TODO: Figure out if we can use requirejs for this

	module.exports = {

		NUM_FLEETS: 3,
		EVENT_ONE : 1,
		EVENT_ALL : 2,

		GAME_CLOSED : 0,
		GAME_STAGING : 1,
		GAME_PROGRESS : 2,

		USR_OFFLINE: 0,
		USR_ONLINE: 1,
		USR_STAGING: 2,
		USR_INGAME: 3,

		RES_METAL : 0,
		RES_WATER : 1,
		RES_FUEL : 2,
		RES_FOOD : 3,
		RES_NONE : 4,

		// Border status constants
		BRD_UNEXPLORED: 0,
		BRD_OPEN: 1,
		BRD_BLOCKED: 2,

		// Action type values. All normal game actions must be greater than 0,
		// Or certain logic (like updateTileInteractivity) will fail
		ACT_LOADED_ASSETS : 0,
		ACT_TURN_DONE : 1,
		ACT_PLACE : 2, // build anywhere, no payment
		ACT_BUILD : 3,
		ACT_RECRUIT : 4,
		// ACT_DOWNGRADE : 5,
		// ACT_REMOVE : 6,
		// ACT_RETIRE : 7,
		// ACT_MOVE : 8,
		// ACT_LAUNCHMISSION : 9,

		PNT_STRUCTURES : 0,
		PNT_EXPLORE : 1,
		PNT_ENVOY : 2,
		PNT_DESTROY : 3,
		PNT_TOTAL : 4,

		OBJ_MINE : 1,
		OBJ_FACTORY : 2,
		OBJ_EMBASSY : 3,
		OBJ_BASE : 4,
		OBJ_FLEET : 5,

		AGT_EXPLORER : 1,
		AGT_MINER : 2,
		AGT_SURVEYOR : 3,
		AGT_AMBASSADOR : 4,
		AGT_ENVOY : 5,
		AGT_SPY : 6,
		AGT_SMUGGLER : 7,
		AGT_SABATEUR : 8,

		AGT_STATUS_OFF : 0,
		AGT_STATUS_ON : 1,
		AGT_STATUS_DEAD : 2,

		OBJ_VALUE : {
			1: 0,
			2: 1,
			3: 1,
			4: 2,
			5: 1
		},

		AGT_ENGLISH : {
							1: "explorer",
							2: "miner",
							3: "surveyor",
							4: "ambassador",
							5: "envoy",
							6: "spy",
							7: "smuggler",
							8: "sabateur"
						},

		ACT_ENGLISH : {
							1: 'End Turn',
							2: 'Place',
							3: 'Build',
							4: 'Recruit'
						},

		OBJ_ENGLISH : {
							1: "mine",
							2: "factory",
							3: "embassy",
							4: "base",
							5: "fleet"
						},

		AGT_OBJTYPE : {
			1: 2,
			2: 2,
			3: 2,
			4: 3,
			5: 3,
			6: 3,
			7: 4,
			8: 4
		},


		STRUCT_REQS : {
			1: { 
				build: {
					0: 1,
					2: 1,
					3: 1 
				},
				upkeep: {}
			}, 
			2: {

				build: {
					0: 1,
					1: 1,
					2: 2
				},
				upkeep: {
					0: 1
				}
			},
			3: {
				build: {
					0: 2,
					1: 2,
					3: 1
				},
				upkeep: {
					1: 1
				}
			},
			4: {
				build: {
					0: 3,
					1: 1,
					2: 1,
					3: 1
				},
				upkeep: {
					2: 1
				}
			},
			5: {
				build: {
					0: 1,
					1: 1,
					2: 1
				},
				upkeep: {
					2: 1
				}
			}
		}
	};

}());