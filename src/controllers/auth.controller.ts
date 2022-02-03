import {inject, service} from '@loopback/core';
import {
  Request, Response,
  RestBindings
} from '@loopback/rest';
import {AuthService} from '../services';

export class AuthController {
  constructor(
    /**
     * Http injects
     */
    @inject(RestBindings.Http.REQUEST)
    private request: Request,
    @inject(RestBindings.Http.RESPONSE)
    private response: Response,
    /**
     * Services
     */
    @service(AuthService)
    private authService: AuthService,
  ) { }

  // @get('auth/google-url')
  // @response(200, {
  //   description: 'Google login page URL',
  //   content: {
  //     'application/json': {
  //       schema: {
  //         type: 'string',
  //         title: 'Google login page url',
  //       }
  //     },
  //   },
  // })
  // async googleLogin(): Promise<void> {
  //   try {
  //     const url = await this.authService.getGoogleAuthURL();
  //     ok({response: this.response, data: url});
  //   } catch (err) {
  //     internalServerError({response: this.response, message: err.message});
  //   }
  // }

  // @get('auth/login')
  // @response(200, {
  //   description: 'User login',
  //   content: {
  //     'application/json': {
  //       schema: {
  //         type: 'object',
  //         title: 'User login',
  //         properties: {
  //           authToken: {type: 'string'},
  //           user: getModelSchemaRef(User, {includeRelations: true}),
  //         },
  //       },
  //     },
  //   },
  // })
  // async login(
  //   @param.query.string('code') code: string,
  // ): Promise<IRegistryCheck | void> {
  //   const registryCheck = await this.authService.login({code, response: this.response});
  //   return registryCheck;
  // }

  // @post('auth/signup')
  // @response(200, {
  //   description: 'User registered',
  //   content: {
  //     'application/json': {
  //       schema: {
  //         type: 'object',
  //         title: 'User registered',
  //         properties: {
  //           authToken: {type: 'string'},
  //           user: getModelSchemaRef(User, {includeRelations: true}),
  //         },
  //       },
  //     },
  //   },
  // })
  // async signup(
  //   @requestBody({
  //     content: {
  //       'application/json': {schema: getModelSchemaRef(Signup)}
  //     }
  //   })
  //   signupeRequest: Signup
  // ): Promise<void> {
  //   try {
  //     let authToken = getAuthTokenFromHeader(this.request.headers, this.response);
  //     const data = await this.authService.createUser({
  //       ...signupeRequest,
  //       authToken,
  //       response: this.response
  //     });
  //     ok({response: this.response, data});
  //   } catch (err) {
  //     badRequestError({
  //       response: this.response,
  //       message: err.message,
  //       logMessage: err.message,
  //     });
  //   }
  // }

  // @get('auth/refresh-token')
  // async refreshToken(): Promise<string> {
  //   let authToken = getAuthTokenFromHeader(this.request.headers, this.response);
  //   const token = await this.authService.refreshToken(authToken);
  //   return token;
  // }
}
