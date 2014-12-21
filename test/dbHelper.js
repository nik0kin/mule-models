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
  GameState = require('../models/GameState/index').Model,
  PieceState = require('../models/PieceState/index').Model,
  SpaceState = require('../models/SpaceState/index').Model,
  RuleBundle = require('../models/RuleBundle/index').Model;


var clearGamesCollectionsQ = function () {
  return Q.all([
    Game.removeQ({}),
    GameBoard.removeQ({}),
    GameState.removeQ({}),
    PieceState.removeQ({}),
    SpaceState.removeQ({})
  ]);
};
exports.clearGamesCollectionsQ = clearGamesCollectionsQ;

exports.clearGamesCollections = function (done) {
    exports.clearGamesCollectionsQ()
    .done(function (value) {
      done();
    }, function (err) {
      done(err);
    });
}

exports.clearAllModelsCollectionQ = function () {
  return Q.all([
    User.removeQ({}),
    clearGamesCollectionsQ(),
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
  return Q.all([
    User.removeQ({}),
    clearGamesCollectionsQ()
  ]);
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
