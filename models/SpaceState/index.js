var mongoose = global.getMongoose(),
  Schema = mongoose.Schema,
  Q = require('q'),
  _ = require('lodash'),
  winston = require('winston');

var SpaceStateSchema = new Schema({
  id: { type: Number, index: true },

  boardSpaceId : {type: String, default: "Unnamed Game"}, // refers to board[].id
     // derives class from this

  attributes: {} // grab attributes from board[].attributes (remember these can change)
});

exports.Schema = SpaceStateSchema;
exports.Model = mongoose.model('SpaceState', SpaceStateSchema);
