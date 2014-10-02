var mongoose = global.getMongoose(),
  Schema = mongoose.Schema,
  Q = require('q'),
  _ = require('lodash'),
  winston = require('winston');

var HistorySchema = new Schema({
  currentTurn: { type: Number, default: 1},
  currentRound: { type: Number, default: 1},

  // re-saved here for efficiency
  gameId: {type: Schema.Types.ObjectId, ref: 'Game'},
  turnSubmitStyle: {type: String, default: 'default'},

  turnOrder: [{type: String}],
  currentPlayerIndexTurn: { type: Number, default: 0},               // whos turn is it?  (if roundRobin)

  /* if game.turnSubmitStyle === 'roundRobin'
        turns looks like: [['turn1id', 'turn2id', 'turn3id'],['turn4id', 'turn5id', 'turn6id']]
        each turn has {meta: singleturn, p1: singleturn}
     if game.turnSubmitStyle === 'playByMail'
        turns looks like: ['turn1id', 'turn2id']
        each turn has {meta: singleturn, p1: singleturn, p2: singleturn, p3: singleturn}
  */
  turns: []
});

HistorySchema.statics.createQ = function (game, turnSubmitStyle) {
  var History = this;

  var newHistory = new History();

  _.each(game.players, function (value, key) {
    newHistory.turnOrder.push(key);
  });

  newHistory.markModified('turnOrder');

  newHistory.gameId = game._id;
  newHistory.turnSubmitStyle = turnSubmitStyle;

  if (turnSubmitStyle === 'roundRobin') {
    newHistory.turns.push([]);
  }

  return newHistory.saveQ();
};

HistorySchema.statics.findFullByIdQ = function (historyId) {
  var History = this,
    Turn = require('../Turn').Model,
   _history;
  return History.findByIdQ(historyId)
    .then(function (history) {
      var promises = [];

      _.each(history.turns, function (roundOrTurnId, roundNumber) {
        var p = history.getRoundTurnsQ(roundNumber + 1)
          .then(function (roundTurns) {
            if (history.turnSubmitStyle === 'playByMail') roundTurns = roundTurns[0];
            history.turns[roundNumber] = roundTurns;
          });

        promises.push(p);
      });

      _history = history;
      return Q.all(promises)
        .then(function () {
          return _history;
        })
    });
};

