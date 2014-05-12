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
    turn.dateSubmitted = Date.now();

    this.turns[player][currentTurn - 1] = turn;
    this.markModified('turns');

    return this.saveQ()
  },
  getPlayerTurn: function (player, turnNumber) {
    return this.turns[player][turnNumber - 1];
  },
  getPlayersTurnStatus: function () {
    var stati = {};

    _.each(this.turns, function (value, key) {
      stati[key] = value[this.currentRound - 1] ? true : false;
    });

    return stati;
  },
  getCanAdvanceTurn: function () {
    var canAdvance = true;

    _.each(this.getPlayersTurnStatus(), function (value) {
      if (!value) canAdvance = false;
    });

    return canAdvance;
  }

};

exports.Schema = HistorySchema;
exports.Model = mongoose.model('History', HistorySchema);
