import {inject, service} from '@loopback/core';
import {
  get, getModelSchemaRef, HttpErrors, OperationVisibility, param, post, Request, requestBody, Response,
  RestBindings,
  visibility
} from '@loopback/rest';
import {URLSearchParams} from 'url';
import {Signup} from '../models/signup.model';
import {AuthService} from '../services';

export class AuthController {
  constructor(
    @inject(RestBindings.Http.RESPONSE)
    private response: Response,

    @inject(RestBindings.Http.REQUEST)
    private request: Request,

    @service(AuthService)
    private authService: AuthService,
  ) { }

  @get('auth/google-signin')
  async googleLogin(
    @param.query.string('projectId') project: string,
    @param.query.string('inviteToken') inviteToken: string,
  ): Promise<void> {
    const url = await this.authService.getGoogleAuthURL(project, inviteToken);
    return this.response.redirect(url);
  }

  @visibility(OperationVisibility.UNDOCUMENTED)
  @get('auth/google')
  async getUserDataFromGoogle(
    @param.query.string('code') code: string,
    @param.query.string('state') state: string,
  ): Promise<void> {
    const googleUser: ISsoUser = await this.authService.getGoogleAuthenticatedUser(code);
    const stateParams = new URLSearchParams(state);
    const token: string = await this.authService.getTokenToAuthenticateUser(googleUser, stateParams.get('project')!, stateParams.get('invite')!);
    return this.response.redirect(`${process.env.UI_SPLASH_URI}?token=${token}`);
  }

  @get('auth/get-user')
  async getSumaryUserInfo(): Promise<ISumaryUser> {
    let authorization = this.request.headers.authorization!;
    if (!authorization) throw new HttpErrors[401]('Unauthorized')
    authorization = authorization.split(' ')[1];
    const user = await this.authService.getUser(authorization);
    return user;
  }

  @post('auth/signup')
  async signup(
    @requestBody({
      content: {
        'application/json': {schema: getModelSchemaRef(Signup)}
      }
    })
    signupeRequest: Signup
  ): Promise<ISumaryUser> {
    let authorization = this.request.headers.authorization!;
    if (!authorization) throw new HttpErrors[401]('Unauthorized')
    authorization = authorization.split(' ')[1];
    return this.authService.createUser(authorization, signupeRequest.uniqueId.replace(/\D/g, ""), signupeRequest.birthday, signupeRequest.country);
  }

  @get('auth/refresh-token/{projectSecret}')
  async refreshToken(
    @param.path.string('projectSecret') projectSecret: string,
  ): Promise<string> {
    let authorization = this.request.headers.authorization as string;
    if (!authorization) throw new HttpErrors[401]('Unauthorized')
    authorization = authorization.split(' ')[1];
    const token = await this.authService.refreshToken(authorization, projectSecret);
    return token;
  }
}
