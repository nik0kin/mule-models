/**
 * Test->Game-> changeStateSpec.js
 *
 * Created by niko on 2/7/14.
 */

var Q = require('q'),
  should = require('should'),
  _ = require('underscore');

var app = require('../../server');

var Game = require('../../models/Game/index'),
  User = require('../../models/User'),
  dbHelper = require('../dbHelper'),
  testHelper = require('../mochaHelper'),
  validParams = require('../validParams/gameConfig');


describe('Models: ', function () {
  describe('Game: ', function () {
    describe('changeStateQ ', function () {
      var ourPlayer;
      var ourGame;

      beforeEach(function (done) {
        var ourUserParams = {username : "joe", password : "blow"};
        var ourGameParams = validParams.validGameParams[0];
        ourGameParams.dontJoinCreator = true;
        // make a player, create and join that game
        dbHelper.clearUsersAndGamesCollectionQ()  //TODO WE CAN REFACTOR RIGHT?
          .done(function () {
            dbHelper.addUserQ(ourUserParams)
              .done(function (user) {
                should(user._id).ok;
                ourPlayer = user;
                dbHelper.addGameQ(ourGameParams)
                  .done(function (game) {
                    var ourGameID = game._id;
                    Game.findByIdQ(ourGameID)
                      .done(function (game) {
                        should(game).ok;
                        ourGame = game;
                        ourGame.joinGameQ(ourPlayer)
                          .done(function (result) {
                            done();
                          }, testHelper.mochaError(done));
                      }, testHelper.mochaError(done));
                  }, testHelper.mochaError(done));
              }, testHelper.mochaError(done));
          }, testHelper.mochaError(done));
      });

      after(function (done) { dbHelper.clearUsersAndGamesCollection(done); });

      it('basic should work if we try to changeState', function (done) {
        ourGame.changeStateQ('inProgress')
          .done(function (result) {
            dbHelper.getGameQ(ourGame._id)
              .done(function (game) {
                should(game).ok;
                should(game.gameStatus).eql('inProgress');
                done();
              }, testHelper.mochaError(done));
          }, testHelper.mochaError(done));
      });

      it('changeState should automatically call if we join a game with one spot left', function (done) {
        dbHelper.addUserQ({username : 'nicoli', password : 'papaduci'})
          .done(function (user) {
            should(user._id).ok;
            var player2 = user;
            ourGame.joinGameQ(player2)
              .done(function (result) {
                dbHelper.getGameQ(ourGame._id)
                  .done(function (game) {
                    should(game).ok;
                    should(game.gameStatus).eql('inProgress');
                    done();
                  }, testHelper.mochaError(done));
              }, testHelper.mochaError(done));
          }, testHelper.mochaError(done));
      });
    });
  });
});