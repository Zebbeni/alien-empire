(function(){
	var app = angular.module('alien-empire', []);

	app.controller('SiteController', function(){
		this.logged_in = false;
	});

	app.controller('LoginController', function(){
		this.username = "";

		this.selectLogin = function(){
		    this.username = document.getElementById('name-text').value;
			console.log(this.username);
			socket.emit('login', this.username);
		};

	});

	app.controller('LobbyController', function(){
		this.users = [];

		socket.on('user login', function(users) {
			logged_in = true;
			this.users = users;
			console.log(this.users);
		});
	});

})();