(function(){
	var app = angular.module('store', []);

	app.controller('StoreController', function(){
		this.product = options; //we're making 'product' a property of our controller
	});

	app.controller('LoginController', function(){
		this.register = false;

		this.selectRegister = function(){
			this.register = true;
		};

		this.selectLogin = function(){
			this.register = false;
		};

		this.isRegistering = function() {
			return this.register;
		};
	});

	var options = [
		{
			name: 'Login',
			description: 'I have an existing account',
			show: true
		},
		{
			name: 'New User',
			description: 'I need an account!',
			show: true
		}
	];
})();