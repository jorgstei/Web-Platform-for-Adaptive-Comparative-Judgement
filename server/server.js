if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}
else{
    console.log("NO ENV PROVIDED")
}
const express = require('express')
const server = express()
const cors = require('cors')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
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
    }).then(() => {
        console.log("Sucessfully connected to MongoDB!")
        //If this is a fresh instance of mongodb, we'll have to create a service admin
        const anyAdminUser = User.find({role: "admin"})
        if(anyAdminUser.length < 1){
            const hashNSalt = hash(process.env.AdminPassword)
            const createAdminResult = User.create(process.env.AdminUserName, "Admin", "Admin", hashNSalt.hash, hashNSalt.salt, "admin")
            console.log(createAdminResult)
        }
    })
    .catch((err) => console.log("Error occured while connecting to MongoDB: ", err))

server.use(cors({
    origin: ["http://localhost:5000", "http://127.0.0.1:5000", "http://acj.heroesunknown.net:5000"],
    credentials: true
}))
server.use(bodyParser.json())

const auth = require("./routes/authentication")
server.use("/auth", auth.router)

const surveyRoute = require('./routes/survey_route')
server.use("/api/survey", surveyRoute)

const surveyAnswerRoute = require('./routes/survey_answer_route')
server.use("/api/surveyanswer", surveyAnswerRoute)

const userRoute = require('./routes/user_route')
server.use("/api/user", userRoute)

server.listen(process.env.ExpressServerPort, () => console.log("Server running on port 3000."))