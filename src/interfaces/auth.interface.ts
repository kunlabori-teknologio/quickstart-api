import {Response} from '@loopback/rest';
import {Signup} from '../entities/signup.entity';

export interface ILoginResponse {
  authToken: string,
  authRefreshToken: string,
  userData?: any,
}

export interface IAuthorizedUser {
  userId: string,
  ownerId: string,
}

export interface IAuth {
  webGoogleLogin(httpResponse: Response, invitationId?: string): Promise<void>;
  webAppleLogin(httpResponse: Response, invitationId?: string): Promise<void>;

  login(token: string): Promise<ILoginResponse>;
  signup(signupBodyRequest: Signup, token: string): Promise<any>;

  refreshToken(token: string): Promise<ILoginResponse>;
  verifyAuthorization(collection: string, action: string, token: string): Promise<IAuthorizedUser>;
}
