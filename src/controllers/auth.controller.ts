import {inject, service} from '@loopback/core';
import {Model, model, property} from '@loopback/repository';
import {
  getModelSchemaRef, post,
  requestBody,
  response,
  Response,
  RestBindings
} from '@loopback/rest';
import {AuthService} from '../services';

// SSO types enum
enum SSOType {
  GOOGLE = 'google',
  APPLE = 'apple',
}

// Auth (Login and Signup) schema model
@model()
class AuthSchema extends Model {
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
}

export class AuthController {
  constructor(
    @inject(RestBindings.Http.RESPONSE)
    private response: Response,

    @service(AuthService)
    private authService: AuthService,
  ) { }

  @post('auth/signup')
  @response(200, {
    description: 'Token to authenticate',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          example: {'token': 'string'}
        }
      }
    }
  })
  async signup(
    @requestBody({
      content: {
        'application/json': {schema: getModelSchemaRef(AuthSchema)}
      }
    })
    signupeRequest: AuthSchema
  ): Promise<Response> {

    const token = await this.authService.authenticateUser(signupeRequest.ssoId, signupeRequest.sso, signupeRequest.project);

    // let token = await this.authService.createUser(signupeRequest.email, signupeRequest.password);

    return this.response.status(200).send({
      'token': token,
    });
  }

  @post('auth/login')
  @response(200, {
    description: 'Token to authenticate',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          example: {'token': 'string'}
        }
      }
    }
  })
  async login(
    @requestBody({
      content: {
        'application/json': {schema: getModelSchemaRef(AuthSchema)}
      }
    })
    loginRequest: AuthSchema
  ): Promise<Response> {
    // await this.authService.emailExists(loginRequest.email);

    // let token = await this.authService.checkPasswordAndGetToken(loginRequest.email, loginRequest.password);

    return this.response.status(200).send({
      'token': 'token',
    });
  }
}
