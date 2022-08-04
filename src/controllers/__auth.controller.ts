// Uncomment these imports to begin using these cool features!
import {inject, service} from '@loopback/core';
import {get, param, post, Request, requestBody, Response, response, RestBindings} from '@loopback/rest';
import {Signup} from '../entities/signup.entity';
import {LocaleEnum} from '../enums/locale.enum';
import {Autentikigo, HttpDocumentation, HttpResponseToClient, JwtToken} from '../implementations';
import {ProfileFromAPIImplementation} from '../implementations/profile-from-api.implementation';
import {IGetProfile} from '../interfaces/auth.interface';
import {IHttpResponse} from '../interfaces/http.interface';
import {__User} from '../models';
import {AuthService} from '../services/auth.service';
import {serverMessages} from '../utils/server-messages';

export class __AuthController {

  private getProfile: IGetProfile

  constructor(
    @inject(RestBindings.Http.REQUEST) private httpRequest: Request,
    @inject(RestBindings.Http.RESPONSE) private httpResponse: Response,

    @service(AuthService) private authService: AuthService,
  ) {
    this.getProfile = new ProfileFromAPIImplementation()
  }

  @get('/auth/google-signin')
  @response(200, {
    description: 'Redirect to google login page',
  })
  async googleSignin(
    @param.query.string('invitationId') invitationId: string,
    @param.query.string('locale') locale?: LocaleEnum,
  ): Promise<IHttpResponse | void> {
    try {

      await Autentikigo.webGoogleLogin(this.httpResponse, invitationId)

    } catch (err) {

      return HttpResponseToClient.badRequestErrorHttpResponse({
        logMessage: err.message,
        locale,
        request: this.httpRequest,
        response: this.httpResponse,
      })

    }
  }

  @get('/auth/mobile/google-signin')
  @response(200, {
    description: 'Mobile google login',
  })
  async mobileGoogleSignin(
    @param.query.string('email') email: string,
    @param.query.string('google-id') googleId: string,
    @param.query.string('invitationId') invitationId: string,
    @param.query.string('locale') locale?: LocaleEnum,
  ): Promise<IHttpResponse | void> {
    try {

      const tokenAndUser =
        (await this.authService.login({email, googleId, invitationId})) ||
        {
          authToken: await Autentikigo.generateToken({email, googleId, invitationId}, '5min'),
          userData: {},
          message: serverMessages['auth']['unregisteredUser'][locale ?? LocaleEnum['pt-BR']],
          statusCode: 601
        }

      return HttpResponseToClient.createHttpResponse({
        data: {...tokenAndUser},
        message: tokenAndUser?.message ?? serverMessages['auth']['loginSuccess'][locale ?? LocaleEnum['pt-BR']],
        statusCode: tokenAndUser?.statusCode ?? 200,
        locale,
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

  @get('/auth/apple-signin')
  @response(200, {
    description: 'Redirect to apple login page',
  })
  async appleSignin(
    @param.query.string('invitationId') invitationId: string,
    @param.query.string('locale') locale?: LocaleEnum,
  ): Promise<IHttpResponse | void> {
    try {

      await Autentikigo.webAppleLogin(this.httpResponse, invitationId)

    } catch (err) {

      return HttpResponseToClient.badRequestErrorHttpResponse({
        logMessage: err.message,
        locale,
        request: this.httpRequest,
        response: this.httpResponse,
      })

    }
  }

  @get('/auth/mobile/apple-signin')
  @response(200, {
    description: 'Mobile google login',
  })
  async mobileAppleSignin(
    @param.query.string('email') email: string,
    @param.query.string('apple-id') appleId: string,
    @param.query.string('invitationId') invitationId: string,
    @param.query.string('locale') locale?: LocaleEnum,
  ): Promise<IHttpResponse | void> {
    try {

      const tokenAndUser =
        (await this.authService.login({email, appleId, invitationId})) ||
        {
          authToken: await Autentikigo.generateToken({email, appleId, invitationId}, '5min'),
          userData: {},
          message: serverMessages['auth']['unregisteredUser'][locale ?? LocaleEnum['pt-BR']],
          statusCode: 601
        }

      return HttpResponseToClient.createHttpResponse({
        data: {...tokenAndUser},
        message: tokenAndUser?.message ?? serverMessages['auth']['loginSuccess'][locale ?? LocaleEnum['pt-BR']],
        statusCode: tokenAndUser?.statusCode ?? 200,
        locale,
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

  @get('/auth/login')
  @response(200, {
    description: 'Login user',
    properties: HttpDocumentation.createDocResponseSchemaForFindOneResult(__User)
  })
  async login(
    @param.query.string('locale') locale?: LocaleEnum,
  ): Promise<IHttpResponse> {
    try {

      // const data = await Autentikigo.login(this.httpRequest.headers.authorization!)

      const tokenVerified = await Autentikigo.verifyJwtAuthorization(this.httpRequest.headers.authorization!)
      if (!tokenVerified) return HttpResponseToClient.unauthorizedErrorHttpResponse({
        locale,
        request: this.httpRequest,
        response: this.httpResponse,
      })

      const loginUserInfo = JwtToken.getLoginUserInfoFromToken(this.httpRequest.headers.authorization!)

      const tokenAndUser =
        (await this.authService.login(loginUserInfo)) ||
        {
          userData: {},
          message: serverMessages['auth']['unregisteredUser'][locale ?? LocaleEnum['pt-BR']],
          statusCode: 601
        }

      return HttpResponseToClient.createHttpResponse({
        data: {...tokenAndUser},
        message: tokenAndUser?.message ?? serverMessages['auth']['loginSuccess'][locale ?? LocaleEnum['pt-BR']],
        statusCode: tokenAndUser?.statusCode ?? 200,
        locale,
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

  @post('/auth/signup')
  @response(200, {
    description: 'Signup user',
  })
  async signup(
    @requestBody({
      content: HttpDocumentation.createDocRequestSchema(Signup)
    }) data: Signup,
    @param.query.string('locale') locale?: LocaleEnum,
  ): Promise<IHttpResponse> {
    try {

      // await Autentikigo.signup(data, this.httpRequest.headers.authorization!)

      const tokenVerified = await Autentikigo.verifyJwtAuthorization(this.httpRequest.headers.authorization!)
      if (!tokenVerified) return HttpResponseToClient.unauthorizedErrorHttpResponse({
        locale,
        request: this.httpRequest,
        response: this.httpResponse,
      })

      const loginUserInfo = JwtToken.getLoginUserInfoFromToken(this.httpRequest.headers.authorization!)

      await this.authService.signup(data, loginUserInfo, this.getProfile)

      return HttpResponseToClient.createHttpResponse({
        locale,
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

  @get('/auth/refresh-token')
  @response(200, {
    description: 'Refresh token',
    properties: {
      authToken: {type: String},
      authRefreshToken: {type: String},
    }
  })
  async refreshToken(
    @param.query.string('locale') locale?: LocaleEnum,
  ): Promise<IHttpResponse> {
    try {

      const data = await Autentikigo.refreshToken(this.httpRequest.headers.authorization!)

      return HttpResponseToClient.okHttpResponse({
        data,
        locale,
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
}
