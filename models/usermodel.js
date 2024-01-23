const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    unique: true,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  picurl:{
    type:String
  }
  // Add other fields as needed, e.g., profile picture, role, etc.
});

module.exports = mongoose.model('User', userSchema);