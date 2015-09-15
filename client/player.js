// values used to build 
var clientColor = null;
var clientTurn = null; // number in turn sequece for this client

var pendingAction = {};

var clearPendingAction = function() {
	pendingAction = {};
};

var setPendingAction = function( actiontype ) {
	pendingAction.userid = clientId;
	pendingAction.actiontype = actiontype;
};

var setPendingPlanet = function( planetid ) {
	pendingAction.planetid = planetid;
};

var setPendingResource = function( index ) {
	pendingAction.resourceid = index;
};

var setPendingObject = function( objecttype ) {
	pendingAction.objecttype = objecttype;
};