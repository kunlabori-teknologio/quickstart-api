import {service} from '@loopback/core';
import {
  repository
} from '@loopback/repository';
import {
  get, param, response
} from '@loopback/rest';
import {UserRepository} from '../repositories';
import {UserService} from '../services';

export class UserController {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,

    @service(UserService)
    private userService: UserService,
  ) { }

  @get('/users/{id}')
  @response(200, {
    description: 'User info',
    // content: {
    //   'application/json': {
    //     schema: getModelSchemaRef(User, {includeRelations: true}),
    //   },
    // },
  })
  async findById(
    @param.path.string('id') id: string,
  ): Promise<any> {
    return this.userService.getUserInfo(id);
  }

  @get('/users/ACL/{userId}/{projectId}')
  @response(200, {
    description: 'ACL',
    // content: {
    //   'application/json': {
    //     schema: getModelSchemaRef(User, {includeRelations: true}),
    //   },
    // },
  })
  async findACL(
    @param.path.string('userId') userId: string,
    @param.path.string('projectId') projectId: string,
  ): Promise<any> {
    return this.userService.getUserACL(userId, projectId);
  }

  // @del('/users/{id}')
  // @response(204, {
  //   description: 'User DELETE success',
  // })
  // async deleteById(@param.path.string('id') id: string): Promise<void> {
  //   await this.userRepository.deleteById(id);
  // }
}
