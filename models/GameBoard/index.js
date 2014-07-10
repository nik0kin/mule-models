/**
 * Models->Board-> index.js
 *
 */

var mongoose = global.getMongoose();
var Schema = mongoose.Schema;

var validateHelp = require('./validateHelper');

var GameBoardSchema = new Schema({
  gameID : {type: Schema.Types.ObjectId}, //do i need this?

  ruleBundle : {
    type: Schema.Types.Mixed,
    name : {type : String, default : 'default'},
    id : {type: Schema.Types.ObjectId, ref: 'RuleBundle'}
  },

  boardType: { type: String, default: 'default' },
  board: {},

  spaces : [{type: String, ref: 'SpaceState'}],
  pieces : [{type: String, ref: 'PieceState'}],

  globalVariables: {type: Schema.Types.Mixed, default: {}},
  playerVariables: {type: Schema.Types.Mixed, default: {}},

  history: {type: String, ref: 'History'}

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

};

GameBoardSchema.statics.findByIdWithPopulatedStatesQ = function (gameBoardId) {
  var GameBoard = this;

  return GameBoard.findByIdQ(gameBoardId)
    .then(function (gameBoard) {
      return gameBoard.populateQ('spaces');
    })
    .then(function (gameBoard) {
      return gameBoard.populateQ('pieces');
    })
};

exports.Schema = GameBoardSchema;
exports.Model = mongoose.model('GameBoard', GameBoardSchema);
