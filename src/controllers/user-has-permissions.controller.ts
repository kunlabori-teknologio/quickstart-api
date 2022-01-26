import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
  response,
} from '@loopback/rest';
import {UserHasPermissions} from '../models';
import {UserHasPermissionsRepository} from '../repositories';

export class UserHasPermissionsController {
  constructor(
    @repository(UserHasPermissionsRepository)
    public userHasPermissionsRepository : UserHasPermissionsRepository,
  ) {}

  @post('/user-has-permissions')
  @response(200, {
    description: 'UserHasPermissions model instance',
    content: {'application/json': {schema: getModelSchemaRef(UserHasPermissions)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UserHasPermissions, {
            title: 'NewUserHasPermissions',
            exclude: ['_id'],
          }),
        },
      },
    })
    userHasPermissions: Omit<UserHasPermissions, '_id'>,
  ): Promise<UserHasPermissions> {
    return this.userHasPermissionsRepository.create(userHasPermissions);
  }

  @get('/user-has-permissions/count')
  @response(200, {
    description: 'UserHasPermissions model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(UserHasPermissions) where?: Where<UserHasPermissions>,
  ): Promise<Count> {
    return this.userHasPermissionsRepository.count(where);
  }

  @get('/user-has-permissions')
  @response(200, {
    description: 'Array of UserHasPermissions model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(UserHasPermissions, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(UserHasPermissions) filter?: Filter<UserHasPermissions>,
  ): Promise<UserHasPermissions[]> {
    return this.userHasPermissionsRepository.find(filter);
  }

  @patch('/user-has-permissions')
  @response(200, {
    description: 'UserHasPermissions PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UserHasPermissions, {partial: true}),
        },
      },
    })
    userHasPermissions: UserHasPermissions,
    @param.where(UserHasPermissions) where?: Where<UserHasPermissions>,
  ): Promise<Count> {
    return this.userHasPermissionsRepository.updateAll(userHasPermissions, where);
  }

  @get('/user-has-permissions/{id}')
  @response(200, {
    description: 'UserHasPermissions model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(UserHasPermissions, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(UserHasPermissions, {exclude: 'where'}) filter?: FilterExcludingWhere<UserHasPermissions>
  ): Promise<UserHasPermissions> {
    return this.userHasPermissionsRepository.findById(id, filter);
  }

  @patch('/user-has-permissions/{id}')
  @response(204, {
    description: 'UserHasPermissions PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UserHasPermissions, {partial: true}),
        },
      },
    })
    userHasPermissions: UserHasPermissions,
  ): Promise<void> {
    await this.userHasPermissionsRepository.updateById(id, userHasPermissions);
  }

  @put('/user-has-permissions/{id}')
  @response(204, {
    description: 'UserHasPermissions PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() userHasPermissions: UserHasPermissions,
  ): Promise<void> {
    await this.userHasPermissionsRepository.replaceById(id, userHasPermissions);
  }

  @del('/user-has-permissions/{id}')
  @response(204, {
    description: 'UserHasPermissions DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.userHasPermissionsRepository.deleteById(id);
  }
}
