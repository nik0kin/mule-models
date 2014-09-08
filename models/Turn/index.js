var mongoose = global.getMongoose(),
  Schema = mongoose.Schema,
  Q = require('q'),
  _ = require('lodash'),
  winston = require('winston');

var ActionSchema = new Schema({
  type: {type: String},
  params: {type: Schema.Types.Mixed}
});

var SingleTurnSchema = new Schema({
  dateSubmitted: {type: Date},
  actions: []
});

var TurnSchema = new Schema({
  turnNumber: { type: Number, default: -1},
  gameId: {type: Schema.Types.ObjectId, ref: 'Game'},
  metaTurn: {type: Schema.Types.Mixed}, //SingleTurnSchema
  playerTurns: {type: Schema.Types.Mixed, default: {}} // {p1: //SingleTurnSchema, p2: SingleTurnSchema}
});

TurnSchema.statics.createQ = function (params) {
  var Turn = this;

  var newTurn = new Turn({
    gameId: params.gameId,
    turnNumber: params.turnNumber
  });

  if (params.singleTurn) {
    params.singleTurn.dateSubmitted  = new Date();
    newTurn.playerTurns[params.playerRel] = params.singleTurn;
    newTurn.markModified('playerTurns');
  }
  if (params.metaTurn) {
    newTurn.metaTurn = params.metaTurn;
    newTurn.markModified('metaTurn');
  }

  return newTurn.saveQ();
};

// createOrAddQ will add turns for specified players for a turnNumber (usually used in playByMail)
// @param playerRels: an array of playerRel's
//     - this is useful for setting turns of players who did not play and the game autoprogressed
TurnSchema.statics.createOrAddQ = function (params) {
  var Turn = this,
    gameId = params.gameId,
    turnNumber = params.turnNumber;

  return Turn.findByGameIdQ(gameId, turnNumber)
    .then(function (turn) {
      if (!turn) {
        var newTurn = new Turn({
          gameId: gameId,
          turnNumber: turnNumber
        });
        turn = newTurn;
      }

      _.each(params.playerRel, function (playerRel) {
        turn.playerTurns[playerRel] = params.singleTurn;
      });
      turn.markModified('playerTurns');

      return turn.saveQ();
    });
};

TurnSchema.statics.findByGameIdQ = function (gameId, turnNumber) {
  var Turn = this,
    conditions = {
      turnNumber: turnNumber,
      gameId: gameId
    };
  return Turn.findQ(conditions)
    .then(function (turns) {
      return Q(turns[0]);
    });
};


TurnSchema.methods = {

  getPlayByMailPlayersTurnStatus: function (playerRels) {
    var stati = {},
      thisTurn = this;
    _.each(playerRels, function (playerRelId) {
      var turn = thisTurn.playerTurns[playerRelId];
      stati[playerRelId] = turn ? true : false;
    });

    return stati;
  },
  saveMetaTurnQ: function (metaTurn) {
    this.metaTurn = metaTurn;
    this.markModified('metaTurn');
    return this.saveQ();
  },
  saveMetaDataToActionQ: function (playerRel, actionNumber, actionMetaData) {
    var action = this.playerTurns[playerRel].actions[actionNumber];
    action.metadata = actionMetaData;
console.log('added metadata')
console.log(actionMetaData)
    this.markModified('playerTurns');
    return this.saveQ();
  },

  getCanAdvancePlayByMailTurn: function (playerRels) {
    var canAdvance = true;
    _.each(this.getPlayByMailPlayersTurnStatus(playerRels), function (value) {
      if (!value) canAdvance = false;
    });
    return canAdvance;
  },
  // out of playerRels[]
  getPlayersThatHaveNotPlayedTheCurrentTurn: function (playerRels) {
    var array = [];
    _.each(this.getPlayByMailPlayersTurnStatus(playerRels), function (status, playerRel) {
      if (!status) {
        array.push(playerRel);
      }
    });
    return array;
  },
};

exports.Schema = TurnSchema;
exports.Model = mongoose.model('Turn', TurnSchema);
