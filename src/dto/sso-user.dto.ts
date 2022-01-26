import {ISsoUser} from '../interfaces/auth.interface';

// Usertypes
export enum ssoEnum {
  google = 'google',
  apple = 'apple',
}
export class SSOUserDto implements ISsoUser {
  googleId?: string | undefined;
  appleId?: string | undefined;
  email?: string;

  constructor({dataFromSSO, sso}: {dataFromSSO: IUserFromGoogle | IUserFromApple, sso: ssoEnum}) {
    this[`${sso}Id`] = dataFromSSO?.id;
    this.email = dataFromSSO?.email;
  }
}
