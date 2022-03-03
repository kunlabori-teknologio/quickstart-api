import {Request, Response} from '@loopback/rest';
import {AccessTokenResponse, AppleIdTokenType} from 'apple-sign-in-rest';
import {CompanyDTO} from '../dto/company.dto';
import {PersonDTO} from '../dto/person.dto';
import {AdditionalInfoModel} from '../entities/signup.entity';
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
  userData: {} | null,
}

export interface IRefreshTokenResponse {
  authToken: string,
  authRefreshToken: string,
}

export interface IAuthToken {
  verifyAuthToken(token: string, secret: string, request: Request, response: Response, locale?: LocaleEnum): boolean,
  getLoginUserInfoFromToken(token: string): ILoginUserInfo,
  getUserIdFromToken(token: string): string,
}

export interface IOAuthLogin {
  getOAuthLoginPageUrl(params?: string): Promise<string>,
  getOAuthUser(code?: string): Promise<IOAuthUser>,
  createOAuthToken(oAuthUser: IOAuthUser, invitationId?: string | null): string,
}

export interface IGetProfile {
  getFullProfileInfo(uniqueId: string, userType: UserTypesEnum, additionalInfo?: AdditionalInfoModel): Promise<PersonDTO | CompanyDTO | null>
}

export interface IAppleAuthorizationUrlConfig {
  redirectUri: string;
  scope?: ("name" | "email")[];
  state?: string;
  nonce?: string;
}

export interface IAppleAuthorizationTokenConfig {
  code: string;
  options: {
    redirectUri?: string;
  }
}

export interface IAppleRefreshAuthorizationTokenConfig {
  clientSecret: string;
  refreshToken: string;
}

export interface IAppleAuthorizationTokenResponse {
  accessToken: AccessTokenResponse,
  clientSecret: string
}

export interface IAppleVerifyIdTokenConfig {
  idToken: string,
  options: {
    nonce?: string;
    ignoreExpiration?: boolean;
    subject?: string;
  }
}

export interface IAppleLogin {
  getAuthorizationUrl(config: IAppleAuthorizationUrlConfig): Promise<string>
  getAuthorizationToken(config: IAppleAuthorizationTokenConfig): Promise<IAppleAuthorizationTokenResponse>
  verifyIdToken(config: IAppleVerifyIdTokenConfig): Promise<AppleIdTokenType>
  createOAuthToken(oAuthUser: IOAuthUser, invitationId?: string | null): string,
}
