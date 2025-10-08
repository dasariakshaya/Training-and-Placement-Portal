// /frontend/js/auth.js

// ✅ ADDED: Define a base URL which is empty for deployment
const API_BASE_URL = '';

async function registerStudent() {
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const rollNumber = document.getElementById("rollNumber").value.trim();
  const branch = document.getElementById("branch").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorBox = document.getElementById("error");

  errorBox.textContent = ""; // Clear previous error

  const rollPattern = /^IIITM\d{4}[A-Z]{2,4}$/;

  if (!name || !email || !rollNumber || !branch || !password) {
    errorBox.textContent = "All fields are required.";
    return;
  }
  if (!rollPattern.test(rollNumber)) {
    errorBox.textContent = "Invalid roll number format. Use IIITM2025CSE style.";
    return;
  }
  if (password.length < 6) {
    errorBox.textContent = "Password must be at least 6 characters.";
    return;
  }

  try {
    // ✅ MODIFIED: Use the relative base URL
    const res = await fetch(`${API_BASE_URL}/api/auth/student/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, rollNumber, branch, password })
    });

    const data = await res.json();

    if (!res.ok) {
      errorBox.textContent = data.error || "Registration failed.";
    } else {
      alert("✅ Registered successfully! Please log in.");
      window.location.href = "multi-login.html"; // Redirect to login page
    }
  } catch (err) {
    errorBox.textContent = "Network error. Please try again later.";
  }
}

async function loginStudent() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorBox = document.getElementById("error");

  errorBox.textContent = ""; // Clear previous error

  if (!email || !password) {
    errorBox.textContent = "Email and password are required.";
    return;
  }

  try {
    // ✅ MODIFIED: Use the relative base URL
    const res = await fetch(`${API_BASE_URL}/api/auth/student/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      errorBox.textContent = data.error || "Login failed.";
    } else {
      localStorage.setItem("studentToken", data.token);
      window.location.href = "student-dashboard.html";
    }
  } catch (err) {
    errorBox.textContent = "Network error. Please try again later.";
  }
}