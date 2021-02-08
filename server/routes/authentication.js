const jwt = require("jsonwebtoken")
const User = require('../models/User')
const {compareHash} = require("../Utility/hashing")
const {Router} = require('express')
const router = Router()
/*
    Expected fields in token:
    exp - expire time
    userid - to lookup userinfo and rights (or none if judge)
    role - f.ex. admin, scientist, judge
*/
const auth = (req, res, next) => {
    const token = req.headers.cookie.split("access-token=")[1]
    if(!token){
        res.sendStatus(401)
        return
    }
    console.log("Auth, token: ", token)
    jwt.verify(token, process.env.JWTSecret, (err, decoded) => {
        if(err){
            console.log(err)
            res.status(401).json({error: "Not authorized."})
        }
        else{
            //Set the potentially required feilds contained in the token to the request
            req.userid = decoded.userid
            req.role = decoded.role
            next()
        }
    })
}

router.post("/login", async (req, res) => {
    console.log("Called get /login")
    console.log("login body: ", req.body)
    const {email, password} = req.body
    try {
        if(email && password){
            const userDoc = await User.findOne({email: email})
            if(userDoc){
                if(compareHash(userDoc.hashed, password, userDoc.salt)){
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
                    res.sendStatus(200)
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
module.exports = {router, auth}