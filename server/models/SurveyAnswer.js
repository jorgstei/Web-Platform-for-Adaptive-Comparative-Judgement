const {Schema, model} = require('mongoose')

const SurveySchema = new Schema(
    {
        judgeId: {
            type: String,
            required: true
        },
        leftOption:{
            type: String,
            required: true
        },
        rightOption:{
            type: String,
            required: true
        },
        winner:{
            type: Number,
            required: true,
            enum: [0, 1]
        },
        surveyId: {
            type: String,
            required: true
        }
    }
)

const SurveyAnswer = model('SurveyAnswer', SurveySchema)
module.exports = SurveyAnswer