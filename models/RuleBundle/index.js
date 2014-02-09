/**
 * Models->RuleBundle-> index.js
 *
 * Created by niko on 2/9/14.
 */

var mongoose = require('mongoose-q')(require('mongoose'));

var validateHelp = require('./validateHelper'),
  instanceMethodsHelp = require('./methods/index');


var RuleBundleSchema = new mongoose.Schema({
  //// IDENTIFICATION ////
  id: { type: Number, index: true },
  name : {type: String, default: "Unnamed RuleBundle"},

  turnSubmitStyle : { type: String, default: 'default' },

  staticBoardSettings: {
    type : mongoose.Schema.Types.Mixed,
    boardStyle : { type : String, default: 'default'}
  },

  gameSettings: {
    type : mongoose.Schema.Types.Mixed,
    playerLimit : {type: Number, default: 0},
    customBoardSettings : {}
  },

  rules : {}
});

/**
 * Virtuals
 */
/*
GameSchema.virtual('playersCount').get(function () {
  return _.values(this.players).length;
});*/

/**
 * Validators
 */

validateHelp.addValidators(RuleBundleSchema);

/**
 * Methods
 */
RuleBundleSchema.methods = {
  //joinGameQ : instanceMethodsHelp.joinGameQCallback()
};

module.exports = mongoose.model('RuleBundle', RuleBundleSchema);
