var mongoose = global.getMongoose(),
  Schema = mongoose.Schema,
  Q = require('q'),
  _ = require('lodash'),
  winston = require('winston');

var PieceStateSchema = new Schema({
  id: { type: Number, index: true },

  locationId : {type: String}, // refers to board[].id(pieceId), that it is currently located on
  ownerId : {type: String}, //relative to Game player ids

  className: {type: String}, //refers to ruleBundle.rules.pieces
  attributes: {} // grab attributes from board[].attributes (remember these can change)
});

exports.Schema = PieceStateSchema;
exports.Model = mongoose.model('PieceState', PieceStateSchema);
