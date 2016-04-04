var fadeIn = function(container, time, drop, override){
	container.visible = true;
	num_objects_moving += 1;
	container.alpha = 0;

	if (override){
		var num_existing_tweens = createjs.Tween.hasActiveTweens(container);
		if ( num_existing_tweens ){
			num_objects_moving -= num_existing_tweens;
		}
	}

	createjs.Tween.get(container, {override: override}).to({ alpha:1}, time ).call(handleTweenComplete);
	if (drop) {
		container.y = container.y - DROP_DIST;
		createjs.Tween.get(container).to({ y:container.y + DROP_DIST}, time );
	}
};

var fadeOut = function(container, time, raise){
	num_objects_moving += 1;
	container.alpha = 1;
	createjs.Tween.get(container).to({ alpha:0, visible:false}, time ).call(handleTweenComplete);
	if (raise) {
		createjs.Tween.get(container).to({ y:container.y - DROP_DIST}, time );
	}
};

var handleTweenComplete = function(){
	num_objects_moving -= 1;
};

var alphaTo = function(container, time, alpha, override){
	num_objects_moving += 1;

	if (override){
		var num_existing_tweens = createjs.Tween.hasActiveTweens(container);
		if ( num_existing_tweens ){
			num_objects_moving -= num_existing_tweens;
		}
	}

	createjs.Tween.get(container, {override: override}).to({ alpha: alpha}, time ).call(handleTweenComplete);
};