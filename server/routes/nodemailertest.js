const {Router} = require('express')
const nodemailer = require('nodemailer')

const router = Router()

router.post("/", async (req,res) => {
    const transporter = nodemailer.createTransport(
        {
            host: "smtp.ansatt.ntnu.no",
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PW
            }
        }
    )

    const response = await transporter.sendMail(
        {
            from: process.env.MAIL_FROM_STRING,
            to: "",
            subject: "Test fra backend RESP-API",
            text: "Funker dette? Hello World!"
        }
    )
    console.log("Mail response:",response)
    res.sendStatus(200)
})

module.exports = router