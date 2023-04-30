import {service} from '@loopback/core';
import {Nodemailer} from '../../services';

export class SendInvitation {

  constructor(
    @service(Nodemailer) private nodemailer: Nodemailer,
  ){}

  public async execute(
    invitationId: string,
    email: string,
    project?: string
  ): Promise<void>{
    const apps: any[] = [
      /*APPS_SPACE*//*APPS_SPACE*/
    ]
    const app = apps.find(el => el.project === project);

    const baseUri = (app && app.url) || process.env.SERVER_URI
    const projectName = (app && app.name) || process.env.PROJECT

    const mailBody = `
      <p>
        <a href='${baseUri}/auth/google-signin?invitationId=${invitationId}'>Login com convite</a>
      </p>
    `;

    await this.nodemailer.sendMail({
      mailFrom: projectName,
      mailTo: email,
      subject: `Convite - ${projectName || 'Quickstart'}`,
      body: mailBody,
    })
  }

}
