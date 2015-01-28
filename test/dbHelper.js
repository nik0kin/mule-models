/**
 * test/dbHelper.js
 *
 */

var Q = require('q');

var Game,
  User,
  GameBoard,
  History,
  GameState,
  PieceState,
  SpaceState,
  RuleBundle;

// required to be called before dbHelper can be used.
exports.init = function () {
  if (Game) return;
  Game = require('../models/Game/index').Model,
  User = require('../models/User').Model,
  GameBoard = require('../models/GameBoard/index').Model,
  History = require('../models/History').Model,
  GameState = require('../models/GameState/index').Model,
  PieceState = require('../models/PieceState/index').Model,
  SpaceState = require('../models/SpaceState/index').Model,
  RuleBundle = require('../models/RuleBundle/index').Model;
};

var clearGamesCollectionsQ = function () {
  return Q.all([
    Game.removeQ({}),
    GameBoard.removeQ({}),
    History.removeQ({}),
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

exports.getUserQ = function (userId) {
  return User.findByIdQ(userId);
};


exports.addGameQ = function (createGameParameters, creator) {
  var newGame = new Game(createGameParameters);
  newGame.markModified(createGameParameters.ruleBundle);
  return newGame.saveQ();
};

exports.getGameQ = function (gameId) {
  return Game.findByIdQ(gameId);
};
