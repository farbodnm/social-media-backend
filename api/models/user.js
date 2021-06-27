const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    min: 3,
    max: 20,
    unique: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true,
    min: 6
  },
  email: {
    type: String,
    required: true,
    max: 50,
    unique: true,
    match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
  },
  profilePicture: {
    type: String,
    default: ""
  },
  coverPicture: {
    type: String,
    default: ""
  },
  followers: {
    type: Array,
    default: []
  },
  following: {
    type: Array,
    default: []
  },
  isAdmin: {
    type: Boolean,
    default: false
  }
},
{timestamps : true}
);

module.exports = mongoose.model("user", userSchema);
