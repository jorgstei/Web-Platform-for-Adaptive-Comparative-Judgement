const {Router} = require('express')
const Survey = require('../models/Survey')
const SurveyAnswer = require("../models/SurveyAnswer")
const {auth} = require("./authentication")

const router = Router()

/**
 * @api {get} /survey
 * @apiName GetAllSurveys
 * @apiGroup Survey
 * @apiVersion 0.1.0
 * @apiSuccess (200) {Object[]} surveys An array of survey objects
 * @apiSuccess (200) {Object[]} surveys.owners An array of objects defining who has access to this survey
 * @apiSuccess (200) {String} surveys.owners.owner_id The ID identifying a user with rights to this survey
 * @apiSuccess (200) {Object} surveys.owners.rights An object with booleans showing which rights the owner has on this survey
 * @apiSuccess (200) {Boolean} surveys.owners.rights.manageMembers If this user can add/remove owners of the survey, or change their access
 * @apiSuccess (200) {Boolean} surveys.owners.rights.editSurvey If this user can edit the survey (Change fields, add new fields, remove fields etc.)
 * @apiSuccess (200) {Boolean} surveys.owners.rights.viewResults If this user can view the judges selections, analysis and statistics.
 * @apiSuccess (200) {Object[]} surveys.items An array of Item objects, these are the options judges choose between
 * @apiSuccess (200) {String} surveys.items.type A string defining what type of item this item is (f.ex. text, pdf, latex)
 * @apiSuccess (200) {String} surveys.items.data For raw text, this will be the text to display. For other <code>items.type</code> it will be a URL to the resource.
 * @apiSuccess (200) {String} surveys.title The title of the survey
 * @apiSuccess (200) {String} surveys.internalDescription The internal description of this survey
 * @apiSuccess (200) {String} surveys.judgeInstructions The instructions that are shown to judges when they take the survey
 * @apiSuccess (200) {String} surveys.surveyQuestion The overarching question the survey is attempting to answer
 * @apiSuccess (200) {String} surveys.purpose TODO: Is this redundant?
 * @apiSuccess (200) {String} surveys.mediaType The media type used for this survey (f.ex. mix, text, pdf etc.)
 * @apiSuccess (200) {String} surveys.accessibility How the survey can be accessed by judges. (code, or link)
 * @apiSuccess (200) {String} surveys.dateCreated The datetime when this survey was made
 * @apiSuccess (200) {String} surveys.lastEdited The datetime when this survey was last edited
 * @apiPermission AdminOrOwner
 * @apiUse AuthMiddleware
 * @apiError (404) 500 Internal Server Error
 */
router.get("/", auth, async (req, res) => {
    console.log("Called get all surveys")
    try{
        if(req.role !== "admin"){
            res.sendStatus(403)
            return
        }
        const surveys = await Survey.find()
        if(!surveys){
            throw new Error("survey_route.js get all surveys failed")
        }
        res.json(surveys)
    } catch(error){
        console.log("Error get all surveys: ", error)
        res.sendStatus(404)
    }
})

/**
 * @api {get} /survey/user/:id
 * @apiName GetAllSurveysForUser
 * @apiGroup Survey
 * @apiVersion 0.1.0
 * @apiSuccess (204) 204 No Content, an invite link has been sent to the <code>email</code>.
 * @apiPermission AdminOrOwner
 * @apiUse AuthMiddleware
 * @apiError (403) 403 Forbidden
 * @apiError (404) 500 Internal Server Error
 */
router.get("/user/:id", auth, async (req, res) => {
    console.log("Called get all surveys for user")
    try{
        if(req.role !== "admin" && req.userid !== req.params.id){
            console.log("req.role: ", req.role, "req.params.id: ", req.params.id, "req.userid: ", req.userid)
            res.sendStatus(403)
            return
        }
        const surveys = await Survey.find({"owners.owner_id": req.params.id})
        if(!surveys){
            throw new Error("survey_route.js get all surveys failed")
        }
        res.json(surveys)
    } catch(error){
        console.log("Error get all surveys: ", error)
        res.sendStatus(404)
    }
})

//Get random item pair from survey by id
router.get("/item/:id", auth, async (req, res) => {
    console.log("called get random pair from survey by id for item")
    try { 
        const surveyDoc = await Survey.findOne({_id: req.params.id})
        if(!surveyDoc || surveyDoc._id == null){
            throw new Error("Could not find survey by id")
        }
        if(!surveyDoc.accessability === "linkonly"){
            if(!req.role === "judge" && !req.userid === surveyDoc.owner_id){
                //TODO: Check that the passphrase from cookie is valid for this survey
            }
        }
        const count = surveyDoc.items.length
        if(count < 2){
            throw new Error("Too few elements in collection.")
        }
        const random_skip = Math.floor(Math.random() * count)
        const comparisonObject1 = surveyDoc.items[random_skip]
        let comparisonObject2 = null
        while(true){
            const random_skip2 = Math.floor(Math.random() * count);
            comparisonObject2 = surveyDoc.items[random_skip2]
            if(comparisonObject2 != null){
                if(comparisonObject1._id != comparisonObject2._id){
                    break
                }
            }
        } 
        res.status(200).json({data: [comparisonObject1, comparisonObject2]})
    } catch (error) {
        res.status(404).json({message: "Unable to get two random ComparisonObjects for this survey"})
    }
})

