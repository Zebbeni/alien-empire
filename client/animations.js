var fadeIn = function(container, time){
	container.visible = true;
	num_objects_moving += 1;
	container.alpha = 0;
	createjs.Tween.get(container, {override:true}).to({ alpha:1}, time ).call(handleTweenComplete);
};

var fadeOut = function(container, time){
	num_objects_moving += 1;
	container.alpha = 1;
	createjs.Tween.get(container, {override:true}).to({ alpha:0}, time ).call(handleTweenComplete);
};