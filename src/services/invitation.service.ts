import { /* inject, */ BindingScope, injectable} from '@loopback/core';
import * as nodemailer from 'nodemailer';

@injectable({scope: BindingScope.TRANSIENT})
export class InvitationService {
  constructor() { }

  public sendInvitation(email: string, mailBody: string): void {
    const mailOptions = {
      from: '"Kunlatek" <noreply@kunlatek.com.br>',
      to: email,
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

    transporter.sendMail(mailOptions, (error) => {
      if (error) throw new Error(error.message)
    })
  }
}
