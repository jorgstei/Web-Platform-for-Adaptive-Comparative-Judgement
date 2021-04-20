const { Router } = require('express')
const Survey = require('../models/Survey')
const SurveyAnswer = require("../models/SurveyAnswer")
const SurveyItemFile = require("../models/SurveyItemFile")
const { auth } = require("./authentication")
const me = require('mongo-escape').escape
const escapeStringRegexp = require('escape-string-regexp')
const axios = require('axios')

const mongoose = require('mongoose')

const router = Router()

//Returns -1 on error, otherwise returns the invite code as a number (must be padded with 0's from the left on client side)
async function generateUniqueHashCode(data){
    data = data.toString();
    //We use a prime number as mod m because it shares no factors
    const LARGEST_PRIME_BELOW_1M = 999983;
    const results = await Survey.countDocuments({inviteCode: {$ne: -1}})
    console.log("Total number of surveys that are active with inviteCode: ", results)
    //If our fillrate is larger than 75%, the cost to find a open key is too expensive, so we have to stop.
    if(results >= Math.floor(LARGEST_PRIME_BELOW_1M*0.75)){
        return -1;
    }
    //Calculate the key and create a large spread by using pow with a prime.
    //With a 6 digit code we have to use a power of 3.4 or greater to get a key pre-mod above LARGEST_PRIME_BELOW_1m.
    //When data is ObjectID, the largest value produced (all lower case z's) is around 1E38, well within the capabilities of JS Number.
    let key = 0;
    for(let i = 0; i < data.length; i++){
        key += data.charCodeAt(i);
    }
    key = Math.pow(key, 11)
    let result = key%LARGEST_PRIME_BELOW_1M;
    const firstResult = result;
    const haveResetOnce = false;
    let unique = false;
    //This loop should probably be made more efficient, f.ex. generating multiple keys and checking them in paralell (or just 1 call to the DB)
    while(!unique){
        const surveyDoc = await Survey.findOne({inviteCode: result})
        if(surveyDoc == undefined || surveyDoc._id == null){
            unique = true;
        }
        else{
            console.log("WARNING: Generated non-unique invite code")
            result++;
            if(result > LARGEST_PRIME_BELOW_1M){
                if(haveResetOnce && result == firstResult){
                    return -1;
                }
                key = 0;
                haveResetOnce = true;
            }
        }
    }
    return result;
}

//TODO: document api
router.post("/function/estimate", auth, async (req, res) => {
    console.log("Called survey/function/estimate")
    if(req.auth["user"].role !== "admin" && req.auth["user"].role !== "researcher"){
        res.status(401).json({message: "Forbidden"})
        return;
    }
    axios(
        {
            headers: {"Content-Type": "text/plain"},
            method: "post",
            url: process.env.estimateServicePath,
            data: req.body,
            withCredentials: false
        }
    )
    .then(response => res.status(200).json(response.data))
    .catch(response => {
        console.log(response)
        res.status(500).json({message: "Internal Server Error"})
    })
})

/**
 * @apiDefine SuccessGetFullSurveyArray
 * @apiSuccess (200) {Object[]} surveys An array of survey objects
 * @apiSuccess (200) {Object[]} surveys.owners An array of objects defining who has access to this survey
 * @apiSuccess (200) {String} surveys.owners.ownerId The ID identifying a user with rights to this survey
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
 * @apiSuccess (200) {String} surveys.dateCreated The datetime when this survey was made
 * @apiSuccess (200) {String} surveys.lastEdited The datetime when this survey was last edited
 */

/**
* @apiDefine SuccessGetFullSurvey
* @apiSuccess (200) {Object[]} owners An array of objects defining who has access to this survey
* @apiSuccess (200) {String} owners.ownerId The ID identifying a user with rights to this survey
* @apiSuccess (200) {Object} owners.rights An object with booleans showing which rights the owner has on this survey
* @apiSuccess (200) {Boolean} owners.rights.manageMembers If this user can add/remove owners of the survey, or change their access
* @apiSuccess (200) {Boolean} owners.rights.editSurvey If this user can edit the survey (Change fields, add new fields, remove fields etc.)
* @apiSuccess (200) {Boolean} owners.rights.viewResults If this user can view the judges selections, analysis and statistics.
* @apiSuccess (200) {Object[]} items An array of Item objects, these are the options judges choose between
* @apiSuccess (200) {String} items.type A string defining what type of item this item is (f.ex. text, pdf, latex)
* @apiSuccess (200) {String} items.data For raw text, this will be the text to display. For other <code>items.type</code> it will be a URL to the resource.
* @apiSuccess (200) {String} title The title of the survey
* @apiSuccess (200) {String} internalDescription The internal description of this survey
* @apiSuccess (200) {String} judgeInstructions The instructions that are shown to judges when they take the survey
* @apiSuccess (200) {String} surveyQuestion The overarching question the survey is attempting to answer
* @apiSuccess (200) {String} purpose TODO: Is this redundant?
* @apiSuccess (200) {String} mediaType The media type used for this survey (f.ex. mix, text, pdf etc.)
* @apiSuccess (200) {String} dateCreated The datetime when this survey was made
* @apiSuccess (200) {String} lastEdited The datetime when this survey was last edited
*/

