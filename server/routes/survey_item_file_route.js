const { Router } = require('express')
const Survey = require('../models/Survey')
const SurveyItemFile = require("../models/SurveyItemFile")
const SurveyAnswer = require("../models/SurveyAnswer")
const { auth } = require('./authentication')
const me = require('mongo-escape').escape

const router = Router()
 /**
 * @apiDefine SuccessGetSurveyItemFile
 * @apiSuccess (200) {String} _id The id of this surveyanswer
 * @apiSuccess (200) {String} surveyId the ID of the survey this file is assosiated with
 * @apiSuccess (200) {Buffer} data The binary data representation of this file
 * @apiSuccess (200) {String} fileName The file name of this file
 * @apiSuccess (200) {String} tag The user defined tag to identify this item file
 * @apiSuccess (200) {String} mimeType The mime-type of this file (f.ex. application/pdf, text/plain) 
 */

/**
 * @api {get} /api/surveyitemfile/:id
 * @apiName GETSurveyItemFileById
 * @apiGroup SurveyItemFile
 * @apiVersion 0.1.0
 * @apiParam (Parameter) id The ID of the item file (Should come from survey.items)
 * @apiUse SuccessGetSurveyItemFile
 * @apiPermission AdminOwnerOrJudge
 * @apiUse AuthMiddleware
 * @apiError (404) 404 Not Found, No documents could be found.
 */
router.get("/:id", auth, async (req, res) => {
    if(req.auth["user"]?.role !== "admin" && req.auth["user"]?.role !== "researcher" && req.auth["judge"]?.role !== "judge"){
        res.status(403).json({message: "Forbidden"})
        return;
    }
    try {
        const me_id = me(req.params.id)
        console.log("me_id:", me_id)
        SurveyItemFile.findOne({_id: me_id})
        .then(file => {
            console.log("Retrieved file: ", file)
            if(file?._id == null){
                res.status(404).json({message: "Could not find file."})
                return
            }
            res.status(200).json(
                file
            )
        })
    } catch (error) {
        console.log("error getting itemfile", error)
        res.status(500).json({message: "Internal Server Error"})
    }
})

/**
 * @api {get} /api/surveyitemfile/:id/view
 * @apiName GETSurveyItemFileViewById
 * @apiGroup SurveyItemFile
 * @apiVersion 0.1.0
 * @apiParam (Parameter) id The ID of the item file (Should come from survey.items)
 * @apiSuccess (200) {String} _id The id of this surveyanswer
 * @apiSuccess (200) {String} surveyId the ID of the survey this file is assosiated with
 * @apiSuccess (200) {String} fileName The file name of this file
 * @apiSuccess (200) {String} tag The user defined tag to identify this item file
 * @apiSuccess (200) {String} mimeType The mime-type of this file (f.ex. application/pdf, text/plain) 
 * @apiPermission AdminOwnerOrJudge
 * @apiUse AuthMiddleware
 * @apiError (404) 404 Not Found, No documents could be found.
 */
router.get("/:id/view", auth, async (req, res) => {
    if(req.auth["user"]?.role !== "admin" && req.auth["user"]?.role !== "researcher" && req.auth["judge"]?.role !== "judge"){
        res.status(403).json({message: "Forbidden"})
        return;
    }
    try {
        const me_id = me(req.params.id)
        console.log("me_id:", me_id)
        SurveyItemFile.findOne({_id: me_id}).select(["-data", "-surveyId"])
        .then(file => {
            console.log("Retrieved file: ", file)
            if(file?._id == null){
                res.status(404).json({message: "Could not find file."})
                return
            }
            res.status(200).json(
                file
            )
        })
    } catch (error) {
        console.log("error getting itemfile", error)
        res.status(500).json({message: "Internal Server Error"})
    }
})

/**
 * @api {patch} /api/surveyitemfile/:id
 * @apiName PATCHSurveyItemFileById
 * @apiGroup SurveyItemFile
 * @apiVersion 0.1.0
 * @apiParam (Parameter) id The ID of the item file.
 * @apiParam (Body) fieldName The name of the db field you want to update.
 * @apiSuccess (204) {String} message A message for completion.
 * @apiPermission AdminOrOwner
 * @apiUse AuthMiddleware
 * @apiError (404) {String} message No documents could be found.
 * @apiError (500) {String} message Internal Server Error.
 */
