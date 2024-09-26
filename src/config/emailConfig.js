import path from 'path';
import commonConstants from '~/constants/commonConstants';
const hbs = require('nodemailer-express-handlebars')
const nodemailer = require('nodemailer')

// initialize nodemailer for smpt 
const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: false, // upgrade later with STARTTLS
    auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD
    },

});


// point to the template folder
var handlebarOptions = {
    viewEngine: {
        partialsDir: path.resolve(commonConstants.EMAIL_TEMPLATE_URL),
        defaultLayout: false,
    },
    viewPath: path.resolve(commonConstants.EMAIL_TEMPLATE_URL),
};

// use a template file with nodemailer
transporter.use('compile', hbs(handlebarOptions))

export default transporter;