/**
 * @api {get} /api/survey
 * @apiName GetAllSurveys
 * @apiGroup Survey
 * @apiVersion 0.1.0
 * @apiUse SuccessGetFullSurveyArray
 * @apiPermission AdminOrOwner
 * @apiUse AuthMiddleware
 * @apiError (404) 404 Not Found, No documents could be found.
 */
router.get("/", auth, async (req, res) => {
    console.log("Called get all surveys")
    try {
        if (req.auth["user"].role !== "admin") {
            res.status(403).json({message: "Forbidden"})
            return
        }
        const surveys = await Survey.find()
        if (!surveys) {
            throw new Error("survey_route.js get all surveys failed.")
        }
        res.json(surveys)
    } catch (error) {
        console.log("Error get all surveys: ", error)
        res.status(404).json({message: "Could not find any documents."})
    }
})

/**
 * @api {get} /api/survey/user/:id
 * @apiName GetAllSurveysForUser
 * @apiGroup Survey
 * @apiVersion 0.1.0
 * @apiUse SuccessGetFullSurveyArray
 * @apiPermission AdminOrOwner
 * @apiUse AuthMiddleware
 * @apiError (404) 404 Not found, empty collection
 */
router.get("/user/:id", auth, async (req, res) => {
    console.log("Called get all surveys for user")
    try {
        if (req.auth["user"].role !== "admin" && req.auth["user"].userid !== req.params.id) {
            res.status(403).json({message: "Forbidden"})
            return
        }
        const surveys = await Survey.find({ "owners.ownerId": req.params.id })
        if (!surveys) {
            throw new Error("survey_route.js get all surveys failed")
        }
        res.json(surveys)
    } catch (error) {
        console.log("Error get all surveys: ", error)
        res.status(404).json({message: "Could not find any documents."})
    }
})

/**
 * @api {get} /api/survey/function/count
 * @apiName GETSurveyCountForUser
 * @apiGroup Survey
 * @apiVersion 0.1.0
 * @apiSuccess (200) {Number} count Number of surveys this user has access to.
 * @apiPermission AdminOrOwner
 * @apiUse AuthMiddleware
 * @apiError (500) 500 Internal Server Error
 */
router.get("/function/count", auth, async (req, res) => {
    console.log("Get count of surveys")
    try {
        if (req.auth["user"].role !== "admin" && req.auth["user"].role !== "researcher") {
            res.status(403).json({message: "Forbidden"})
            return
        }
        const me_userid = me(req.auth["user"].userid)
        if (req.auth["user"].role === "admin") {
            Survey.countDocuments().then(count => res.json(count))
            return;
        }
        else {
            Survey.countDocuments({ "owners.ownerId": me_userid }).then(count => res.json(count))
        }
    } catch (error) {
        console.log("survey/function/count error:", error)
        res.status(500).json({message: "Internal Server Error"})
    }
})

