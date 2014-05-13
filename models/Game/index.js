/**
 * Models->Game-> index.js
 *
 */

var mongoose = global.getMongoose(),
  Schema = mongoose.Schema,
  Q = require('q'),
  _ = require('lodash'),
  winston = require('winston');

var validateHelp = require('./validateHelper'),
  instanceMethodsHelp = require('./instanceMethodsHelper'),
  stateChangeHelp = require('./stateChanges/index'),
  RuleBundleSchema = require('../RuleBundle/index').Schema;

var GameSchema = new Schema({
  //// IDENTIFICATION ////
  id: { type: Number, index: true },
  name : {type: String, default: "Unnamed Game"},

  //// HIGH LEVEL SETTINGS ////
  turnStyle : {type : String, default : 'default'},
  turnTimer : {type : String, default : 'default'},

  maxPlayers : { type: Number, default: 1 },
  ruleBundle : {
    type: Schema.Types.Mixed,
    name : {type : String, default : 'default'},
    id : {type: Schema.Types.ObjectId, ref: 'RuleBundle'}
  },

  //// GAME INFO ////
  gameStatus: {type: String, default: 'open'},//open, inprogress, finished
  gameBoard: {type: Schema.Types.ObjectId, ref: 'GameBoard'},
  players : {type : Schema.Types.Mixed, default : {} },

  //// SETTINGS ////
  ruleBundleGameSettings : {
    type : Schema.Types.Mixed,
    customBoardSettings : {type : Schema.Types.Mixed }
  }

});

/**
 * Virtuals
 */

GameSchema.virtual('playersCount').get(function () {
  return _.values(this.players).length;
});
GameSchema.virtual('full').get(function () {
  return this.playersCount === this.maxPlayers;
});

/**
 * Validators
 */

validateHelp.addValidators(GameSchema);

/**
 * Methods
 */
GameSchema.methods = {
  joinGameQ : instanceMethodsHelp.joinGameQCallback(),

  changeStateQ : stateChangeHelp.changeStateQCallback(),

  //simple for now, but later it should adapt when people 'leave' a game before it starts
  getNextPlayerPosition : function () {
    if (this.playersCount >= this.maxPlayers)
      throw 'playerCount exceeds maxPlayers';
    return 'p' + (this.playersCount + 1);
  },

  //returns -1 if player is not in game
  getPlayerPosition : function (playerID) {
    var position = -1;
    _.each(this.players, function (value, key) {
      if (_.isEqual('' + value.playerID, '' + playerID)) {
        position = key;
      }
    });
    return position;
  }
};

exports.Schema = GameSchema;
exports.Model = mongoose.model('Game', GameSchema);
