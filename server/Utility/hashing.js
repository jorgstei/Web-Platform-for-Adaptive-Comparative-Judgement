const sjcl = require('sjcl')

function hash(data) {
    var salt = sjcl.random.randomWords(64);
    var saltstring = sjcl.codec.base64.fromBits(salt);
    return {
        hash: sjcl.codec.base64.fromBits(sjcl.hash.sha256.hash(data + saltstring)),
        salt: sjcl.codec.base64.fromBits(salt)
    };
}

// This method is used when the user logs in
function compareHash(hash, data, salt) {
    var newHash = sjcl.codec.base64.fromBits(sjcl.hash.sha256.hash(data + salt));
    return hash == newHash;
}

module.exports = {hash, compareHash}