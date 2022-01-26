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
import {AclHasActions} from '../models';
import {AclHasActionsRepository} from '../repositories';

export class AclHasActionsController {
  constructor(
    @repository(AclHasActionsRepository)
    public aclHasActionsRepository : AclHasActionsRepository,
  ) {}

  @post('/acl-has-actions')
  @response(200, {
    description: 'AclHasActions model instance',
    content: {'application/json': {schema: getModelSchemaRef(AclHasActions)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(AclHasActions, {
            title: 'NewAclHasActions',
            exclude: ['_id'],
          }),
        },
      },
    })
    aclHasActions: Omit<AclHasActions, '_id'>,
  ): Promise<AclHasActions> {
    return this.aclHasActionsRepository.create(aclHasActions);
  }

  @get('/acl-has-actions/count')
  @response(200, {
    description: 'AclHasActions model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(AclHasActions) where?: Where<AclHasActions>,
  ): Promise<Count> {
    return this.aclHasActionsRepository.count(where);
  }

  @get('/acl-has-actions')
  @response(200, {
    description: 'Array of AclHasActions model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(AclHasActions, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(AclHasActions) filter?: Filter<AclHasActions>,
  ): Promise<AclHasActions[]> {
    return this.aclHasActionsRepository.find(filter);
  }

  @patch('/acl-has-actions')
  @response(200, {
    description: 'AclHasActions PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(AclHasActions, {partial: true}),
        },
      },
    })
    aclHasActions: AclHasActions,
    @param.where(AclHasActions) where?: Where<AclHasActions>,
  ): Promise<Count> {
    return this.aclHasActionsRepository.updateAll(aclHasActions, where);
  }

  @get('/acl-has-actions/{id}')
  @response(200, {
    description: 'AclHasActions model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(AclHasActions, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(AclHasActions, {exclude: 'where'}) filter?: FilterExcludingWhere<AclHasActions>
  ): Promise<AclHasActions> {
    return this.aclHasActionsRepository.findById(id, filter);
  }

  @patch('/acl-has-actions/{id}')
  @response(204, {
    description: 'AclHasActions PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(AclHasActions, {partial: true}),
        },
      },
    })
    aclHasActions: AclHasActions,
  ): Promise<void> {
    await this.aclHasActionsRepository.updateById(id, aclHasActions);
  }

  @put('/acl-has-actions/{id}')
  @response(204, {
    description: 'AclHasActions PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() aclHasActions: AclHasActions,
  ): Promise<void> {
    await this.aclHasActionsRepository.replaceById(id, aclHasActions);
  }

  @del('/acl-has-actions/{id}')
  @response(204, {
    description: 'AclHasActions DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.aclHasActionsRepository.deleteById(id);
  }
}
