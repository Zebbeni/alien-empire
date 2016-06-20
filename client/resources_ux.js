/*
 * resources_ux.js contains all drawing functions for resources-related
 * menu items in game ux 
 */

var icons = ['metal-icon', 'water-icon', 'fuel-icon', 'food-icon'];

var createResourcesMenu = function() {
	
	var innerHTML = '<div id="resources-menu-title" class="menu-title">Resources</div>';
	clientGame.game.collectedPkgs = []; // indices of packages the ux has animated

	for ( var i = RES_METAL; i <= RES_FOOD; i++ ){
		
		table = '<table class="fourtoone-menu-table" cellspacing="0">';
		// create 4 to 1 menu
		for ( var j = RES_METAL; j <= RES_FOOD; j++){
			if ( i != j ){
				table += '<td width="25px" height="25px"><input type="button" '
					   + 'class="res-icon ' + icons[j] + ' ' 
					   + icons[j] + '-button" '
					   + 'onclick="javascript:tradeFourToOne(' + i + ',' + j + ')"></input></td>';
			}
		}
		table += '</table>';
		
		innerHTML += '<div class="resource-div" id="resource-div' + i + '">'
				   + '<div class="gain-div"></div><div class="loss-div"></div>'
				   + '<table class="resource-table" cellspacing="0"><tr>';

		for ( var n = 1; n <= 10; n++){
			innerHTML += '<td id="res-table-icon-' + i + 'n' + n + '" '
						+ 'class="res-icon no-icon"></td>';
		}
		innerHTML += '</tr></table>';
		innerHTML += '<input type="button" class="fourtoone-button" '
				   + 'value="4 to 1" '
				   + 'onclick="javascript:toggleFourToOneMenu(' + i + ');">'
				   + '</input>'
		innerHTML += '<div id="res-change' + i + '" class="res-change"></div>';
		innerHTML += '<div id="fourtoone-menu' + i + '" class="fourtoone-menu">'
		           + table + '</div></div>';
	}

	innerHTML += '<input type="button" id="trade-button" value="Trade" '
			   + 'onclick="javascript:drawTradeMenu(null);"></input>';

	$('#resources-menu-div').html(innerHTML);
};

var updateResourcesMenu = function() {

	var collect = clientGame.game.resourceCollect[clientTurn];
	var upkeep = clientGame.game.resourceUpkeep[clientTurn];

	for ( var i = RES_METAL; i <= RES_FOOD; i++ ){

		var resourceDiv = '#resource-div' + i;
		$(resourceDiv).find('.gain-div').html('+' + collect[i]);
		$(resourceDiv).find('.loss-div').html('-' + upkeep[i]);

		var resources = clientGame.game.resources[clientTurn];
		for ( var n = 1; n <= 10; n++ ) {
			var restd = '#res-table-icon-' + i + 'n' + n;
			if ( n <= resources[i] ) {
				$(restd).removeClass('no-icon').addClass(icons[i]);
			}
			else {
				$(restd).removeClass(icons[i]).addClass('no-icon');
			}
		}
	}
};

