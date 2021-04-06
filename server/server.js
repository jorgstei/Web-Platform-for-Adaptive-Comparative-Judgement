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
        const anyAdminUser = await User.find({role: "admin"})
        if(anyAdminUser.length < 1){
            const hashNSalt = hash(process.env.AdminPassword)
            const email = process.env.AdminUsername
            const hashed = hashNSalt.hash
            const salt = hashNSalt.salt
            const firstName = "Admin"
            const lastName = firstName
            const role = "admin"
            const adminObj = {email, firstName, lastName, hashed, salt, role}
            const createAdminResult = await User.create(adminObj)
            console.log("CreateAdminResult:",createAdminResult)
        }
        else{
            console.log("Found existing admin user.")
        }
        
    })
    .catch((err) => console.log("Error occured while connecting to MongoDB: ", err))

server.use(cors({
    origin: ["http://localhost:5000", "http://127.0.0.1:5000", "http://acj.heroesunknown.net:5000", "http://compair.it.ntnu.no"
    , "https://compair.it.ntnu.no", "https://compair.it.ntnu.no:5000", "http://compair.it.ntnu.no:5000"
    ],
    credentials: true
}))
server.use(bodyParser.json())

server.use(cookieParser())

const auth = require("./routes/authentication")
server.use("/auth", auth.router)

const surveyRoute = require('./routes/survey_route')
server.use("/api/survey", surveyRoute)

const surveyAnswerRoute = require('./routes/survey_answer_route')
server.use("/api/surveyanswer", surveyAnswerRoute)

const userRoute = require('./routes/user_route')
const { exec } = require('child_process')
server.use("/api/user", userRoute)

if(process.env.privateKeyPath != undefined && process.env.certPath != undefined && process.env.caPath != undefined){

    console.log("priv path:",process.env.privateKeyPath)
    console.log("cert path:",process.env.certPath)
    console.log("ca path:",process.env.caPath)
    exec("pwd")
    exec("ls ../../certs")
    const privateKey = fs.readFileSync(process.env.privateKeyPath)
    const cert = fs.readFileSync(process.env.certPath)
    const ca = fs.readFileSync(process.env.caPath)
    const credentials = 
    {
        key: privateKey,
        cert: cert,
        ca: ca
    }
    
    const httpsServer = https.createServer(credentials, server)
    httpsServer.listen(443);
}
else{
    server.listen(process.env.ExpressServerPort, () => console.log("Server running on port 3000."))
}