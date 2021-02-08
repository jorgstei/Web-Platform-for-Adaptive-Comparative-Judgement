const {Schema, model} = require('mongoose')

const UserSchema = new Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            dropDups: true
        },
        hashed: {
            type: String,
            required: true,
        },
        salt: {
            type: String,
            required: true
        },
        role: {
            type: String,
            required: true
        }
    }
)

const User = model('User', UserSchema)

module.exports = User