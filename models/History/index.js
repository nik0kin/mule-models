var mongoose = global.getMongoose(),
  Schema = mongoose.Schema,
  Q = require('q'),
  _ = require('lodash'),
  winston = require('winston');

var ActionSchema = new Schema({
  type: {type: String},
  params: {type: Schema.Types.Mixed}
});

var TurnSchema = new Schema({
  dateSubmitted: {type: Date},
  actions: []
});

var HistorySchema = new Schema({
  currentRound: { type: Number, default: 1},

  turnOrder: [{type: String}],
  currentPlayerIndexTurn: { type: Number, default: 0},               // whos turn is it?  (if roundRobin)

  turns: { type: Schema.Types.Mixed, default: {} }
});

HistorySchema.statics.createQ = function (game) {
  var History = this;

  var newHistory = new History();

  _.each(game.players, function (value, key) {
    newHistory.turns[key] = [];
    newHistory.turnOrder.push(key);
  });

  newHistory.markModified('turns');
  newHistory.markModified('turnOrder');

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
  getCanAdvancePlayByMailRound: function () {
    var canAdvance = true;

    _.each(this.getPlayersTurnStatus(), function (value) {
      if (!value) canAdvance = false;
    });

    return canAdvance;
  },
  progressRoundRobinPlayerTurnTicker: function () {
    var next = (this.currentPlayerIndexTurn + 1) % _.size(this.turns);

    this.currentPlayerIndexTurn = next;
  },
  isPlayersTurn: function (player) {
    return _.isEqual(player, this.turnOrder[this.currentPlayerIndexTurn]);
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
