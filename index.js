require('mule-utils/mongooseUtils');


module.exports = {
  User: require('./models/User'),

  RuleBundle: require('./models/RuleBundle'),

  Game: require('./models/Game'),
  GameBoard: require('./models/GameBoard'),

  History: require('./models/History'),

  PieceState: require('./models/PieceState'),
  SpaceState: require('./models/SpaceState')
};
