const {Router} = require('express')
const SurveyAnswer = require('../models/SurveyAnswer')
const {auth} = require("./authentication")
const Survey = require('../models/Survey')
const me = require('mongo-escape').escape

const router = Router()

function userHasViewResultsRights(surveyId, userid){
    Survey.findOne({_id: {$eq: surveyId}})
    .then(survey => {
        if(survey == undefined || survey == null || survey._id == null){
            return false;
        }
        let owner = survey.owners.find(e => e.ownerId == userid)
        if(owner == undefined || owner.rights == undefined){
            console.log("userHasViewResultsRights owner is undefined or has no rights")
            return false
        }
        if(owner.rights.viewResults != true){
            return false
        }
        return true
    })
}

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
        if(req.auth["user"]?.role !== "admin"){
            res.sendStatus(403)
            return
        }
        const surveyAnswers = await SurveyAnswer.find()
        if(!surveyAnswers){
            throw new Error("survey_answer_route.js, couldn't get all")
        }
        res.json(surveyAnswers)
    } catch(error) {
        console.log("Error occured in GETAllSurveyanswer")
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
        if(!userHasViewResultsRights(surveyAnswer.surveyId, req.auth["user"]?.userid)){
            res.sendStatus(403)
            return
        }
        res.json(surveyAnswer)
    } catch(error) {
        console.log("Error occured in GETSurveyanswerById")
        res.status(404).json({message: "Empty collection"})
    }
})

/**
 * @api {get} /api/surveyanswer/judge/:id
 * @apiName GETSurveyanswerByJudgeId
 * @apiGroup Surveyanswer
 * @apiVersion 0.1.0
 * @apiParam (Parameter) id The ID of the judge you want to get the answers for
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
        if(!userHasViewResultsRights(surveyAnswer[0].surveyId, req.auth["user"]?.userid)){
            res.sendStatus(403)
            return
        }
        res.json(surveyAnswers)
    } catch(error) {
        console.log("Error occured in GETSurveyanswerByJudgeId")
        res.status(404).json({message: "Empty collection"})
    }
})

/**
 * @api {get} /api/surveyanswer/survey/:id
 * @apiName GETSurveyanswerBySurveyId
 * @apiGroup Surveyanswer
 * @apiVersion 0.1.0
 * @apiParam (Parameter) id The ID of the survey you want to get the answers for
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
        if(req.auth["user"]?.role != "admin" && !userHasViewResultsRights(req.params.id, req.auth["user"]?.userid)){
            res.sendStatus(403)
            return
        }
        res.json(surveyAnswers)
    } catch(error) {
        console.log("Error occured in GETSurveyanswerBySurveyId")
        res.status(404).json({message: "Empty collection"})
    }
})

/**
 * @api {post} /api/surveyanswer/
 * @apiName POSTSurveyanswer
 * @apiGroup Surveyanswer
 * @apiVersion 0.1.0
 * @apiParam {Object} surveyAnswer The judge's answer.
 * @apiParam {String} surveyAnswer.judgeId The ID of the judge.
 * @apiParam {String} surveyAnswer.leftOption The ID of the left option.
 * @apiParam {String} surveyAnswer.rightOption The ID of the right option.
 * @apiParam {Number=0,1} surveyAnswer.winner 0 if right won, 1 of left won.
 * @apiParam {String} surveyAnswer.surveyId The ID of the survey being answered.
 * @apiSuccess (201) {String} loc the location of the newly created document.
 * @apiPermission Judge
 * @apiUse AuthMiddleware
 * @apiError (404) 404 Not Found, No documents could be found.
 */
