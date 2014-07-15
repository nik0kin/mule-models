/**
 * Created by niko on 5/6/14.
 */

var Q = require('q'),
  _ = require('lodash');


exports.startGameQ = function (game) {
  var GameBoard = require('mule-models').GameBoard.Model, // TODO why can I put this higher than this scope?
    GameState = require('mule-models').GameState.Model,
    RuleBundle = require('mule-models').RuleBundle.Model,
    History = require('mule-models').History.Model,
    PieceState = require('mule-models').PieceState.Model,
    SpaceState = require('mule-models').SpaceState.Model;

  return Q.promise(function (resolve, reject) {
    var newSpacesIds = [],
      newPieceIds = [];

    var currentRuleBundle,
      _gameBoard,
      _gameState;

    RuleBundle.findByIdQ(game.ruleBundle.id)
      .then(function (foundRuleBundle) {
        currentRuleBundle = foundRuleBundle;

        return GameBoard.findByIdQ(game.gameBoard);
      })
      .then(function (foundGameBoard) {
        _gameBoard = foundGameBoard;
      })
      .then(function () {
        var spacesMasterOptions = {
          'built': _gameBoard.board,
          'static': currentRuleBundle.rules.board
        };
        var spacesMaster = spacesMasterOptions[_gameBoard.boardType]; //boardDef?

        var createPromises = [];

        // GAME STATE
        var newGameState = new GameState({});

        // DEFINE PLAYER VARS
        newGameState.playerVariables = {};
        _.each(game.players, function (value, key) {
          newGameState.playerVariables[key] = {
            lose: false
          };
        });
        newGameState.markModified('playerVariables');

        // CREATE SPACES
        _.each(spacesMaster, function (value, key) {
          var newSpaceState = new SpaceState();
          newSpaceState.boardSpaceId = value.id;
          newSpaceState.attributes = value.attributes;

          var promise = newSpaceState.saveQ()
            .then(function (savedSpaceState) {
              newSpacesIds.push(savedSpaceState._id);
            });

          createPromises.push(promise);
        });

        // CREATE PIECES
        var promiseSaveAndAddIdToArray = function (params) {
          var newPieceState = new PieceState(params);
          return newPieceState.saveQ()
            .then(function (savedPieceState) {
              newPieceIds.push(savedPieceState._id);
            });
        };

        var pieceId = 0;
        _.each(currentRuleBundle.rules.startingPieces, function (startingPiecesValue, startingPiecesTypeKey) {
          _.each(startingPiecesValue, function (pieceDef) {
            var params = {
              id: pieceId,
              class: pieceDef.class,
              attributes: pieceDef.attributes
            };

            switch(startingPiecesTypeKey) {
              case 'each':
                //make one for each player (gotta check how many players)
                _.each(newGameState.playerVariables, function (value, key) {
                  var p = _.clone(params);
                  p.id = pieceId++;
                  p.ownerId = key;
                  p.locationId = pieceDef.spaceId;

                  createPromises.push(promiseSaveAndAddIdToArray(p));
                });
                break;
              case 'each-random-location':
                //make one for each player (gotta check how many players) in a random location (of the available spaces)
                _.each(newGameState.playerVariables, function (value, key) {
                  var randomLoc = spacesMaster[Math.floor(Math.random() * (spacesMaster.length + 1))].id;
                  var p = _.clone(params);
                  p.id = pieceId++;
                  p.locationId = randomLoc;
                  p.ownerId = key;
                  createPromises.push(promiseSaveAndAddIdToArray(p));
                });
                break;
              default:
                //make one for the player (startingPiecesTypeKey)
                params.locationId = pieceDef.spaceId;
                params.ownerId = startingPiecesTypeKey;
                pieceId++;

                createPromises.push(promiseSaveAndAddIdToArray(params));
                break;
            }
          });
        });

        _gameState = newGameState;
        return Q.all(createPromises);
      })
      .then(function () {
        _gameState.spaces = newSpacesIds;
        _gameState.markModified('spaces');

        _gameState.pieces = newPieceIds;
        _gameState.markModified('pieces');

        return _gameState.saveQ();
      })
      .then(function (savedGameState) {
        console.log('calling gameStart ' + _gameBoard.ruleBundle.name)
        var MuleRules = require('mule-rules');
        console.log(MuleRules.getBundleCode(_gameBoard.ruleBundle.name));
        var ruleBundleGameStartQ = MuleRules.getBundleCode(_gameBoard.ruleBundle.name).gameStart;
        if (ruleBundleGameStartQ) {
          return ruleBundleGameStartQ(savedGameState);
        } else {
          return Q(savedGameState);
        }
      })
      .then(function (savedGameState) {
        return History.createQ(game)
      })
      .then(function (newHistory) {
        _gameBoard.history = newHistory._id;
        _gameBoard.gameState = _gameState._id;
        return _gameBoard.saveQ();
      })
      .then(function (savedGameBoardState) {
        return game.setTurnTimerQ();
      })
      .then(function (savedGame) {
        resolve(savedGame);
      })
      .fail(function (err) {
        console.log('startGameQ failed: ');
        console.log(err);
        reject(err);
      });
  });
};

