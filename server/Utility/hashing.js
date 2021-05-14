const crypto = require('crypto')

const iterations = 1000000
function hash(data) {
    var salt = crypto.randomBytes(256).toString('hex');
    var result = crypto.pbkdf2Sync(data, salt, iterations, 32, "sha256").toString('hex')
    return {
        hash: result,
        salt: salt
    };
}

// This method is used when the user logs in
function compareHash(hash, data, salt) {
    var newHash = crypto.pbkdf2Sync(data, salt, iterations, 32, "sha256").toString('hex')
    return hash == newHash;
}

module.exports = {hash, compareHash}