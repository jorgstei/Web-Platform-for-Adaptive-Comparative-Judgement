const { Router } = require('express')
const Survey = require('../models/Survey')
const SurveyItemFile = require("../models/SurveyItemFile")
const { auth } = require('./authentication')
const me = require('mongo-escape').escape

const router = Router()

router.get("/:id", auth, async (req, res) => {
    if(req.auth["user"]?.role !== "admin" && req.auth["user"]?.role !== researcher && req.auth["judge"]?.role !== "judge"){
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

router.get("/:id/view", auth, async (req, res) => {
    if(req.auth["user"]?.role !== "admin" && req.auth["user"]?.role !== researcher && req.auth["judge"]?.role !== "judge"){
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

//Generic patch route, requires body.fieldName and body.value
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
router.post("/:id", auth, async (req, res) => {
    const me_fieldName = "data"
    let me_value = req?.files?.value?.data
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

router.delete("/:id", auth, async (req, res) => {
    const me_id = me(req.params.id)
    SurveyItemFile.deleteOne({_id: me_id})
    .then(async deleteOneResponse => {
        const surveyUpdateResponse = await Survey.updateOne({"items.data": me_id}, {$pull: {
            items: {
                data: me_id
            }
        }})
        console.log("Delete one response (file):",deleteOneResponse)
        console.log("SsurveyUpdateResponse:", surveyUpdateResponse)
        res.status(204).json({message: "Successfully deleted item."})
    })
    .catch(error =>{
        console.log(error)
        res.status(500).json({message: "Internal Server Error"})
    })
})
module.exports = router