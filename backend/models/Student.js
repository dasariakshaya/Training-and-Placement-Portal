// models/Student.js
const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: { // ✅ NEW FIELD
    type: String,
    enum: ['student', 'verifier'],
    default: 'student'
  },
  rollNumber: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    // Example format: IIITM2023BTECH
    match: [/^IIITM\d{4}[A-Z]+$/, 'Invalid roll number format. Expected format: IIITM<YEAR><BRANCH>']
  },
  branch: {
    type: String,
    required: true
  },
  resumeLink: {
    type: String
  },
  placed: {
    type: Boolean,
    default: false
  },
  placedCompany: { 
    type: String, 
    default: "" 
  },
  verified: {
    type: Boolean,
    default: false
  },
  experience: [{
    title: String,
    company: String,
    duration: String,
    description: String,
  }],
  education: [{
    institute: String,
    degree: String,
    year: String
  }],
  projects: [{
    title: String,
    description: String,
    link: String
  }],
  achievements: [String],
  skills: [String],
  socialLinks: [String]
});

module.exports = mongoose.model('Student', studentSchema);