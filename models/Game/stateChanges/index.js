/**
 * Models->Game->methods-> stateChanges/index.js
 *
 * Created by niko on 2/7/14.
 */

var Q = require('q'),
  _ = require('lodash'),
  winston = require('winston');

var gameStatusUtils = require('mule-utils/gameStatusUtils');

exports.changeStateQCallback = function () {
  return function (newState) {
    var thisGame = this;
    return Q.promise(function (resolve, reject) {
      if (!gameStatusUtils.validateGameStatus(newState))
        return reject('Invalid newState: ' + newState);

      if (thisGame.playersCount < 1)
        return reject('Empty Game');

      thisGame.gameStatus = newState;

      winston.info('game[' + thisGame._id + '] State changed to ' + thisGame.gameStatus);
      resolve(thisGame);
    });
  };
};