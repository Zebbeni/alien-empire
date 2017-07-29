var initBases = function() {
	var basesContainer = new createjs.Container();
	basesContainer.name = "basesContainer";
	basesContainer.x = 0;
	basesContainer.y = 0;

	for ( var p = 0; p < clientGame.game.players.length; p++){

		var base = new createjs.Container();
		base.name = "base" + p;
		base.planetid = undefined;
		base.player = p;
		base.visible = false;

		base.on("mouseover", function() {
			selectBase( this.planetid, this.player );
		});

		base.on("mouseout", function() {
			hideSelection();
		});

		base.on("click", function() {
			handleClickBase( this.planetid, this.player );
		});

		baseimage = new createjs.Shape();
		baseimage.name = 'baseimage';
		var baseImg = loader.getResult( 'structures' + String(p) );
		baseimage.graphics.beginBitmapFill( baseImg, "no-repeat" ).drawRect( 0, 0, 140, 140);
		baseimage.x = 0;
		baseimage.y = 0;
		base.addChild(baseimage);

		var hit = new createjs.Shape();
		hit.graphics.beginFill("000").drawRect(0,0,140,140);
		base.hitArea = hit;

		base.scaleX = 0.80;
		base.scaleY = 0.80;
		base.used = false;

		basesContainer.addChild(base);
	}

	board.addChild(basesContainer);
};

var updateBasesInteractivity = function() {

	var basesContainer = board.getChildByName('basesContainer');

	for ( var p = 0; p < clientGame.game.players.length; p++){
		
		var base = basesContainer.getChildByName('base' + p);

		if ( base.planetid != undefined) {

			switch ( clientGame.game.phase ) {

				case PHS_UPKEEP:

					if ( base.player == clientTurn ){
						base.mouseEnabled = true;
					}
					break;

				case PHS_MISSIONS:
					
					if ( pendingAction.agenttype == AGT_SABATEUR 
						&& base.player != clientTurn
						&& base.planetid == pendingAction.planetid ) {
						
						base.mouseEnabled = true;
					}
					else {
						base.mouseEnabled = false;
					}
					break;
				
				case PHS_ACTIONS:
					if ( pendingAction.actiontype == ACT_FLEET_ATTACK) {

						if ( base.player != clientTurn ){
							base.mouseEnabled = true;
						}
						else {
							base.mouseEnabled = false;
						}
					}
					else if ( base.player == clientTurn ){
						base.mouseEnabled = true;
					}
					break;

				default:
					break;
			}
		}
	}
};

var updateRemovedBases = function(){
		
	var basesContainer = board.getChildByName('basesContainer');

	for ( var p = 0; p < clientGame.game.players.length; p++){
		var base = basesContainer.getChildByName('base' + p);
		var planetid = base.planetid;

		if ( planetid != undefined ){
			var planet = clientGame.game.board.planets[planetid];
			if ( !planet.base ){
				base.planetid = undefined;
				fadeOut(base, 500, true);
			}
		}
	}
};

var updateBases = function( planetid ) {

	var planet = clientGame.game.board.planets[planetid];

	if ( planet.base ) {

		var basesContainer = board.getChildByName("basesContainer");
		var player = planet.base.player;
		var base = basesContainer.getChildByName("base" + player);
		var used = planet.base.used;

		base.planetid = planetid;
		base.player = player;

		if ( !base.visible ){

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

			fadeIn(base, 500, true, false);
		}
		else if (base.used != used){
			var baseimage = base.getChildByName('baseimage');
			baseimage.graphics.clear();
			var baseImg = loader.getResult( 'structures' + String(player) );

			if ( used ){
				baseimage.graphics.beginBitmapFill( baseImg, "no-repeat" ).drawRect( 584, 0, 140, 140);
				baseimage.x = -584;
				baseimage.y = 0;
			}
			else {
				baseimage.graphics.beginBitmapFill( baseImg, "no-repeat" ).drawRect( 0, 0, 140, 140);
				baseimage.x = 0;
				baseimage.y = 0;
			}
			base.used = used;
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
			if (pendingAction.actiontype == ACT_FLEET_ATTACK){
				var planet = clientGame.game.board.planets[planetid];
				var targetPlayer = planet.base.player;
				setPendingObject( OBJ_BASE );
				setPendingChoice( RES_NONE );
				setPendingTargetPlayer( targetPlayer );
			}
			else {
				setPendingPlanet( planetid );
				updateActionMenu( 'base', planetid );
				showActionMenu();
			}
			break;

		case PHS_MISSIONS:
			var planet = clientGame.game.board.planets[planetid];
			var targetPlayer = planet.base.player;
			setPendingObject( OBJ_BASE );
			setPendingTargetPlayer( targetPlayer );
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