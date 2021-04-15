const { Router } = require('express')
const Survey = require('../models/Survey')
const SurveyItemFile = require("../models/SurveyItemFile")
const { auth } = require('./authentication')

const router = Router()

router.get("/:id", auth, async (req, res) => {
    if(req.auth["user"]?.role !== "admin" && req.auth["user"]?.role !== researcher && req.auth["judge"]?.role !== "judge"){
        res.status(403).json({message: "Forbidden"})
        return;
    }
    try {
        SurveyItemFile.findOne({_id: {$eq: req.params.id}})
        .then(file => {
            console.log("Retrieved file: ", file)
            if(file?._id == null){
                res.status(404).json({message: "Could not find file."})
                return
            }
            let stringified = file.data.toString('base64')
            res.status(200).json(
                file
            )
        })
    } catch (error) {
        res.status(500).json({message: "Internal Server Error"})
    }

})

module.exports = router