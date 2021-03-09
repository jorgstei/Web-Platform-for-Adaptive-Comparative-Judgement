const nodemailer = require('nodemailer')

/*
    mailOptions: 
    {
        to: The recipient email address
        subject: The subject of the email
        content
    }
*/
async function sendMail(mailOptions){
    const transporter = nodemailer.createTransport(
        {
            host: "smtp.stud.ntnu.no",
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
    await transporter.sendMail(
        await transporter.sendMail(
            {
                from: process.env.MAIL_FROM_STRING,
                to: email,
                subject: "You have been invited to join ACJ",
                html: body_intro + body_invite_link + body_outro
            }
        )
    )
}