/**
 * Test->Models-> validateSpec.js
 *
 * Created by niko on 2/9/14.
 */

var should = require('should'),
  _ = require('underscore'),
  fs = require('fs');

var dbHelper = require('../dbHelper'),
  testHelper = require('mule-utils/lib/testUtils/mochaHelper'),
  RuleBundleModel = require('../../models/RuleBundle/index').Model;

require.extensions[".json"] = function (m) {
  m.exports = JSON.parse(fs.readFileSync(m.filename));
};

var checkersRuleBundleJSON = require('../../bundles/checkers.json'),
  backgammonRuleBundleJSON = require('../../bundles/backgammon.json'),
  vikingsRuleBundleJSON = require('../../bundles/vikings.json');


describe('Models: ', function () {
  describe('RuleBundle: ', function () {
    describe('validateSpec ', function () {
      after(function (done) { dbHelper.clearUsersAndGamesCollection(done); });

      it('should work with checkers', function (done) {
        var newRuleBundle = new RuleBundleModel(checkersRuleBundleJSON);
        newRuleBundle.saveQ()
          .done(function (result) {
            _.each(checkersRuleBundleJSON, function (value, key) {
              should(result[key]).ok;
              should(result[key]).eql(value);
            });

            done();
          }, testHelper.mochaError(done));
      });

      it('should work with backgammon', function (done) {
        var newRuleBundle = new RuleBundleModel(backgammonRuleBundleJSON);
        newRuleBundle.saveQ()
          .done(function (result) {
            _.each(backgammonRuleBundleJSON, function (value, key) {
              should(result[key]).ok;
              should(result[key]).eql(value);
            });

            done();
          }, testHelper.mochaError(done));
      });

      it('should work with vikings', function (done) {
        var newRuleBundle = new RuleBundleModel(vikingsRuleBundleJSON);
        newRuleBundle.saveQ()
          .done(function (result) {
            _.each(vikingsRuleBundleJSON, function (value, key) {
              should(result[key]).ok;
              should(result[key]).eql(value);
            });

            done();
          }, testHelper.mochaError(done));
      });
    });
  });
});