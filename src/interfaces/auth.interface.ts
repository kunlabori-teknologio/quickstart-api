import {Request, Response} from '@loopback/rest';
import {LocaleEnum} from '../enums/locale.enum';
import {IHttpResponse} from './http.interface';

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
  verifyLoginUserInfoToken(token: string, secret: string, request: Request, response: Response, locale?: LocaleEnum): IHttpResponse,
  getLoginUserInfoFromToken(token: string): ILoginResponse,
  getUserIdFromToken(token: string, secret: string): string,
}
