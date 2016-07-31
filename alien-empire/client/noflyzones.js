
/** noflyzones.js contains all methods for initializing and drawing no fly zones
    Each no fly zone is drawn once and then hidden or shown based on the status
    of its planets' border. */

var initNoFlyZones = function() {

	//create container to store all agent shapes
	var noflyContainer = new createjs.Container();
	noflyContainer.name = 'noflyContainer';
	noflyContainer.mouseEnabled = true;
	noflyContainer.mouseChildren = true;
	noflyContainer.x = 0;
	noflyContainer.y = 0;

	var noflyzoneImg = loader.getResult("noflyzone");
	var planets = clientGame.game.board.planets;
	var b1, b2, pointangle;

	for (var pid = 0; pid < planets.length; pid++ ){
		if ( planets[pid].w == 2 ){

			var planet1 = planets[pid];

			for ( var bid in planets[pid].borders ){
				// only create new noflyzone if this 
				// is a border we haven't done yet
				if (planets[bid].w == 1 || bid > pid) {

					var planet2 = planets[bid];

					var noflyzone = new createjs.Shape();
					noflyzone.name = "noflyzone" + pid + bid;
					noflyzone.planets = [Number(pid), Number(bid)];
					noflyzone.isPermanent = false;

					var mx1 = sWid * ( planet1.x + (planet1.w / 2));
					var my1 = sWid * ( planet1.y + (planet1.w / 2));
					var mx2 = sWid * ( planet2.x + (planet2.w / 2));
					var my2 = sWid * ( planet2.y + (planet2.w / 2));

					var angle1 = Math.atan2(my2 - my1, mx2 - mx1);

					if ( planet2.w == 1){
						b1 = angle1 + ((3/4) * Math.PI ) + Math.atan(1/3);
						b2 = angle1 + Math.atan(1/3) - ((3/4) * Math.PI );
					}
					else {
						b1 = angle1 - Math.atan(1/2) + ((3/4) * Math.PI );
						b2 = angle1 - Math.atan(1/2) - ((3/4) * Math.PI );
					}

					var h = sWid * planet2.w / Math.sqrt(2);
					var px1 = mx2 + ( h * Math.cos(b1) );
					var py1 = my2 + ( h * Math.sin(b1) );
					var px2 = mx2 + ( h * Math.cos(b2) );
					var py2 = my2 + ( h * Math.sin(b2) );

					noflyzone.graphics.beginBitmapFill(noflyzoneImg).drawRect(0, -13, 212, 25);
					
					if ( planets[bid].w == 1){
						pointangle = Math.atan2(py2 - py1, px2 - px1);
						noflyzone.x = px1;
						noflyzone.y = py1;
					}
					else {
						pointangle = Math.atan2(py1 - py2, px1 - px2);
						noflyzone.x = px2;
						noflyzone.y = py2;
					}
					
					noflyzone.rotation = pointangle * 180 / Math.PI;

					noflyzone.mouseEnabled = false;
					noflyzone.alpha = 0;
					noflyzone.visible = false;
					noflyzone.selected = false;

					noflyzone.on("mouseover", function() {
						if (!this.selected && !this.isPermanent){
							alphaTo(this, 200, 1, true);
						}
					});

					noflyzone.on("mouseout", function() {
						if (!this.selected && !this.isPermanent){
							alphaTo(this, 200, 0.3, true);
						}
					});

					noflyzone.on("click", function() {
						handleClickNoFlyZone( this );
					});
					noflyContainer.addChild( noflyzone );
				}
			}
		}
	}

	board.addChild(noflyContainer);
};

var updateNoFlyZones = function() {

	var noflyContainer = board.getChildByName('noflyContainer');
	var planets = clientGame.game.board.planets;

	for ( var c = 0; c < noflyContainer.children.length; c++ ){
		var noflyzone = noflyContainer.children[c];
		
		var p1 = noflyzone.planets[0];
		var p2 = noflyzone.planets[1];

		// if border is blocked, make sure we update the visual no fly zone
		if ( !noflyzone.isPermanent && planets[p1].borders[p2] == BRD_BLOCKED){
			if ( !noflyzone.visible ){
				noflyContainer.children[c].isPermanent = true;
				noflyContainer.children[c].mouseEnabled = false;
				fadeIn(noflyContainer.children[c], 500, false, true);
			}
		}
		// if we're choosing borders to block, show these at < 100% opacity
		else if ( clientGame.game.phase == PHS_MISSIONS
				  && pendingAction.actiontype == ACT_MISSION_RESOLVE
				  && pendingAction.agenttype == AGT_AMBASSADOR 
				  && !noflyzone.isPermanent ){
			
			var planetid = pendingAction.planetid;
			var index = noflyzone.planets.indexOf(planetid);

			if ( index != -1 ){
				var bid = noflyzone.planets[ (index + 1) % 2];
				noflyContainer.children[c].mouseEnabled = true;
				noflyContainer.children[c].visible = true;

				if ( pendingAction.choice.indexOf(bid) != -1 ){
					alphaTo(noflyContainer.children[c], 200, 1, true);
					noflyContainer.children[c].selected = true;
					noflyContainer.children[c].shadow = new createjs.Shadow("#FFFFFF", 0, 0, 5);
				}
				else {
					alphaTo(noflyContainer.children[c], 200, 0.3, true);
					noflyContainer.children[c].shadow = undefined;
					noflyContainer.children[c].selected = false;
				}
			}
		}

		else if ( !noflyzone.isPermanent && noflyzone.visible == true ){
			fadeOut(noflyContainer.children[c], 200, false, true);
		}
	}
	
};

var handleClickNoFlyZone = function( noflyzone ) {
	var pid = noflyzone.planets[0];
	var bid = noflyzone.planets[1];
	if (clientGame.game.phase == PHS_MISSIONS 
		&& pendingAction.agenttype == AGT_AMBASSADOR) {
			
		if ( pendingAction.planetid == pid ){
			setPendingChoice(bid);
		}
		else {
			setPendingChoice(pid);
		}
		updateNoFlyZones();
	}

	if ( isPendingActionReady() ) {
		// only automatically display confirm menu if we're not resolving
		// an ambassador or surveyor mission. Those confirm menus should 
		// only be triggered by an explicit 'done' command
		if ((clientGame.game.phase == PHS_MISSIONS
			 && ( pendingAction.agenttype == AGT_SURVEYOR 
			 	  || pendingAction.agenttype == AGT_AMBASSADOR )) == false ) {
			displayConfirmMenu();
		}
	}
};