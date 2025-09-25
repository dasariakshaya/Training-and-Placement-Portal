// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');

const app = express();

// --- ✅ CORE MIDDLEWARE ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- ✅ STATIC FILE SERVING ---
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// --- ✅ API ROUTES ---
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/studentRoutes');
const recruiterJobsRoutes = require('./routes/recruiterJobs');
const adminDashboardRoutes = require('./routes/adminDashboard');
const verifierRoutes = require('./routes/verifier');
const jobRoutes = require('./routes/job');
const applicationRoutes = require('./routes/application');
const uploadRoutes = require('./routes/upload');

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/recruiters', recruiterJobsRoutes);
app.use('/api/admin', adminDashboardRoutes);
app.use('/api/verifier', verifierRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/upload', uploadRoutes);

// --- ✅ TEST & FALLBACK ROUTES ---
app.get('/', (req, res) => {
  res.send('👋 Backend is running smoothly!');
});

app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API route not found.' });
});


// --- ✅ DATABASE CONNECTION ---
// ✅ MODIFIED: Switched to MongoDB Atlas connection string
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://TNP_Member:nZaxjCSwn5PTVmdk@cluster0.vaze4je.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// ✅ This logic will now correctly identify the connection source as MongoDB Atlas
const connectionSource = MONGO_URI.includes('mongodb+srv') ? 'MongoDB Atlas' : 'Local MongoDB';

mongoose.connect(MONGO_URI)
  .then(() => console.log(`✅ Connected to ${connectionSource} successfully.`))
  .catch(err => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });


// --- ✅ START SERVER ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is live and listening at http://localhost:${PORT}`);
});