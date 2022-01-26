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
import {InvitationHasPermissions} from '../models';
import {InvitationHasPermissionsRepository} from '../repositories';

export class InvitationHasPermissionsController {
  constructor(
    @repository(InvitationHasPermissionsRepository)
    public invitationHasPermissionsRepository : InvitationHasPermissionsRepository,
  ) {}

  @post('/invitation-has-permissions')
  @response(200, {
    description: 'InvitationHasPermissions model instance',
    content: {'application/json': {schema: getModelSchemaRef(InvitationHasPermissions)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(InvitationHasPermissions, {
            title: 'NewInvitationHasPermissions',
            exclude: ['_id'],
          }),
        },
      },
    })
    invitationHasPermissions: Omit<InvitationHasPermissions, '_id'>,
  ): Promise<InvitationHasPermissions> {
    return this.invitationHasPermissionsRepository.create(invitationHasPermissions);
  }

  @get('/invitation-has-permissions/count')
  @response(200, {
    description: 'InvitationHasPermissions model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(InvitationHasPermissions) where?: Where<InvitationHasPermissions>,
  ): Promise<Count> {
    return this.invitationHasPermissionsRepository.count(where);
  }

  @get('/invitation-has-permissions')
  @response(200, {
    description: 'Array of InvitationHasPermissions model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(InvitationHasPermissions, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(InvitationHasPermissions) filter?: Filter<InvitationHasPermissions>,
  ): Promise<InvitationHasPermissions[]> {
    return this.invitationHasPermissionsRepository.find(filter);
  }

  @patch('/invitation-has-permissions')
  @response(200, {
    description: 'InvitationHasPermissions PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(InvitationHasPermissions, {partial: true}),
        },
      },
    })
    invitationHasPermissions: InvitationHasPermissions,
    @param.where(InvitationHasPermissions) where?: Where<InvitationHasPermissions>,
  ): Promise<Count> {
    return this.invitationHasPermissionsRepository.updateAll(invitationHasPermissions, where);
  }

  @get('/invitation-has-permissions/{id}')
  @response(200, {
    description: 'InvitationHasPermissions model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(InvitationHasPermissions, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(InvitationHasPermissions, {exclude: 'where'}) filter?: FilterExcludingWhere<InvitationHasPermissions>
  ): Promise<InvitationHasPermissions> {
    return this.invitationHasPermissionsRepository.findById(id, filter);
  }

  @patch('/invitation-has-permissions/{id}')
  @response(204, {
    description: 'InvitationHasPermissions PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(InvitationHasPermissions, {partial: true}),
        },
      },
    })
    invitationHasPermissions: InvitationHasPermissions,
  ): Promise<void> {
    await this.invitationHasPermissionsRepository.updateById(id, invitationHasPermissions);
  }

  @put('/invitation-has-permissions/{id}')
  @response(204, {
    description: 'InvitationHasPermissions PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() invitationHasPermissions: InvitationHasPermissions,
  ): Promise<void> {
    await this.invitationHasPermissionsRepository.replaceById(id, invitationHasPermissions);
  }

  @del('/invitation-has-permissions/{id}')
  @response(204, {
    description: 'InvitationHasPermissions DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.invitationHasPermissionsRepository.deleteById(id);
  }
}
