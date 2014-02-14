/**
 * Created by niko on 2/13/14.
 */

var Q = require('q');

var RuleBundle = require('./index').Model;

exports.validateRuleBundleID = function (ruleBundle, callback) {
  RuleBundle.findByIdQ(ruleBundle.id)
    .then(function (result) {
      if (result) {
        // found by id
        callback(true);
      } else {
        //else check name
        RuleBundle.findQ({ name : ruleBundle.name})
          .done(function (result2) {
            if (result2[0]) {
              // found first by name
              callback(true);
            } else {
              // did not find
              callback(false);
            }
          }, function (err) {
            callback(false);
          });
      }
    }, function (err) {
      callback(false);
    });
};

exports.findRuleBundleByIdOrNameQ = function (ruleBundle) {
  return Q.promise(function (resolve, reject) {
    RuleBundle.findByIdQ(ruleBundle.id)
      .then(function (result) {
        if (result) {
          // found by id
          resolve(result);
        } else {
          //else check name
          RuleBundle.findQ({ name : ruleBundle.name})
            .done(function (result2) {
              if (result2[0]) {
                // found first by name
                resolve(result2[0]);
              } else {
                // did not find
                reject();
              }
            }, reject);
        }
      }, reject);
  });
};