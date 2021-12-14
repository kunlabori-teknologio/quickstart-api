import {inject, service} from '@loopback/core';
import {Model, model, property} from '@loopback/repository';
import {
  get, getModelSchemaRef, OperationVisibility, param, post, Request, requestBody, Response,
  RestBindings,
  visibility
} from '@loopback/rest';
import {AuthService, UserService} from '../services';

// SSO types enum
enum SSOType {
  GOOGLE = 'google',
  APPLE = 'apple',
}

// Signup schema model
@model()
class SignupSchema extends Model {
  @property({
    required: true,
  })
  ssoId: string;

  @property({
    required: true,
    jsonSchema: {
      enum: Object.values(SSOType),
    }
  })
  sso: string;

  @property({
    required: true,
  })
  project: string;

  @property({
    required: true,
    description: 'Person/Company Unique ID such as CPF and CNPJ',
  })
  uniqueId: string;

  @property({
    required: true,
    description: 'Birthday format: DD/MM/YYYY'
  })
  birthday: string;
}

export class AuthController {
  constructor(
    @inject(RestBindings.Http.RESPONSE)
    private response: Response,

    @inject(RestBindings.Http.REQUEST)
    private request: Request,

    @service(AuthService)
    private authService: AuthService,

    @service(UserService)
    private userService: UserService,
  ) { }

  @visibility(OperationVisibility.UNDOCUMENTED)
  @post('auth/signup')
  async signup(
    @requestBody({
      content: {
        'application/json': {schema: getModelSchemaRef(SignupSchema)}
      }
    })
    signupeRequest: SignupSchema
  ): Promise<any> {

    const token = await this.authService.authenticateUser(
      signupeRequest.ssoId,
      signupeRequest.sso,
      signupeRequest.project,
      signupeRequest.uniqueId,
      signupeRequest.birthday
    );

    return {redirectUri: `${process.env.UI_SPLASH_URI}/${token}`};
  }

  @get('auth/google-signin')
  async googleLogin(
    @param.query.string('projectId') project: string,
  ): Promise<any> {

    const url = await this.authService.getGoogleAuthURL('auth/google', project);

    return this.response.redirect(url);
  }

  @visibility(OperationVisibility.UNDOCUMENTED)
  @get('auth/google')
  async authenticateUser(
    @param.query.string('code') code: string,
    @param.query.string('state') state: string,
  ): Promise<void> {
    const userAuthenticated = await this.authService.authenticateGoogleUser('auth/google', code, state);

    if (userAuthenticated.signup) {
      await this.response.cookie('sso', 'google');
      await this.response.cookie('ssoId', userAuthenticated.ssoId);
      await this.response.cookie('project', userAuthenticated.project);
      return this.response.redirect(`/signup.html`);
    }

    return this.response.redirect(userAuthenticated.redirectUri);
  }

  @get('auth/token')
  async getToken(
    @param.query.string('code') code: string,
    @param.query.string('secret') secret: string,
  ): Promise<any> {

    const decodedToken = await this.authService.verifyToken(code, secret);

    const authToken = await this.authService.createToken({
      userId: decodedToken.userId,
      projectId: decodedToken.projectId
    }, process.env.JWT_SECRET as string, '7d');

    const refreshToken = await this.authService.createToken({
      userId: decodedToken.userId,
      projectId: decodedToken.projectId
    }, process.env.JWT_REFRESH_SECRET as string, '14d');

    return {
      token: authToken,
      refreshToken: refreshToken,
    };
  }

  @get('auth/get-user')
  async getUser(): Promise<any> {

    let authorization = this.request.headers.authorization as string;
    authorization = authorization.split(' ')[1];

    const user = await this.userService.getUserInfo(authorization);

    return user;
  }
}
