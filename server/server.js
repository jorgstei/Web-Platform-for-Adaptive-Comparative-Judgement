if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}
else{
    console.log("NO ENV PROVIDED")
}
const express = require('express')
let fs = require('fs')
const https = require('https')
const server = express()
const cors = require('cors')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
var cookieParser = require('cookie-parser')
const { hash } = require('./Utility/hashing')
const User = require('./models/User')
const fileUpload = require('express-fileupload')
 
const mongoConnectionString = process.env.MongoDBConnectionString;
mongoose.connect(mongoConnectionString,
    {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        sslValidate: false,
        checkServerIdentity: false
    }).then(async  () => {
        console.log("Sucessfully connected to MongoDB!")
        //If this is a fresh instance of mongodb, we'll have to create a service admin
        const anyAdminUser = await User.findOne({email: process.env.AdminUsername})
        if(anyAdminUser == null || anyAdminUser._id == null){
            const hashNSalt = hash(process.env.AdminPassword)
            const email = process.env.AdminUsername
            const hashed = hashNSalt.hash
            const salt = hashNSalt.salt
            const firstName = "Admin"
            const lastName = firstName
            const role = "admin"
            const adminObj = {email, firstName, lastName, hashed, salt, role}
            await User.create(adminObj)
        }
        else{
            console.log("Found existing admin user.")
        }
        
    })
    .catch((err) => {
        console.log("Error occured while connecting to MongoDB: ")
        exit(0)
    })

server.use(cors({
    origin: ["http://localhost:5000", "http://127.0.0.1:5000", "http://acj.heroesunknown.net:5000", "http://compair.it.ntnu.no"
    , "https://compair.it.ntnu.no", "https://compair.it.ntnu.no:5000", "http://compair.it.ntnu.no:5000", "http://compair.it.ntnu.no:1030"
    , "http://10.0.0.41", "http://10.0.0.41:5000"
    ],
    credentials: true
}))
server.use(bodyParser.json({limit: "16mb"}))

server.use(cookieParser())

server.use(fileUpload({
    debug: true,
    createParentPath: true,
    limits:{
        fileSize: 16 * 1024 * 1024, //16 MB file size limit TODO: Should this be part of server .env?
    }
}))

const auth = require("./routes/authentication")
server.use("/auth", auth.router)

const surveyRoute = require('./routes/survey_route')
server.use("/api/survey", surveyRoute)

const surveyAnswerRoute = require('./routes/survey_answer_route')
server.use("/api/surveyanswer", surveyAnswerRoute)

const userRoute = require('./routes/user_route')
server.use("/api/user", userRoute)

const surveyItemFileRoute = require('./routes/survey_item_file_route')
const { exit } = require('process')
server.use("/api/surveyitemfile", surveyItemFileRoute)

if(process.env.privateKeyPath != undefined && process.env.certPath != undefined && process.env.caPath != undefined){
    try {
        
        const privateKey = fs.readFileSync(fs.realpathSync(process.env.privateKeyPath))
        const cert = fs.readFileSync(fs.realpathSync(process.env.certPath))
        const ca = fs.readFileSync(fs.realpathSync(process.env.caPath))
        console.log("Privatekey real path:",fs.realpathSync(process.env.privateKeyPath))
        const credentials = 
        {
            key: privateKey,
            cert: cert,
            ca: ca
        }
        
        const httpsServer = https.createServer(credentials, server)
        httpsServer.listen(3000);
    } catch (error) {
        console.error(error)
        server.listen(process.env.ExpressServerPort, () => console.log("Server running on port 3000 without HTTPS."))
    }
}
else{
    server.listen(process.env.ExpressServerPort, () => console.log("Server running on port 3000."))
}