const fetch = require('node-fetch');
require('dotenv').config();

export class Autentikigo {
  private autentikigoRoute: string;
  private clientRedirectUri: string;

  constructor(){
    this.autentikigoRoute = process.env.AUTENTIKIGO_URI || 'http://localhost:3001';
    this.clientRedirectUri = process.env.CLIENT_URI || 'http://localhost:4200';
  }

  public async webGoogleLoginUrl(invitationId?: string): Promise<string> {

    const invitation = invitationId ? `&invitation=${invitationId}` : '';

    const response = await fetch(`${this.autentikigoRoute}/google-login-url?client-redirect-uri=${this.clientRedirectUri}${invitation}`);
    const data = await response.json();

    if (data.statusCode !== 200) throw new Error(data.logMessage);

    return data.data.url;
  }

  public async webAppleLoginUrl(invitationId?: string): Promise<string> {
    const invitation = invitationId ? `&invitation=${invitationId}` : '';

    const response = await fetch(`${this.autentikigoRoute}/apple-login-url?client-redirect-uri=${this.clientRedirectUri}${invitation}`);
    const data = await response.json();

    if (data.statusCode !== 200) throw new Error(data.logMessage);

    return data.data.url;
  }
}
