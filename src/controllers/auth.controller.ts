import {inject, service} from '@loopback/core';
import {
  get,
  getModelSchemaRef,
  OperationVisibility,
  param,
  post,
  Request, requestBody, response, Response,
  RestBindings,
  visibility
} from '@loopback/rest';
import {URLSearchParams} from 'url';
import {Signup} from '../entities/signup.entity';
import {LocaleEnum} from '../enums/locale.enum';
import {AppleSigninImplementation} from '../implementations/apple-signin.implementation';
import {GoogleOAuthImplementation} from '../implementations/google-oauth.implementation';
import {HttpDocumentation, HttpResponseToClient, JwtToken} from '../implementations/index';
import {ProfileFromAPIImplementation} from '../implementations/profile-from-api.implementation';
import {IAppleLogin, IGetProfile, IOAuthLogin} from '../interfaces/auth.interface';
import {IHttpResponse} from '../interfaces/http.interface';
import {IOAuthUser} from '../interfaces/user.interface';
import {User} from '../models/user.model';
import {AuthService} from '../services';
import {serverMessages} from './../utils/server-messages';

export class AuthController {

  private googleOAuth: IOAuthLogin
  private getProfile: IGetProfile
  private appleLogin: IAppleLogin

  constructor(
    @inject(RestBindings.Http.REQUEST) private httpRequest: Request,
    @inject(RestBindings.Http.RESPONSE) private httpResponse: Response,

    @service(AuthService) private authService: AuthService,
  ) {
    this.googleOAuth = new GoogleOAuthImplementation()
    this.getProfile = new ProfileFromAPIImplementation()
    this.appleLogin = new AppleSigninImplementation()
  }

  @get('auth/google-signin')
  @response(200, {description: 'Redirect to Google login page'})
  async redirectToGoogleLoginPage(
    @param.query.string('invitationId') invitationId?: string,
    @param.query.string('locale') locale?: LocaleEnum,
  ): Promise<void | IHttpResponse> {
    try {

      const invitationParam = invitationId ? `invitationId=${invitationId}` : ''

      const url = await this.authService.getOAuthLoginPageURL(this.googleOAuth, invitationParam)

      this.httpResponse.redirect(url)

    } catch (err) {

      return HttpResponseToClient.badRequestErrorHttpResponse({
        message: serverMessages['auth']['getGoogleUrl'][locale ?? LocaleEnum['pt-BR']],
        logMessage: err.message,
        locale,
        request: this.httpRequest,
        response: this.httpResponse,
      })

    }
  }

  @visibility(OperationVisibility.UNDOCUMENTED)
  @get('auth/google')
  async handleGoogleCodeAndReturnToken(
    @param.query.string('code') code: string,
    @param.query.string('state') state?: string,
  ): Promise<void | IHttpResponse> {
    try {

      const googleUser = await this.authService.getOAuthUser(this.googleOAuth, code)

      const invitationId = new URLSearchParams(state).get('invitationId')

      const token = this.authService.createOAuthToken(this.googleOAuth, googleUser, invitationId)

      this.httpResponse.redirect(`${process.env.CLIENT_URI}?token=${token}`)

    } catch (err) {

      return HttpResponseToClient.badRequestErrorHttpResponse({
        message: serverMessages['auth']['getGoogleUser'][LocaleEnum['en-US']],
        logMessage: err.message,
        request: this.httpRequest,
        response: this.httpResponse,
      })

    }
  }

  @get('auth/apple-signin')
  @response(200, {description: 'Redirect to Apple login page'})
  async redirectToAppleLoginPage(
    @param.query.string('nonce') nonce?: string,
    @param.query.string('invitationId') invitationId?: string,
    @param.query.string('locale') locale?: LocaleEnum,
  ): Promise<void | IHttpResponse> {
    try {

      const url = await this.authService.getAppleAuthorizationUrl(this.appleLogin, {
        redirectUri: process.env.APPLE_AUTH_REDIRECT_URI as string,
        nonce,
        scope: ['name', 'email'],
        state: JSON.stringify(invitationId)
      })

      this.httpResponse.redirect(url);

    } catch (err) {

      return HttpResponseToClient.badRequestErrorHttpResponse({
        message: serverMessages['auth']['getAppleUrl'][locale ?? LocaleEnum['pt-BR']],
        logMessage: err.message,
        locale,
        request: this.httpRequest,
        response: this.httpResponse,
      });
    }
  }

