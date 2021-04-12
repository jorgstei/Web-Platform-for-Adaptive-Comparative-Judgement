const {Router} = require('express')
const SurveyAnswer = require('../models/SurveyAnswer')
const {auth} = require("./authentication")
const Survey = require('../models/Survey')

const router = Router()

/**
 * @apiDefine SuccessGetSurveyAnswerArray
 * @apiSuccess (200) {String} surveyanswers._id The id of this surveyanswer
 * @apiSuccess (200) {String} surveyanswers.judgeId the ID of the judge that created this answer
 * @apiSuccess (200) {String} surveyanswers.leftOption the ID of the Survey.item that was in the left position
 * @apiSuccess (200) {String} surveyanswers.rightOption the ID of the Survey.item that was in the right position
 * @apiSuccess (200) {Number=0,1} surveyanswers.winner 1 means the left option was picked, 0 means the right option was picked.
 * @apiSuccess (200) {String} surveyanswers.surveyId The ID of the survey that holds these items, and the judge was participating in. 
 */

 /**
 * @apiDefine SuccessGetSurveyAnswer
 * @apiSuccess (200) {String} _id The id of this surveyanswer
 * @apiSuccess (200) {String} judgeId the ID of the judge that created this answer
 * @apiSuccess (200) {String} leftOption the ID of the Survey.item that was in the left position
 * @apiSuccess (200) {String} rightOption the ID of the Survey.item that was in the right position
 * @apiSuccess (200) {Number=[0, 1]} winner 1 means the left option was picked, 0 means the right option was picked.
 * @apiSuccess (200) {String} surveyId The ID of the survey that holds these items, and the judge was participating in. 
 */

/**
 * @api {get} /api/surveyanswer
 * @apiName GETAllSurveyanswer
 * @apiGroup Surveyanswer
 * @apiVersion 0.1.0
 * @apiUse SuccessGetSurveyAnswerArray
 * @apiPermission AdminOrOwner
 * @apiUse AuthMiddleware
 * @apiError (404) 404 Not Found, No documents could be found.
 */
router.get("/", auth, async (req, res) => {
    console.log("Get all SurveyAnswers called")
    try{
        if(req.auth["user"]?.role !== "admin" && req.auth["user"]?.role !== "researcher"){
            res.sendStatus(403)
            return
        }
        const surveyAnswers = await SurveyAnswer.find()
        if(!surveyAnswers){
            throw new Error("survey_answer_route.js, couldn't get all")
        }
        res.json(surveyAnswers)
    } catch(error) {
        res.status(404).json({message: "Empty collection"})
    }
})

/**
 * @api {get} /api/surveyanswer/:id
 * @apiName GETSurveyanswerById
 * @apiGroup Surveyanswer
 * @apiVersion 0.1.0
 * @apiParam (Parameter) id The ID of the surveyanswer to get
 * @apiUse SuccessGetSurveyAnswer
 * @apiPermission AdminOrOwner
 * @apiUse AuthMiddleware
 * @apiError (404) 404 Not Found, No documents could be found.
 */
router.get("/:id", auth, async (req, res) => {
    console.log("Get SurveyAnswer by id called")
    try{
        if(req.auth["user"]?.role !== "admin" && req.auth["user"]?.role !== "researcher"){
            res.sendStatus(403)
            return
        }
        const surveyAnswer = await SurveyAnswer.findOne({_id: {$eq: req.params.id}})
        console.log("SurveyAnswer in get by id: ", surveyAnswer)
        if(!surveyAnswer || surveyAnswer._id == null){
            throw new Error("survey_answer_route.js, couldn't get by id")
        }
        res.json(surveyAnswer)
    } catch(error) {
        console.log(error)
        res.status(404).json({message: "Empty collection"})
    }
})

/**
 * @api {get} /api/surveyanswer/judge/:id
 * @apiName GETSurveyanswerByJudgeId
 * @apiGroup Surveyanswer
 * @apiVersion 0.1.0
 * @apiParam (Parameter) id The ID of the surveyanswer to get
 * @apiUse SuccessGetSurveyAnswerArray
 * @apiPermission AdminOrOwner
 * @apiUse AuthMiddleware
 * @apiError (404) 404 Not Found, No documents could be found.
 */
router.get("/judge/:id", auth, async (req, res) => {
    console.log("Get SurveyAnswer by id called")
    try{
        if(req.auth["user"]?.role !== "admin" && req.auth["user"]?.role !== "researcher"){
            res.sendStatus(403)
            return
        }
        const surveyAnswers = await SurveyAnswer.find({judgeId: {$eq: req.params.id}})
        if(!surveyAnswers){
            throw new Error("survey_answer_route.js, couldn't get by id")
        }
        res.json(surveyAnswers)
    } catch(error) {
        res.status(404).json({message: "Empty collection"})
    }
})

/**
 * @api {get} /api/surveyanswer/survey/:id
 * @apiName GETSurveyanswerBySurveyId
 * @apiGroup Surveyanswer
 * @apiVersion 0.1.0
 * @apiParam (Parameter) id The ID of the surveyanswer to get
 * @apiUse SuccessGetSurveyAnswerArray
 * @apiPermission AdminOrOwner
 * @apiUse AuthMiddleware
 * @apiError (404) 404 Not Found, No documents could be found.
 */
