const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
    constructor(user, url) {
        this.to = user.email;
        this.firstName = user.name.split(' ')[0];
        this.url = url;
        this.from = `John Doe <${process.env.EMAIL_FROM}>`
    }

    newTransport() {
        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }

    async send(template, subject) {
        const pugValues = {
            firstName: this.firstName,
            url: this.url,
            subject
        };

        const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, pugValues);

        const config = {
            from: this.from,
            to: this.to,
            subject,
            html,
            text: htmlToText.fromString(html)
        }

        await this.newTransport().sendMail(config);
    }

    async sendWelcomeMessage() {
        await this.send('welcome', 'Welcome to ReadsTracker!')
    }

    async sendPasswordRecoveryMessage() {
        await this.send('passwordRecovery', 'Password Recovery')
    }
}