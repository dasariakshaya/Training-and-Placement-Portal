// models/Student.js
const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'student' },
  rollNumber: { type: String },
  branch: { type: String },
  placed: { type: Boolean, default: false },
  verified: { type: Boolean, default: false },
  achievements: [{ description: String }],
  skills: [String],
  socialLinks: [{ platform: String, url: String }],
  experience: [{ title: String, company: String, duration: String, description: String }],
  education: [{ degree: String, institute: String, year: String }],
  projects: [{ title: String, description: String, link: String }],
  resumeLink: { type: String },
  // This field is updated by the recruiter's actions
  placementDetails: {
    company: { type: String },
    role: { type: String },
    status: { type: String, enum: ['Applied', 'Shortlisted', 'Hired', 'Rejected'] }
  }
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);