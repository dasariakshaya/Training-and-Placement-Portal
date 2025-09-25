// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Admin = require('../models/admin');
const Recruiter = require('../models/recruiter');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

// ===================================
// STUDENT AUTH
// ===================================

router.post('/student/register', async (req, res) => {
    const { name, email, password, rollNumber, branch } = req.body;
    const validRollRegex = /^IIITM\d{4}[A-Z]+$/;

    if (!validRollRegex.test(rollNumber)) {
        return res.status(400).json({ error: 'Invalid roll number format. Expected format: IIITM<YEAR><BRANCH>.' });
    }

    // ✅ ADDED: Password length validation for security
    if (!password || password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    try {
        const existingUser = await Student.findOne({ $or: [{ email }, { rollNumber }] });
        if (existingUser) {
            return res.status(409).json({ error: 'A user with this email or roll number already exists.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newStudent = new Student({ name, email, password: hashedPassword, rollNumber, branch });
        await newStudent.save();

        res.status(201).json({ message: 'Student registered successfully.' });
    } catch (err) {
        console.error("❌ Student registration error:", err);
        res.status(500).json({ error: 'Server error during registration.' });
    }
});

// ===================================
// RECRUITER AUTH
// ===================================

router.post('/recruiter/register', async (req, res) => {
    const { email, password, company, contactPerson } = req.body;
    try {
        if (!email || !password || !company) {
            return res.status(400).json({ error: 'Email, password, and company are required.' });
        }
        
        // ✅ ADDED: Password length validation for security
        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
        }

        const existingRecruiter = await Recruiter.findOne({ email });
        if (existingRecruiter) {
            return res.status(409).json({ error: 'A recruiter with this email already exists.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newRecruiter = new Recruiter({ email, password: hashedPassword, company, contactPerson });
        await newRecruiter.save();
        res.status(201).json({ message: 'Recruiter registered successfully.' });
    } catch (err) {
        console.error("❌ Recruiter registration error:", err);
        res.status(500).json({ error: 'Server error during registration.' });
    }
});


// ===================================
// GENERIC LOGIN HANDLER (REFACTORED)
// ===================================

// ✅ REFACTORED: A single function to handle login logic for all user types
const loginHandler = async (req, res, Model, findBy, role, expiresIn) => {
    const { password } = req.body;
    const identifier = req.body[findBy]; // e.g., req.body['email'] or req.body['username']

    try {
        const user = await Model.findOne({ [findBy]: identifier });

        if (!user || !await bcrypt.compare(password, user.password)) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }
        
        // Use the user's specific role if it exists (for student/verifier), otherwise use the provided role
        const userRole = user.role || role;

        const token = jwt.sign({ id: user._id, role: userRole }, JWT_SECRET, { expiresIn });
        res.json({ token, role: userRole });

    } catch (err) {
        console.error(`❌ ${role} login error:`, err);
        res.status(500).json({ error: 'Server error during login.' });
    }
};

// ===================================
// LOGIN ROUTES (Now using the handler)
// ===================================

// POST /api/auth/student/login
router.post('/student/login', (req, res) => {
    loginHandler(req, res, Student, 'email', 'student', '7d');
});

// POST /api/auth/recruiter/login
router.post('/recruiter/login', (req, res) => {
    loginHandler(req, res, Recruiter, 'email', 'recruiter', '7d');
});

// POST /api/auth/admin/login
router.post('/admin/login', (req, res) => {
    loginHandler(req, res, Admin, 'username', 'admin', '2h');
});

module.exports = router;