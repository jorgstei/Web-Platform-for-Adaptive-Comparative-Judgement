if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}
const express = require('express')
const server = express()
const cors = require('cors')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')

const mongoConnectionString = process.env.MongoDBConnectionString;
mongoose.connect(mongoConnectionString,
    {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
    }).then(() => console.log("Sucessfully connected to MongoDB!"))
    .catch((err) => console.log("Error occured while connecting to MongoDB: ", err))

server.use(cors())
server.use(bodyParser.json())
server.get("/", (req, res) => res.send("Test OK."))

const comparisonObjectRoute = require('./routes/comparison_object_route')
server.use("/api/comparisonobject", comparisonObjectRoute)

server.listen(process.env.ExpressServerPort, () => console.log("Server running on port 3000."))