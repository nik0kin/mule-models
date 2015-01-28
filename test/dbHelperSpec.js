/**
 * Created by niko on 1/28/14.
 */

var should = require('should')

var dbHelper = require('./dbHelper'),
  testHelper = require('mule-utils/lib/testUtils/mochaHelper');

describe('dbHelper: ', function () {
  before(function (done) {
    require('../index').initDatabaseQ({db: 'mongodb://localhost/mule_test'})
      .then(function () {
        dbHelper.init();
        done();
      })
  });

  var validCreateGamesBody = {
    "name": "fun game 3v3",
    "maxPlayers" : 6,
    "turnStyle" : "realtime"
  };

  var validUserParams = {
    username : "joe",
    password : "blow"
  };

  it('addUserQ should work', function (done){
    dbHelper.addUserQ(validUserParams)
      .done(function (user) {
        ourPlayerID = user._id;
        done()
      }, function (err) {
        done(err);
      });
  });

  it('addGameQ should work', function (done){
    dbHelper.addGameQ(validCreateGamesBody)
      .done(function (game) {
        done()
      }, function (err) {
        done(err);
      });
  });

  it('getGameQ should work', function (done) {
    dbHelper.addGameQ(validCreateGamesBody)
      .done(function (game){
        should(game._id).ok;
        dbHelper.getGameQ(game._id)
          .done(function (gottenGame) {
            should(game._id).eql(gottenGame._id);
            game.name.should.equal(gottenGame.name)
            done();
          }, testHelper.mochaError(done));
      }, testHelper.mochaError(done));
  });

  it('getUserQ should work', function (done) {
    dbHelper.addUserQ(validUserParams)
      .done(function (user){
        should(user._id).ok;
        dbHelper.getUserQ(user._id)
          .done(function (gottenUser) {
            should(user._id).eql(gottenUser._id);
            should(user.username).equal(gottenUser.username)
            done();
          }, testHelper.mochaError(done));
      }, testHelper.mochaError(done));
  });
});
