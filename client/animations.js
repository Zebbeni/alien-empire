var fadeIn = function(container, time, drop){
	container.visible = true;
	num_objects_moving += 1;
	container.alpha = 0;
	createjs.Tween.get(container, {override:true}).to({ alpha:1}, time ).call(handleTweenComplete);
	if (drop) {
		container.y = container.y - DROP_DIST;
		createjs.Tween.get(container).to({ y:container.y + DROP_DIST}, time );
	}
};

var fadeOut = function(container, time, raise){
	num_objects_moving += 1;
	container.alpha = 1;
	createjs.Tween.get(container, {override:true}).to({ alpha:0, visible:false}, time ).call(handleTweenComplete);
	if (raise) {
		createjs.Tween.get(container).to({ y:container.y - DROP_DIST}, time );
	}
};

var handleTweenComplete = function(){
	num_objects_moving -= 1;
};