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
import {PermissionHasAcls} from '../models';
import {PermissionHasAclsRepository} from '../repositories';

export class PermissionHasAclsController {
  constructor(
    @repository(PermissionHasAclsRepository)
    public permissionHasAclsRepository : PermissionHasAclsRepository,
  ) {}

  @post('/permission-has-acls')
  @response(200, {
    description: 'PermissionHasAcls model instance',
    content: {'application/json': {schema: getModelSchemaRef(PermissionHasAcls)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(PermissionHasAcls, {
            title: 'NewPermissionHasAcls',
            exclude: ['_id'],
          }),
        },
      },
    })
    permissionHasAcls: Omit<PermissionHasAcls, '_id'>,
  ): Promise<PermissionHasAcls> {
    return this.permissionHasAclsRepository.create(permissionHasAcls);
  }

  @get('/permission-has-acls/count')
  @response(200, {
    description: 'PermissionHasAcls model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(PermissionHasAcls) where?: Where<PermissionHasAcls>,
  ): Promise<Count> {
    return this.permissionHasAclsRepository.count(where);
  }

  @get('/permission-has-acls')
  @response(200, {
    description: 'Array of PermissionHasAcls model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(PermissionHasAcls, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(PermissionHasAcls) filter?: Filter<PermissionHasAcls>,
  ): Promise<PermissionHasAcls[]> {
    return this.permissionHasAclsRepository.find(filter);
  }

  @patch('/permission-has-acls')
  @response(200, {
    description: 'PermissionHasAcls PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(PermissionHasAcls, {partial: true}),
        },
      },
    })
    permissionHasAcls: PermissionHasAcls,
    @param.where(PermissionHasAcls) where?: Where<PermissionHasAcls>,
  ): Promise<Count> {
    return this.permissionHasAclsRepository.updateAll(permissionHasAcls, where);
  }

  @get('/permission-has-acls/{id}')
  @response(200, {
    description: 'PermissionHasAcls model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(PermissionHasAcls, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(PermissionHasAcls, {exclude: 'where'}) filter?: FilterExcludingWhere<PermissionHasAcls>
  ): Promise<PermissionHasAcls> {
    return this.permissionHasAclsRepository.findById(id, filter);
  }

  @patch('/permission-has-acls/{id}')
  @response(204, {
    description: 'PermissionHasAcls PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(PermissionHasAcls, {partial: true}),
        },
      },
    })
    permissionHasAcls: PermissionHasAcls,
  ): Promise<void> {
    await this.permissionHasAclsRepository.updateById(id, permissionHasAcls);
  }

  @put('/permission-has-acls/{id}')
  @response(204, {
    description: 'PermissionHasAcls PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() permissionHasAcls: PermissionHasAcls,
  ): Promise<void> {
    await this.permissionHasAclsRepository.replaceById(id, permissionHasAcls);
  }

  @del('/permission-has-acls/{id}')
  @response(204, {
    description: 'PermissionHasAcls DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.permissionHasAclsRepository.deleteById(id);
  }
}