//Get survey by id
router.get("/:id", auth, async (req, res) => {
    console.log("Called get survey by id")
    try {
        const survey = await Survey.findOne({_id: req.params.id})
        const foundOwner = survey.owners.find(owner => owner.owner_id === req.userid)
        if(req.role !== "admin" && req.userid !== foundOwner.owner_id){
            res.sendStatus(403)
            return
        }
        console.log("Survey: ", survey)
        if(!survey || survey._id === null){
            throw new Error('survey_route.js GET by id: Could not find document')
        }
        res.status(200).json(survey)
    } catch (error) {
        console.log("Error getting 1 survey by id: ", error)
        res.status(404).json({message: "Could not find survey."})
    }
})

//Insert one TODO: Add support for using pre-existing ComparisonObjects
router.post("/", auth, async (req, res) => {
    console.log("called post one for survey")
    const {
        owners, items, active, title, internalDescription, judgeInstructions, surveyQuestion,
        purpose, mediaType, accessibility
    } = req.body
    const owner_id = req.userid;
    if(req.role !== "admin" && req.role !== "scientist"){
        res.sendStatus(403)
        return
    }
    try {
        const survey = await Survey.create({
            owners, items, active, title, internalDescription, judgeInstructions, surveyQuestion,
            purpose, mediaType, accessibility
        })
        if(!survey || !survey._id){
            throw new Error('Could not create survey.')
        }
        res.status(201).json({loc: survey._id});
    } catch (error) {
        console.log(error);
        res.status(500).json({message: "Internal Server Error: Could not save the object."})
    }
})

//Update/Overwrite survey
router.put("/:id", auth, async (req, res) => {
    console.log("called put for survey")
    const {
        owners, items, active, title, internalDescription, judgeInstructions, surveyQuestion,
        purpose, mediaType, accessibility
    } = req.body
    const owner_id = req.userid
    const surveyDoc = await Survey.findOne({_id: req.params.id})
    if(surveyDoc._id == null){
        res.sendStatus(404)
    }
    const userIsOwner = await surveyDoc.owners.some(e => {(e.owner_id == owner_id) && e.rights.editSurvey == true })
    if(req.role !== "admin" && req.role !== "scientist" && !userIsOwner){
        res.sendStatus(403)
        return
    }

    try {
        const surveyReplaceResult = await Survey.replaceOne({_id: req.params.id},
            {
                owners, items, active, title, internalDescription, judgeInstructions, surveyQuestion,
                purpose, mediaType, accessibility
            }
        )
        console.log("surveyReplaceResult:", surveyReplaceResult)
        res.sendStatus(200);
    } catch (error) {
        console.log(error);
        res.status(500).json({message: "Internal Server Error: Could not save the object."})
    }
})

//Delete one by ID
router.delete("/:id", auth, async (req, res) => {
    try {
        const surveyDoc = await Survey.findOne({_id: req.params.id})
        console.log(surveyDoc.owners)
        console.log("userid:", req.userid)
        const foundOwner = surveyDoc.owners.find(owner => owner.owner_id === req.userid)
        console.log(foundOwner)
        if(req.role !== "admin" && req.userid !== foundOwner.owner_id ){
            res.sendStatus(401)
            return
        }
        if(surveyDoc._id == null){
            res.sendStatus(404)
            return
        }
        if(req.role === "admin"){
            //Remember to clean up the assosiated SurveyAnswers
            await SurveyAnswer.deleteMany({survey_id: surveyDoc._id})
            //Finally clean up the Survey itself
            const result = await Survey.deleteOne({_id: req.params.id})
            if(result.deletedCount == 1){
                res.sendStatus(204)
            }
            else{
                res.sendStatus(404)
            }
        }
        else{
            const updateSurveysResult = await Survey.updateOne(
                {_id: surveyDoc._id},
                {
                    $pull: 
                    {
                        owners: 
                        {
                            owner_id: req.userid
                        }
                    }
                })
            console.log(updateSurveysResult)
            if(updateSurveysResult.n === 1 && updateSurveysResult.nModified === 1 && updateSurveysResult.ok === 1){
                res.sendStatus(204)
            }
            else{
                res.sendStatus(500)
            }
        }

    } catch (error) {
        console.log("delete survey error:", error)
        res.sendStatus(500)
    }

})

module.exports = router