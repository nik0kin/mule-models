//var Logger = require('mule-utils').logging;

var mongoose = global.getMongoose();
var Schema = mongoose.Schema;

var GameStateSchema = new Schema({
  spaces : [{type: String, ref: 'SpaceState'}],
  pieces : [{type: Schema.ObjectId, ref: 'PieceState'}],

  globalVariables: {type: Schema.Types.Mixed, default: {}},
  playerVariables: {type: Schema.Types.Mixed, default: {}}
}, {usePushEach: true});

/**
 * Virtuals
 */
/*
 GameSchema.virtual('playersCount').get(function () {
 return _.values(this.players).length;
 });*/


/**
 * Methods
 */
GameStateSchema.methods = {};

GameStateSchema.statics.findByIdWithPopulatedStatesQ = function (gameStateId) {
  var GameState = this;
  //console.log('findByIdWithPopulatedStatesQ: '+ gameStateId);
  return GameState.findByIdQ(gameStateId)
    .then(function (gameState) {
      if (gameState) {
        return gameState.populateQ('spaces')
          .then(function (gameState) {
            return gameState.populateQ('pieces');
          });
      }
    });

};

exports.Schema = GameStateSchema;
exports.Model = mongoose.model('GameState', GameStateSchema);
