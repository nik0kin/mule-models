/**
 * Created by niko on 2/13/14.
 */

var Q = require('q'),
  should = require('should'),
  _ = require('lodash');

require('../../server');

var Game = require('../../models/Game/index').Model,
  dbHelper = require('../dbHelper'),
  testHelper = require('mule-utils/lib/testUtils/mochaHelper'),
  validParams = require('../validParams/gameConfig');

var util = require('../../models/RuleBundle/util');

describe('Game: ', function () {
  describe('CRUD: ', function () {
    describe('create: ', function () {
      after(function (done) { dbHelper.clearUsersAndGamesCollection(done); });

      it('should work with basic game (checkers) config', function (done) {
        dbHelper.addGameQ(validParams.validCheckersGameParams)
          .done(function (game) {
            done();
          }, function (err) {
            done(err);
          });
      });
      it('util with name should work: ', function (done) {
        util.validateRuleBundleID(validParams.validCheckersGameParams.roleBundle, function (result) {
          if (result)
            done();
          else
            done();
        })
      });

      it('util Q should work: ', function (done) {
        util.findRuleBundleByIdOrNameQ(validParams.validCheckersGameParams.roleBundle)
          .done(function (result) {
          done();
        }, testHelper.mochaError(done))
      });
    });
  });
});

