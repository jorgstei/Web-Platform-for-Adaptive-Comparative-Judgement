const {Router} = require('express')
const ComparisonObject = require('../models/ComparisonObject')

const router = Router()
//Get all
router.get("/", async (req, res) => {
    console.log("Called get for comparisonobject")
    try {
        const comparisonObjects = await ComparisonObject.find()
        if(!comparisonObjects){
            throw new Error('comparison_object_route.js GET: Could not find any transactions')
        }
        res.status(200).json(comparisonObjects)
    } catch (error) {
        res.status(404).json({message: "Empty collection"})
    }
})

//Get by ID
router.get("/:id", async (req, res) => {
    console.log("called get 1 by id for comparionobject")
    try {
        const comparionObject = await ComparisonObject.findById(req.params.id)
        if(!comparionObject || comparionObject._id == null){
            throw new Error('GET 1 by id, id ' + req.params.id + ' does not exist.')
        }
        res.status(200).json(comparionObject)
    } catch (error) {
        res.status(404).json({message: "Object with this ID doesn't exist."})
    }
})

//Get a random pair
router.get("/random/pair", async (req, res) => {
    console.log("called get random pair for comparisonobject")
    try { 
        const count = await ComparisonObject.countDocuments()
        if(count < 2){
            throw new Error("Too few elements in collection.")
        }
        const random_skip = Math.floor(Math.random() * count)
        const comparisonObject1 = await ComparisonObject.findOne().skip(random_skip)
        let comparisonObject2 = null
        while(true){
            const random_skip2 = Math.floor(Math.random() * count);
            comparisonObject2 = await ComparisonObject.findOne({_id: {$ne: comparisonObject1._id}}).skip(random_skip2)
            if(comparisonObject2 != null){
                if(comparisonObject1._id != comparisonObject2._id){
                    break
                }
            }
        } 
        if(!comparisonObject1 || !comparisonObject2 || comparisonObject1._id == null || comparisonObject2._id == null){
            throw new Error("Get 2 random failed.")
        }
        res.status(200).json({data: [comparisonObject1, comparisonObject2]})
    } catch (error) {
        res.status(404).json({message: "Unable to get two random ComparisonObjects"})
    }
})

//Update one
router.put("/:id", async (req, res) => {
    console.log("called put/update one by id for comparisonobject with id: ", req.params.id)
    try {
        let doc = await ComparisonObject.findById(req.params.id)
        if(!doc || doc._id == null){
            console.log("doc: ", doc)
            throw new Error("No document with id: ", req.params.id)
        }
        const data = req.body.data
        if(data["type"]){
            doc.type = data["type"]
        }
        if(data["data"]){
            doc.data = data["data"]
        }
        console.log("Input data update one: ", data)
        await doc.save()
        res.sendStatus(200)
    } catch (error) {
        console.log("Error: ", error)
        res.status(404).json({message: "Unable to update document"})
    }
})

//Insert one
router.post("/", async (req, res) => {
    const {type, data} = req.body
    const comparionElement = new ComparisonObject({type, data})

    try {
        const transaction = await comparionElement.save();
        if(!transaction){
            throw new Error('comparison_object_route.js POST: Failed to save object')
        }
        res.status(201).json(transaction)
    } catch (error) {
        res.status(500).json({message: "Internal Server Error: Could not save the object."})
    }
})

//Delete one
router.delete("/:id", async (req, res) => {
    console.log("called delete by id for comparisonobject")
    const result = await ComparisonObject.deleteOne({_id: req.params.id})
    if(result.deletedCount == 1){
        res.sendStatus(204)
    }
    else{
        res.sendStatus(404)
    }
})

module.exports = router;