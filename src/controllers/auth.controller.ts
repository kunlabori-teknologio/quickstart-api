import {inject, service} from '@loopback/core';
import {
  get, getModelSchemaRef, OperationVisibility, param, post, Request, requestBody, Response,
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
    const googleUser: SsoUser = await this.authService.getGoogleAuthenticatedUser(code);
    const stateParams = new URLSearchParams(state);
    const token: string = await this.authService.getTokenToAuthenticateUser(googleUser, stateParams.get('project')!, stateParams.get('invite')!);
    return this.response.redirect(`${process.env.UI_SPLASH_URI}?token=${token}`);
  }

  @get('auth/get-user')
  async getSumaryUserInfo(): Promise<SumaryUser> {
    let authorization = this.request.headers.authorization!;
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
  ): Promise<SumaryUser> {
    let authorization = this.request.headers.authorization!;
    authorization = authorization.split(' ')[1];
    return this.authService.createUser(authorization, signupeRequest.uniqueId, signupeRequest.birthday);
  }

  // @get('auth/refresh-token/{projectSecret}')
  // async refreshToken(
  //   @param.path.string('projectSecret') projectSecret: string,
  // ): Promise<any> {
  //   let authorization = this.request.headers.authorization as string;
  //   authorization = authorization.split(' ')[1];

  //   const decodedToken = await this.authService.getTokenPayload(authorization);

  //   // Check project
  //   const credentialsAreValid = await this.authService.checkProjectAndSecret(decodedToken.projectId, projectSecret);

  //   if (!credentialsAreValid) throw new HttpErrors['400']('Invalid credentials');

  //   const token = await this.authService.createToken({
  //     userId: decodedToken.userId,
  //     projectId: decodedToken.projectId
  //   }, process.env.JWT_SECRET as string, '10m');
  //   const user = await this.userService.getUserInfo(token);

  //   return {
  //     token,
  //     user,
  //   };
  // }
}
