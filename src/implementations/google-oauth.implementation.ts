import {google} from 'googleapis';
import {sign} from 'jsonwebtoken';
import {IOAuthLogin} from '../interfaces/auth.interface';
import {IOAuthUser} from '../interfaces/user.interface';

export class GoogleOAuthImplementation implements IOAuthLogin {

  async getOAuthLoginPageUrl(params?: string): Promise<string> {
    try {

      const googleOAuth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        `${process.env.GOOGLE_REDIRECT_URI}/auth/google`
      )

      const url = googleOAuth2Client.generateAuthUrl({
        'access_type': "offline",
        'scope':
          [
            "https://www.googleapis.com/auth/userinfo.profile",
            "https://www.googleapis.com/auth/userinfo.email",
          ],
        'state': params ?? ''
      });

      return url;

    } catch (err) {

      throw new Error(err.message)

    }
  }

  async getOAuthUser(code?: string): Promise<IOAuthUser> {
    try {

      const googleOAuth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        `${process.env.GOOGLE_REDIRECT_URI}/auth/google`
      )

      const {tokens} = await googleOAuth2Client.getToken(code!)

      googleOAuth2Client.setCredentials(tokens)

      const oauth2 = google.oauth2({version: 'v2', auth: googleOAuth2Client})

      const googleUser = await oauth2.userinfo.v2.me.get()

      return {email: googleUser.data.email, id: googleUser.data.id}

    } catch (err) {

      throw new Error(err.message)

    }
  }

  createOAuthToken(oAuthUser: IOAuthUser, invitationId?: string | null): string {

    return sign({
      email: oAuthUser.email, googleId: oAuthUser.id, invitationId
    },
      process.env.PROJECT_SECRET!, {
      expiresIn: '5m'
    })

  }

}
