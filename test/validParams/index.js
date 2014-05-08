/**
 * index
 * - @nikpoklitar
 */
var _ = require('lodash');

var gameConfigs = require('./gameConfig');

exports.getRandomGameConfig = function () {
  return gameConfigs[_.random(0, _.size(gameConfigs) - 1)];
};