var updateResourcePkgMenu = function() {
	
	var packages = clientGame.game.resourcePackages[clientTurn];
	var count = 0, html = '';
	var pkg, pkg_class, td_class, sign, onclick, pkg_id, message;

	// TODO: We seriously need to look at using html templates for this
	// kind of stuff. This is nuts
	for (var p = 0; p < packages.length; p++){

		pkg = packages[p];
		// show all packages that have not already been collected or cancelled
		// if collection has already been tried before, or if the package
		// is upkeep and not trivial to resolve (all elements not 0)
		if ( !pkg.collected && !pkg.cancelled 
			 && ( !pkg.isnew 
				 || ( pkg.pkgtype == PKG_UPKEEP 
				 	  && !allValuesEqualTo(pkg.resources, 0) ) ) ) {

			message = pkg.message;
			pkg_id = 'respk-collect-id' + count;

			if (pkg.pkgtype == PKG_UPKEEP) {
				pkg_class = 'respkg-upkeep-div';
				td_class = 'respkg-upkeep-td';
				sign = '-';
				title = 'Upkeep';
				onclick = 'javascript:payUpkeepPackage(' + p + ')';
			}
			else {
				pkg_class = 'respkg-collect-div';
				td_class = 'respkg-collect-td';
				sign = '+';
				title = 'Collect';
				onclick = 'javascript:collectResourcePackage(' + p + ')';
			}

			html += '<div class="respkg-div ' + pkg_class + '" '
					+ 'id="' + pkg_id + '"' + '>'
					+ '<div class="respkg-notification-div">'
					+ '<div class="respkg-message-div">' + message + '</div>'
					+ '<div class="respkg-arrow-div"></div>'
					+ '</div>';
			
			html += '<div class="respkg-clickable-div" '
					+ 'onclick="' + onclick + '">'
					+ '<div class="respkg-title-div">' + title + '</div>'
					+ '<div class="respkg-resources-div">'
					+ '<table class="respkg-resources-table">';

			for ( var i = RES_METAL; i <= RES_FOOD; i++ ){
				html += '<tr class="respkg-num-tr">'
						+ '<td class="respkg-num-td ' + td_class + '">' 
						+ sign + String(Math.abs(pkg.resources[i])) 
						+ '</td>'
						+ '<td class="res-icon ' + icons[i] + '" ></td>'
						+ '</tr>';
			}

			html += '</table></div></div></div>';
			count += 1;
		}

		else if ( !pkg.collected && !pkg.cancelled && pkg.isnew ) {
			if ( pkg.pkgtype != PKG_UPKEEP ) {
				collectResourcePackage(p);
			}
			else if ( clientGame.game.phase == PHS_RESOURCE ){
				submitTurnDone();
			}
			else if ( allValuesEqualTo(pkg.resources, 0) ) {
				payUpkeepPackage(p);
			}
		}
	}

	$('#resourcepackages-div').html(html);

	for ( var c = 0; c < count; c++ ){
		var xpos = c * 70;
		$('#respk-collect-id' + c).css({left: xpos});
	}

	$('#resourcepackages-div').show();

	setInterfaceImage('.respkg-collect-div');
	setInterfaceImage('.respkg-upkeep-div');
	setInterfaceImage('.respkg-arrow-div');
	setInterfaceImage('.res-icon');
};

var allValuesEqualTo = function(array, val) {
	for ( var i = 0; i < array.length; i++ ){
		if (array[i] != val){
			return false;
		}
	}
	return true;
};

var updateResourceAnimations = function() {
	var packages = clientGame.game.resourcePackages[clientTurn];

	for (var p = 0; p < packages.length; p++){
		var pkg = packages[p];

		if( pkg.collected && clientGame.game.collectedPkgs.indexOf(p) == -1 ){
			// don't animate if all changes are 0
			if ( !allValuesEqualTo(pkg.resources, 0) ){
				animateResourceChange(pkg);
				clientGame.game.collectedPkgs.push(p);
				break;
			}
		}
	}
};

var animateResourceChange = function( pkg ) {

	var clientResources = clientGame.game.resources[clientTurn];
	var sign = "+";

	if (pkg.pkgtype == PKG_UPKEEP || pkg.pkgtype ==  PKG_BUILD) {
		sign = "-";
		$('.res-change').each( function() {
			$( this ).addClass('res-change-down');
			$( this ).removeClass('res-change-up');
		});
	} else {
		$('.res-change').each( function() {
			$( this ).addClass('res-change-up');
			$( this ).removeClass('res-change-down');
		});
	}

	for ( var i = RES_METAL; i <= RES_FOOD; i++ ){
		
		leftpos = String( 60 + (clientResources[i] * 25) ) + 'px';
		value = pkg.resources[i] == 0 ? '' : String( sign + pkg.resources[i]);

		$('#res-change' + i).text(value);
		$('#res-change' + i).css({left: leftpos, top: "0px", opacity: "1.00"});
		$('#res-change' + i).show();
		$('#res-change' + i).transition({ opacity: 0.00, top: "-15px"}, 2000, function(){
			$( this ).hide();
		});
	}
};

