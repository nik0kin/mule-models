var Q = require('q');

// singleton mongoose
var mongooseObject;

exports.initDatabaseQ = function (databaseConfig) {
  if (global.getMongoose) {
    return Q();
  }

  // Open MongoDB connection
  return Q.promise(function (resolve, reject) {
      mongooseObject = require('mongoose-q')(require('mongoose'));
      mongooseObject.connect(databaseConfig.db);

      var db = mongooseObject.connection;
      db.on('error', console.error.bind(console, 'connection error:'));
      db.once('open', function callback () {
        console.log('MongoDB online: ' + databaseConfig.db);
        resolve();
      });
    })
  // set getMongoose to global
    .then(function () {
      global.getMongoose = function () {
        return mongooseObject;
      };
    })
  // expose Models (they depend on getMongoose)
    .then(function () {
      exports.User = require('./models/User'),

      exports.RuleBundle = require('./models/RuleBundle'),

      exports.Game = require('./models/Game'),
      exports.GameBoard = require('./models/GameBoard'),
      exports.GameState = require('./models/GameState'),

      exports.History = require('./models/History'),
      exports.Turn = require('./models/Turn'),

      exports.PieceState = require('./models/PieceState'),
      exports.SpaceState = require('./models/SpaceState')
    });
};

exports.initLogger = function (initLoggerObj) {
  require('mule-utils').logging.initWithLoggerObj(initLoggerObj);
};