HistorySchema.methods = {
  incrementRoundQ: function () { // should we ever let something out side this model to change the round number
    this.currentRound++;
    console.log('INCREMENTING ROUND');
    if (this.turnSubmitStyle === 'roundRobin') {
      this.turns.push([]);
    }
    return this.saveQ();
  },

  addRoundRobinPlayerTurnAndSaveQ: function (playerRel, singleTurn) {
    var Turn = require('../Turn').Model,
      thisHistory = this,
      newTurnParams = {
        gameId: this.gameId,
        turnNumber: this.currentTurn,
        playerRel: playerRel,
        singleTurn: singleTurn
      };


    return Turn.createQ(newTurnParams)
      .then(function (turn) {
        // add id reference to this.turns
        var roundTurns = thisHistory.turns[thisHistory.currentRound - 1];
        if (!roundTurns) { // incrementRound should take care of this
          roundTurns.push([]);
        }
        roundTurns[thisHistory.getPlayersOrderNumber(playerRel)] = turn._id;
        thisHistory.turns[thisHistory.currentRound - 1] = roundTurns;
        thisHistory.markModified('turns');

        return thisHistory.saveQ();
      });
  },
  //player maybe be one or an array
  addPlayByMailPlayerTurnAndSaveQ: function (player, singleTurn) {
    var Turn = require('../Turn').Model,
      thisHistory = this,
      players = _.isArray(player) ? player : [player],
      singleTurn = singleTurn || {
        actions: []
      },
      newTurnParams = {
        gameId: this.gameId,
        turnNumber: this.currentTurn,
        playerRel: players,
        singleTurn: singleTurn
      };

    return Turn.createOrAddQ(newTurnParams)
      .then(function (turn) {
        // add id reference to this.turns
        //  - it should just be resaving ths same id, all but the first time
        thisHistory.turns[thisHistory.currentRound - 1] = turn._id;
        thisHistory.markModified('turns');

        return thisHistory.saveQ();
      });
  },
  addRoundRobinMetaAndSaveQ: function (metaTurn) {
    return this.addMetaToLastAddedTurnAndSaveQ(metaTurn);
  },
  addPlayByMailMetaAndSaveQ: function (metaTurn) {
    return this.addMetaToLastAddedTurnAndSaveQ(metaTurn);
  },
  addMetaToLastAddedTurnAndSaveQ: function (metaTurn) {
    var Turn = require('../Turn').Model,
      thisHistory = this;

    return this.getLastAddedTurnQ()
      .then(function (turn) {
        if (turn) {
          return turn.saveMetaTurnQ(metaTurn);
        } else {
          var newTurnParams = {
            gameId: thisHistory.gameId,
            turnNumber: thisHistory.currentTurn,
            metaTurn: metaTurn
          };
          return Turn.createQ(newTurnParams);
        }
      })
      .then(function (turn) {
        thisHistory.currentTurn++;
        return thisHistory.saveQ();
      });
  },
  getCanAdvanceRoundRobinTurnQ: function () {
    var canAdvance = true,
      thisHistory = this;
    return thisHistory.getPlayersTurnStatusQ()
      .then(function (stati) {
        _.each(stati, function (played, playerRel) {
          if (!played) canAdvance = false;
        });
        return Q(canAdvance);
      });
  },
  getCanAdvancePlayByMailTurnQ: function () {
    var thisHistory = this;
    return thisHistory.getLastAddedTurnQ()
      .then(function (turn) {
        if (!turn) {
          return Q(false);
        }
        return Q(turn.getCanAdvancePlayByMailTurn(thisHistory.getAllPlayersArray()));
      });
  },

  ///////// TURN ORDER STUFF /////////////
  getPlayersTurnStatusQ: function () {
    var thisHistory = this,
      Turn = require('../Turn').Model;

    if (thisHistory.turnSubmitStyle === 'roundRobin') {
      var stati = {};
      _.each(thisHistory.turnOrder, function (playerRel, orderNumber) {
        stati[playerRel] = !!thisHistory.turns[thisHistory.currentRound - 1][orderNumber];
      });
      return Q(stati);
    } else if (this.turnSubmitStyle === 'playByMail') {
      var currentTurnId = this.turns[this.currentRound - 1];
      if (!currentTurnId) {
        var stati = {};
        _.each(this.turnOrder, function (playerRel, order) {
          stati[playerRel] = false;
        });
        return Q(stati);
      }
      return Turn.findByIdQ(currentTurnId)
        .then(function (turn) {
          return Q(turn.getPlayByMailPlayersTurnStatus(thisHistory.getAllPlayersArray()));
        });
    }
  },
  getRoundRobinNextPlayerRel: function () {
    return this.turnOrder[this.currentPlayerIndexTurn];
  },
  progressRoundRobinPlayerTurnTicker: function () {
    var next = (this.currentPlayerIndexTurn + 1) % _.size(this.turnOrder);

    this.currentPlayerIndexTurn = next;
  },
  // starting with 0
  getPlayersOrderNumber: function (playerRel) {
    return _.invert(this.turnOrder)[playerRel]; // EFF cache the inverted
  },
  isPlayersTurn: function (player) {
    return _.isEqual(player, this.turnOrder[this.currentPlayerIndexTurn]);
  },
  getLastAddedTurnQ: function () {
    var Turn = require('../Turn').Model;
    if (this.turnSubmitStyle === 'roundRobin') {
      var roundTurnsIds = this.turns[this.currentRound - 1];
      var id = roundTurnsIds[_.size(roundTurnsIds)-1];
      return Turn.findByIdQ(id);
    } else if (this.turnSubmitStyle === 'playByMail') {
      return Turn.findByIdQ(this.turns[this.currentRound - 1]);
    }
  },
  getRoundTurnsQ: function (roundNumber) {
    var Turn = require('../Turn').Model,
      promises = [];

    if (this.turnSubmitStyle === 'roundRobin') {
      _.each(this.turns[roundNumber - 1], function (turnId) {
        promises.push(Turn.findByIdQ(turnId));
      });
      return Q.all(promises);
    } else if (this.turnSubmitStyle === 'playByMail') {
      return Turn.findByIdQ(this.turns[roundNumber - 1])
        .then(function (result) {
          return Q([result]);
        });
    }
  },
  //For PlayByMail
  getPlayersThatHaveNotPlayedTheCurrentTurnQ: function () {
    var thisHistory = this,
      allPlayers = thisHistory.getAllPlayersArray();
    return thisHistory.getLastAddedTurnQ()
      .then(function (turn) {
        if (!turn) {
          return Q(allPlayers);
        }
        return Q(turn.getPlayersThatHaveNotPlayedTheCurrentTurn(allPlayers));
      });
  },
  getAllPlayersArray: function () {
        // using map instead of _.values, because it messes up[] (something with mongoose)
    return _.map(this.turnOrder, function (v, k) { return v;})
  },

  saveMetaDataToActionQ: function (playerRel, actionNumber, actionMetaData, roundNumber) {
    var Turn = require('../Turn').Model;
    //  turnId,
    //  roundNumber = roundNumber || this.currentRound;

    // EFF this function is called in a loop, we dont need to load that turn over and over again
    /*if (this.turnSubmitStyle === 'roundRobin') {
      turnId = this.turns[roundNumber - 1][this.getPlayersOrderNumber(playerRel)];
    } else if (this.turnSubmitStyle === 'playByMail') {
      turnId = this.turns[roundNumber - 1];
    } */

    return this.getLastAddedTurnQ() //Turn.findByIdQ(turnId)
      .then(function (turn) {
        return turn.saveMetaDataToActionQ(playerRel, actionNumber, actionMetaData);
      });
  }

};

exports.Schema = HistorySchema;
exports.Model = mongoose.model('History', HistorySchema);
