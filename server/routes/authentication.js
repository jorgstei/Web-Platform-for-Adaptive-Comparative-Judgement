const jwt = require("jsonwebtoken")
const User = require('../models/User')
const { compareHash } = require("../Utility/hashing")
const mongoose = require('mongoose')
const { Router } = require('express')
const me = require('mongo-escape').escape
const escapeStringRegexp = require('escape-string-regexp')


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
    if (!req.headers.cookie) {
        res.sendStatus(401)
        return
    }
    const cookies = req.cookies

    if (!cookies["access-token"] && !cookies["judge-token"]) {
        res.sendStatus(401)
        return
    }
    else{
        req.auth = []
        if (cookies["judge-token"]) {
            jwt.verify(cookies["judge-token"], process.env.JWTJudgeSecret, (err, decoded) => {
                if (err) {
                    console.log("Judge verify error in auth:",err)
                    res.sendStatus(401)
                }
                else {
                    //Set the potentially required feilds contained in the token to the request
                    req.auth["judge"] = {userid: decoded.userid, role: decoded.role}
                    //req.userid = decoded.userid
                    //req.role = decoded.role
                }
            })
        }
        if (cookies["access-token"]) {
            jwt.verify(cookies["access-token"], process.env.JWTSecret, (err, decoded) => {
                if (err) {
                    res.sendStatus(401)
                }
                else {
                    //Set the potentially required feilds contained in the token to the request
                    req.auth["user"] = {userid: decoded.userid, role: decoded.role}
                    //req.userid = decoded.userid
                    //req.role = decoded.role
                }
            })
        }
        if(req.auth === []){
            res.sendStatus(401)
        }
        else{
            next()
        }
    }
}

/**
 * @api {get} /logout
 * @apiName GETLogout
 * @apiGroup Auth
 * @apiVersion 0.1.0
 * @apiSuccess (200) 200 ok.
 */
router.get("/logout", async (req, res) => {
    res.set({
        "Cache-Control": "no-cache",
        "Pragma": "no-cache"
    })
    res.cookie("access-token", {}, { httpOnly: true, maxAge: 0, sameSite: "lax" })
    res.sendStatus(200)
    return;
})

/**
 * @api {get} /logout/judge
 * @apiName GETLogoutJudge
 * @apiGroup Auth
 * @apiVersion 0.1.0
 * @apiSuccess (200) 200 ok.
 */
router.get("/logout/judge", async (req, res) => {
    res.set({
        "Cache-Control": "no-cache",
        "Pragma": "no-cache"
    })
    res.cookie("judge-token", {}, { httpOnly: true, maxAge: 0, sameSite: "lax" })
    res.sendStatus(200)
    return;
})

/**
 * @api {post} /login
 * @apiName POSTLogin
 * @apiGroup Auth
 * @apiVersion 0.1.0
 * @apiSuccess (200) {String} email The authorized users email
 * @apiSuccess (200) {String} userid The authorized users id
 * @apiSuccess (200) {String} role The authorized users role
 * @apiError (401) {String} message Occurs when username or password is wrong.
 * @apiError (500) {String} message Internal Server Error.
 */
router.post("/login", async (req, res) => {
    const { email, password } = req.body
    try {
        if (email && password) {
            const userDoc = await User.findOne({ email: {$eq: email} })
            if (userDoc) {
                if (compareHash(userDoc.hashed, password, userDoc.salt)) {
                    const now = new Date(Date.now())
                    const exp = new Date(now)
                    exp.setMinutes(exp.getMinutes() + 30)
                    const expSeconds = Math.floor(exp.getTime() / 1000)
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
                    let expMillis = exp.getTime() - now.getTime(); //Cookie max age converts milliseconds from creation into expires at DateTime
                    res.cookie("access-token", token, { httpOnly: true, maxAge: expMillis, sameSite: "lax" })
                    res.status(200).json({ email: email, userid: userDoc._id, role: userDoc.role })
                    return;
                }
            }
        }
        res.status(401).json({message: "Incorrect username or password"})
    } catch (error) {
        console.log("Error occured in POSTLogin")
        res.status(500).json({message: "Internal Server Error"})
    }
})

/**
 * @api {post} /refresh-token
 * @apiName POSTRefreshToken
 * @apiGroup Auth
 * @apiVersion 0.1.0
 * @apiSuccess (200) {String} email The authorized users email
 * @apiSuccess (200) {String} userid The authorized users id
 * @apiSuccess (200) {String} role The authorized users role
 * @apiError (401) User is not logged in, no cookies received, or token has expired.
 */
