/**
 * Models->Game-> validateHelper.js
 *
 * Created by niko on 1/28/14.
 */
 
var MAX_GAMENAME_LENGTH = 75;
 
var _ = require('underscore');

var gameStatusUtils = require('mule-utils/gameStatusUtils'),
  playerGameStatusUtils = require('mule-utils/playerGameStatusUtils'),
  RuleBundle = require('../RuleBundle/index').Model;

exports.addValidators = function (GameSchema) {
  GameSchema.path('name').validate(validateNameLength, '\'name\' length must be within the range 1 - ' + MAX_GAMENAME_LENGTH)
  //GameSchema.path('ruleBundle').validate(validateRuleBundleID, 'invalid ruleBundle ID or name');
  GameSchema.path('gameStatus').validate(gameStatusUtils.validateGameStatus, 'gameStatus must equal one of the following: open, inProgress, or finished');
  GameSchema.path('maxPlayers').validate(validateNumberOfPlayers, 'maxPlayers must be within the range: 2 - 10');
  GameSchema.path('players').validate(validateGamePlayersObject, 'game->players object became invalid..');
};

var validateNameLength = function (nameStr) {
  return _.isString(nameStr) && nameStr.length > 0 && nameStr.length <= MAX_GAMENAME_LENGTH;
};

var validateNumberOfPlayers = function (number) {
  return _.isNumber(number) && number >= 1;
};

//an object when every key contains an object with 'playerID' & 'playerStatus'
// {playerID : 'DEFAULT_PIGGIE_ID', playerStatus : 'default'}
// TODO how can i get this to check how many players are in the game?
// could go further to validate that playerID refers to an existing User.ID
var validateGamePlayersObject = function (players) {
  var allGood = true;
  _.each(players, function (value, key) {
    if (!value.playerID && value.playerStatus
        && playerGameStatusUtils.validatePlayerStatus(value.playerStatus) ){
        allGood = false;
      console.log('validated player:' + key);
      console.log(value);   // TODO when does this get called
    }
  });
  return allGood;
};

