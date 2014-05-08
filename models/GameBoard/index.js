/**
 * Models->Board-> index.js
 *
 */

var mongoose = global.getMongoose();
var Schema = mongoose.Schema;

var validateHelp = require('./validateHelper');

var GameBoardSchema = new Schema({

  id: { type: Number, index: true },
  gameID : {type: Schema.Types.ObjectId}, //do i need this?

  ruleBundle : {
    type: Schema.Types.Mixed,
    name : {type : String, default : 'default'},
    id : {type: Schema.Types.ObjectId}
  },

  boardType: { type: String, default: 'default' },
  board: {},

  spaces : [{type: String, ref: 'SpaceState'}],
  pieces : [Schema.Types.Mixed],

  globalVariables: {},
  playerVariables: {}

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

validateHelp.addValidators(GameBoardSchema);

/**
 * Methods
 */
GameBoardSchema.methods = {
  //joinGameQ : instanceMethodsHelp.joinGameQCallback()
};

exports.Schema = GameBoardSchema;
exports.Model = mongoose.model('GameBoard', GameBoardSchema);
