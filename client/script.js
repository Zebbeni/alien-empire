var socket = io.connect();
var name = "";

socket.on('messages', function () {
    var name = prompt("what's your username?");
    console.log(name);
    socket.emit('login', name);
});

socket.on('user login', function(users) {
    var usersTd = document.getElementById('users');
    usersTd.innerHTML = "";
    for (var i in users) {
        usersTd.innerHTML += users[i] + "<br>";
    }
});

socket.on('user logoff', function(users) {
    var usersTd = document.getElementById('users');
    usersTd.innerHTML = "";
    for (var i in users) {
        usersTd.innerHTML += users[i] + "<br>";
    }
});

function login() {
    console.log('logged in as ', document.getElementById('username').value );
    socket.emit('login', document.getElementById('username').value );
};

$(document).ready(function() {
    $('#logoff').click(function() {
        socket.emit('logoff');
    });

    $('#get_username').click(function() {
        console.log("client username: " + this.username);
        console.log("client id: " + this.id_num);
    })
});