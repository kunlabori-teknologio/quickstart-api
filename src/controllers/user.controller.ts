import {inject, service} from '@loopback/core';
import {
  repository
} from '@loopback/repository';
import {
  get,
  getModelSchemaRef, param, response, Response,
  RestBindings
} from '@loopback/rest';
import {User} from '../models';
import {UserRepository} from '../repositories';
import {badRequestError, ok} from '../utils/http-response';
import {UserService} from './../services/user.service';
import {localeMessage, serverMessages} from './../utils/server-messages';

export class UserController {
  constructor(
    /**
     * Repositories
     */
    @repository(UserRepository)
    public userRepository: UserRepository,
    /**
     * Services
     */
    @service(UserService)
    private userService: UserService,
    /**
     * Http injects
     */
    @inject(RestBindings.Http.RESPONSE)
    private response: Response,
  ) { }

  @get('/users/{id}')
  @response(200, {
    description: 'User model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(User, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
  ): Promise<void> {
    try {
      const data = await this.userService.getUserWithPermissions({
        condition: {where: {_id: id}},
        projectId: process.env.PROJECT_ID!,
      });
      ok({response: this.response, data, message: serverMessages['crudSuccess']['read'][localeMessage]});
    } catch (err) {
      badRequestError({
        response: this.response,
        message: serverMessages['crudError']['read'][localeMessage],
        logMessage: err.message,
      })
    }
  }

  // @post('/users')
  // @response(200, {
  //   description: 'User model instance',
  //   content: {'application/json': {schema: getModelSchemaRef(User)}},
  // })
  // async create(
  //   @requestBody({
  //     content: {
  //       'application/json': {
  //         schema: getModelSchemaRef(User, {
  //           title: 'NewUser',
  //           exclude: ['_id'],
  //         }),
  //       },
  //     },
  //   })
  //   user: Omit<User, '_id'>,
  // ): Promise<User> {
  //   return this.userRepository.create(user);
  // }

  // @get('/users/count')
  // @response(200, {
  //   description: 'User model count',
  //   content: {'application/json': {schema: CountSchema}},
  // })
  // async count(
  //   @param.where(User) where?: Where<User>,
  // ): Promise<Count> {
  //   return this.userRepository.count(where);
  // }

  // @get('/users')
  // @response(200, {
  //   description: 'Array of User model instances',
  //   content: {
  //     'application/json': {
  //       schema: {
  //         type: 'array',
  //         items: getModelSchemaRef(User, {includeRelations: true}),
  //       },
  //     },
  //   },
  // })
  // async find(
  //   @param.filter(User) filter?: Filter<User>,
  // ): Promise<User[]> {
  //   return this.userRepository.find(filter);
  // }

  // @patch('/users')
  // @response(200, {
  //   description: 'User PATCH success count',
  //   content: {'application/json': {schema: CountSchema}},
  // })
  // async updateAll(
  //   @requestBody({
  //     content: {
  //       'application/json': {
  //         schema: getModelSchemaRef(User, {partial: true}),
  //       },
  //     },
  //   })
  //   user: User,
  //   @param.where(User) where?: Where<User>,
  // ): Promise<Count> {
  //   return this.userRepository.updateAll(user, where);
  // }

  // @patch('/users/{id}')
  // @response(204, {
  //   description: 'User PATCH success',
  // })
  // async updateById(
  //   @param.path.string('id') id: string,
  //   @requestBody({
  //     content: {
  //       'application/json': {
  //         schema: getModelSchemaRef(User, {partial: true}),
  //       },
  //     },
  //   })
  //   user: User,
  // ): Promise<void> {
  //   await this.userRepository.updateById(id, user);
  // }

  // @put('/users/{id}')
  // @response(204, {
  //   description: 'User PUT success',
  // })
  // async replaceById(
  //   @param.path.string('id') id: string,
  //   @requestBody() user: User,
  // ): Promise<void> {
  //   await this.userRepository.replaceById(id, user);
  // }

  // @del('/users/{id}')
  // @response(204, {
  //   description: 'User DELETE success',
  // })
  // async deleteById(@param.path.string('id') id: string): Promise<void> {
  //   await this.userRepository.deleteById(id);
  // }
}
