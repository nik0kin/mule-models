/**
 * Created by niko on 5/6/14.
 */

var Q = require('q'),
  _ = require('lodash');


exports.startGameQ = function (game) {
  var GameBoard = require('mule-models').GameBoard.Model, // TODO why can I put this higher than this scope?
    RuleBundle = require('mule-models').RuleBundle.Model,
    History = require('mule-models').History.Model,
    PieceState = require('mule-models').PieceState.Model,
    SpaceState = require('mule-models').SpaceState.Model;

  return Q.promise(function (resolve, reject) {
    var newSpacesIds = [],
      newPieceIds = [];

    var currentRuleBundle;

    RuleBundle.findByIdQ(game.ruleBundle.id)
      .then(function (foundRuleBundle) {
        currentRuleBundle = foundRuleBundle;

        return GameBoard.findByIdQ(game.gameBoard);
      })
      .then(function (foundGameBoard) {
        var spacesMasterOptions = {
          'built': foundGameBoard.board,
          'static': currentRuleBundle.rules.board
        };
        var spacesMaster = spacesMasterOptions[foundGameBoard.boardType];

        var createPromises = [];

        // DEFINE PLAYER VARS
        foundGameBoard.playerVariables = {};
        _.each(game.players, function (value, key) {
          foundGameBoard.playerVariables[key] = {
            lose: false
          };
        });
        foundGameBoard.markModified('playerVariables');

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
                _.each(foundGameBoard.playerVariables, function (value, key) {
                  var p = _.clone(params);
                  p.id = pieceId++;
                  p.ownerId = key;
                  p.locationId = pieceDef.spaceId;

                  createPromises.push(promiseSaveAndAddIdToArray(p));
                });
                break;
              case 'each-random-location':
                //make one for each player (gotta check how many players) in a random location (of the available spaces)
                _.each(foundGameBoard.playerVariables, function (value, key) {
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

        return Q.all(createPromises)
          .then (function () {
          return Q(foundGameBoard);
        });
      })
      .then(function (foundGameBoard) {
        return History.createQ(game)
          .then(function (newHistory) {
            foundGameBoard.history = newHistory._id;
            return Q(foundGameBoard);
          });
      })
      .then(function (foundGameBoard) {
        foundGameBoard.spaces = newSpacesIds;
        foundGameBoard.markModified('spaces');

        foundGameBoard.pieces = newPieceIds;
        foundGameBoard.markModified('pieces');

        return foundGameBoard.saveQ();
      })
      .then(function (foundGameBoard) {
        // TODO hacky again :(
        console.log('hacking hard here ' + foundGameBoard.ruleBundle.name)
        if (foundGameBoard.ruleBundle.name === 'MuleSprawl') {
          var x = require('mule-rules/bundles/mulesprawl/gameStart')(foundGameBoard);
          console.log(x);
          return x;
        } else
          return Q(foundGameBoard);
      })
      .then(function (modifiedGame) {
        resolve(modifiedGame);
      })
      .fail(function (err) {
        console.log('startGameQ failed: ');
        console.log(err);
        reject(err);
      });
  });
};

