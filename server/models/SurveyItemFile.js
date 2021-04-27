const {Schema, model} = require('mongoose')

const SurveyItemFileSchema = new Schema(
    {
        surveyId: {
            type: String,
            required: true
        },
        data: {
            type: Buffer,
            required: true
        },
        fileName: {
            type: String,
            required: false,
            default: ""
        },
        tag: {
            type: String,
            required: true
        },
        mimeType: {
            type: String,
            required: true
        }
    }
)

const SurveyItemFile = model('SurveyItemFile', SurveyItemFileSchema)

module.exports = SurveyItemFile