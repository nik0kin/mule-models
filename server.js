var mongoose = require('mongoose-q')(require('mongoose'));

var config = {
    db: 'mongodb://localhost/mule_test',
  };

if (!mongoose.connection.readyState)
  mongoose.connect(config.db);

