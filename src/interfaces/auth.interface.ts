import {Request, Response} from '@loopback/rest';
import {CompanyDTO} from '../dto/company.dto';
import {PersonDTO} from '../dto/person.dto';
import {AdditionalInfoModel, Signup} from '../entities/signup.entity';
import {LocaleEnum} from '../enums/locale.enum';
import {UserTypesEnum} from '../utils/general-functions';
import {IOAuthUser} from './user.interface';

export interface ILoginUserInfo {
  email?: string;
  googleId?: string;
  appleId?: string;
  invitationId?: string;
}

export interface ILoginResponse {
  authToken: string,
  authRefreshToken: string,
  userData?: any,
  statusCode?: number,
  message?: string,
}

export interface IRefreshTokenResponse {
  authToken: string,
  authRefreshToken: string,
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
  getProfile(userType: UserTypesEnum, uniqueId: string): Promise<any>;

  generateToken(payload: any, expiresIn: string): Promise<string>;
  refreshToken(token: string): Promise<ILoginResponse>;
  verifyAuthorization(collection: string, action: string, token: string): Promise<IAuthorizedUser>;
  verifyJwtAuthorization(token: string): Promise<any>;
}

export interface IAuthToken {
  verifyAuthToken(token: string, secret: string, request: Request, response: Response, locale?: LocaleEnum): boolean,
  getLoginUserInfoFromToken(token: string): ILoginUserInfo,
  getUserIdFromToken(token: string): string,
}

export interface IOAuthLogin {
  getOAuthLoginPageUrl(params?: string): Promise<string>,
  getOAuthUser(code?: string): Promise<IOAuthUser>,
  createOAuthToken(oAuthUser: IOAuthUser, invitationId?: string | null, clientRedirectUri?: string): string,
}

export interface IGetProfile {
  getFullProfileInfo(uniqueId: string, userType: UserTypesEnum, additionalInfo?: AdditionalInfoModel): Promise<PersonDTO | CompanyDTO | null>
}
