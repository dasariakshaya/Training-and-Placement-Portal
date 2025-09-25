// hashAdminPassword.js
const bcrypt = require('bcryptjs');

const plainTextPassword = '123';
const saltRounds = 10;

const hashedPassword = bcrypt.hashSync(plainTextPassword, saltRounds);

console.log("Your plaintext password is: ", plainTextPassword);
console.log("\nCopy this hashed password to use in the Mongo shell:");
console.log(hashedPassword);