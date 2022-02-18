import * as nodemailer from 'nodemailer';
import {ISendMail} from '../interfaces/send-mail.interface';

export class SendNodemailerMailImplementation implements ISendMail {

  sendInvitationMail(invitationId: string, emailOfInvited: string): string | null {
    const mailBody = `
      <p>
        <a href='${process.env.SERVER_ROOT_URI}/auth/google-signin?invitationId=${invitationId}'>Login com convite</a>
      </p>
    `

    const mailOptions = {
      from: '"Kunlatek" <noreply@kunlatek.com.br>',
      to: emailOfInvited,
      subject: 'Convite Kunlatek',
      html: mailBody
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASS,
      },
      tls: {rejectUnauthorized: false}
    });

    let errorMessage = null

    transporter.sendMail(mailOptions, (error) => {
      if (error) errorMessage = error.message
    })

    return errorMessage
  }

}
