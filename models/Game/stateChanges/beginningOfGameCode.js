/**
 * Created by niko on 5/6/14.
 */

var Q = require('q');

exports.startGameQ = function (game) {
  var GameBoard = require('mule-models').GameBoard.Model;
  return Q.promise(function (resolve, reject) {
    GameBoard.findByIdQ(game.gameBoard)
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
        foundGameBoard.spaces = foundGameBoard.board;
        foundGameBoard.markModified('spaces');

        return foundGameBoard.saveQ();
      })
      .then(function () {
        resolve(game);
      })
      .fail(reject);
  });
};

