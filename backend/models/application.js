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
  interviewDate: { type: Date, default: null } // ✅ NEW FIELD
});

module.exports = mongoose.model('Application', applicationSchema);
