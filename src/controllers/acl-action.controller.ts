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
import {AclAction} from '../models';
import {AclActionRepository} from '../repositories';

export class AclActionController {
  constructor(
    @repository(AclActionRepository)
    public aclActionRepository : AclActionRepository,
  ) {}

  @post('/acl-actions')
  @response(200, {
    description: 'AclAction model instance',
    content: {'application/json': {schema: getModelSchemaRef(AclAction)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(AclAction, {
            title: 'NewAclAction',
            
          }),
        },
      },
    })
    aclAction: AclAction,
  ): Promise<AclAction> {
    return this.aclActionRepository.create(aclAction);
  }

  @get('/acl-actions/count')
  @response(200, {
    description: 'AclAction model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(AclAction) where?: Where<AclAction>,
  ): Promise<Count> {
    return this.aclActionRepository.count(where);
  }

  @get('/acl-actions')
  @response(200, {
    description: 'Array of AclAction model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(AclAction, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(AclAction) filter?: Filter<AclAction>,
  ): Promise<AclAction[]> {
    return this.aclActionRepository.find(filter);
  }

  @patch('/acl-actions')
  @response(200, {
    description: 'AclAction PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(AclAction, {partial: true}),
        },
      },
    })
    aclAction: AclAction,
    @param.where(AclAction) where?: Where<AclAction>,
  ): Promise<Count> {
    return this.aclActionRepository.updateAll(aclAction, where);
  }

  @get('/acl-actions/{id}')
  @response(200, {
    description: 'AclAction model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(AclAction, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(AclAction, {exclude: 'where'}) filter?: FilterExcludingWhere<AclAction>
  ): Promise<AclAction> {
    return this.aclActionRepository.findById(id, filter);
  }

  @patch('/acl-actions/{id}')
  @response(204, {
    description: 'AclAction PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(AclAction, {partial: true}),
        },
      },
    })
    aclAction: AclAction,
  ): Promise<void> {
    await this.aclActionRepository.updateById(id, aclAction);
  }

  @put('/acl-actions/{id}')
  @response(204, {
    description: 'AclAction PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() aclAction: AclAction,
  ): Promise<void> {
    await this.aclActionRepository.replaceById(id, aclAction);
  }

  @del('/acl-actions/{id}')
  @response(204, {
    description: 'AclAction DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.aclActionRepository.deleteById(id);
  }
}
