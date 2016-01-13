var initBases = function() {
	var basesContainer = new createjs.Container();
	basesContainer.name = "basesContainer";
	basesContainer.x = 0;
	basesContainer.y = 0;

	for ( var p = 0; p < clientGame.game.players.length; p++){

		var base = new createjs.Shape();
		base.name = "base" + p;
		base.planetid = undefined;
		base.player = undefined;

		base.on("mouseover", function() {
			selectBase( this.planetid, this.player );
		});

		base.on("mouseout", function() {
			hideSelection();
		});

		base.on("click", function() {
			handleClickBase( this.planetid, this.player );
		});

		basesContainer.addChild(base);

	}

	board.addChild(basesContainer);
};

var updateRemovedBases = function(){
		
	var basesContainer = board.getChildByName('basesContainer');

	for ( var p = 0; p < clientGame.game.players.length; p++){
		var base = basesContainer.getChildByName('base' + p);
		base.player = undefined;
		base.planetid = undefined;
		base.visible = false;
	}
};

var updateBases = function( planetid ) {

	var planet = clientGame.game.board.planets[planetid];

	if ( planet.base ) {

		var basesContainer = board.getChildByName("basesContainer");
		var player = planet.base.player;
		var base = basesContainer.getChildByName("base" + player);

		base.planetid = planetid;
		base.player = player;
		base.visible = true;
		if ( clientTurn == player ) { 
			base.mouseEnabled = true;
		}

		var baseImg = loader.getResult( OBJ_ENGLISH[ OBJ_BASE ] + planet.base.player);
		base.graphics.beginBitmapFill(baseImg, "no-repeat").drawRect(0, 0, baseImg.width, baseImg.height);
		
		switch (planet.w) {
			case 1:
				base.x = tiles[planetid].x - 25;
				base.y = tiles[planetid].y - 25;
				break;
			case 2:
				base.x = tiles[planetid].x + 25;
				base.y = tiles[planetid].y + 25;
				break;
		}
	}
};

var handleClickBase = function( planetid, player ) {
	switch( clientGame.game.phase ) {
		case PHS_UPKEEP:
			setPendingAction( ACT_REMOVE );
			setPendingObject( OBJ_BASE );
			setPendingPlanet( planetid );
			setPendingResource( RES_NONE );
			break;
		case PHS_ACTIONS:
			break;
		default:
			break;
	}

	if ( isPendingActionReady() ) {
		displayConfirmMenu();
	}
};

var selectBase = function( planetid, player ){
	var basesContainer = board.getChildByName('basesContainer');
	var base = basesContainer.getChildByName( 'base' + player );
	setSelection( base.x + 30, base.y - 30 );
};