var collectResourcePackage = function( pkgindex ){
	submitCollectResources( pkgindex );
};

var payUpkeepPackage = function( pkgindex ){
	submitPayUpkeep( pkgindex );
};

var tradeFourToOne = function( paykind, getkind ){
	submitTradeFourToOne( paykind, getkind );
	hideFourToOneMenu( paykind );
};

var toggleFourToOneMenu = function( res ){
	for ( var i = RES_METAL; i <= RES_FOOD; i++){
		if ( i == res){
			if ( $('#fourtoone-menu' + i).is(":visible") ){
				hideFourToOneMenu( i );
			}
			else {
				showFourToOneMenu( i );
			}
		}
		else {
			hideFourToOneMenu( i );
		}
	}
};

var hideFourToOneMenu = function( res ){
	$('#fourtoone-menu' + res).transition({ opacity: 0.00}, 250, function(){
		$( this ).hide();
	});
};

var showFourToOneMenu = function( res ){
	$('#fourtoone-menu' + res).show();
	$('#fourtoone-menu' + res).transition({ opacity: 1.00}, 250);
};

// draws the Trade Menu in one of two ways, depending on whether triggered from
// the 'trade' button on the resource menu or from clicking a trade offer on a 
// player stats menu. (if player is null, it means we are offerig a new trade) 
var drawTradeMenu = function(player) {
	
	// player is null if this function triggered from 'Trade' on Resource Menu
	if (player == null) {

		allowTradeMenuChanges('auto');

		for ( var i = RES_METAL; i <= RES_FOOD; i++ ){
			$('#player-trade-res' + i).html(0);
			$('#opponent-trade-res' + i).html(0);
		}
		var playersHtml = "<table><tr>";
		var count = 0;
		for ( var p = 0; p < 4; p++ ){
			if ( p < clientGame.game.players.length ){
				if ( p != clientTurn){
					// AAAGh not sure what to do here. 
					$('#trade-radio-n' + count).removeClass('radio-off trade-radio-p' + p).addClass('radio-on');
					playersHtml += '<td class="trade-radio-button radio-on" id="trade-radio-button' + p + '"';
					playersHtml += 'onclick="javascript:toggleTradeRadio(' + p + ')"></td>';
					count += 1;
				}
			}
			else {
				// Aaugh Not sure what to do here either!
				$('#trade-radio-n' + count).off();
				count += 1;
			}
		}
		playersHtml += "</tr></table>";
		$('#trade-offers-div').html(playersHtml);
		$('#trade-button-yes').prop('value', 'Submit Request');
		$('#trade-button-yes').css('pointer-events', 'auto');
		$('#trade-button-yes').off().click( function() { 

			allowTradeMenuChanges('none');

			$('#trade-button-yes').prop('value', 'Waiting...');
			$('#trade-button-yes').css('pointer-events', 'none');
			
			// get list of offered players
			var offered_to = [];
			$('.trade-radio-button').each(function() {
				if ( $(this).hasClass('radio-on') ){
					var offeredid = parseInt(this.id[this.id.length - 1], 10);
					offered_to.push(offeredid);
				}
			});

			// get list of player resources to be traded
			requester_resources = [0,0,0,0];
			for ( var i = RES_METAL; i <= RES_FOOD; i++ ){
				requester_resources[i] = parseInt( $('#player-trade-res' + i)[0].innerHTML, 10);
			}

			// get list of opponent resources to be traded
			opponent_resources = [0,0,0,0];
			for ( var i = RES_METAL; i <= RES_FOOD; i++ ){
				opponent_resources[i] = parseInt( $('#opponent-trade-res' + i)[0].innerHTML, 10);
			}

			submitTradeRequest(requester_resources, opponent_resources, offered_to);

			var checker = setInterval( function(){ 
				var trade = clientGame.game.trades[clientTurn];
				if (trade == undefined) {
					hideTradeMenu();
					clearInterval(checker);
				}
				else if ( trade.offered_to.length == trade.declined.length ){
					$('#trade-button-yes').prop('value', 'Declined');
					clearInterval(checker);
				}
			}, 500);
		});
		$('#trade-button-no').prop('value', 'Cancel');
		$('#trade-button-no').off().click( function() { 
			if (clientGame.game.trades[clientTurn] != undefined){
				submitTradeCancel(); 
			}
			hideTradeMenu();
		});
	}
	else {
		var trade = clientGame.game.trades[player];
		// flip these since these are now being viewed by the opponent
		var requester_resources = trade.opponent_resources;
		var opponent_resources = trade.requester_resources;
		var offered_to = trade.offered_to;

		for ( var i = RES_METAL; i <= RES_FOOD; i++ ){
			$('#player-trade-res' + i).html(requester_resources[i]);
			$('#opponent-trade-res' + i).html(opponent_resources[i]);
		}
		var playersHtml = "<table><tr>";
		for ( var p = 0; p < 4; p++ ){
			if ( p < clientGame.game.players.length ){
				if ( p != player){
					playersHtml += '<td class="trade-radio-button';
					if ( offered_to.indexOf(p) != -1 ) { 
						playersHtml += ' radio-on'; 
					}
					else {
						playersHtml += ' radio-off';
					}
					playersHtml += '" id="trade-radio-button' + p + '"></td>';
				}
			}
			else {
				playersHtml += '<td style="width: 25px height:25px"></td>';
			}
		}
		playersHtml += "</tr></table>";
		$('#trade-offers-div').html(playersHtml);
		$('#trade-button-yes').prop('value', 'Accept Trade');
		$('#trade-button-yes').css('pointer-events', 'auto');
		$('#trade-button-yes').off().click( function() { 
			submitTradeAccept(player);
			hideTradeMenu();
		});
		$('#trade-button-no').prop('value', 'Decline');
		$('#trade-button-no').off().click( function() { 
			submitTradeDecline(player);
			hideTradeMenu();
		});

		allowTradeMenuChanges('none');
	}
	setInterfaceImage('.trade-radio-button');
	showTradeMenu();
};

