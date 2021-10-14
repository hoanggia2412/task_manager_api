const sgMail = require('@sendgrid/mail')
const template = require('./template')
const sendGridAPIKey =  process.env.SENDGRID_API_KEY

sgMail.setApiKey(sendGridAPIKey)
// sgMail.send({
//     to: 'hoanggia1224@gmail.com',
//     from: 'hoanggia1224@gmail.com',
//     subject: 'This is my first email',
//     text: 'I hope this one actually get to you',
// })
const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'hoanggia1224@gmail.com',
        subject: 'Thanks for joining in!',
        text:`Welcome to the app, ${name}. Let you know how you get along with app.`,
        html: template('**',name)
    })
}

const sendCancelationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'hoanggia1224@gmail.com',
        subject: 'Sorry to see you go!',
        text:`Goodbye, ${name}. I hope you back sometime to soon!.`
    })
}
module.exports = {
    sendWelcomeEmail,
    sendCancelationEmail
}