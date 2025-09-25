// models/admin.js
const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { // ✅ NEW FIELD
    type: String,
    default: 'admin'
  }
});

module.exports = mongoose.model('Admin', adminSchema);