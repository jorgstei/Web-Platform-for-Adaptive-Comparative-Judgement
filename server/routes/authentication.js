const jwt = require("jsonwebtoken")
const User = require('../models/User')
const {compareHash} = require("../Utility/hashing")
const mongoose = require('mongoose')
const {Router} = require('express')
const router = Router()
/*
    Expected fields in token:
    exp - expire time
    userid - to lookup userinfo and rights (or none if judge)
    role - f.ex. admin, researcher, judge
*/
/**
 * @apiDefine AuthMiddleware
 * @apiError (401) 401 Unauthorized, You do not have the access-token required to access this resource
 * @apiError (403) 403 Forbidden, you are authenticated but lack authorization to access this resource
 */
const auth = (req, res, next) => {
    if(!req.headers.cookie){
        res.sendStatus(401)
        return
    }
    const token = req.headers.cookie.split("access-token=")[1].replace(";", "").trim()
    if(!token){
        res.sendStatus(401)
        return
    }
    console.log("Auth, token: ", token)
    jwt.verify(token, process.env.JWTSecret, (err, decoded) => {
        if(err){
            console.log(err)
            res.sendStatus(401)
        }
        else{
            //Set the potentially required feilds contained in the token to the request
            req.userid = decoded.userid
            req.role = decoded.role
            next()
        }
    })
}

router.get("/logout", async (req, res) => {
    res.set({
        "Cache-Control": "no-cache",
        "Pragma": "no-cache"
    })
    res.cookie("access-token", {}, {httpOnly: true, maxAge: 0, sameSite: "lax"})
    res.sendStatus(200)
    return;
})

router.post("/login", async (req, res) => {
    console.log("Called get /login")
    console.log("login body: ", req.body)
    const {email, password} = req.body
    try {
        if(email && password){
            const userDoc = await User.findOne({email: email})
            if(userDoc){
                console.log("Found user with email: ", email)
                if(compareHash(userDoc.hashed, password, userDoc.salt)){
                    console.log("authenticated successfully")
                    const now = new Date(Date.now())
                    const exp = new Date(now)
                    exp.setMinutes(exp.getMinutes()+30)
                    const expSeconds = exp.getTime()/1000
                    console.log("JWT Expires in seconds: ", expSeconds)
                    const token = jwt.sign(
                        {
                            exp: expSeconds, 
                            userid: userDoc._id, 
                            role: userDoc.role
                        }, 
                        process.env.JWTSecret
                    )
                    res.set({
                        "Cache-Control": "no-cache",
                        "Pragma": "no-cache"
                    })
                    let expMillis = exp.getTime()-now.getTime(); //Cookie max age converts milliseconds from creation into expires at DateTime
                    res.cookie("access-token", token, {httpOnly: true, maxAge: expMillis, sameSite: "lax"})
                    res.status(200).json({email: email, userid: userDoc._id, role: userDoc.role})
                    return;
                }
            }
        }
        throw new Error("Email or password not provided.")
    } catch (error) {
        console.log("Error: ", error)
        res.sendStatus(401)
    }
})

router.post("/refresh-token", async (req, res) => {
    console.log("Called post /refresh-token")
    if(!req.headers.cookie){
        res.sendStatus(401)
        return
    }
    const token = req.headers.cookie.split("access-token=")[1].replace(";", "").trim()
    if(!token){
        res.sendStatus(401)
        return
    }
    jwt.verify(token, process.env.JWTSecret, async (err, decoded) => {
        if(err){
            console.log(err)
            res.status(401).json({error: "Not authorized."})
            return
        }
        else{
            const userDoc = await User.findOne({_id: decoded.userid})
            if(!userDoc){
                res.sendStatus(401)
                return
            }
            const now = new Date(Date.now())
            const exp = new Date(now)
            exp.setMinutes(exp.getMinutes()+30)
            const expSeconds = exp.getTime()/1000
            const newToken = jwt.sign(
                {
                    exp: expSeconds,
                    userid: decoded.userid,
                    role: decoded.role
                },
                process.env.JWTSecret
            )
            res.set({
                "Cache-Control": "no-cache",
                "Pragma": "no-cache"
            })
            let expMillis = exp.getTime()-now.getTime(); //Cookie max age converts milliseconds from creation into expires at DateTime
            res.cookie("access-token", newToken, {httpOnly: true, maxAge: expMillis, sameSite: "lax"})
            res.status(200).json({email: userDoc.email, userid: decoded.userid, role: decoded.role})
        }
    })
})

router.post("/login/judge", async (req, res) => {
    console.log("Called get /login/judge")
    const {requestedSurveyID, passphrase} = req.body
    try {
        if(requestedSurveyID){
                const now = new Date(Date.now())
                const exp = new Date(now)
                exp.setMinutes(exp.getMinutes()+30)
                const expSeconds = exp.getTime()/1000
                console.log("JWT Expires in seconds: ", expSeconds)
                const userId = new mongoose.mongo.ObjectId()
                const token = jwt.sign(
                    {
                        exp: expSeconds, 
                        userid: userId, //judge ID, used for SurveyAnswer
                        role: "judge"
                    }, 
                    process.env.JWTSecret
                )
                res.set({
                    "Cache-Control": "no-cache",
                    "Pragma": "no-cache"
                })
                let expMillis = exp.getTime()-now.getTime(); //Cookie max age converts milliseconds from creation into expires at DateTime
                res.cookie("access-token", token, {httpOnly: true, maxAge: expMillis, sameSite: "lax"})
                res.json({email: null, userid: userId, role: "judge"})
                return;       
        }
        throw new Error("Email or password not provided.")
    } catch (error) {
        console.log("Error: ", error)
        res.sendStatus(401)
    }
})
module.exports = {router, auth}