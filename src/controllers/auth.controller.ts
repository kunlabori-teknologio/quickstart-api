import {inject, service} from '@loopback/core';
import {Model, model, property} from '@loopback/repository';
import {
  get, getModelSchemaRef, param, post, requestBody, Response,
  RestBindings
} from '@loopback/rest';
import {AuthService} from '../services';

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
  acl: string;

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

// // Login schema model
// @model()
// class LoginSchema extends Model {
//   @property({
//     required: true,
//   })
//   ssoId: string;

//   @property({
//     required: true,
//     jsonSchema: {
//       enum: Object.values(SSOType),
//     }
//   })
//   sso: string;

//   @property({
//     required: true,
//   })
//   project: string;
// }

export class AuthController {
  constructor(
    @inject(RestBindings.Http.RESPONSE)
    private response: Response,

    @service(AuthService)
    private authService: AuthService,
  ) { }

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
      signupeRequest.acl,
      signupeRequest.uniqueId,
      signupeRequest.birthday
    );

    return {redirectUri: `${process.env.UI_SPLASH_URI}?token=${token}`};

    // this.response.cookie(`${process.env.PROJECT_NAME}_auth_data`, userAuthenticated);

    // return this.response.redirect(process.env.UI_SPLASH_URI as string);
  }

  @get('auth/google-signin')
  async googleLogin(): Promise<any> {

    const url = await this.authService.getGoogleAuthURL('auth/google');

    return this.response.redirect(url);
  }

  @get('auth/google')
  async authenticateUser(@param.query.string('code') code: string): Promise<void> {

    const userAuthenticated = await this.authService.authenticateGoogleUser('auth/google', code);

    if (userAuthenticated.signup) {
      await this.response.cookie('sso', 'google');
      await this.response.cookie('ssoId', userAuthenticated.ssoId);
      return this.response.redirect(`/signup.html`);
    }

    return this.response.redirect(userAuthenticated.redirectUri);
  }

  // @post('auth/login')
  // @response(200, {
  //   description: 'Token to authenticate',
  //   content: {
  //     'application/json': {
  //       schema: {
  //         type: 'object',
  //         example: {'token': 'string'}
  //       }
  //     }
  //   }
  // })
  // async login(
  //   @requestBody({
  //     content: {
  //       'application/json': {schema: getModelSchemaRef(LoginSchema)}
  //     }
  //   })
  //   loginRequest: LoginSchema
  // ): Promise<Response> {

  //   const token = await this.authService.authenticateUser(loginRequest.ssoId, loginRequest.sso, loginRequest.project, '');

  //   return this.response.status(200).send({
  //     'token': token,
  //   });
  // }
}
