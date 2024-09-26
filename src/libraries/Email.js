import transporter from "~/config/emailConfig";
import hbs from 'nodemailer-express-handlebars';

class Email {
    // trigger the sending of the E-mail
    async sendEmail(mailOptions) {
        mailOptions.from = process.env.MAIL_USERNAME;
        // use a template file with nodemailer
        transporter.use('compile', hbs(mailOptions))

        // send mail 
        return transporter.sendMail(mailOptions).then((response) => {
            var res = {
                status: true,
                response: response
            };

            return res;

        }).catch((err) => {
            console.log(err);
            var res = {
                status: false,
                response: err
            };
            return res;
        })

    }
}
module.exports = Email;