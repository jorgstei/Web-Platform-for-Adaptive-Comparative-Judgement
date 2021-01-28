const {Schema, model} = require('mongoose')

const SurveySchema = new Schema(
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

const Survey = model('ComparisonObject', ComparisonObjectSchema)

module.exports = Survey