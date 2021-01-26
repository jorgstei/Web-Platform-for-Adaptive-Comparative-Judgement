const {Schema, model} = require('mongoose')

const ComparisonObjectSchema = new Schema(
    {
        type: {
            type: String,
            required: true,
        },
        data: {
            type: String,
            required: true,
        }
    }
)

const ComparisonObject = model('ComparisonObject', ComparisonObjectSchema)

module.exports = ComparisonObject