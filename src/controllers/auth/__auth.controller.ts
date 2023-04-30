// Uncomment these imports to begin using these cool features!
import {inject, service} from '@loopback/core';
import {Request, Response, RestBindings, get, param, post, requestBody, response} from '@loopback/rest';
import {IHttpResponse} from '../../interfaces/http.interface';
import {Autentikigo} from '../../services';
import {Login, Signup} from '../../usecases/auth';
import {GenerateJwt, VerifyAuthToken} from '../../usecases/jwt';
import {getSwaggerRequestBodySchema, getSwaggerResponseSchema} from '../../utils/general-functions';
import {badRequestErrorHttpResponse, createHttpResponse, okHttpResponse} from '../../utils/http-response.util';
import {serverMessages} from '../../utils/server-messages';

export class __AuthController {

  constructor(
    @inject(RestBindings.Http.REQUEST) private httpRequest: Request,
    @inject(RestBindings.Http.RESPONSE) private httpResponse: Response,

    @service(Autentikigo) private autentikigo: Autentikigo,
    @service(Login) private login: Login,
    @service(Signup) private signup: Signup,

  ) {}

  @get('/auth/google-signin')
  @response(200, {
    description: 'Redirect to google login page',
  })
  async googleSignin(
    @param.query.string('invitationId') invitationId: string
  ): Promise<IHttpResponse | void> {
    try {

      const googleLoginUrl = await this.autentikigo.webGoogleLoginUrl(invitationId);
      this.httpResponse.redirect(googleLoginUrl);

    } catch (err) {

      return badRequestErrorHttpResponse({
        logMessage: err.message,
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
  ): Promise<IHttpResponse | void> {
    try {

      const appleLoginUrl = await this.autentikigo.webAppleLoginUrl(invitationId);
      this.httpResponse.redirect(appleLoginUrl);

    } catch (err) {

      return badRequestErrorHttpResponse({
        logMessage: err.message,
        request: this.httpRequest,
        response: this.httpResponse,
      })

    }
  }

  @get('/auth/login')
  @response(200, getSwaggerResponseSchema())
  async authLogin(): Promise<IHttpResponse> {
    try {

      const token = this.httpRequest.headers.authorization;
      const loginUserInfo = new VerifyAuthToken().execute(token);

      const tokenAndUser =
        (await this.login.execute(loginUserInfo)) ||
        {
          userData: {},
          message: serverMessages.auth.unregisteredUser['pt-BR'],
          statusCode: 601
        }

      return okHttpResponse({
        data: {...tokenAndUser},
        message: tokenAndUser?.message ?? serverMessages.auth.loginSuccess['pt-BR'],
        statusCode: tokenAndUser?.statusCode ?? 200,
        request: this.httpRequest,
        response: this.httpResponse,
      })

    } catch (err) {

      return badRequestErrorHttpResponse({
        logMessage: err.message,
        request: this.httpRequest,
        response: this.httpResponse,
      })

    }
  }

  @post('/auth/signup')
  @response(200, {
    description: 'Signup user',
  })
  async authSignup(
    @requestBody(getSwaggerRequestBodySchema({
      'uniqueId': {type: 'string'},
      'birthday': {type: 'string'},
    }, [])) data: any,
    // @param.query.string('country') countryId?: string,
  ): Promise<IHttpResponse> {
    try {

      const token = this.httpRequest.headers.authorization;
      const loginUserInfo = new VerifyAuthToken().execute(token);

      await this.signup.execute(
        data,
        loginUserInfo
      );

      return createHttpResponse({
        request: this.httpRequest,
        response: this.httpResponse,
      })

    } catch (err) {

      return badRequestErrorHttpResponse({
        logMessage: err.message,
        request: this.httpRequest,
        response: this.httpResponse,
      })

    }
  }

  @get('/auth/refresh-token')
  @response(200, getSwaggerResponseSchema({
    authToken: {type: 'string'},
    authRefreshToken: {type: 'string'},
  }))
  async refreshToken(): Promise<IHttpResponse> {
    try {

      const token = this.httpRequest.headers.authorization;
      const payload = new VerifyAuthToken().execute(token);

      const authToken = new GenerateJwt().execute({ id: payload?._id }, '1d');
      const authRefreshToken = new GenerateJwt().execute({ id: payload?._id }, '7d');

      return okHttpResponse({
        data: { authToken, authRefreshToken },
        request: this.httpRequest,
        response: this.httpResponse,
      })

    } catch (err) {

      return badRequestErrorHttpResponse({
        logMessage: err.message,
        request: this.httpRequest,
        response: this.httpResponse,
      })

    }
  }
}
