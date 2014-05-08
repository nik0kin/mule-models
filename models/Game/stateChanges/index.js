/**
 * Models->Game->methods-> stateChanges/index.js
 *
 * Created by niko on 2/7/14.
 */

var Q = require('q'),
  _ = require('lodash'),
  winston = require('winston');

var gameStatusUtils = require('mule-utils/gameStatusUtils'),
  startGameCode = require('./beginningOfGameCode');

exports.changeStateQCallback = function () {
  return function (newState) {
    var thisGame = this;
    return Q.promise(function (resolve, reject) {
      if (!gameStatusUtils.validateGameStatus(newState))
        return reject('Invalid newState: ' + newState);

      if (thisGame.playersCount < 1)
        return reject('Empty Game');

      var promise = Q(thisGame);

      switch (newState) {
        case 'open' :
          break;
        case 'inProgress' :
          thisGame.gameStatus = 'inProgress';
          promise = startGameCode.startGameQ(thisGame);
          break;
        case 'finished' :
          break;
      }

      promise
        .then(function (game) {
          return game.saveQ();
        })
        .then(function (game) {
          winston.info('game[' +  game._id + '] State changed to ' + game.gameStatus);
          resolve(game);
        })
        .fail(function (err) {
          reject(err);
        });
    });
  };
};