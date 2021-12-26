import {authenticate} from '@loopback/authentication';
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where
} from '@loopback/repository';
import {
  del, get,
  getModelSchemaRef, param, patch, post, put, requestBody,
  response
} from '@loopback/rest';
import {Invite} from '../models';
import {InviteRepository} from '../repositories';

@authenticate('autentikigo')
export class InviteController {
  constructor(
    @repository(InviteRepository)
    public inviteRepository: InviteRepository,
  ) { }

  @post('/invites')
  @response(200, {
    description: 'Invite model instance',
    content: {'application/json': {schema: getModelSchemaRef(Invite)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Invite, {
            title: 'NewInvite',
            exclude: ['_id'],
          }),
        },
      },
    })
    invite: Omit<Invite, '_id'>,
  ): Promise<Invite> {
    return this.inviteRepository.create(invite);
  }

  @get('/invites/count')
  @response(200, {
    description: 'Invite model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Invite) where?: Where<Invite>,
  ): Promise<Count> {
    return this.inviteRepository.count(where);
  }

  @get('/invites')
  @response(200, {
    description: 'Array of Invite model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Invite, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Invite) filter?: Filter<Invite>,
  ): Promise<Invite[]> {
    return this.inviteRepository.find(filter);
  }

  @patch('/invites')
  @response(200, {
    description: 'Invite PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Invite, {partial: true}),
        },
      },
    })
    invite: Invite,
    @param.where(Invite) where?: Where<Invite>,
  ): Promise<Count> {
    return this.inviteRepository.updateAll(invite, where);
  }

  @get('/invites/{id}')
  @response(200, {
    description: 'Invite model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Invite, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Invite, {exclude: 'where'}) filter?: FilterExcludingWhere<Invite>
  ): Promise<Invite> {
    return this.inviteRepository.findById(id, filter);
  }

  @patch('/invites/{id}')
  @response(204, {
    description: 'Invite PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Invite, {partial: true}),
        },
      },
    })
    invite: Invite,
  ): Promise<void> {
    await this.inviteRepository.updateById(id, invite);
  }

  @put('/invites/{id}')
  @response(204, {
    description: 'Invite PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() invite: Invite,
  ): Promise<void> {
    await this.inviteRepository.replaceById(id, invite);
  }

  @del('/invites/{id}')
  @response(204, {
    description: 'Invite DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.inviteRepository.deleteById(id);
  }
}
