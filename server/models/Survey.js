const {Schema, model} = require('mongoose')


const childOwnerRightsSchema = new Schema(
    {
        //An owner implicitly has rights to VIEW the survey
        manageMembers:{
            type: Boolean,
            required: true,
            default: false
        },
        editSurvey: {
            type: Boolean,
            required: true,
            default: false
        },
        viewResults: {
            type: Boolean,
            required: true,
            default: false
        }
    }
)
const childOwnerSchema = new Schema(
    {
        ownerId: {
            type: String,
            required: true
        },
        rights: {
            type: childOwnerRightsSchema,
            required: true
        }
    }
)

const Item = new Schema(
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

const SurveySchema = new Schema(
    {
        owners: {
            type: [childOwnerSchema],
            required: true
        },
        inviteCode: {
            type: Number
        },
        expectedComparisons:{
            type: Number,
            required: true,
            min: 1,
            default: 1
        },
        items: [Item],
        active: {
            type: Boolean,
            required: true
        },
        title: {
            type: String,
            required: true,
        },
        internalDescription: {
            type: String,
            required: true
        },
        judgeInstructions: {
            type: String,
            required: true
        },
        surveyQuestion: {
            type: String,
            required: true
        },
        purpose: {
            type: String,
            required: true
        },
        mediaType: {
            type:String,
            default: "text"
        },
    },
    {
        timestamps: {
            createdAt: "dateCreated",
            updatedAt: "lastEdited"
        }
    }
)

const Survey = model('Survey', SurveySchema)

module.exports = Survey