var mongoose = global.getMongoose(),
  Schema = mongoose.Schema,
  Q = require('q'),
  _ = require('lodash'),
  winston = require('winston');

var TurnSchema = new Schema({
  dateSubmitted: {type: Date},
  actions: []
});

var HistorySchema = new Schema({
  currentRound: { type: Number, default: 1},
  turns: { type: Schema.Types.Mixed, default: {} }
});

HistorySchema.statics.createQ = function (game) {
  var History = this;

  var newHistory = new History();

  _.each(game.players, function (value, key) {
    newHistory.turns[key] = [];
  });

  newHistory.markModified('turns');

  return newHistory.saveQ();
};

HistorySchema.methods = {
  addPlayerTurnAndSaveQ: function (player, turn) {
    turn.dateSubmitted = new Date();

    this.turns[player][this.currentRound - 1] = turn;
    this.markModified('turns');

    return this.saveQ()
  },
  getPlayerTurn: function (player, turnNumber) {
    return this.turns[player][turnNumber - 1];
  },
  getPlayersTurnStatus: function () {
    var stati = {},
      currentRound = this.currentRound;
    _.each(this.turns, function (value, key) {
      stati[key] = value[currentRound - 1] ? true : false;
    });

    return stati;
  },
  getCanAdvanceTurn: function () {
    var canAdvance = true;

    _.each(this.getPlayersTurnStatus(), function (value) {
      if (!value) canAdvance = false;
    });

    return canAdvance;
  },
  getRoundTurns: function (turnNumber) {
    var turns = {};

    _.each(this.turns, function (playersTurns, playerRelId) {
      turns[playerRelId] = playersTurns[turnNumber - 1];
    });

    return turns;
  }

};

exports.Schema = HistorySchema;
exports.Model = mongoose.model('History', HistorySchema);
