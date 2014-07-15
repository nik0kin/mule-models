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
  board: {}, //boardDef

  history: {type: String, ref: 'History'},
  gameState : {type: String, ref: 'GameState'}
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
  var GameBoard = this,
    GameState = require('../GameState').Model,
    _gameBoard;

  return GameBoard.findByIdQ(gameBoardId)
    .then(function (gameBoard) {
      _gameBoard = gameBoard;
      return GameState.findByIdWithPopulatedStatesQ(gameBoard.gameState);
    })
    .then(function (gameState) {
      _gameBoard.gameState = gameState;
      return _gameBoard;
    });
};

exports.Schema = GameBoardSchema;
exports.Model = mongoose.model('GameBoard', GameBoardSchema);
