/**
 * Models->RuleBundle-> validateHelper.js
 *
 * Created by niko on 2/9/14.
 */

var _ = require('lodash');

var MIN_PLAYERS_PER_GAME = 1;
var MAX_PLAYERS_PER_GAME = 100;

exports.addValidators = function (GameSchema) {
  GameSchema.path('name')
    .validate(validateNameLength, '\'name\' length must be within the range 1 - 30');

  GameSchema.path('turnSubmitStyle')
    .validate(validateTurnSubmitStyle, 'turnSubmitStyle must equal \'roundRobin\' or \'playByMail\'');

  GameSchema.path('staticBoardSettings')
    .validate(validateStaticBoardSettings, 'staticBoardSettings must contain a key \'boardStyle\' with valid value');

  GameSchema.path('gameSettings')
    .validate(validateGameSettings, 'gameSettings must contain a valid playerLimit and a valid customBoardSettings object');
};

var validateNameLength = function (nameStr) {
  return _.isString(nameStr) && nameStr.length > 0 && nameStr.length <= 30;
};

var validateTurnSubmitStyle = function (string) {
  return _.isEqual(string, 'roundRobin') || _.isEqual(string, 'playByMail');
};

var validateStaticBoardSettings = function (staticBoardSettingsObject) {
  if (staticBoardSettingsObject.boardStyle)
    return _.isEqual(staticBoardSettingsObject.boardStyle, 'linear')
      || _.isEqual(staticBoardSettingsObject.boardStyle, 'linearCircular')
      || _.isEqual(staticBoardSettingsObject.boardStyle, 'graph')
      || _.isEqual(staticBoardSettingsObject.boardStyle, 'hexGrid')
      || _.isEqual(staticBoardSettingsObject.boardStyle, 'squareGrid');

  return false;
};

var validateGameSettings = function (gameSettingsObject) {
  if (!gameSettingsObject || !gameSettingsObject.playerLimit || !gameSettingsObject.customBoardSettings)
    return false;

  var playerLimit = gameSettingsObject.playerLimit;
  var customBoardSettings = gameSettingsObject.customBoardSettings;

  var isValidPlayerLimit = validatePlayerLimit(playerLimit);
  var isValidCustomBoardSettings = validateCustomBoardSettings(customBoardSettings);

  return isValidCustomBoardSettings && isValidPlayerLimit;
};

var validatePlayerLimit = function (playerLimit) {
  var badValue = false;
  if (isInt(playerLimit)
    && playerLimit > MIN_PLAYERS_PER_GAME
    && playerLimit <= MAX_PLAYERS_PER_GAME) {

  } else if (_.isArray(playerLimit)) {
    _.each(playerLimit, function (value) {
      if (!isInt(value)){
        console.log('bad value')
        badValue = true;
      }
    });
  } else if (_.isObject(playerLimit)
    && validateMinMaxIntegerObject(playerLimit)) {

  } else {
    return false;
  }
  return !badValue;
};

var validateCustomBoardSettings = function (customBoardSettings) {
  var badSetting = false;
  _.each(customBoardSettings, function (value, key) {
    if (_.isArray(value)) {
      _.each(value, function (arrayValue) {
        if (!isInt(arrayValue)){
          console.log('bad value')
          badSetting = true;
        }
      });
    } else if (!validateMinMaxIntegerObject(value)){
      console.log('bad setting ' + key + ": " + value)
      badSetting = true;
    }
  });
  return !badSetting;
};

var validateMinMaxIntegerObject = function (object) {
  return object && isInt(object.min) && isInt(object.max) && (object.max > object.min);
};

var isInt = function (n) {
  return _.isNumber(n) && n % 1 === 0;
};