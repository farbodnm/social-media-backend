const mongoose = require("mongoose")

const postSchema = new mongoose.Schema({
  userid: {
    type: String,
    required: true
  },
  desc: {
    type: String,
    max: 500
  },
  media: {
    type: String
  },
  mediatype: {
    type: String
  },
  likes: {
    type: Array,
    default: []
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("post", postSchema);