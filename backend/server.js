// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
// fs is no longer needed for directory creation on Vercel
// const fs = require('fs'); 

const app = express();

// ✅ REMOVED: This logic is incompatible with Vercel's read-only file system.
// File uploads will need to be handled by a cloud storage service.
/*
const uploadsDir = path.join(__dirname, 'uploads');
const jobPdfsDir = path.join(uploadsDir, 'job_pdfs');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
if (!fs.existsSync(jobPdfsDir)) fs.mkdirSync(jobPdfsDir);
*/


// --- CORE MIDDLEWARE ---
const corsOptions = {
  // ✅ ADDED: Your live Vercel URL to the list of allowed origins.
  origin: [
    'http://127.0.0.1:5500', 
    'http://localhost:5500', 
    'https://trainingplacementakshaya.vercel.app'
  ],
  methods: 'GET,POST,PATCH,DELETE,OPTIONS',
  allowedHeaders: 'Content-Type,Authorization'
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// --- STATIC FILE SERVING ---
// Note: This route will not work for new uploads on Vercel.
// It's kept for any existing local files if you run the server locally.
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// --- API ROUTES ---
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/studentRoutes');
const recruiterJobsRoutes = require('./routes/recruiterJobs');
const adminDashboardRoutes = require('./routes/adminDashboard');
const verifierRoutes = require('./routes/verifier');
const jobRoutes = require('./routes/job');
const applicationRoutes = require('./routes/application');
const uploadRoutes = require('./routes/upload');
const recruiterAuthRoutes = require('./routes/recruiterAuth');
const recruiterDashboardRoutes = require('./routes/recruiterDashboard');
const adminAuthRoutes = require('./routes/adminAuth');

app.use('/api/auth', authRoutes);
app.use('/api/auth/recruiter', recruiterAuthRoutes);
app.use('/api/auth/admin', adminAuthRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/recruiter', recruiterJobsRoutes);
app.use('/api/recruiter/dashboard', recruiterDashboardRoutes);
app.use('/api/admin', adminDashboardRoutes);
app.use('/api/verifier', verifierRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/upload', uploadRoutes);


// --- TEST & FALLBACK ROUTES ---
// This root route is not strictly needed for Vercel but is good for testing.
app.get('/api', (req, res) => {
  res.send('👋 Backend API is running!');
});

app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API route not found.' });
});


// --- DATABASE CONNECTION ---
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error("❌ FATAL ERROR: MONGO_URI environment variable is not set.");
    process.exit(1);
}

mongoose.connect(MONGO_URI)
  .then(() => console.log(`✅ Connected to MongoDB successfully.`))
  .catch(err => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });


// --- START SERVER (for Vercel, this is the main export) ---
// This PORT logic is for local testing; Vercel handles the server listening.
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is live for local testing at http://localhost:${PORT}`);
});

// Vercel uses this export to run the app as a serverless function
module.exports = app;
