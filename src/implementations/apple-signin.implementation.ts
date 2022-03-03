import {generateUniqueId} from '@loopback/context';
import {AppleIdTokenType, AppleSignIn, AppleSignInOptions} from 'apple-sign-in-rest';
import {sign} from 'jsonwebtoken';
import {
  IAppleAuthorizationTokenConfig,
  IAppleAuthorizationTokenResponse,
  IAppleAuthorizationUrlConfig,
  IAppleLogin, IAppleVerifyIdTokenConfig
} from '../interfaces/auth.interface';
import {IOAuthUser} from '../interfaces/user.interface';

/**
 * https://github.com/renarsvilnis/apple-sign-in-rest#readme
 */
export class AppleSigninImplementation implements IAppleLogin {
  private appleSignIn: AppleSignIn
  private options: AppleSignInOptions
  private expirationAuthToken: number;

  constructor() {
    this.options = {
      clientId: process.env.APPLE_CLIENT_ID as string,
      teamId: process.env.APPLE_TEAM_ID as string,
      keyIdentifier: process.env.APPLE_KEY_IDENTIFIER as string,
      privateKeyPath: process.env.APPLE_KEY_PATH as string
    }
    this.appleSignIn = new AppleSignIn(this.options);
    this.expirationAuthToken = parseInt(process.env.APPLE_EXPIRATION_AUTH_TOKEN_IN_SECONDS as string) || 300;
  }

  async getAuthorizationUrl(config: IAppleAuthorizationUrlConfig): Promise<string> {
    try {
      config.nonce = !config.nonce ? generateUniqueId() : config.nonce;
      return this.appleSignIn.getAuthorizationUrl(config);
    } catch (error) {
      throw new Error(error.message)
    }
  }

  async getAuthorizationToken({code, options}: IAppleAuthorizationTokenConfig): Promise<IAppleAuthorizationTokenResponse> {
    try {
      const clientSecret = this.appleSignIn.createClientSecret({ expirationDuration: this.expirationAuthToken })
      const accessToken = await this.appleSignIn.getAuthorizationToken(clientSecret, code, options);
      return {
        accessToken,
        clientSecret
      };
    } catch (error) {
      throw new Error(error.message)
    }
  }

  async verifyIdToken({idToken, options}: IAppleVerifyIdTokenConfig): Promise<AppleIdTokenType> {
    try{
      return await this.appleSignIn.verifyIdToken(idToken, options);
    } catch (error) {
      throw new Error(error.message)
    }
  }

  createOAuthToken(oAuthUser: IOAuthUser, invitationId?: string | null): string {
    return sign({
      email: oAuthUser.email,
      appleId: oAuthUser.id,
      invitationId
    },
      process.env.PROJECT_SECRET!, {
      expiresIn: '5m'
    })

  }
}
