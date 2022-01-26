import {inject, service} from '@loopback/core';
import {
  get, getModelSchemaRef, HttpErrors, OperationVisibility, param, post, Request, requestBody, Response,
  RestBindings,
  visibility
} from '@loopback/rest';
import {URLSearchParams} from 'url';
import {Signup} from '../models/signup.model';
import {AuthService} from '../services';
import {IRegistryCheck, ISumaryUser} from './../interfaces/auth.interface';

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
    @param.query.string('redirectUri') redirectUri: string,
  ): Promise<void> {
    const url = await this.authService.getGoogleAuthURL(redirectUri);
    return this.response.redirect(url);
  }

  @visibility(OperationVisibility.UNDOCUMENTED)
  @get('auth/google')
  async getUserDataFromGoogle(
    @param.query.string('code') code: string,
    @param.query.string('state') state: string,
  ): Promise<void> {
    const redirectUri = new URLSearchParams(state).get('redirectUri');
    return this.response.redirect(`${redirectUri}?token=${code}`);
  }

  @get('auth')
  async getSumaryUserInfo(
    @param.query.string('code') code: string,
  ): Promise<IRegistryCheck> {
    const registryCheck = await this.authService.checkUser(code);
    return registryCheck;
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
    let authToken = this.request.headers.authorization!;
    if (!authToken) throw new HttpErrors[401]('Unauthorized')
    authToken = authToken.split(' ')[1];
    return this.authService.createUser({authToken, ...signupeRequest});
    // signupeRequest.uniqueId.replace(/\D/g, ""),
    // signupeRequest.birthday, signupeRequest.country

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
