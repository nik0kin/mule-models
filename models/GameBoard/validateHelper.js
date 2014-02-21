/**
 * Models->GameBoard-> validateHelper.js
 *
 */

var _ = require('underscore');



exports.addValidators = function (GameSchema) {
  GameSchema.path('boardType').validate(validateBoardType, 'boardType must equal "static" or "built"')

};

var validateBoardType = function (boardType) {
  return _.isString(boardType) && (_.isEqual(boardType,'static') || _.isEqual(boardType,'built'));
};

var validateBoard = function () {

  return true;
};