//Get random item pair from survey by id
router.get("/items_to_compare/:id", auth, async (req, res) => {
    console.log("called get random pair from survey by id for item")
    try {
        const surveyDoc = await Survey.findOne({ _id: req.params.id })
        if (!surveyDoc || surveyDoc._id == null) {
            throw new Error("Could not find survey by id")
        }
        if (!req.auth["judge"].role === "judge" && !req.auth["user"].role === "admin" && !req.auth["user"].userid === surveyDoc.ownerId) {
            res.status(403).json({message: "Forbidden"})
        }
        const expectedComparisons = surveyDoc.expectedComparisons;
        const count = surveyDoc.items.length
        //Find amounts of comparisons
        let amountOfUniqueComparisons = 0;
        let toAdd = 1;
        while(toAdd < count){
            amountOfUniqueComparisons += toAdd;
            toAdd++;
        }
        console.log("Length of survey items is " + count + ". It has " + amountOfUniqueComparisons + " unique comparisons");
        if (count < 2) {
            res.status(500).json({message: "Survey does not have enough items to do a comparison."})
            return
        }
        else if(expectedComparisons > amountOfUniqueComparisons){
            res.status(500).json({message: 
                "Expected amount of comparisons: " + expectedComparisons + " is greater than amount of unique comparisons: " + amountOfUniqueComparisons
            })
            return
        }
        // Add all possible unique comparisons to array
        let allUniqueComparisons = [];
        for (let i = 0; i < count-1; i++) {
            for (let j = i+1; j < count; j++) {
                allUniqueComparisons.push({left: surveyDoc.items[i], right: surveyDoc.items[j]});
            }
        }
        // Random indeces to be picked out of allUniqueComparisons
        let randomComparisonIndeces = [];
        let addedIndeces = 0;
        while(addedIndeces < expectedComparisons){
            const randomIndex = Math.floor(Math.random() * allUniqueComparisons.length);
            //Check that comparison hasn't already been chosen,
            if(randomComparisonIndeces.find(e=>e===randomIndex) === undefined){
                //Add index to array
                randomComparisonIndeces.push(randomIndex);
                addedIndeces++;
            }
        }
        let comparisons = [];
        randomComparisonIndeces.forEach(index=>comparisons.push(allUniqueComparisons[index]));
        
        comparisons.map(e => {
            if(Math.random() > 0.5){
                const temp = e.left;
                e.left = e.right;
                e.right = temp;
            }
        })
        res.status(200).json({data: comparisons})
    } catch (error) {
        res.status(404).json({ message: "Unable to get random ComparisonObjects for this survey" })
    }
})

/**
 * @api {get} /api/survey/:id
 * @apiName GetSurveyById
 * @apiGroup Survey
 * @apiVersion 0.1.0
 * @apiUse SuccessGetFullSurvey
 * @apiPermission AdminOrOwner
 * @apiUse AuthMiddleware
 * @apiError (403) 403 Forbidden
 * @apiError (404) 404 Not Found
 */
router.get("/:id", auth, async (req, res) => {
    console.log("Called get survey by id")
    try {
        const survey = await Survey.findOne({ _id: {$eq: req.params.id }})
        const foundOwner = survey.owners.find(owner => owner.ownerId === req.auth["user"].userid)
        if (req.auth["user"].role !== "admin" && req.auth["user"].userid !== foundOwner.ownerId) {
            res.status(403).json({message: "Forbidden"})
            return
        }
        console.log("Survey: ", survey)
        if (!survey || survey._id === null) {
            throw new Error('survey_route.js GET by id: Could not find document')
        }
        res.status(200).json(survey)
    } catch (error) {
        console.log("Error getting 1 survey by id: ", error)
        res.status(404).json({ message: "Could not find survey." })
    }
})




//* @apiSuccess (200) {String} items.type The type of the item (text, pdf, latex)
//* @apiSuccess (200) {String} items.data The data for the item (for <code>type</code>=text this will be the actual data. For other types this will be a url to fetch the full data)

/**
 * @api {get} /api/survey/judge/:id
 * @apiName GetSurveyForJudgeById
 * @apiGroup Survey
 * @apiVersion 0.1.0
 * @apiSuccess (200) {String} judgeInstructions The instructions provided to the judge
 * @apiSuccess (200) {String} surveyQuestion The question the researchers want answers to/the judge needs to answer
 * @apiPermission AdminOrOwner
 * @apiUse AuthMiddleware
 * @apiError (403) 403 Forbidden
 * @apiError (404) 404 Not Found
 */
