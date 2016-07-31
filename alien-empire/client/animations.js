var fadeIn = function(container, time, drop, override){
	if (override){
		var num_existing_tweens = createjs.Tween.hasActiveTweens(container);
		if ( num_existing_tweens ){
			num_objects_moving -= num_existing_tweens;
		}
	}
	if (override || !createjs.Tween.hasActiveTweens(container) ){
		container.visible = true;
		num_objects_moving += 1;
		container.alpha = 0;
		createjs.Tween.get(container, {override: override}).to({ alpha:1}, time ).call(handleTweenComplete);
		if (drop) {
			playSound("flutter3", 0.2);
			container.y = container.y - DROP_DIST;
			createjs.Tween.get(container).to({ y:container.y + DROP_DIST}, time );
		}
	}
};

var fadeOut = function(container, time, raise) {
	if (!createjs.Tween.hasActiveTweens(container) ) {
		num_objects_moving += 1;
		container.alpha = 1;
		createjs.Tween.get(container).to({ alpha:0, visible:false}, time ).call(handleTweenComplete);
		if (raise) {
			createjs.Tween.get(container).to({ y:container.y - DROP_DIST}, time );
		}
	}
};

var handleTweenComplete = function(){
	num_objects_moving -= 1;
};

var alphaTo = function(container, time, alpha, override){
	if (override){
		var num_existing_tweens = createjs.Tween.hasActiveTweens(container);
		if ( num_existing_tweens ){
			num_objects_moving -= num_existing_tweens;
		}
	}
	if (override || !createjs.Tween.hasActiveTweens(container)){
		num_objects_moving += 1;
		createjs.Tween.get(container, {override: override}).to({ alpha: alpha}, time ).call(handleTweenComplete);
	}
};