router.get("/survey/:id", auth, async (req, res) => {
    console.log("Get SurveyAnswer by id called")
    try{

        if(req.auth["user"]?.role !== "admin" && req.auth["user"]?.role !== "researcher"){
            res.sendStatus(403)
            return
        }
        const surveyAnswers = await SurveyAnswer.find({surveyId: {$eq: req.params.id}})
        if(!surveyAnswers){
            throw new Error("survey_answer_route.js, couldn't get by id")
        }
        res.json(surveyAnswers)
    } catch(error) {
        res.status(404).json({message: "Empty collection"})
    }
})

/**
 * @api {post} /api/surveyanswer/
 * @apiName POSTSurveyanswer
 * @apiGroup Surveyanswer
 * @apiVersion 0.1.0
 * @apiSuccess (201) {String} loc the location of the newly created document.
 * @apiPermission AdminOrOwner
 * @apiUse AuthMiddleware
 * @apiError (404) 404 Not Found, No documents could be found.
 */
router.post("/", auth, async (req, res) => {
    console.log("Insert one SurveyAnswer")
    const surveyAnswer = req.body
    console.log("surveyAnswer instert: ", surveyAnswer)
    console.log("req.role: ", req.role)
    if(req.auth["judge"]?.role !== "judge"){
        res.sendStatus(403)
        return
    }
    try{
        const surveyAnswerDoc = await SurveyAnswer.create(surveyAnswer)
        if(!surveyAnswerDoc || !surveyAnswerDoc._id) {
            throw new Error("Could not create SurveyAnswer")
        }
        res.status(201).json({loc: surveyAnswerDoc._id})
    } catch(error) {
        console.log(error)
        res.sendStatus(500)
    }
})

/**
 * @api {delete} /api/surveyanswer/:id
 * @apiName DELETESurveyanswer
 * @apiGroup Surveyanswer
 * @apiVersion 0.1.0
 * @apiParam (Parameter) id The ID of the surveyanswer to delete
 * @apiSuccess (204) 204 No Content, the document was successfully deleted
 * @apiPermission AdminOrOwner
 * @apiUse AuthMiddleware
 * @apiError (404) 404 Not Found, No documents could be found.
 * @apiError (500) 500 Internal Server Error
 */
router.delete("/:id", auth, async (req, res) => {
    console.log("Delete one SurveyAnswer")
    const surveyAnswerDoc = await SurveyAnswer.findOne({_id: {$eq: req.params.id}})
    if(!surveyAnswerDoc || !surveyAnswerDoc._id){
        res.sendStatus(404)
        return
    }
    const surveyDoc = await Survey.findOne({_id: surveyAnswerDoc.surveyId})
    console.log("delete surveyAnswerDoc: ", surveyAnswerDoc)
    console.log("delete surveyDoc: ", surveyDoc)
    if(!surveyDoc || !surveyDoc._id){
        res.sendStatus(404)
        return
    }
    if(req.auth["user"]?.role !== "admin" && req.auth["user"]?.userid !== surveyDoc.ownerId){
        res.sendStatus(403)
        return
    }
    const result = await SurveyAnswer.deleteOne({_id: req.params.id})
    if(result.deletedCount == 1){
        res.sendStatus(204)
    }
    else{
        res.sendStatus(500)
    }
})

/**
 * @api {delete} /api/surveyanswer/judge/:id
 * @apiName DELETESurveyanswersByJudge
 * @apiGroup Surveyanswer
 * @apiVersion 0.1.0
 * @apiParam (Parameter) id The ID of the judge who's answers should be deleted
 * @apiSuccess (204) 204 No Content, the document was successfully deleted
 * @apiPermission AdminOrOwner
 * @apiUse AuthMiddleware
 * @apiError (404) 404 Not Found, No documents could be found.
 * @apiError (500) 500 Internal Server Error
 */
 router.delete("/judge/:id", auth, async (req, res) => {
    console.log("Delete surveyAnswers by judge")
    const surveyAnswers = await SurveyAnswer.find({judgeId: {$eq: req.params.id}})
    if(!surveyAnswers || !surveyAnswers.length > 0){
        res.sendStatus(404)
        return
    }
    const surveyDoc = await Survey.findOne({_id: surveyAnswers[0].surveyId})
    console.log("delete surveyAnswers: ", surveyAnswers)
    console.log("delete surveyDoc: ", surveyDoc)
    if(!surveyDoc || !surveyDoc._id){
        res.sendStatus(404)
        return
    }
    if(req.auth["user"]?.role !== "admin" && req.auth["user"]?.userid !== surveyDoc.ownerId){
        res.sendStatus(403)
        return
    }
    const surveyAnswersIDs = surveyAnswers.map(e=>e._id);
    console.log("Survey answer id's to be deleted: ", surveyAnswersIDs)
    const result = await SurveyAnswer.deleteMany({_id: {$in:surveyAnswersIDs}})
    console.log("Result from delete answers by judge: ", result);
    if(result.deletedCount === surveyAnswers.length){
        res.sendStatus(204)
    }
    else{
        res.sendStatus(500)
    }
})

module.exports = router