router.get("/judge/:id", auth, async (req, res) => {
    console.log("Called get survey by id as judge");
    try {

        console.log("In judge by id survey:", req.params.id);
        let survey = undefined;
        if(req.params.id.length === 6){
            const code = parseInt(req.params.id, 10);
            survey = await Survey.findOne({ inviteCode: {$eq: code} }).select(["-internalDescription", "-title"]);
        }
        else{
            
            survey = await Survey.findOne({ _id: {$eq: req.params.id} }).select(["-internalDescription", "-title"]);
        }
        console.log("Survey: ", survey)
        if (!survey || survey == null || survey?._id === null) {
            res.status(404).json({message: "Could not find the requested Survey"})
            return
        }
        console.log("Survey in get by id as judge: ", survey);
        const foundOwner = survey.owners.find(owner => owner.ownerId === req.auth["user"].userid)

        if (req.auth["user"].role !== "admin" && req.auth["judge"].role !== "judge" && (foundOwner == undefined || req.auth["user"].userid !== foundOwner.ownerId)) {
            res.status(403).json({message: "Forbidden"});
            return
        }

        if (!survey.active) {
            res.status(403).json({message: "Survey is not active and therefore cannot be judged."})
            return
        }

        survey.purpose = undefined;
        survey.owners = undefined;
        survey.active = undefined;
        survey.items = undefined;
        survey.lastEdited = undefined;
        survey.dateCreated = undefined;
        survey.mediaType = undefined;
        survey.__v = undefined;

        res.status(200).json(survey)
    }
    catch (error) {
        console.log("Error getting survey by id with judge authentication: ", error)
        res.status(500).json({ message: "Internal Server Error" })
    }
})


router.get("/function/checkPIN/:PIN", async (req, res) => {
    console.log("Called check if pin exists as judge");
    try{
        const surveyWithPIN = await Survey.findOne({inviteCode: {$eq: req.params.PIN}});
        if(surveyWithPIN?._id == null){
            res.status(404).json({message: "There is no survey with that PIN"});
            return
        }
        res.sendStatus(200);
    }
    catch (error) {
        console.log("Error checking whether PIN was valid");
        res.status(500).json({ message: "Internal Server Error" });
    }
})



/**
 * @api {post} /api/survey
 * @apiName POSTSurvey
 * @apiGroup Survey
 * @apiVersion 0.1.0
 * @apiParam (Body) {Object[]} owners An array of owners objects
 * @apiParam (Body) {String} owners.ownerId The database ID for this owner (user)
 * @apiParam (Body) {Object[]} owners.rights An array of rights objects
 * @apiParam (Body) {Boolean} owners.rights.manageMembers Should this owner be allowed to add new owners, and change owners rights?
 * @apiParam (Body) {Boolean} owners.rights.editSurvey Should this owner be allowed to edit the other fields in this survey?
 * @apiParam (Body) {Boolean} owners.rights.viewResults Should this owner be allowed to view the results of this survey? (judges answers, stats, analytics)
 * @apiParam (Body) {Object[]} surveys.items An array of Item objects, these are the options judges choose between
 * @apiParam (Body) {String} surveys.items.type A string defining what type of item this item is (f.ex. text, pdf, latex)
 * @apiParam (Body) {String} surveys.items.data For raw text, this will be the text to display. For other <code>items.type</code> it will be a URL to the resource.
 * @apiParam (Body) {String} surveys.title The title of the survey
 * @apiParam (Body) {String} surveys.internalDescription The internal description of this survey
 * @apiParam (Body) {String} surveys.judgeInstructions The instructions that are shown to judges when they take the survey
 * @apiParam (Body) {String} surveys.surveyQuestion The overarching question the survey is attempting to answer
 * @apiParam (Body) {String} surveys.purpose TODO: Is this redundant?
 * @apiParam (Body) {String} surveys.mediaType The media type used for this survey (f.ex. mix, text, pdf etc.)
 * @apiParam (Body) {String} surveys.dateCreated The datetime when this survey was made
 * @apiParam (Body) {String} surveys.lastEdited The datetime when this survey was last edited
 * @apiSuccess (200) {String} loc The ID of the newly created survey.
 * @apiPermission AdminOrOwner
 * @apiUse AuthMiddleware
 * @apiError (500) 500 Internal Server Error
 */
router.post("/", auth, async (req, res) => {
    console.log("called post one for survey")
    const {
        owners, expectedComparisons, items, active, title, internalDescription, judgeInstructions, surveyQuestion,
        purpose, mediaType
    } = req.body
    if (req.auth["user"].role !== "admin" && req.auth["user"].role !== "researcher") {
        res.status(403).json({message: "Forbidden"})
        return
    }
    try {
        let inviteCode = -1;
        if(active === true){
            inviteCode = await generateUniqueHashCode(new mongoose.Types.ObjectId())
            console.log("Invite code became: ", inviteCode);
        }
        const survey = await Survey.create({
            owners, inviteCode, expectedComparisons, items, active, title, internalDescription, judgeInstructions, surveyQuestion,
            purpose, mediaType
        })
        if (!survey || !survey._id) {
            throw new Error('Could not create survey.')
        }
        res.status(201).json({ loc: survey._id });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error: Could not save the object." })
    }
})

