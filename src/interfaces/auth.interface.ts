
export interface ILoginUserInfo {
  email?: string;
  googleId?: string;
  appleId?: string;
}

export interface ILoginResponse {
  authToken: string,
  authRefreshToken: string,
  userData: {},
}

export interface IRefreshTokenResponse {
  authToken: string,
  authRefreshToken: string,
}