  @visibility(OperationVisibility.UNDOCUMENTED)
  @get('auth/apple')
  async handleAppleLoginCodeAndReturnToken(
    @param.query.string('code') code: string,
    @param.query.string('state') state?: string,
  ): Promise<void | IHttpResponse> {

    const invitationId = new URLSearchParams(state).get('invitationId');

    const nonce = new URLSearchParams(state).get('nonce') || undefined;

    const localeStr: any = new URLSearchParams(state).get('locale') ?? 'pt-BR';

    const locale = LocaleEnum[localeStr] as unknown as LocaleEnum;

    try {

      const {accessToken} = await this.appleLogin.getAuthorizationToken({
        code,
        options: {
          redirectUri: process.env.APPLE_AUTH_REDIRECT_URI
        }
      });

      const {email, sub} = await this.appleLogin.verifyIdToken({
        idToken: accessToken.id_token,
        options: {
          nonce
        }
      });

      const appleUser: IOAuthUser = {
        email,
        id: sub
      };

      const token = this.authService.signInWithAppleOAuthToken(
        this.appleLogin,
        appleUser,
        invitationId
      );

      this.httpResponse.redirect(`${process.env.CLIENT_URI}?token=${token}`);

    } catch (err) {

      return HttpResponseToClient.badRequestErrorHttpResponse({
        message: serverMessages['auth']['getAppleUser'][locale],
        logMessage: err.message,
        locale,
        request: this.httpRequest,
        response: this.httpResponse,
      });
    }
  }

  @get('auth/login')
  @response(200, {
    description: 'Auth token',
    properties: {
      message: {type: 'string'},
      statusCode: {type: 'number'},
      data: {
        properties: {
          authToken: {type: 'string'},
          authRefreshToken: {type: 'string'},
          userData: getModelSchemaRef(User, {includeRelations: true}),
        }
      }
    }
  })
  async login(
    @param.query.string('locale') locale?: LocaleEnum,
  ): Promise<IHttpResponse | undefined> {
    try {
      const tokenVerified = JwtToken.verifyAuthToken(
        this.httpRequest.headers.authorization!, process.env.PROJECT_SECRET!,
        this.httpRequest, this.httpResponse, locale
      )
      if (!tokenVerified) return

      const loginUserInfo = JwtToken.getLoginUserInfoFromToken(this.httpRequest.headers.authorization!)

      const tokenAndUser = await this.authService.login(loginUserInfo)

      return HttpResponseToClient.okHttpResponse({
        data: {...tokenAndUser},
        message: serverMessages['auth'][tokenAndUser?.authToken ? 'loginSuccess' : 'unregisteredUser'][locale ?? LocaleEnum['pt-BR']],
        statusCode: tokenAndUser?.authToken ? 200 : 601,
        request: this.httpRequest,
        response: this.httpResponse,
      })


    } catch (err) {

      return HttpResponseToClient.badRequestErrorHttpResponse({
        logMessage: err.message,
        locale,
        request: this.httpRequest,
        response: this.httpResponse,
      })

    }
  }

  @post('auth/signup')
  @response(200, {
    description: 'User registered',
    properties: HttpDocumentation.createDocResponseSchemaForFindOneResult(User)
  })
  async signup(
    @requestBody({
      content: HttpDocumentation.createDocRequestSchema(Signup)
    }) data: Signup,
    @param.query.string('locale') locale?: LocaleEnum,
  ): Promise<IHttpResponse | undefined> {
    try {

      const tokenVerified = JwtToken.verifyAuthToken(
        this.httpRequest.headers.authorization!, process.env.PROJECT_SECRET!,
        this.httpRequest, this.httpResponse, locale
      )
      if (!tokenVerified) return

      const loginUserInfo = JwtToken.getLoginUserInfoFromToken(this.httpRequest.headers.authorization!)

      const userWithProfile = await this.authService.signup(data, loginUserInfo, this.getProfile)

      return HttpResponseToClient.okHttpResponse({
        data: userWithProfile,
        locale,
        request: this.httpRequest,
        response: this.httpResponse,
      })

    } catch (err) {

      return HttpResponseToClient.badRequestErrorHttpResponse({
        message: err.message,
        logMessage: err.message,
        locale,
        request: this.httpRequest,
        response: this.httpResponse,
      })

    }
  }

  @get('auth/refresh-token')
  @response(200, {
    description: 'Auth token',
    properties: {
      message: {type: 'string'},
      statusCode: {type: 'number'},
      data: {
        properties: {
          authToken: {type: 'string'},
          authRefreshToken: {type: 'string'},
        }
      }
    }
  })
  async refreshToken(
    @param.query.string('locale') locale?: LocaleEnum,
  ): Promise<IHttpResponse | undefined> {
    try {

      const tokenVerified = JwtToken.verifyAuthToken(
        this.httpRequest.headers.authorization!, process.env.PROJECT_SECRET!,
        this.httpRequest, this.httpResponse, locale
      )
      if (!tokenVerified) return

      const userId = JwtToken.getUserIdFromToken(this.httpRequest.headers.authorization!)

      const authToken = await this.authService.refreshToken(userId);

      return HttpResponseToClient.okHttpResponse({
        data: authToken,
        message: serverMessages['auth']['refreshTokenSuccess'][locale ?? LocaleEnum['pt-BR']],
        locale,
        request: this.httpRequest,
        response: this.httpResponse,
      })

    } catch (err) {

      return HttpResponseToClient.badRequestErrorHttpResponse({
        message: serverMessages['auth']['refreshTokenError'][locale ?? LocaleEnum['pt-BR']],
        logMessage: err.message,
        locale,
        request: this.httpRequest,
        response: this.httpResponse,
      })

    }
  }
}