router.post("/refresh-token", async (req, res) => {
    if (!req.headers.cookie) {
        res.sendStatus(401)
        return
    }
    const cookies = req.cookies
    if (!cookies["access-token"]) {
        res.sendStatus(401)
        return
    }
    if(cookies["access-token"]) {
        jwt.verify(cookies["access-token"], process.env.JWTSecret, async (err, decoded) => {
            if (err) {
                res.sendStatus(401);
                return
            }
            else {
                const userDoc = await User.findOne({ _id: decoded.userid })
                if (!userDoc) {
                    res.sendStatus(401)
                    return
                }
                const now = new Date(Date.now())
                const exp = new Date(now)
                exp.setMinutes(exp.getMinutes() + 30)
                const expSeconds = Math.floor(exp.getTime() / 1000)
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
                let expMillis = exp.getTime() - now.getTime(); //Cookie max age converts milliseconds from creation into expires at DateTime
                res.cookie("access-token", newToken, { httpOnly: true, maxAge: expMillis, sameSite: "lax" })
                res.status(200).json({ email: userDoc.email, userid: decoded.userid, role: decoded.role })
                return
            }
        })
    }
    else{
        res.status(401).json({message: "Unauthorized"});
        return
    }   
})

/**
 * @api {post} /refresh-judge-token
 * @apiName POSTRefreshJudgeToken
 * @apiGroup Auth
 * @apiVersion 0.1.0
 * @apiSuccess (200) {String} email The authorized users email
 * @apiSuccess (200) {String} userid The authorized users id
 * @apiSuccess (200) {String} role The authorized users role
 * @apiError (401) User is not logged in, no cookies received, or token has expired.
 */
router.post("/refresh-judge-token", async (req, res) => {
    const cookies = req.cookies
    if (cookies["judge-token"]) {
        jwt.verify(cookies["judge-token"], process.env.JWTJudgeSecret, async (err, decoded) => {
            if (err) {
                res.status(401).json({ error: "Not authorized." })
                return
            }
            else {
                const now = new Date(Date.now())
                const exp = new Date(now)
                exp.setMinutes(exp.getMinutes() + 30)
                const expSeconds = Math.floor(exp.getTime() / 1000)
                const newToken = jwt.sign(
                    {
                        exp: expSeconds,
                        userid: decoded.userid,
                        role: decoded.role
                    },
                    process.env.JWTJudgeSecret
                )
                res.set({
                    "Cache-Control": "no-cache",
                    "Pragma": "no-cache"
                })
                let expMillis = exp.getTime() - now.getTime(); //Cookie max age converts milliseconds from creation into expires at DateTime
                res.cookie("judge-token", newToken, { httpOnly: true, maxAge: expMillis, sameSite: "lax" })
                res.status(200).json({ email: decoded.email, userid: decoded.userid, role: decoded.role })
                return;
            }
        })
    }
    else{
        res.status(401).json({message: "Missing token, unauthorized"});
        return
    }
})

/**
 * @api {post} /login/judge
 * @apiName POSTLoginJudge
 * @apiGroup Auth
 * @apiVersion 0.1.0
 * @apiParam (Body) requestedSurveyID The ID or assosiated PIN for the survey
 * @apiSuccess (200) {String} email Always null for judges
 * @apiSuccess (200) {String} userid Randomly generated ObjectId for anonymous judges
 * @apiSuccess (200) {String} role Always "judge" for judges
 * @apiError (401) {String} message Occurs when username or password is wrong.
 */
router.post("/login/judge", async (req, res) => {
    const { requestedSurveyID } = req.body
    try {
        if (requestedSurveyID) {
            const now = new Date(Date.now())
            const exp = new Date(now)
            exp.setMinutes(exp.getMinutes() + 30)
            const expSeconds = Math.floor(exp.getTime() / 1000)
            const userId = new mongoose.mongo.ObjectId()
            const token = jwt.sign(
                {
                    exp: expSeconds,
                    userid: userId, //judge ID, used for SurveyAnswer
                    role: "judge"
                },
                process.env.JWTJudgeSecret
            )
            res.set({
                "Cache-Control": "no-cache",
                "Pragma": "no-cache"
            })
            let expMillis = exp.getTime() - now.getTime(); //Cookie max age converts milliseconds from creation into expires at DateTime
            res.cookie("judge-token", token, { httpOnly: true, maxAge: expMillis, sameSite: "lax" })
            res.json({ email: null, userid: userId, role: "judge" })
            return;
        }
        throw new Error("Email or password not provided.")
    } catch (error) {
        console.log("Error occured in POSTLoginJudge.")
        res.status(401).json({message: "Unathorized"})
    }
})
module.exports = { router, auth }