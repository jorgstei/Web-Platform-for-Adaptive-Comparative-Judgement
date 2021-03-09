const {Schema, model} = require('mongoose')

const SurveySchema = new Schema(
    {
        judge_id: {
            type: String,
            required: true
        },
        winner_id:{
            type: String,
            required: true
        },
        loser_id: {
            type: String,
            required: true
        },
        survey_id: {
            type: String,
            required: true
        }
    }
)

const SurveyAnswer = model('SurveyAnswer', SurveySchema)
module.exports = SurveyAnswer