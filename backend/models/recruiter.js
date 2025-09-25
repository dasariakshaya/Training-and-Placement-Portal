// models/recruiter.js
const mongoose = require('mongoose');

const recruiterSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  company: {
    type: String,
    required: true,
  },
  contactPerson: {
    type: String 
  },
  role: { // ✅ NEW FIELD
    type: String,
    default: 'recruiter'
  }
});

module.exports = mongoose.model('Recruiter', recruiterSchema);