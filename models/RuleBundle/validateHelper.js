/**
 * Models->RuleBundle-> validateHelper.js
 *
 * Created by niko on 2/9/14.
 */

var _ = require('underscore');

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

var validateGameSettings = function (gameSettingsObject) { //TODO refactor this
  if (!gameSettingsObject || !gameSettingsObject.playerLimit || !gameSettingsObject.customBoardSettings)
    return false;

  var playerLimit = gameSettingsObject.playerLimit;
  var customBoardSettings = gameSettingsObject.customBoardSettings;

  var badValue = false;
  if (_.isNumber(playerLimit)
    && playerLimit > 1
    && playerLimit <= MAX_PLAYERS_PER_GAME) {

  } else if (_.isArray(playerLimit)) {
    _.each(playerLimit, function (value) {
      if (!_.isNumber(value)){
        console.log('bad value')
        badValue = true;
      }
    });
  } else if (_.isObject(playerLimit)
    && validateMinMaxObject(gameSettingsObject.playerLimit)) {

  } else {
    return false;
  }

  var badSetting = false;
  _.each(customBoardSettings, function (value, key) {
    if (_.isArray(value)) {
      _.each(value, function (arrayValue) {
        if (!_.isNumber(arrayValue)){
          console.log('bad value')
          badSetting = true;
        }
      });
    } else if (!validateMinMaxObject(value)){
      console.log('bad setting ' + key + ": " + value)
      badSetting = true;
    }
  });


  return !badSetting && !badValue;
};

var validateMinMaxObject = function (object) {
  return object && _.isNumber(object.min) && _.isNumber(object.max) && (object.max > object.min);
};