'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var BusinessSchema = new Schema({
  name: String,
  attendees: Array
});

module.exports = mongoose.model('Business', BusinessSchema);