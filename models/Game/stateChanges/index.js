/**
 * Models->Game->methods-> stateChanges/index.js
 *
 * Created by niko on 2/7/14.
 */

var Q = require('q'),
  _ = require('underscore'),
  winston = require('winston');

var gameStatusUtils = require('mule-utils/gameStatusUtils');

exports.changeStateQCallback = function () {
  return function (newState) {
    var _this = this;
    return Q.promise(function (resolve, reject) {
      if (!gameStatusUtils.validateGameStatus(newState))
        return reject('Invalid newState: ' + newState);

      if (_this.playersCount < 1)
        return reject('Empty Game');


      switch (newState) {
        case 'open' :
          break;
        case 'inProgress' :
          _this.gameStatus = 'inProgress';
          break;
        case 'finished' :
          break;
      }

      _this.saveQ()
        .done(function () {
          winston.info('game[' +  _this._id + '] State changed to ' + _this.gameStatus);
          resolve();
        }, reject);
    });
  };
};