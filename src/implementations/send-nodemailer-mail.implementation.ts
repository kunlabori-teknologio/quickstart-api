import * as nodemailer from 'nodemailer';
import {ISendMail} from '../interfaces/send-mail.interface';

export class SendNodemailerMailImplementation implements ISendMail {
  sendInvitationMail(
    invitationId: string,
    emailOfInvited: string,
    project?: string,
  ): string | null {
    const apps: any[] = [
      /*APPS_SPACE*//*APPS_SPACE*/
    ]
    const app = apps.find(el => el.project === project);

    const baseUri = (app && app.url) || process.env.SERVER_ROOT_URI
    const projectName = (app && app.name) || process.env.PROJECT

    const mailBody = `
      <p>
        <a href='${baseUri}/auth/google-signin?invitationId=${invitationId}'>Login com convite</a>
      </p>
    `;

    const mailOptions = {
      from: `${projectName || 'Quickstart'}`,
      to: emailOfInvited,
      subject: `Convite - ${projectName || 'Quickstart'}`,
      html: mailBody,
    };

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASS,
      },
      tls: {rejectUnauthorized: false},
    });

    let errorMessage = null;

    transporter.sendMail(mailOptions, error => {
      if (error) errorMessage = error.message;
    });

    return errorMessage;
  }
}