/**
 * @api {put} /api/survey/:id
 * @apiName PUTSurveyById
 * @apiGroup Survey
 * @apiVersion 0.1.0
 * @apiParam (Parameter) {String} id The ID of the survey to update
 * @apiParam (Body) {Object[]} owners An array of owners objects
 * @apiParam (Body) {String} owners.ownerId The database ID for this owner (user)
 * @apiParam (Body) {Object[]} owners.rights An array of rights objects
 * @apiParam (Body) {Boolean} owners.rights.manageMembers Should this owner be allowed to add new owners, and change owners rights?
 * @apiParam (Body) {Boolean} owners.rights.editSurvey Should this owner be allowed to edit the other fields in this survey?
 * @apiParam (Body) {Boolean} owners.rights.viewResults Should this owner be allowed to view the results of this survey? (judges answers, stats, analytics)
 * @apiParam (Body) {Object[]} surveys.items An array of Item objects, these are the options judges choose between
 * @apiParam (Body) {String} surveys.items.type A string defining what type of item this item is (f.ex. text, pdf, latex)
 * @apiParam (Body) {String} surveys.items.data For raw text, this will be the text to display. For other <code>items.type</code> it will be a URL to the resource.
 * @apiParam (Body) {String} surveys.title The title of the survey
 * @apiParam (Body) {String} surveys.internalDescription The internal description of this survey
 * @apiParam (Body) {String} surveys.judgeInstructions The instructions that are shown to judges when they take the survey
 * @apiParam (Body) {String} surveys.surveyQuestion The overarching question the survey is attempting to answer
 * @apiParam (Body) {String} surveys.purpose TODO: Is this redundant?
 * @apiParam (Body) {String} surveys.mediaType The media type used for this survey (f.ex. mix, text, pdf etc.)
 * @apiParam (Body) {String} surveys.dateCreated The datetime when this survey was made
 * @apiParam (Body) {String} surveys.lastEdited The datetime when this survey was last edited
 * @apiSuccess (200) 200 OK
 * @apiPermission AdminOrOwner
 * @apiUse AuthMiddleware
 * @apiError (500) 500 Internal Server Error
 */
router.put("/:id", auth, async (req, res) => {
    console.log("called put for survey")
    let {owners, expectedComparisons, items, active, title, internalDescription, judgeInstructions, surveyQuestion, purpose, mediaType} = me(req.body);
    const ownerId = req.auth["user"].userid
    const me_id = me(req.params.id)
    const surveyDoc = await Survey.findOne({ _id: me_id })
    if (surveyDoc._id == null) {
        res.status(404).json({message: "Could not find survey to update."})
        return
    }
    console.log("expectedComp", surveyDoc);
    let expectedComparisonsIsEqual = expectedComparisons === surveyDoc.expectedComparisons;
    //TODO: Allow modifications that do not change items and expectedComparisons
    //Issue with this is that items is empty at this point. Due to uploading pdf i think..
    /*
    //console.log("Req body", me(req.body));
    console.log("surveydoc", surveyDoc.items, "items", items);
    let everyItemIsIdentical = true;
    for (let i = 0; i < surveyDoc.items.length; i++) {
        for (const key in surveyDoc.items[i]) {
            if(surveyDoc.items[i].hasOwnProperty(key) && items[i].hasOwnProperty(key)){
                //console.log("Comparing values of key", key, "from surveyDoc:", surveyDoc.items[i][key], "from items", items[i][key], "Res was:", surveyDoc.items[i][key] === items[i][key])
                if(surveyDoc.items[i][key] !== items[i][key]){
                    everyItemIsIdentical = false;
                }
            }
            else{
                everyItemIsIdentical = false;
            }
        }
    }
    */

    if(surveyDoc.active && active && !expectedComparisonsIsEqual /*&& !everyItemIsIdentical*/){
        res.status(403).json({message: "You are not allowed to edit the items of an active survey."})
        return
    }
    const userIsOwner = await surveyDoc.owners.some(e => { (e.ownerId == ownerId) && e.rights.editSurvey == true })
    if (req.auth["user"].role !== "admin" && req.auth["user"].role !== "researcher" && !userIsOwner) {
        res.status(403).json({message: "Forbidden"})
        return
    }
    try {
        const _items = items.map(item => {
            const oldItem = surveyDoc.items.find(e => e.data == item.data)
            if (oldItem == undefined) {
                return item
            }
            else {
                return oldItem
            }
        })
        items = _items;
        let inviteCode = -1;
        if(active === true){
            inviteCode = await generateUniqueHashCode(new mongoose.Types.ObjectId())
        }
        const surveyReplaceResult = await Survey.updateOne({ _id: req.params.id },
            {
                owners, inviteCode, expectedComparisons, active, title, internalDescription, judgeInstructions, surveyQuestion,
                purpose, mediaType
            }
        )
        console.log("surveyReplaceResult:", surveyReplaceResult)
        res.sendStatus(200);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error: Could not save the object." })
    }
})

