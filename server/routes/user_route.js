const {Router} = require('express')
const {hash, compareHash} = require('../Utility/hashing')
const User = require('../models/User')
const {auth} = require("./authentication")
const nodemailer = require('nodemailer')
const sjcl = require('sjcl')
const jwt = require("jsonwebtoken")
const Survey = require('../models/Survey')

const router = Router()

/*
    Only for use with non-critical information such as email
*/
function hashNoSalt(data) {
    console.log("data", data)
    return sjcl.codec.base64.fromBits(sjcl.hash.sha256.hash(data))
}

function createUserRegisterToken(to, role){
    const now = new Date(Date.now())
    const exp = new Date(now)
    exp.setMinutes(exp.getMinutes()+1440)
    const expSeconds = exp.getTime()/1000
    const token = jwt.sign(
        {
            exp: expSeconds, 
            to: to,
            role: role
        }, 
        process.env.JWTRegisterUserSecret
    )
    return token;
}

async function verifyUserRegistration(token, email){
    return jwt.verify(token, process.env.JWTRegisterUserSecret, (err, decoded) => {
        if(err){
            console.log("Couldn't veryify UserRegistrationToken: ", err)
            return [false, null]
        }
        else{
            const newHash = hashNoSalt(email)
            console.log("New hash: ", newHash)
            console.log("to: ", decoded.to)
            if(newHash === decoded.to){
                console.log("verified correct email, with role:", decoded.role)
                const role = decoded.role
                return [true, role]
            }
            else{
                console.log("new hash did not match decoded.to")
                return [false, null]
            }
        }
    })
}

/**
 * @api {post} /user/invite_link
 * @apiName POSTUserInviteLink
 * @apiGroup User
 * @apiVersion 0.1.0
 * @apiParam {String} email The invited users email.
 * @apiParam {String} role The invited users role. 
 * @apiSuccess (204) 204 No Content, an invite link has been sent to the <code>email</code>.
 * @apiUse AuthMiddleware
 * @apiError (500) 500 Internal Server Error
 */
router.post("/invite_link", auth, async (req,res) => {
    if(req.role !== "admin"){
        res.sendStatus(403)
        return
    }
    const {email, role} = req.body
    const userDoc = User.findOne({email: email})
    if(userDoc._id != null){
        console.log("Tried inviting user that already exists")
        res.status(422).json({message: "User with that email already exists."})
        return
    }
    const link = process.env.CLIENT_BASE_URL + "/register_account/?token=" + createUserRegisterToken(hashNoSalt(email), role)
    const body_intro = "<div>You have been invited to join ACJ.<br>"
    const body_invite_link = "<Please us this link to create your account. You must enter the email address you received this mail from in order to create the account." 
        + "<a href="+ link + ">" + link + "</a>"
    const body_outro = "</div>"
    try {
        const transporter = nodemailer.createTransport(
            {
                host: "smtp.ansatt.ntnu.no",
                port: 587,
                secure: false,
                requireTLS: true,
                auth: {
                    user: process.env.MAIL_USER,
                    pass: process.env.MAIL_PW
                },
                tls: {
                    rejectUnauthorized: false
                }
            }  
        )
    
        const response = await transporter.sendMail(
            {
                from: process.env.MAIL_FROM_STRING,
                to: email,
                subject: "You have been invited to join ACJ",
                html: body_intro + body_invite_link + body_outro
            }
        )
        console.log("Mail response:",response)
        transporter.close()
        res.sendStatus(204)
    } catch (error) {
        console.log("user registration error: ", error)
        res.sendStatus(500)
    }
})

/**
 * @api {get} /user
 * @apiName GETAllUsers
 * @apiGroup User
 * @apiVersion 0.1.0
 * @apiSuccess (200) {Object[]} users An array of all user objects
 * @apiSuccess (200) {String} users.email The users registered email
 * @apiSuccess (200) {String} users.role The users role (admin/scientist)
 * @apiSuccess (200) {String} firstName The users first name (including middle names)
 * @apiSuccess (200) {String} lastName The users last name.
 * @apiError (403) {String} 403 Forbidden
 * @apiError (404) {String} message Empty collection
 * @apiUse AuthMiddleware
 */
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

/**
 * @api {get} /user/:id
 * @apiName GETUserByID
 * @apiGroup User
 * @apiVersion 0.1.0
 * @apiParam {String} id The ID of the user you want to get. (Mongoose ObjectId)
 * @apiSuccess (200) {String} email The users registered email
 * @apiSuccess (200) {String} role The users role (admin/scientist)
 * @apiSuccess (200) {String} firstName The users first name (including middle names)
 * @apiSuccess (200) {String} lastName The users last name.
 * @apiUse AuthMiddleware
 * @apiError (403) {String} 403 Forbidden
 * @apiError (404) {String} message Could not find user.
 */
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

