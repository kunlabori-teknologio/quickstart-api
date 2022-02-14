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
import {Http} from '../entities/http.entity';
import {ILoginUserInfo} from '../interfaces/auth.interface';
import {Signup} from '../models/signup.model';
import {User} from '../models/user.model';
import {AuthService} from '../services';
import {localeMessage, serverMessages} from './../utils/server-messages';

export class AuthController {

  private httpClass

  constructor(
    @inject(RestBindings.Http.REQUEST) private httpRequest: Request,
    @inject(RestBindings.Http.RESPONSE) private httpResponse: Response,

    @service(AuthService) private authService: AuthService,
  ) {
    this.httpClass = new Http({response: this.httpResponse, request: this.httpRequest})
  }

  @get('auth/google-signin')
  @response(200, {description: 'Redirect to Google login page'})
  async redirectToGoogleLoginPage(
    @param.query.string('invitationId') invitationId?: string,
  ): Promise<void> {
    try {
      const invitationParam = invitationId ? `invitationId=${invitationId}` : ''
      const url = await this.authService.getGoogleLoginPageURL(invitationParam)
      this.httpResponse.redirect(url)
    } catch (err) {
      this.httpClass.badRequestErrorResponse({
        message: serverMessages['auth']['getGoogleUrl'][localeMessage],
        logMessage: err.message
      })
    }
  }

  @visibility(OperationVisibility.UNDOCUMENTED)
  @get('auth/google')
  async handleGoogleCodeAndReturnToken(
    @param.query.string('code') code: string,
    @param.query.string('state') state?: string,
  ): Promise<void> {
    try {
      const googleUser = await this.authService.getGoogleUser(code)
      const invitationId = new URLSearchParams(state).get('invitationId')
      const token = this.authService.createGoogleLoginToken(googleUser, invitationId)
      this.httpResponse.redirect(`${process.env.CLIENT_URI}?token=${token}`)
    } catch (err) {
      this.httpClass.badRequestErrorResponse({
        message: serverMessages['auth']['getGoogleUser'][localeMessage],
        logMessage: err.message
      })
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
  async login(): Promise<void> {
    try {
      const payload = this.httpClass.verifyToken(this.httpRequest.headers.authorization!, process.env.PROJECT_SECRET!)
      const tokenAndUser = await this.authService.login(payload as ILoginUserInfo)
      this.httpClass.okResponse({
        data: {...tokenAndUser},
        message: serverMessages['auth'][tokenAndUser?.authToken ? 'loginSuccess' : 'unregisteredUser'][localeMessage],
        statusCode: tokenAndUser?.authToken ? 200 : 601
      })
    } catch (err) {
      this.httpClass.badRequestErrorResponse({logMessage: err.message})
    }
  }

  @post('auth/signup')
  @response(200, {
    description: 'User registered',
    properties: new Http().findOneSchema(User, true)
  })
  async signup(
    @requestBody({content: new Http().requestSchema(Signup)}) data: Signup,
  ): Promise<void> {
    try {
      const payload = this.httpClass.verifyToken(this.httpRequest.headers.authorization!, process.env.PROJECT_SECRET!)
      const userWithProfile = await this.authService.signup(data, payload!)

      this.httpClass.okResponse({
        message: serverMessages['auth']['signupSuccess'][localeMessage],
        data: userWithProfile
      })
    } catch (err) {
      this.httpClass.badRequestErrorResponse({
        message: err.message,
        logMessage: err.message,
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
  async refreshToken(): Promise<void> {
    try {
      const payload = this.httpClass.verifyToken(this.httpRequest.headers.authorization!, process.env.PROJECT_SECRET!)
      const authToken = await this.authService.refreshToken(payload?.id);
      this.httpClass.okResponse({
        data: authToken,
        message: serverMessages['auth']['refreshTokenSuccess'][localeMessage]
      })
    } catch (err) {
      this.httpClass.badRequestErrorResponse({
        message: serverMessages['auth']['refreshTokenError'][localeMessage],
        logMessage: err.message,
      })
    }
  }
}
