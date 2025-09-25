# Training and Placement Portal (TNP_PORTAL)

This is a full-stack web application built to simplify and manage the training and placement process for students, recruiters, and administrators. The project focuses on a modular design with working backend features developed first, followed by UI refinement.

## Tech Stack

Frontend  
HTML, CSS, JavaScript (focus on functionality with basic user interface)

Backend  
Node.js, Express.js

Database  
MongoDB

Tools Used  
Postman for API testing

## Features

### Student Panel

- Allows students to register and log in
- Resume upload functionality
- Job application system
- Application status tracking

### Recruiter Panel

- Recruiter login and job posting
- View all applicants for a posted job
- Access and download student resumes
- Update application status with options like Interview, Selected, or Rejected
- Send interview calls to shortlisted candidates

### Admin Panel

- Manage access for students and recruiters
- Approve or reject job postings
- View and analyze placement data
- Export applicant data in CSV format

## Project Notes

- The project is being developed incrementally, with backend logic built first and frontend being improved progressively.
- The aim is to replicate the real-world placement workflow using a clean and maintainable code structure.
- This portal takes inspiration from the IIT Bombay campus placement system.
## How to Run Locally
### Frontend Setup

Open the frontend/index.html file in any web browser.  
You can also serve it using a live server extension in your code editor for better development experience.

### Backend Setup

Open terminal in the backend folder and run the following commands:
Run the following commands in your terminal:

```bash
cd backend
npm install
npm start
node server.js