/**
 * @api {post} /user
 * @apiName POSTUser
 * @apiGroup User
 * @apiParam {String} email    A valid email address. this must match the email that was invited to join.
 * @apiParam {String} password The users chosen password. Must fullfill TODO: password strength
 * @apiParam {String} firstName The users first name (including middle names)
 * @apiParam {String} lastName The users last name.
 * @apiParam {String} token    The token is generated when the user is invited and is part of the invite link.
 * @apiSuccess (201) {String} loc The newly created users ID
 * @apiUse AuthMiddleware
 * @apiError (403) {String} 403 Forbidden
 * @apiError (404) {String} message Could not find user.
 * @apiError (409) {String} Error This registration link has already been used.
 */
router.post("/", async (req, res) => {
    console.log("called post one for User")
    const {email, password, firstName, lastName, token} = req.body
    console.log(req.body)
    const [real, role] = await verifyUserRegistration(token, email)
    console.log("New user role:",role)
    const userDoc = await User.findOne({email: email})
    if(userDoc != null && userDoc._id != null){
        res.status(409).json({Error: "This registration link has already been used."})
        return
    }
    if(real == false){
        console.log("Requestee is not the real invited person")
        res.sendStatus(403)
        return
    }
    const result = hash(password)
    const hashed = result.hash
    const salt = result.salt

    try {
        const user = await User.create({email, firstName, lastName, hashed, salt, role })
        if(!user || !user._id){
            throw new Error('Could not create user.')
        }
        res.status(201).json({loc: user._id});
    } catch (error) {
        console.log("Eror creating user: ", error)
        res.status(500).json({message: "Internal Server Error: Could not save the object."})
    }
})

/**
 * @api {patch} /user/:id/email
 * @apiName PATCHUserEmail
 * @apiGroup User
 * @apiParam {String} id The ID of the user you want to update. (Mongoose ObjectId)
 * @apiParam {String} email The new email of the user.
 * @apiSuccess (204) {String} 204 No Content, the email was updated successfully.
 * @apiUse AuthMiddleware
 * @apiError (403) {String} 403 Forbidden
 * @apiError (404) {String} message Could not find user.
 * @apiError (422) {String} 422 Unprocessable Entity, <code>email</code> is not a valid email address.
 */
router.patch("/:id/email", auth, async (req, res) => {
    console.log("User PUT email")
    if(req.role !== "admin" && req.userid !== req.params.id){
        res.sendStatus(403)
        return
    }
    const email_regex = /[^,\/\\\s@]+\@[^,\/\\\s@]+.[^,\/\\\s@]+/
    if(!email_regex.test(req.body.email)){
        res.sendStatus(422)
        return
    }
    try {
        const doc = await User.findById(req.params.id)
        if(!doc || doc_id == null){
            throw new Error("No user with id: ", req.params.id)
        }
        doc.email = req.body.email        
        await doc.save()
        res.sendStatus(204)
    } catch (error) {
        res.sendStatus(404)
    }
})

/**
 * @api {patch} /user/:id/change_password
 * @apiName PATCHUserPassword
 * @apiGroup User
 * @apiParam {String} id The ID of the user you want to update. (Mongoose ObjectId)
 * @apiParam {String} currentPassword The users current password
 * @apiParam {String} newPassword The new password for the user.
 * @apiSuccess (204) {String} 204 No Content, the email was updated successfully.
 * @apiUse AuthMiddleware
 * @apiError (422) {String} 422 Unprocessable Entity, <code>email</code> is not a valid email address.
 * @apiError (500) {String} 500 Internal Server Error
 */
router.patch("/:id/change_password", auth, async (req, res) => {
    console.log("User PATCH password")
    if(req.userid !== req.params.id){
        res.sendStatus(403)
        console.log("ID's in patch password: ", req.userid, req.params.id)
        return
    }
    try {
        const {currentPassword, newPassword} = req.body
        if(!currentPassword || !newPassword){
            res.sendStatus(422)
            return
        }
        const userDoc = await User.findOne({_id: req.userid})
        const samePassword = compareHash(userDoc.hashed, currentPassword, userDoc.salt)
        if(!samePassword){
            res.status(403).json({message: "Password not correct."})
            return
        }
        const result = hash(newPassword)
        const hashed = result.hash
        const salt = result.salt
        userDoc.hashed = hashed
        userDoc.salt = salt
        userDoc.save()
        res.sendStatus(204)
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
})

/**
 * @api {delete} /user/:id
 * @apiName DELETEUser
 * @apiGroup User
 * @apiParam {String} id The ID of the user you want to delete. (Mongoose ObjectId)
 * @apiSuccess (204) {String} 204 No Content, the user was deleted successfully
 * @apiUse AuthMiddleware
 * @apiError (403) {String} 403 Forbidden
 * @apiError (404) {String} message Could not find user.
 */
router.delete("/:id", auth, async (req, res) => {
    console.log("Called delete user by id with id: " + req.userid);
    if(req.role !== "admin" && req.userid !== req.params.id){
        res.sendStatus(403)
        return
    }
    const result = await User.deleteOne({_id: req.params.id})
    const updateSurveysResult = await Survey.updateMany(
        {"owners.owner_id": req.params.id},
        {
            $pull: 
            {
                owners: 
                {
                    owner_id: req.params.id
                }
            }
        })
    console.log(updateSurveysResult)
    if(result.deletedCount == 1){
        res.sendStatus(204)
    }
    else{
        res.sendStatus(404)
    }
})

module.exports = router