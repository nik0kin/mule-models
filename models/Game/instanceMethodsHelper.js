/**
 * models/Game/instanceMethodsHelper.js
 *
 * Created by niko on 1/28/14.
 */

var mongoose = require('mongoose-q')(require('mongoose')),
  Q = require('q'),
  _ = require('underscore'),
  winston = require('winston');

/*exports.addMethods = function(GameSchema, _this) {
 GameSchema.methods = ...
 };*/

exports.joinGameQCallback = function () {
  return function (player) {
    var that = this;
    return Q.promise(function (resolve, reject) {
      //valid user?
      if (!player || !player._id){//TODO lazy, didnt check db
        return reject('invalid player');
      }

      //are we full?
      if (that.full){
        return reject('Game Full');
      }

      //is the player in this Game already?
      if (that.getPlayerPosition(player._id) !== -1) {
        return reject('Player is already in Game');
      }

      //make object
      var newPlayerGameInfo = { //aka piggie
        "playerID" : player._id,
        "playerStatus" : 'inGame'
      };

      var position = that.getNextPlayerPosition();
      //that.players['p1'] = newPlayerGameInfo; // WHY DOESN'T THIS WORK

      var playersCopy = _.clone(that.players); //ugly fix
      playersCopy[position] = newPlayerGameInfo;
      that.players = playersCopy;

      /*  that.players = { //works
       'p1' : newPlayerGameInfo
       };*/

      var successCallback = function (result) {
        winston.info('player[' + player.username + '|' + player._id + '] added to game: ' + result._id + ' [' + result.playersCount + '/' + result.maxPlayers + ']');
        resolve(result);
      };

      //is the game full now? if it is, start it!
      if (that.full) {
        that.changeStateQ('inProgress')
          .done(function () {
            that.saveQ()
              .done(successCallback, reject);
          }, reject);
      } else {
        //update db
        that.saveQ()
          .then(successCallback)
          .fail(reject)
          .done();
      }

    });
  };
};