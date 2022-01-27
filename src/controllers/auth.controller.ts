import {inject, service} from '@loopback/core';
import {
  get, getModelSchemaRef, OperationVisibility, param, post, Request, requestBody, response, Response,
  RestBindings,
  visibility
} from '@loopback/rest';
import {URLSearchParams} from 'url';
import {User} from '../models';
import {Signup} from '../models/signup.model';
import {AuthService} from '../services';
import {getAuthTokenFromHeader} from '../utils/general-functions';
import {IRegistryCheck} from './../interfaces/auth.interface';

export class AuthController {
  constructor(
    @inject(RestBindings.Http.RESPONSE)
    private response: Response,

    @inject(RestBindings.Http.REQUEST)
    private request: Request,

    @service(AuthService)
    private authService: AuthService,
  ) { }

  @get('auth/web/google-signin')
  @response(204, {
    description: 'Get google login page URL',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          title: 'Google login page url',
          properties: {
            url: {type: 'string'}
          },
        }
      },
    },
  })
  async googleLogin(
    @param.query.string('redirectUri') redirectUri: string,
  ): Promise<any> {
    const url = await this.authService.getGoogleAuthURL(redirectUri);
    return {url};
  }

  @get('auth/web/apple-signin')
  @response(204, {
    description: 'Redirect user to google login page',
  })
  async appleLogin(
    @param.query.string('redirectUri') redirectUri: string,
  ): Promise<void> { }

  @visibility(OperationVisibility.UNDOCUMENTED)
  @get('auth/google')
  async getUserDataFromGoogle(
    @param.query.string('code') code: string,
    @param.query.string('state') state: string,
  ): Promise<void> {
    const redirectUri = new URLSearchParams(state).get('redirectUri');
    return this.response.redirect(`${redirectUri}?token=${code}`);
  }

  @get('auth/check')
  @response(200, {
    description: 'User registration verification',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          title: 'User registration verification',
          properties: {
            registeredUser: {type: 'boolean'},
            authToken: {type: 'string'},
            user: getModelSchemaRef(User, {includeRelations: true}),
          },
        },
      },
    },
  })
  async getSumaryUserInfo(
    @param.query.string('code') code: string,
    @param.query.string('projectId') projectId: string,
    @param.query.string('permissionId') permissionId?: string,
  ): Promise<IRegistryCheck> {
    const registryCheck = await this.authService.checkUser(code, projectId, permissionId);
    return registryCheck;
  }

  @post('auth/signup')
  @response(200, {
    description: 'User registered',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          title: 'User registered',
          properties: {
            registeredUser: {type: 'boolean'},
            authToken: {type: 'string'},
            user: getModelSchemaRef(User, {includeRelations: true}),
          },
        },
      },
    },
  })
  async signup(
    @requestBody({
      content: {
        'application/json': {schema: getModelSchemaRef(Signup)}
      }
    })
    signupeRequest: Signup
  ): Promise<IRegistryCheck> {
    let authToken = getAuthTokenFromHeader(this.request.headers);
    return this.authService.createUser({authToken, ...signupeRequest});
  }

  @get('auth/refresh-token/{projectSecret}')
  async refreshToken(
    @param.path.string('projectSecret') projectSecret: string,
  ): Promise<string> {
    let authToken = getAuthTokenFromHeader(this.request.headers);
    const token = await this.authService.refreshToken(authToken, projectSecret);
    return token;
  }
}
