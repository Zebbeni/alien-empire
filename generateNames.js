"use strict";

var utils = require('./utils');

console.log('Planets:');
for (var i = 0; i < 20; i++) {
    var name = utils.generatePlanetName();
    console.log('  ' + name);
}
console.log('\nNames:');
for (var i = 0; i < 20; i++) {
    var name = utils.generateComputerPlayerName();
    console.log('  ' + name);
}