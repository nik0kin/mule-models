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
  newHistory.turns['meta'] = [];

  newHistory.markModified('turns');
  newHistory.markModified('turnOrder');

  return newHistory.saveQ();
};

HistorySchema.methods = {
  addPlayerTurnAndSaveQ: function (player, turn) {
    turn = turn || {};
    turn.dateSubmitted = new Date();
    var thisHistory = this;
    var players = _.isArray(player) ? player : [player];
    _.each(players, function (playerRel) {
      thisHistory.turns[playerRel][thisHistory.currentRound - 1] = turn;
      console.log('saving ' + playerRel + '\'s turn ' + turn + ' [' + (thisHistory.currentRound - 1) + ']');
    });

    this.markModified('turns');
    return this.saveQ()
  },
  getPlayerTurn: function (player, turnNumber) {
    return this.turns[player][turnNumber - 1];
  },
  getPlayersTurnStatus: function () {
    var stati = {},
      currentRound = this.currentRound;
    _.each(this.turns, function (turn, playerRelId) {
      if (playerRelId === 'meta') return;
      stati[playerRelId] = turn[currentRound - 1] ? true : false;
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
  getRoundRobinNextPlayerRel: function () {
    return this.turnOrder[this.currentPlayerIndexTurn];
  },
  progressRoundRobinPlayerTurnTicker: function () {
    var next = (this.currentPlayerIndexTurn + 1) % _.size(this.turnOrder);

    this.currentPlayerIndexTurn = next;
  },
  isPlayersTurn: function (player) {
    return _.isEqual(player, this.turnOrder[this.currentPlayerIndexTurn]);
  },
  getRoundTurns: function (turnNumber) {
    var turns = {};

    _.each(this.turns, function (playersTurns, playerRelId) {
      if (playerRelId === 'meta') return;
      turns[playerRelId] = playersTurns[turnNumber - 1];
    });

    return turns;
  },
  //For PlayByMail
  getPlayersThatHaveNotPlayedTheCurrentRound: function () {
    var array = [];

    _.each(this.getPlayersTurnStatus(), function (status, playerRel) {
      if (!status) {
        array.push(playerRel);
      }
    });

    return array;
  },

  saveMetaDataToActionQ: function (data, playerRel, actionNumber, roundNumber) {
    roundNumber = roundNumber || this.currentRound;
    var action = this.turns[playerRel][roundNumber - 1].actions[actionNumber];
    action.metadata = data;
console.log('added metadata')
console.log(data)
    this.markModified('turns');
    return this.saveQ();
  }

};

exports.Schema = HistorySchema;
exports.Model = mongoose.model('History', HistorySchema);
