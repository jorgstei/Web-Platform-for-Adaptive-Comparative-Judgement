const {Router} = require('express')
const SurveyAnswer = require('../models/SurveyAnswer')
const {auth} = require("./authentication")
const Survey = require('../models/Survey')

const router = Router()

//Get all
router.get("/", auth, async (req, res) => {
    console.log("Get all SurveyAnswers called")
    try{
        if(req.role !== "admin" && req.role !== "researcher"){
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

//Get one by id
router.get("/:id", auth, async (req, res) => {
    console.log("Get SurveyAnswer by id called")
    try{
        if(req.role !== "admin" && req.role !== "researcher"){
            res.sendStatus(403)
            return
        }
        const surveyAnswer = await SurveyAnswer.findOne({_id: req.params.id})
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

//Get all by judge
router.get("/judge/:id", auth, async (req, res) => {
    console.log("Get SurveyAnswer by id called")
    try{
        if(req.role !== "admin" && req.role !== "researcher"){
            res.sendStatus(403)
            return
        }
        const surveyAnswers = await SurveyAnswer.find({judge_id: req.params.id})
        if(!surveyAnswers){
            throw new Error("survey_answer_route.js, couldn't get by id")
        }
        res.json(surveyAnswers)
    } catch(error) {
        res.status(404).json({message: "Empty collection"})
    }
})
//Get all by survey id
router.get("/survey/:id", auth, async (req, res) => {
    console.log("Get SurveyAnswer by id called")
    try{
        console.log("get all by survey id role: ", req.role)
        //TODO: Fix this check once we've updated all users to the correct naming
        if(req.role !== "admin" && req.role !== "researcher" && req.role !== "scientist"){
            console.log("get all by survey id role: ", req.role)
            res.sendStatus(403)
            return
        }
        const surveyAnswers = await SurveyAnswer.find({survey_id: req.params.id})
        if(!surveyAnswers){
            throw new Error("survey_answer_route.js, couldn't get by id")
        }
        res.json(surveyAnswers)
    } catch(error) {
        res.status(404).json({message: "Empty collection"})
    }
})

//Insert one
router.post("/", auth, async (req, res) => {
    console.log("Insert one SurveyAnswer")
    const surveyAnswer = req.body
    console.log("surveyAnswer instert: ", surveyAnswer)
    console.log("req.role: ", req.role)
    if(req.role !== "judge"){
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

//Delete one
router.delete("/:id", auth, async (req, res) => {
    console.log("Delete one SurveyAnswer")
    const surveyAnswerDoc = await SurveyAnswer.findOne({_id: req.params.id})
    if(!surveyAnswerDoc || !surveyAnswerDoc._id){
        res.sendStatus(404)
        return
    }
    const surveyDoc = await Survey.findOne({_id: surveyAnswerDoc.survey_id})
    console.log("delete surveyAnswerDoc: ", surveyAnswerDoc)
    console.log("delete surveyDoc: ", surveyDoc)
    if(!surveyDoc || !surveyDoc._id){
        res.sendStatus(404)
        return
    }
    if(req.role !== "admin" && req.userid !== surveyDoc.owner_id){
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

module.exports = router