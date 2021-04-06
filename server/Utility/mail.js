const nodemailer = require('nodemailer')

/*
    mailOptions: 
    {
        to: The recipient email address
        subject: The subject of the email
        html: HTML representation of the mail content/body
    }
*/
async function sendMail(mailOptions) {
    if (process.env.MAIL_PW != undefined && process.env.MAIL_USER != undefined) {
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
        mailOptions.from = process.env.MAIL_FROM_STRING
        const result = await transporter.sendMail(
            mailOptions
        )
        transporter.close()
        return result;
    }
    else {
        const transporter = nodemailer.createTransport(
            {
                host: "smtp.ansatt.ntnu.no",
                port: 587,
                secure: false,
                requireTLS: true,
                tls: {
                    rejectUnauthorized: false
                }
            }  
        )
        mailOptions.from = process.env.MAIL_FROM_STRING
        const result = await transporter.sendMail(
            mailOptions
        )
        transporter.close()
        return result;
    }
}

module.exports = sendMail