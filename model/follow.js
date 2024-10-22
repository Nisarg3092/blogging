const { Schema, model } = require('mongoose');

const followSchema = new Schema({
  follower: {
    type: Schema.Types.ObjectId,
    ref: 'user', 
    required: true
  },
  following: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
},{timestamps: true, timeseries : true});

const Follow = model('Follow', followSchema);

module.exports = Follow;
