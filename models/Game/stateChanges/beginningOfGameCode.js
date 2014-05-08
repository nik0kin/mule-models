/**
 * Created by niko on 5/6/14.
 */

var Q = require('q'),
  _ = require('lodash');


exports.startGameQ = function (game) {
  var GameBoard = require('mule-models').GameBoard.Model, // TODO why can I put this higher than this scope?
    RuleBundle = require('mule-models').RuleBundle.Model,
    SpaceState = require('mule-models').SpaceState.Model;

  return Q.promise(function (resolve, reject) {
    var newSpacesIds = [];

    var currentRuleBundle;

    RuleBundle.findByIdQ(game.ruleBundle.id)
      .then(function (foundRuleBundle) {
        currentRuleBundle = foundRuleBundle;

        return GameBoard.findByIdQ(game.gameBoard);
      })
      .then(function (foundGameBoard) {
        // every player gets 3 pieces (no space assigned)
        var pieceId = 0;

        var pieces = [];

        pieces.push({
          id: pieceId++,
          spaceId: 0,
          owner: '1'
        });
        pieces.push({
          id: pieceId++,
          spaceId: 0,
          owner: '2'
        });

        foundGameBoard.pieces = pieces;
        foundGameBoard.markModified('pieces');

        // make spaces copy from ruleBundle gameboard or w/e
        var createSpacesPromises = [];

        var spacesMaster;

        if (foundGameBoard.boardType === 'built') { // TODO enumifiy this
          spacesMaster = foundGameBoard.board;
        } else if (foundGameBoard.boardType === 'static') {
          spacesMaster = currentRuleBundle.rules.board;
        }

        _.each(spacesMaster, function (value, key) {
          var newSpaceState = new SpaceState();
          newSpaceState.boardSpaceId = value.id;
          newSpaceState.attributes = value.attributes;

          var promise = newSpaceState.saveQ()
            .then(function (savedSpaceState) {
              newSpacesIds.push(savedSpaceState._id);
            });

          createSpacesPromises.push(promise);
        });

        return Q.all(createSpacesPromises)
          .then (function () {
            return Q(foundGameBoard);
        });
      })
      .then(function (foundGameBoard) {
        foundGameBoard.spaces = newSpacesIds;
        foundGameBoard.markModified('spaces');

        return foundGameBoard.saveQ();
      })
      .then(function () {
        resolve(game);
      })
      .fail(reject);
  });
};

