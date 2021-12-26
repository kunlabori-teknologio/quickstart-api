import {authenticate} from '@loopback/authentication';
import {inject, service} from '@loopback/core';
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
  getModelSchemaRef, param, patch, post, put, Request, requestBody,
  response,
  RestBindings
} from '@loopback/rest';
import {Permission} from '../models';
import {PermissionRepository} from '../repositories';
import {AuthService} from './../services/auth.service';

@authenticate('autentikigo')
export class PermissionController {
  constructor(
    @repository(PermissionRepository)
    public permissionRepository: PermissionRepository,

    @inject(RestBindings.Http.REQUEST)
    private request: Request,

    @service(AuthService)
    private authService: AuthService,
  ) { }

  @post('/permissions')
  @response(200, {
    description: 'Permission model instance',
    content: {'application/json': {schema: getModelSchemaRef(Permission)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Permission, {
            title: 'NewPermission',
            exclude: ['_id'],
          }),
        },
      },
    })
    permission: Omit<Permission, '_id'>,
  ): Promise<Permission> {
    permission._createdBy = await this.authService.getCreatedBy(this.request.headers.authorization as string);
    return this.permissionRepository.create(permission);
  }

  @get('/permissions/count')
  @response(200, {
    description: 'Permission model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Permission) where?: Where<Permission>,
  ): Promise<Count> {
    return this.permissionRepository.count(where);
  }

  @get('/permissions')
  @response(200, {
    description: 'Array of Permission model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Permission, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Permission) filter?: Filter<Permission>,
  ): Promise<Permission[]> {
    return this.permissionRepository.find(filter);
  }

  @patch('/permissions')
  @response(200, {
    description: 'Permission PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Permission, {partial: true}),
        },
      },
    })
    permission: Permission,
    @param.where(Permission) where?: Where<Permission>,
  ): Promise<Count> {
    return this.permissionRepository.updateAll(permission, where);
  }

  @get('/permissions/{id}')
  @response(200, {
    description: 'Permission model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Permission, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Permission, {exclude: 'where'}) filter?: FilterExcludingWhere<Permission>
  ): Promise<Permission> {
    return this.permissionRepository.findById(id, filter);
  }

  @patch('/permissions/{id}')
  @response(204, {
    description: 'Permission PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Permission, {partial: true}),
        },
      },
    })
    permission: Permission,
  ): Promise<void> {
    await this.permissionRepository.updateById(id, permission);
  }

  @put('/permissions/{id}')
  @response(204, {
    description: 'Permission PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() permission: Permission,
  ): Promise<void> {
    await this.permissionRepository.replaceById(id, permission);
  }

  @del('/permissions/{id}')
  @response(204, {
    description: 'Permission DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.permissionRepository.deleteById(id);
  }
}
