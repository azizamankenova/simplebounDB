const crypto = require("crypto");

function encryptPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

function checkPassword(password, hashedPassword) {
    return encryptPassword(password) === hashedPassword;
}

module.exports = {
    encryptPassword,
    checkPassword
}