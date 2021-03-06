var mongoose = global.getMongoose(),
  Schema = mongoose.Schema;

var PieceStateSchema = new Schema({
  id: { type: Number, index: true },

  locationId : {type: String}, // refers to board[].id(pieceId), that it is currently located on
  ownerId : {type: String}, //relative to Game player ids

  class: {type: String}, //classes listed at ruleBundle.rules.pieces
  attributes: {} // grab attributes from board[].attributes (remember these can change)
}, {usePushEach: true, minimize: false});

exports.Schema = PieceStateSchema;
exports.Model = mongoose.model('PieceState', PieceStateSchema);
