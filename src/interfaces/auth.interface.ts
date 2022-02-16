import {Request, Response} from '@loopback/rest';
import {CompanyDTO} from '../dto/company.dto';
import {PersonDTO} from '../dto/person.dto';
import {AdditionalInfoModel} from '../entities/signup.entity';
import {LocaleEnum} from '../enums/locale.enum';
import {UserTypesEnum} from '../utils/general-functions';
import {IHttpResponse} from './http.interface';
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
  verifyAuthToken(token: string, secret: string, request: Request, response: Response, locale?: LocaleEnum): IHttpResponse,
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
