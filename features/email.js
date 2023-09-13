import nodemailer from "nodemailer";
import pug from "pug";
import { htmlToText } from "html-to-text";

export class Email {
  constructor(user, url) {
    this.firstName = user.name.split(" ")[0];
    this.to = user.email;
    this.url = url;
    this.from = `ahmed anis <${process.env.SEND_FROM}>`;
  }

  newTransporter() {
    if (process.env.STAGE === "production") {
      return;
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(template, subject) {
    const html = pug.renderFile(`./views/emailTemplet/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });

    const mailDetails = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText(html),
    };

    await this.newTransporter().sendMail(mailDetails);
  }

  async sendWelcome() {
    await this.send("welcome", "welcom to the family");
  }

  async sendResetPassword() {
    await this.send(
      "resetPassword",
      "reset Passwor link (will expires in 10 min)"
    );
  }
}
