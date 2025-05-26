const mongoose = require('mongoose');

const verifierSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String
});

module.exports = mongoose.model('Verifier', verifierSchema);
