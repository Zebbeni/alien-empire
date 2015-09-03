socket.on('room game starting', function(game) {
    clientGame = game; // should actually receive the starting state of the game
                        // OR we could trigger the game interface to come up while
                        // the sferver initializes and sends the game info

    game_init();
    // THIS IS WHERE WE TRIGGER THE CLIENT TO START THE GAME UX
    moveToGame();
    // alert('woo! your game is starting!');
});