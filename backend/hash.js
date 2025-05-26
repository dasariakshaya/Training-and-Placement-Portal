const bcrypt = require('bcrypt');

const plainPassword = 'password'; // 🔒 Change to your actual password

bcrypt.hash(plainPassword, 10)
  .then(hash => {
    console.log('Hashed password:', hash);
  })
  .catch(err => {
    console.error('Error hashing password:', err);
  });
