import * as nodemailer from 'nodemailer';

interface INodemailerProps {
  mailFrom?: string,
  mailTo: string,
  subject?: string,
  body: string,
}

export class Nodemailer {

  public async sendMail(props: INodemailerProps): Promise<void>{

      const mailOptions = {
        from: `${props.mailFrom || 'Quickstart'}`,
        to: props.mailTo,
        subject: props.subject ?? 'Olá',
        html: props.body,
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

      transporter.sendMail(mailOptions, error => {
        if (error) throw new Error(error.message);
      });
  }

}