/**
 * @api {delete} /api/survey/:id
 * @apiName DeleteSurvey
 * @apiGroup Survey
 * @apiVersion 0.1.0
 * @apiParam (Parameter) {String} id The ID of the survey to update
 * @apiSuccess (200) 200 OK
 * @apiPermission AdminOrOwner
 * @apiUse AuthMiddleware
 * @apiSuccess (204) 204 No Content, The survey was deleted successfully, or the user was removed from owners successfully.
 * @apiError (404) 404 Not Found, The survey could not be found in the database.
 * @apiError (500) 500 Internal Server Error
 */
router.delete("/:id", auth, async (req, res) => {
    try {
        const surveyDoc = await Survey.findOne({ _id: req.params.id })
        console.log(surveyDoc.owners)
        const foundOwner = surveyDoc.owners.find(owner => owner.ownerId === req.auth["user"].userid)
        if (req.auth["user"].role !== "admin" && req.auth["user"].userid !== foundOwner.ownerId) {
            res.status(403).json({message: "Forbidden."})
            return
        }
        if (surveyDoc._id == null) {
            res.status(404).json({message: "Could not find survey to delete."})
            return
        }
        if (req.auth["user"].role === "admin") {
            //Remember to clean up the assosiated SurveyAnswers
            await SurveyAnswer.deleteMany({ survey_id: surveyDoc._id })
            //Finally clean up the Survey itself
            const result = await Survey.deleteOne({ _id: req.params.id })
            if (result.deletedCount == 1) {
                res.sendStatus(204)
            }
            else {
                res.status(404).json({message: "Could not find survey to delete."})
            }
        }
        else {
            const updateSurveysResult = await Survey.updateOne(
                { _id: surveyDoc._id },
                {
                    $pull:
                    {
                        owners:
                        {
                            ownerId: req.auth["user"].userid
                        }
                    }
                })
            if (updateSurveysResult.n === 1 && updateSurveysResult.nModified === 1 && updateSurveysResult.ok === 1) {
                res.sendStatus(204)
            }
            else {
                res.status(500).json({message: "Internal Server Error: Could not remove owner."})
            }
        }

    } catch (error) {
        console.log("delete survey error:", error)
        res.status(500).json({message: "Internal Server Error"})
    }

})

/**
 * @api {get} /survey/function/sort
 * @apiName GetSortedSurveys
 * @apiGroup Survey
 * @apiVersion 0.1.0
 * @apiParam (Query) {String="title","active","purpose","dateCreated","lastEdited"} field The entities field you want to sort by
 * @apiParam (Query) {Number{0-..}} skip How many documents to skip over
 * @apiParam (Query) {Number{1-..}} limit How many documents to retrieve
 * @apiParam (Query) {Number=1,-1} direction 1 For ascending, -1 for descending
 * @apiSuccess (200) {Object[]} surveys An array of survey objects
 * @apiSuccess (200) {Object[]} surveys.owners An array of objects defining who has access to this survey
 * @apiSuccess (200) {String} surveys.owners.ownerId The ID identifying a user with rights to this survey
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
 * @apiSuccess (200) {String} surveys.dateCreated The datetime when this survey was made
 * @apiSuccess (200) {String} surveys.lastEdited The datetime when this survey was last edited
 * @apiSuccess (200) {Number} surveys.itemsCount The number of items
 * @apiSuccess (200) {Object[]} surveys.users An array of stripped down user objects that correspond to surveys.owners.ownerId
 * @apiSuccess (200) {String} surveys.users.fullName Concatination of user.firstName and user.lastName
 * @apiSuccess (200) {String} surveys.users.email The users email
 * @apiSuccess (200) {String} surveys.users._id The users id
 * @apiPermission AdminOrOwner
 * @apiUse AuthMiddleware
 * @apiError (400) 400 Bad Request, Missing query parameters
 * @apiError (422) 422 Unprocessable Entity, one or more of the query parameters had invalid values
 * @apiError (500) 500 Internal Server Error
 */
