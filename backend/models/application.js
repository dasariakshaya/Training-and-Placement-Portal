// models/application.js
const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
  appliedAt: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['applied', 'interview', 'selected', 'rejected'],
    default: 'applied'
  },
  interviewDate: { type: Date, default: null },
  meetingLink: { type: String, default: null } // ✅ ADDED: Field to store the meeting URL
});

module.exports = mongoose.model('Application', applicationSchema);