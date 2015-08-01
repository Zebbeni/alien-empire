(function(){
	var app = angular.module('alien-empire', []);

	app.controller('LoginController', function(){
		this.username = "";
		this.show_login = true;

		this.selectLogin = function(){
		    this.username = document.getElementById('name-text').value;
		    this.show_login = false;
			console.log(this.username);
			socket.emit('login', this.username);
		};

	});

	app.controller('LobbyController', function(){
		this.users = [];
		this.show_lobby = false;

		socket.on('user login', function(users) {
			this.show_lobby = true;
			this.users = users;
			console.log(this.users);
		});
	});

})();