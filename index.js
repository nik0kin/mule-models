require('mule-utils/mongooseUtils');


module.exports = {
  User: require('./models/User'),

  RuleBundle: require('./models/RuleBundle'),

  Game: require('./models/Game'),
  GameBoard: require('./models/GameBoard'),
  GameState: require('./models/GameState'),

  History: require('./models/History'),
  Turn: require('./models/Turn'),

  PieceState: require('./models/PieceState'),
  SpaceState: require('./models/SpaceState')
};
