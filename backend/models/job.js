// models/job.js
const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  description: { type: String },
  jobDescriptionPdfUrl: { type: String }, 
  eligibleBranches: [String],
  minCGPA: Number,
  deadline: Date,
  postedAt: { type: Date, default: Date.now },
  recruiterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recruiter',
  },
  status: { type: String, enum: ['open', 'closed'], default: 'open' }
});

module.exports = mongoose.model('Job', jobSchema);