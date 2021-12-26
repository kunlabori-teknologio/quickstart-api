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
import {del, get, getModelSchemaRef, param, patch, post, put, Request, requestBody, response, RestBindings} from '@loopback/rest';
import {Module} from '../models';
import {ModuleRepository} from '../repositories';
import {AuthService} from './../services/auth.service';

@authenticate('autentikigo')
export class ModuleController {
  constructor(
    @repository(ModuleRepository)
    public moduleRepository: ModuleRepository,

    @inject(RestBindings.Http.REQUEST)
    private request: Request,

    @service(AuthService)
    private authService: AuthService,
  ) { }

  @post('/modules')
  @response(200, {
    description: 'Module model instance',
    content: {'application/json': {schema: getModelSchemaRef(Module)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Module, {
            title: 'NewModule',

          }),
        },
      },
    })
    module: Module,
  ): Promise<Module> {
    module._createdBy = await this.authService.getCreatedBy(this.request.headers.authorization as string);
    return this.moduleRepository.create(module);
  }

  @get('/modules/count')
  @response(200, {
    description: 'Module model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Module) where?: Where<Module>,
  ): Promise<Count> {
    return this.moduleRepository.count(where);
  }

  @get('/modules')
  @response(200, {
    description: 'Array of Module model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Module, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Module) filter?: Filter<Module>,
  ): Promise<Module[]> {
    return this.moduleRepository.find(filter);
  }

  @patch('/modules')
  @response(200, {
    description: 'Module PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Module, {partial: true}),
        },
      },
    })
    module: Module,
    @param.where(Module) where?: Where<Module>,
  ): Promise<Count> {
    return this.moduleRepository.updateAll(module, where);
  }

  @get('/modules/{id}')
  @response(200, {
    description: 'Module model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Module, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Module, {exclude: 'where'}) filter?: FilterExcludingWhere<Module>
  ): Promise<Module> {
    return this.moduleRepository.findById(id, filter);
  }

  @patch('/modules/{id}')
  @response(204, {
    description: 'Module PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Module, {partial: true}),
        },
      },
    })
    module: Module,
  ): Promise<void> {
    await this.moduleRepository.updateById(id, module);
  }

  @put('/modules/{id}')
  @response(204, {
    description: 'Module PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() module: Module,
  ): Promise<void> {
    await this.moduleRepository.replaceById(id, module);
  }

  @del('/modules/{id}')
  @response(204, {
    description: 'Module DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.moduleRepository.deleteById(id);
  }
}