// sets user-configurable settings' pointer-events properties 
// in trade menu to val (val must be either 'none' or 'auto')
var allowTradeMenuChanges = function( val ){
	$('.trade-radio-button').each( function() {
		$(this).css( 'pointer-events', val );
	});
	$('.trade-arrow-down').each( function() {
		$(this).css( 'pointer-events', val );
	});
	$('.trade-arrow-up').each( function() {
		$(this).css( 'pointer-events', val );
	});
};

var handletradeArrow = function(player, res, val){
	createjs.Sound.play("click1");
	var value = parseInt($('#' + player + '-trade-res' + res)[0].innerHTML, 10);
	if ( value + val <= 9 && value + val >= 0){
		$('#' + player + '-trade-res' + res).html(value + val);
	}
};

var toggleTradeRadio = function( player ){
	createjs.Sound.play("click2");
	$('#trade-radio-button' + player).toggleClass('radio-on');
	$('#trade-radio-button' + player).toggleClass('radio-off');
};

var showTradeMenu = function() {
	createjs.Sound.play("click2");
	$('#trade-menu-div').show();
	$('#trade-menu-div').transition({ opacity: 1.00, top: "40%" }, 1000);
	$('#trade-menu-div').css();
	$('#trade-screen').show();
	$('#trade-screen').transition({ opacity: 1.00 }, 1000);
};

var hideTradeMenu = function() {
	$('#trade-menu-div').transition({opacity: 0.00,top: "38%"}, 1000,function(){
		$( this ).hide();
	});
	$('#trade-screen').transition({ opacity: 0.00}, 1000, function(){
		$( this ).hide();
	});
};