import {Response} from '@loopback/rest';
import {Signup} from '../entities/signup.entity';
import {UserTypesEnum} from '../utils/general-functions';
import {IAuth, IAuthorizedUser, ILoginResponse} from './../interfaces/auth.interface';

const fetch = require('node-fetch');

export class AuthAutentikigoImplementation implements IAuth {

  autentikigoRoute = 'https://autentikigo-tftftsuywa-ue.a.run.app/'

  clientRedirectUri = process.env.CLIENT_REDIRECT_URI || 'http://localhost:4200'

  async webGoogleLogin(httpResponse: Response, invitationId?: string): Promise<void> {

    const invitation = invitationId ? `&invitation=${invitationId}` : ''

    const response = await fetch(`${this.autentikigoRoute}/google-login-url?client-redirect-uri=${this.clientRedirectUri}${invitation}`)
    const data = await response.json()

    if (data.statusCode === 200) httpResponse.redirect(data.data.url);
    else throw new Error(data.logMessage)

  }

  async webAppleLogin(httpResponse: Response<any, Record<string, any>>, invitationId?: string): Promise<void> {
    const invitation = invitationId ? `&invitation=${invitationId}` : ''

    const response = await fetch(`${this.autentikigoRoute}/apple-login-url?client-redirect-uri=${this.clientRedirectUri}${invitation}`)
    const data = await response.json()

    if (data.statusCode === 200) httpResponse.redirect(data.data.url);
    else throw new Error(data.logMessage)

  }

  async login(token: string): Promise<ILoginResponse> {

    const response = await fetch(`${this.autentikigoRoute}/login?project-id=${process.env.PROJECT_ID}`, {
      method: 'GET',
      headers: {
        'Content-type': 'application/json',
        'Authorization': token,
      },
    })
    const data = await response.json()

    if (data.statusCode === 200) return data.data as ILoginResponse;
    else if (data.statusCode === 601) return data as ILoginResponse;
    else throw new Error(data.logMessage)

  }

  async signup(signupBodyRequest: Signup, token: string): Promise<void> {

    const response = await fetch(`${this.autentikigoRoute}/signup`, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
        'Authorization': token,
      },
      body: JSON.stringify(signupBodyRequest),
    })
    const data = await response.json()

    if (data.statusCode !== 200) throw new Error(data.logMessage)

  }

  async verifyAuthorization(collection: string, action: string, token: string): Promise<IAuthorizedUser> {

    const response = await fetch(`${this.autentikigoRoute}/verify-authorization?collection=${collection}&action=${action}&project-id=${process.env.PROJECT_ID}`, {
      method: 'GET',
      headers: {
        'Content-type': 'application/json',
        'Authorization': token,
      },
    })
    const data = await response.json()

    if (data.statusCode === 200) return data.data as IAuthorizedUser;
    else throw new Error(data.logMessage)

  }

  async generateToken(payload: any, expiresIn: string): Promise<string> {

    const response = await fetch(`${this.autentikigoRoute}/generate-jwt`, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
        // 'Authorization': token,
      },
      body: JSON.stringify({payload, expiresIn}),
    })
    const data = await response.json()

    if (data.statusCode === 200) return data.data as string;
    else throw new Error(data.logMessage)

  }

  async refreshToken(token: string): Promise<ILoginResponse> {

    const response = await fetch(`${this.autentikigoRoute}/refresh-token`, {
      method: 'GET',
      headers: {
        'Content-type': 'application/json',
        'Authorization': token,
      },
    })
    const data = await response.json()

    if (data.statusCode === 200) return data.data as ILoginResponse;
    else throw new Error(data.logMessage)

  }

  async verifyJwtAuthorization(token: string): Promise<IAuthorizedUser> {

    const response = await fetch(`${this.autentikigoRoute}/verify-jwt-authorization?token=${token}`, {
      method: 'GET',
      headers: {
        'Content-type': 'application/json'
        // 'Authorization': token,
      },
    })
    const data = await response.json()

    if (data.statusCode === 200) return data;
    else throw new Error(data.logMessage)

  }

  async getProfile(userType: UserTypesEnum, uniqueId: string, token: string): Promise<any> {

    const response = await fetch(`${this.autentikigoRoute}/get-profile?userType=${userType}&uniqueId=${uniqueId}`, {
      method: 'GET',
      headers: {
        'Content-type': 'application/json',
        'Authorization': token,
      },
    })
    const data = await response.json()

    if (data.statusCode === 200) return data;
    else throw new Error(data.logMessage)

  }

}
