const { Router } = require('express')
const Survey = require('../models/Survey')
const SurveyAnswer = require("../models/SurveyAnswer")
const { auth } = require("./authentication")
const me = require('mongo-escape').escape
const escapeStringRegexp = require('escape-string-regexp')

const mongoose = require('mongoose')

const router = Router()

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
 * @apiSuccess (200) {String} surveys.accessibility How the survey can be accessed by judges. (code, or link)
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
* @apiSuccess (200) {String} accessibility How the survey can be accessed by judges. (code, or link)
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
        if (req.role !== "admin") {
            res.sendStatus(403)
            return
        }
        const surveys = await Survey.find()
        if (!surveys) {
            throw new Error("survey_route.js get all surveys failed")
        }
        res.json(surveys)
    } catch (error) {
        console.log("Error get all surveys: ", error)
        res.sendStatus(404)
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
        if (req.role !== "admin" && req.userid !== req.params.id) {
            console.log("req.role: ", req.role, "req.params.id: ", req.params.id, "req.userid: ", req.userid)
            res.sendStatus(403)
            return
        }
        const surveys = await Survey.find({ "owners.ownerId": req.params.id })
        if (!surveys) {
            throw new Error("survey_route.js get all surveys failed")
        }
        res.json(surveys)
    } catch (error) {
        console.log("Error get all surveys: ", error)
        res.sendStatus(404)
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
        if (req.role !== "admin" && req.role !== "researcher") {
            res.sendStatus(403)
            return
        }
        const me_userid = me(req.userid)
        if (req.role === "admin") {
            Survey.countDocuments().then(count => res.json(count))
            return;
        }
        else {
            Survey.countDocuments({ "owners.ownerId": me_userid }).then(count => res.json(count))
        }
    } catch (error) {
        console.log("survey/function/count error:", error)
        res.sendStatus(500)
    }
})