router.patch("/:id", auth, async (req, res) => {
    const me_fieldName = req.body?.fieldName?.replace("$","")
    let me_value = me(req.body.value)
    const me_id = me(req.params.id)
    console.log("patch SurveyItemFile fn: ", me_fieldName)
    if(me_fieldName === "data"){
        console.log("me_value before buffer: ", me_value, " typeof: ", typeof(me_value))
        me_value = Buffer.from(me_value)
        console.log("me_value after buffer: ", me_value)
    }
    SurveyItemFile.updateOne({_id: me_id}, {$set: {[me_fieldName]: me_value}})
    .then(updateResult => {
        console.log("patch SurveyItemFile result: ", updateResult)
        if(updateResult?.ok == 1){
            res.status(204).json({message: "Successfully updated "+me_id+"."+me_fieldName})
            return;
        }
        else{
            res.status(404).json({message: "Couldn't find file"})
        }
    })
    .catch(error =>{
        console.log("ItemFileError",error)
        res.status(500).json({message: "Internal Server Error"})
    })
})

//post used as patch for data (terrible, but a working workaround)
//real post is "upload_file" in survey_route.js
/**
 * @api {POST} /api/surveyitemfile/:id
 * @apiName POSTSurveyItemFileById
 * @apiGroup SurveyItemFile
 * @apiVersion 0.1.0
 * @apiParam (Parameter) id The ID of the item file.
 * @apiSuccess (204) {String} message A message for completion.
 * @apiPermission AdminOrOwner
 * @apiUse AuthMiddleware
 * @apiError (404) {String} message No documents could be found.
 * @apiError (500) {String} message Internal Server Error.
 */
router.post("/:id", auth, async (req, res) => {
    const me_fieldName = "data"
    let me_value = req?.files?.value?.data
    console.log("file upload: ", me_value)
    const me_id = me(req.params.id)
    SurveyItemFile.updateOne({_id: me_id}, {$set: {[me_fieldName]: me_value}})
    .then(updateResult => {
        console.log("post SurveyItemFile result: ", updateResult)
        if(updateResult?.ok == 1){
            res.status(204).json({message: "Successfully updated "+me_id+"."+me_fieldName})
            return;
        }
        else{
            res.status(404).json({message: "Couldn't find file"})
        }
    })
    .catch(error =>{
        console.log("ItemFileError",error)
        res.status(500).json({message: "Internal Server Error"})
    })
})

/**
 * @api {DELETE} /api/surveyitemfile/:id
 * @apiName DELETESurveyItemFileById
 * @apiGroup SurveyItemFile
 * @apiVersion 0.1.0
 * @apiParam (Parameter) id The ID of the item file.
 * @apiSuccess (204) {String} message A message for completion.
 * @apiPermission AdminOrOwner
 * @apiUse AuthMiddleware
 * @apiError (500) {String} message Internal Server Error.
 */
router.delete("/:id", auth, async (req, res) => {
    /*
        This route should use transactions if available, because of calls to multiple different collections.
    */
    const me_id = me(req.params.id)
    SurveyItemFile.deleteOne({_id: me_id})
    .then(async deleteOneResponse => {
        const survey = await Survey.findOne({"items.data": me_id})
        console.log("survey: ", survey)
        const item = survey?.items?.find(e => e.data == me_id)
        if(item == undefined){
            console.log("Unable to find item with matching ItemFile ID")
        }
        else{
            const surveyAnswerDeleteResponse = await SurveyAnswer.deleteMany({$or: [ {leftOption: item._id}, {rightOption: item._id}]})
            console.log("surveyAnswerDeleteResponse: ", surveyAnswerDeleteResponse)
        }
        await Survey.updateOne({"items.data": me_id}, {$pull: {
            items: {
                data: me_id
            }
        }})

        res.status(204).json({message: "Successfully deleted item."})
    })
    .catch(error =>{
        console.log("error deleting survey item file")
        res.status(500).json({message: "Internal Server Error"})
    })
})
module.exports = router