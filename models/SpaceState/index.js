var mongoose = global.getMongoose(),
  Schema = mongoose.Schema;

var SpaceStateSchema = new Schema({
  id: { type: Number, index: true },

  boardSpaceId : {type: String, default: "Unnamed Game"}, // refers to board[].id
  class: {type: String},

  attributes: {} // grab attributes from board[].attributes (remember these can change)
}, {usePushEach: true, minimize: false});

exports.Schema = SpaceStateSchema;
exports.Model = mongoose.model('SpaceState', SpaceStateSchema);