router.post("/", auth, async (req, res) => {
    const surveyAnswer = req.body
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
        console.log("Error occured in POSTSurveyanswer")
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
    try {
        const surveyAnswerDoc = await SurveyAnswer.findOne({_id: {$eq: req.params.id}})
        if(!surveyAnswerDoc || !surveyAnswerDoc._id){
            res.sendStatus(404)
            return
        }
        const surveyDoc = await Survey.findOne({_id: surveyAnswerDoc.surveyId})
    
        if(!surveyDoc || !surveyDoc._id){
            res.sendStatus(404)
            return
        }
        if(req.auth["user"]?.role !== "admin" && req.auth["user"]?.userid !== surveyDoc.ownerId 
            && !userHasViewResultsRights(surveyDoc.surveyId, req.auth["user"]?.userid)
        ){
            res.sendStatus(403)
            return
        }
        const result = await SurveyAnswer.deleteOne({_id: req.params.id})
        if(result.deletedCount == 1){
            res.sendStatus(204)
        }
        else{
            throw new Error("Failed to delete survey answer")
        }
    } catch (error) {
        console.log("Error occured in DELETESurveyanswer")
        res.status(500).json({message: "Internal Server Error"})
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
    try {
        const surveyAnswers = await SurveyAnswer.find({judgeId: {$eq: req.params.id}})
        if(!surveyAnswers || !surveyAnswers.length > 0){
            res.sendStatus(404)
            return
        }
        const surveyDoc = await Survey.findOne({_id: surveyAnswers[0].surveyId})
        if(!surveyDoc || !surveyDoc._id){
            res.sendStatus(404)
            return
        }
        if(req.auth["user"]?.role !== "admin" && req.auth["user"]?.userid !== surveyDoc.ownerId && !userHasViewResultsRights(surveyDoc._id, req.auth["user"].userid)){
            res.sendStatus(403)
            return
        }
        const surveyAnswersIDs = surveyAnswers.map(e=>e._id);
        const result = await SurveyAnswer.deleteMany({_id: {$in:surveyAnswersIDs}})
        if(result.deletedCount === surveyAnswers.length){
            res.sendStatus(204)
        }
        else{
            throw new Error("Error deleting survey answers by judge id")
        }
    } catch (error) {
        console.log("Error occured in DELETESurveyanswer")
        res.sendStatus(500)
    }
})

/**
 * @api {get} /api/surveyanswer/function/count/answers/:surveyid
 * @apiName GetSurveyAnswersCountBySurveyId
 * @apiGroup Surveyanswer
 * @apiVersion 0.1.0
 * @apiParam (Parameter) surveyId The ID of the survey you want the answer count for
 * @apiSuccess (200) {Number} count The number of comparisons done for this survey
 * @apiPermission AdminOrOwner
 * @apiUse AuthMiddleware
 * @apiError (500) 500 Internal Server Error
 */
router.get("/function/count/answers/:surveyid", auth, async (req, res) => {
    try {
        if (req.auth["user"]?.role !== "admin" && req.auth["user"]?.role !== "researcher") {
            res.status(403).json({message: "Forbidden"})
            return
        }
        else{
            SurveyAnswer.countDocuments({surveyId: me(req.params.surveyid)})
            .then(count => {
                res.json(count)
            })
            return;
        }

    } catch (error) {
        console.log("Error occured in GetSurveyAnswersCountBySurveyId")
        res.status(500).json({message: "Internal Server Error"})
    }
})

/**
 * @api {get} /api/surveyanswer/function/count/judges/:surveyid
 * @apiName GetSurveyJudgeCountBySurveyId
 * @apiGroup Surveyanswer
 * @apiVersion 0.1.0
 * @apiParam (Parameter) surveyId The ID of the survey you want the judge count for
 * @apiSuccess (200) {Number} count The number of judges that has judged this survey
 * @apiPermission AdminOrOwner
 * @apiUse AuthMiddleware
 * @apiError (500) 500 Internal Server Error
 */
router.get("/function/count/judges/:surveyid", auth, async (req, res) => {
    try {
        if (req.auth["user"]?.role !== "admin" && req.auth["user"]?.role !== "researcher" && !userHasViewResultsRights(req.params.id, req.auth["user"]?.userid)) {
            res.status(403).json({message: "Forbidden"})
            return
        }
        else{
            //SurveyAnswer.find({surveyId:{$eq: req.params.id}}).distinct("judgeId").count().then(count => res.json(count))
            SurveyAnswer.aggregate([{ $match: { surveyId: me(req.params.surveyid)}}, { $group: { _id: '$judgeId', count: {$sum: 1} } }])
            .then(result => {
                res.json(result.length);
            })
            return;
        }

    } catch (error) {
        console.log("Error occured in GetSurveyJudgeCountBySurveyId")
        res.status(500).json({message: "Internal Server Error"})
    }
})

module.exports = router