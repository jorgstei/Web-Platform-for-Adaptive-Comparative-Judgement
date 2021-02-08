const {Router} = require('express')
const {hash} = require('../Utility/hashing')
const User = require('../models/User')
const {auth} = require("./authentication")

const router = Router()

//Get all users (removes password and salt field)
router.get("/", auth, async (req, res) => {
    console.log("Called get all for User")
    try {
        if(req.role !== "admin"){
            res.sendStatus(403)
            return
        }
        const users = await User.find().select(["-hashed", "-salt"])
        if(!users){
            throw new Error('user_route.js GET: Could not find any docuemnts')
        }
        res.json(users)
    } catch (error) {
        res.status(404).json({message: "Empty collection"})
    }
})

//Get user by id (removes password and salt field)
router.get("/:id", auth, async (req, res) => {
    console.log("Called get user by id")
    try {
        if(req.role !== "admin" && req.userid !== req.params.id){
            res.sendStatus(403)
            return
        }
        const user = await User.findOne({_id: req.params.id}).select(["-hashed", "-salt"])
        if(!user || user._id == null){
            throw new Error('user_route.js GET by id: Could not find document')
        }
        res.status(200).json(user)
    } catch (error) {
        res.status(404).json({message: "Could not find user."})
    }
})

//Insert one
router.post("/", auth, async (req, res) => {
    console.log("called post one for User")
    const {email, password, role} = req.body
    const result = hash(password)
    const hashed = result.hash
    const salt = result.salt
    if(req.role !== "admin"){
        res.sendStatus(403)
        return
    }
    try {
        const user = await User.create({email, hashed, salt, role })
        if(!user || !user._id){
            throw new Error('Could not create user.')
        }
        res.status(201).json({loc: user._id});
    } catch (error) {
        res.status(500).json({message: "Internal Server Error: Could not save the object."})
    }
})

//Update email by id
router.patch("/update/email/:id", auth, async (req, res) => {
    console.log("User PUT")
    if(req.userid !== req.params.id){
        res.sendStatus(403)
        return
    }
    try {
        const doc = await User.findById(req.params.id)
        if(!doc || doc_id == null){
            throw new Error("No user with id: ", req.params.id)
        }
        const data = req.body.data
        if(data["email"]){
            doc.email = data["email"]
        }
        await doc.save()
    } catch (error) {
        res.sendStatus(404)
    }
})

//Delete one by ID
router.delete("/:id", auth, async (req, res) => {
    if(req.role !== "admin" && req.userid !== req.params.id){
        res.sendStatus(401)
        return
    }
    const result = await User.deleteOne({_id: req.params.id})
    if(result.deletedCount == 1){
        res.sendStatus(204)
    }
    else{
        res.sendStatus(404)
    }
})

module.exports = router