/**
 * test/dbHelper.js
 *
 * Created by niko on 1/28/14.
 */

var Q = require('q');

require ('../server.js');

var Game = require('../models/Game/index'),
 // gamesHelper = require('../app/controllers/games/crud/helper'),
  User = require('../models/User');
  //users = require('../app/controllers/users/crud/helper');


exports.clearUsersAndGamesCollectionQ = function () {
  return Q.all([User.removeQ({}), Game.removeQ({})]);
};
exports.clearUsersAndGamesCollection = function (done) {
  exports.clearUsersAndGamesCollectionQ()
    .done(function (value) {
      done();
    }, function (err) {
      done(err);
    });
};

exports.addUserQ = function (userParameters) {
  var newUser = new User(userParameters);
  return newUser.saveQ();
};

exports.getUserQ = function (userID) {
  return User.findByIdQ(gameID);
};


exports.addGameQ = function (createGameParameters, creator) {
  var newGame = new Game(createGameParameters);
  return newGame.saveQ();
};

exports.getGameQ = function (gameID) {
  return Game.findByIdQ(gameID);
};
