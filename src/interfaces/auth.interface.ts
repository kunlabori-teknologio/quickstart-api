
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
