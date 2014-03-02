/**
 * test/dbHelper.js
 *
 * Created by niko on 1/28/14.
 */

var Q = require('q');

require ('../server.js');

var Game = require('../models/Game/index').Model,
  User = require('../models/User').Model,
  GameBoard = require('../models/GameBoard/index').Model,
  RuleBundle = require('../models/RuleBundle/index').Model;


exports.clearAllModelsCollectionQ = function () {
  return Q.all([
    User.removeQ({}),
    Game.removeQ({}),
    GameBoard.removeQ({}),
    RuleBundle.removeQ({})
  ]);
};

exports.clearAllModelsCollectionCallback = function (done) {
  exports.clearAllModelsCollectionQ()
    .done(function (value) {
      done();
    }, function (err) {
      done(err);
    });
};

exports.clearUsersAndGamesCollectionQ = function () {
  return Q.all([User.removeQ({}), Game.removeQ({}), GameBoard.removeQ({})]);
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
  return User.findByIdQ(userID);
};


exports.addGameQ = function (createGameParameters, creator) {
  var newGame = new Game(createGameParameters);
  newGame.markModified(createGameParameters.ruleBundle);
  return newGame.saveQ();
};

exports.getGameQ = function (gameID) {
  return Game.findByIdQ(gameID);
};
