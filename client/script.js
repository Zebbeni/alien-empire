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

$(document).ready(function() {
    $('#logoff').click(function() {
        console.log("hit the logoff button");
        socket.emit('logoff');
    });
});