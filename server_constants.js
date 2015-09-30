(function() {
	// a lot of these are duplicated by constants.js. I'm sure this is a stupid way to
	// export constants, but I'm doing it this way until I come up with a better fix.
	// Ideally the same file should be given to both the client and server
	// TODO: Figure out if we can use requirejs for this

	module.exports = {

		NUM_FLEETS: 3,
		EVENT_ONE : 1,
		EVENT_ALL : 2,

		RES_METAL : 0,
		RES_WATER : 1,
		RES_FUEL : 2,
		RES_FOOD : 3,
		RES_NONE : 4,

		// Action type values. All normal game actions must be greater than 0,
		// Or certain logic (like updateTileInteractivity) will fail
		ACT_LOADED_ASSETS : 0,
		ACT_TURN_DONE : 1,
		ACT_PLACE : 2, // build anywhere, no payment
		ACT_BUILD : 3,
		// var ACT_RECRUIT : 4,
		// var ACT_DOWNGRADE : 5,
		// var ACT_REMOVE : 6,
		// var ACT_RETIRE : 7,
		// var ACT_MOVE : 8,
		// var ACT_LAUNCHMISSION : 9,

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

		OBJ_VALUE : {
			1: 0,
			2: 1,
			3: 1,
			4: 2,
			5: 1
		},

		ACT_ENGLISH : {
							1: 'End Turn',
							2: 'Place',
							3: 'Build',
						},

		OBJ_ENGLISH : {
							1: "mine",
							2: "factory",
							3: "embassy",
							4: "base",
							5: "fleet"
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