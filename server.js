var mongoose = require('mongoose-q')(require('mongoose'));

var config = {
    db: 'mongodb://localhost/mule_test',
  };

mongoose.connect(config.db);