router.get("/function/sort", auth, async (req, res) => {
    /*
        field: Fieldname (f.ex. dateCreated, _id)
        skip: How many documents to skip (f.ex. You have viewed documents 0-50, and you want to view 10 more, skip should be 50, limit 10)
        limit: How many documents you want to retrieve, f.ex. 10 as in the case above
        direction: 1 ascending, -1 descending
    */
   console.log("survey/function/sort called")
    const { field, skip, limit, direction } = req.query
    const me_field = field.replace("$", "")
    const me_skip = Number(me(skip))
    const me_limit = Number(me(limit))
    const me_direction = Number(me(direction))
    console.log(me_field)

    if (me_field === undefined || me_skip === undefined || me_field === "" || me_limit === undefined || me_direction === undefined) {
        res.status(400).json({message: "Missing one of the required parameters."})
        return
    }
    if (me_skip < 0 || me_limit < 1 || (me_direction != 1 && me_direction != -1)) {
        res.status(422).json({message: "One of the following parameters have an invalid value: limit, skip or direction"})
        return
    }
    try {
        const surveys = await Survey.aggregate(
            [
                req.auth["user"].role === "admin" ?
                    {
                        $match: { _id: { $exists: true } }
                    } //Admin should find all, but aggregate requires a pipeline
                    :
                    {
                        $match:
                        {
                            "owners.ownerId": req.auth["user"].userid
                        }
                    }, //Find surveys where this user has access
                {
                    $addFields: {
                        'owners': {
                            $map: {
                                'input': '$owners',
                                'in': {
                                    'ownerId': {
                                        '$toObjectId': '$$this.ownerId'
                                    },
                                    '_id': '$$this._id',
                                    'rights': '$$this.rights'
                                }
                            }
                        }
                    }
                }, {
                    $lookup: {
                        'from': 'users',
                        'localField': 'owners.ownerId',
                        'foreignField': '_id',
                        'as': 'users'
                    }
                }, {
                    $unset: [
                        'users.hashed', 'users.salt'
                    ]
                },
                {
                    $addFields: {
                        'users': {
                            $map: {
                                'input': '$users',
                                'in': {
                                    'fullName': {'$concat': ['$$this.firstName', ' ', '$$this.lastName']},
                                    '_id': '$$this._id',
                                    'email': '$$this.email'
                                }
                            }
                        }
                    },
                    $addFields: {
                        'itemsCount' : {
                            $size: "$items"
                        }
                    }
                },

                { $sort: { [me_field]: me_direction } },
                { $skip: me_skip },
                { $limit: me_limit },
            ]
        ).collation(                
            { 
                locale: "en_US",
                numericOrdering: true
            }
        )
        res.json(surveys)
    } catch (error) {
        console.log("Error sorting surveys:", error)
        res.status(500).json({message: "Internal Server Error"})
    }
})


/**
 * @api {get} /survey/function/search/:term
 * @apiName GetSortedSurveys
 * @apiGroup Survey
 * @apiVersion 0.1.0
 * @apiParam (Parameter) {String{1-64}} term The search text you want to search by.
 * @apiParam (Body) {String} [sortField="dateCreated"] Name of the field to sort the results by
 * @apiParam (Body) {Number{0-..}} skip How many documents to skip over
 * @apiParam (Body) {Number{1-..}} limit How many documents to retrieve
 * @apiParam (Body) {Number=1,-1} [direction=1] 1 For ascending, -1 for descending
 * @apiParam (Body) {String[]} fields The fields to be searched for matches against <code>term</code>
 * @apiSuccess (200) {Object[]} surveys An array of survey objects
 * @apiSuccess (200) {Object[]} surveys.owners An array of objects defining who has access to this survey
 * @apiSuccess (200) {String} surveys.owners.ownerId The ID identifying a user with rights to this survey
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
 * @apiSuccess (200) {String} surveys.dateCreated The datetime when this survey was made
 * @apiSuccess (200) {String} surveys.lastEdited The datetime when this survey was last edited
 * @apiPermission AdminOrOwner
 * @apiUse AuthMiddleware
 * @apiError (400) 400 Bad Request, Missing query parameters
 * @apiError (422) 422 Unprocessable Entity, one or more of the parameters had invalid values
 * @apiError (500) 500 Internal Server Error
 */
