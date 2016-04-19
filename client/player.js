// values used to build 
var clientColor = null;
var clientTurn = null; // number in turn sequece for this client

var pendingAction = {};

var clearPendingAction = function() {
	pendingAction = {};
};

var setPendingAction = function( actiontype ) {
	pendingAction.player = clientTurn;
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

var setPendingAgent = function( agenttype ) {
	pendingAction.agenttype = agenttype;
};

var setPendingSmuggler = function( usesmuggler ){
	pendingAction.usesmuggler = usesmuggler;
};

var setPendingTargetId = function( id ) {
	pendingAction.targetid = id;
};

var setPendingTargetPlayer = function( p ) {
	pendingAction.targetPlayer = p;
};

// Sets pendingAction.choice to a given value. If choice is an 
// array, we either push the value to the array or remove it if 
// the value is already contained in the array
var setPendingChoice = function( value ){
	if ( value != undefined 
		  && pendingAction.choice != undefined) {
		if (pendingAction.choice.constructor === Array){
			var index = pendingAction.choice.indexOf(value);
			if ( index == -1 ){
				pendingAction.choice.push(value);
			}
			else {
				pendingAction.choice.splice(index, 1);
			}
			return;
		}
	}
	pendingAction.choice = value;
};