//Get random item pair from survey by id
router.get("/item/:id", auth, async (req, res) => {
    console.log("called get random pair from survey by id for item")
    try {
        const surveyDoc = await Survey.findOne({ _id: req.params.id })
        if (!surveyDoc || surveyDoc._id == null) {
            throw new Error("Could not find survey by id")
        }
        if (!surveyDoc.accessibility === "linkonly") {
            if (!req.role === "judge" && !req.userid === surveyDoc.ownerId) {
                //TODO: Check that the passphrase from cookie is valid for this survey
            }
        }
        const count = surveyDoc.items.length
        if (count < 2) {
            throw new Error("Too few elements in collection.")
        }
        const random_skip = Math.floor(Math.random() * count)
        const comparisonObject1 = surveyDoc.items[random_skip]
        let comparisonObject2 = null
        while (true) {
            const random_skip2 = Math.floor(Math.random() * count);
            comparisonObject2 = surveyDoc.items[random_skip2]
            if (comparisonObject2 != null) {
                if (comparisonObject1._id != comparisonObject2._id) {
                    break
                }
            }
        }
        res.status(200).json({ data: [comparisonObject1, comparisonObject2] })
    } catch (error) {
        res.status(404).json({ message: "Unable to get two random ComparisonObjects for this survey" })
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
        const survey = await Survey.findOne({ _id: req.params.id })
        const foundOwner = survey.owners.find(owner => owner.ownerId === req.userid)
        if (req.role !== "admin" && req.userid !== foundOwner.ownerId) {
            res.sendStatus(403)
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
router.get("/judge/:id", async (req, res) => {
    console.log("Called get survey by id as judge");
    try {
        let survey = await Survey.findOne({ _id: req.params.id }).select(["-internalDescription", "-title"]);
        const foundOwner = survey.owners.find(owner => owner.ownerId === req.userid)
        // DELETE THIS, JUST TEST
        req.role = "judge";

        if (req.role !== "admin" && req.role !== "judge" && req.userid !== foundOwner.ownerId) {
            res.sendStatus(403)
            return
        }
        console.log("Survey: ", survey)
        if (!survey || survey._id === null) {
            throw new Error('survey_route.js GET by id as judge: Could not find document')
        }
        if (!survey.active) {
            throw new Error('survey_route.js GET by id as judge: Survey is not active')
        }
        if (survey.accessibility == "code") {
            if (!(req.body.code === survey.code)) {
                res.sendStatus(403).json("survey_route.js GET by id as judge: Code does not match")
                return
            }
        }
        survey.accessibility = undefined;
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
        res.status(404).json({ message: "Could not find survey." })
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
 * @apiParam (Body) {String} surveys.accessibility How the survey can be accessed by judges. (code, or link)
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
        owners, items, active, title, internalDescription, judgeInstructions, surveyQuestion,
        purpose, mediaType, accessibility
    } = req.body
    console.log("req.role: ", req.role)
    if (req.role !== "admin" && req.role !== "researcher") {
        res.sendStatus(403)
        return
    }
    try {
        const survey = await Survey.create({
            owners, items, active, title, internalDescription, judgeInstructions, surveyQuestion,
            purpose, mediaType, accessibility
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
 * @apiParam (Body) {String} surveys.accessibility How the survey can be accessed by judges. (code, or link)
 * @apiParam (Body) {String} surveys.dateCreated The datetime when this survey was made
 * @apiParam (Body) {String} surveys.lastEdited The datetime when this survey was last edited
 * @apiSuccess (200) 200 OK
 * @apiPermission AdminOrOwner
 * @apiUse AuthMiddleware
 * @apiError (500) 500 Internal Server Error
 */
router.put("/:id", auth, async (req, res) => {
    console.log("called put for survey")
    let {
        owners, items, active, title, internalDescription, judgeInstructions, surveyQuestion,
        purpose, mediaType, accessibility
    } = req.body
    const ownerId = req.userid
    const surveyDoc = await Survey.findOne({ _id: req.params.id })
    if (surveyDoc._id == null) {
        res.sendStatus(404)
        return
    }
    const userIsOwner = await surveyDoc.owners.some(e => { (e.ownerId == ownerId) && e.rights.editSurvey == true })
    if (req.role !== "admin" && req.role !== "researcher" && !userIsOwner) {
        res.sendStatus(403)
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
        const surveyReplaceResult = await Survey.updateOne({ _id: req.params.id },
            {
                owners, items, active, title, internalDescription, judgeInstructions, surveyQuestion,
                purpose, mediaType, accessibility
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
        const foundOwner = surveyDoc.owners.find(owner => owner.ownerId === req.userid)
        if (req.role !== "admin" && req.userid !== foundOwner.ownerId) {
            res.sendStatus(403)
            return
        }
        if (surveyDoc._id == null) {
            res.sendStatus(404)
            return
        }
        if (req.role === "admin") {
            //Remember to clean up the assosiated SurveyAnswers
            await SurveyAnswer.deleteMany({ survey_id: surveyDoc._id })
            //Finally clean up the Survey itself
            const result = await Survey.deleteOne({ _id: req.params.id })
            if (result.deletedCount == 1) {
                res.sendStatus(204)
            }
            else {
                res.sendStatus(404)
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
                            ownerId: req.userid
                        }
                    }
                })
            if (updateSurveysResult.n === 1 && updateSurveysResult.nModified === 1 && updateSurveysResult.ok === 1) {
                res.sendStatus(204)
            }
            else {
                res.sendStatus(500)
            }
        }

    } catch (error) {
        console.log("delete survey error:", error)
        res.sendStatus(500)
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
 * @apiSuccess (200) {String} surveys.accessibility How the survey can be accessed by judges. (code, or link)
 * @apiSuccess (200) {String} surveys.dateCreated The datetime when this survey was made
 * @apiSuccess (200) {String} surveys.lastEdited The datetime when this survey was last edited
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
    const { field, skip, limit, direction } = req.query
    console.log(req.query)
    const me_field = me(field)
    const me_skip = Number(me(skip))
    const me_limit = Number(me(limit))
    const me_direction = Number(me(direction))

    if (me_field === undefined || me_skip === undefined || me_field === "" || me_limit === undefined || me_direction === undefined) {
        res.sendStatus(400)
        return
    }
    if (me_skip < 0 || me_limit < 1 || (me_direction != 1 && me_direction != -1)) {
        res.sendStatus(422)
        return
    }
    try {
        const surveys = await Survey.aggregate(
            [
                req.role === "admin" ?
                    {
                        $match: { _id: { $exists: true } }
                    } //Admin should find all, but aggregate requires a pipeline
                    :
                    {
                        $match:
                        {
                            "owners.ownerId": req.userid
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
                                }
                            }
                        }
                    }
                },

                { $sort: { [me_field]: me_direction } },
                { $skip: me_skip },
                { $limit: me_limit },
            ]
        )
        res.json(surveys)
    } catch (error) {
        console.log("Error sorting surveys:", error)
        res.sendStatus(500)
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
 * @apiSuccess (200) {String} surveys.accessibility How the survey can be accessed by judges. (code, or link)
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
        res.sendStatus(400)
        return
    }
    if (me_skip < 0 || me_limit < 1 || (me_direction != 1 && me_direction != -1)) {
        console.log("me_skip:", me_skip, ", me_limit:", me_limit, ", me_direction:", me_direction)
        res.sendStatus(422)
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

    const matchWithRole = req.role === "admin" ?
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
                "owners.ownerId": req.userid,
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
        res.sendStatus(500)
    }
})

module.exports = router