router.post("/function/search/:term", auth, async (req, res) => {
    const { fields, sortField, skip, limit, direction } = req.body
    console.log("req body:", req.body)
    let me_sortField = me(sortField)
    let me_fields = me(fields)
    let me_term = escapeStringRegexp(me(req.params.term))
    let me_skip = Number(me(skip))
    let me_limit = Number(me(limit))
    let me_direction = Number(me(direction))
    if (direction === undefined) me_direction = 1
    if (me_sortField === undefined) me_sortField = "dateCreated"

    if (me_fields === undefined || me_term === undefined || me_skip === undefined || me_limit === undefined) {
        console.log("fields:", fields, ", term:", me_term, ", skip:", me_skip, ", limit:", me_limit)
        res.status(400).json({message: "Missing one of the required parameters."})
        return
    }
    if (me_skip < 0 || me_limit < 1 || (me_direction != 1 && me_direction != -1)) {
        console.log("me_skip:", me_skip, ", me_limit:", me_limit, ", me_direction:", me_direction)
        res.status(422).json({message: "One of the following parameters have an invalid value: limit, skip or direction"})
        return
    }
    console.log(me_fields)
    const orFields = me_fields.map((field, i) => {
        return {
            [me_fields[i]]:
            {
                $regex: me_term, $options: 'i'
            }
        }
    })

    const matchWithRole = req.auth["user"].role === "admin" ?
        {
            $match:
            {
                _id: { $exists: true },
            },
        } //Admin should find all, but aggregate requires a pipeline
        :
        {
            $match:
            {
                "owners.ownerId": req.auth["user"].userid,
            }
        } //Find surveys where this user has access


    try {
        const surveys = await Survey.aggregate(
            [
                matchWithRole,
                {
                    $addFields: {
                        'owners': {
                            $map: {
                                'input': '$owners',
                                'in': {
                                    'ownerId': {
                                        '$toObjectId': '$$this.ownerId'
                                    },
                                    '_id': '$$this._id',
                                    'rights': '$$this.rights'
                                }
                            }
                        }
                    }
                }, {
                    $lookup: {
                        'from': 'users',
                        'localField': 'owners.ownerId',
                        'foreignField': '_id',
                        'as': 'users'
                    }
                }, {
                    $unset: [
                        'users.hashed', 'users.salt'
                    ]
                },
                {

                    $match:
                    {
                        $or:
                            [
                                ...orFields
                            ]
                    },
                },
                { $sort: { [me_sortField]: me_direction } },
                { $skip: me_skip },
                { $limit: me_limit },
            ]
        )
        console.log(surveys)
        res.json(surveys)
    } catch (error) {
        console.log("Error searching surveys:", error)
        res.status(500).json({message: "Internal Server Error"})
    }
})

router.post("/function/upload_item/:id", auth, async (req, res) => {
    if(!req.auth["user"]?.role === "admin" && !req.auth["user"]?.role === "researcher"){
        res.status(403).json({message: "Forbidden"})
        return
    }
    try {
        const tag = me(req.query.tag)
        const fileName = req.files?.file?.name?.replace("..", "")
        console.log("Find me: ", req.files)
        if(req.files?.file == undefined || req.files?.file == null || req.files?.file?.truncated == true){
            res.status(422).json({message: "Filesize too large for file: " + fileName+".\nMax supported filesize is 16MB"})
            return
        }
        SurveyItemFile.create({
            surveyId: me(req.params.id),
            data: req.files.file.data,
            tag: tag,
            fileName: fileName,
            mimeType: req.files.file.mimetype
        })
        .then((file) => {
            console.log("Successfully created file:",file)
            Survey.updateOne({_id: me(req.params.id)}, 
                {
                    $push: {
                        items: {
                            type: file.mimeType.split("/")[1],
                            data: file._id
                        }
                    }
                }
            )
            .then(updateOneResult => {
                console.log(updateOneResult)
                res.status(201).json({loc: file._id})
            })
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({message: "Internal Server Error"})
    }
})

module.exports = router