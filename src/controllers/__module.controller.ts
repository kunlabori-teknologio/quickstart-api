import {inject, service} from '@loopback/core';
import {
  repository
} from '@loopback/repository';
import {get, param, Request, response, Response, RestBindings} from '@loopback/rest';
import {SecurityBindings, UserProfile} from '@loopback/security';
import {LocaleEnum} from '../enums/locale.enum';
import {HttpDocumentation, HttpResponseToClient} from '../implementations/index';
import {IHttpResponse} from '../interfaces/http.interface';
import {__Module} from '../models/__module.model';
import {__ModuleRepository} from '../repositories/__module.repository';
import {ModuleService} from '../services';
import {serverMessages} from '../utils/server-messages';

export class __ModuleController {

  constructor(
    @repository(__ModuleRepository) public moduleRepository: __ModuleRepository,

    @inject(RestBindings.Http.REQUEST) private httpRequest: Request,
    @inject(RestBindings.Http.RESPONSE) private httpResponse: Response,

    @service(ModuleService) private moduleService: ModuleService,

    @inject(SecurityBindings.USER, {optional: true}) private currentUser?: UserProfile,
  ) { }

  // @authenticate({strategy: 'autentikigo', options: {collection: 'Module', action: 'createOne'}})
  // @post('/modules')
  // @response(200, {
  //   description: 'Module model instance',
  //   properties: HttpDocumentation.createDocResponseSchemaForFindOneResult(Module)
  // })
  // async create(
  //   @requestBody({
  //     content: HttpDocumentation.createDocRequestSchema(Module)
  //   }) data: Module,
  //   @param.query.string('locale') locale?: LocaleEnum,
  // ): Promise<IHttpResponse> {
  //   try {

  //     const createdBy = this.currentUser?.[securityId] as string
  //     const ownerId = this.currentUser?.ownerId as string

  //     const module = await this.moduleRepository.create({...data, _createdBy: createdBy, _ownerId: ownerId})

  //     await this.moduleService.createDefaultPermission(module._id!, ownerId)

  //     return HttpResponseToClient.createHttpResponse({
  //       data: module,
  //       locale,
  //       request: this.httpRequest,
  //       response: this.httpResponse,
  //     })

  //   } catch (err) {

  //     return HttpResponseToClient.badRequestErrorHttpResponse({
  //       logMessage: err.message,
  //       locale,
  //       request: this.httpRequest,
  //       response: this.httpResponse,
  //     })
  //   }
  // }

  // @authenticate({strategy: 'autentikigo', options: {collection: 'Module', action: 'read'}})
  @get('/__modules')
  @response(200, {
    description: 'Array of Module model instances',
    properties: HttpDocumentation.createDocResponseSchemaForFindManyResults(__Module)
  })
  async find(
    @param.query.number('limit') limit?: number,
    @param.query.number('page') page?: number,
    @param.query.string('order_by') orderBy?: string,
    @param.query.string('locale') locale?: LocaleEnum,
  ): Promise<IHttpResponse> {
    try {

      const url = `${this.httpRequest.url}?filter={"or":[{"project":"${process.env.AUTH_DB}"},{"project":"${process.env.DB}"}]}`
      const filters = HttpDocumentation.createFilterRequestParams(url)

      const result = await this.moduleRepository.find(filters)

      const total = await this.moduleRepository.count(filters['where'])

      return HttpResponseToClient.okHttpResponse({
        data: {total: total?.count, result},
        locale,
        request: this.httpRequest,
        response: this.httpResponse,
      })

    } catch (err) {

      return HttpResponseToClient.badRequestErrorHttpResponse({
        logMessage: err.message,
        locale,
        request: this.httpRequest,
        response: this.httpResponse,
      })

    }
  }

  // @authenticate({strategy: 'autentikigo', options: {collection: 'Module', action: 'readOne'}})
  @get('/__modules/{moduleId}')
  @response(200, {
    description: 'Module model instance',
    properties: HttpDocumentation.createDocResponseSchemaForFindOneResult(__Module)
  })
  async findById(
    @param.path.string('moduleId') id: string,
    @param.query.string('locale') locale?: LocaleEnum,
  ): Promise<IHttpResponse> {
    try {

      const data = await this.moduleRepository.findOne({where: {and: [{_id: id}, {_deletedAt: {eq: null}}]}})
      if (!data) throw new Error(serverMessages['httpResponse']['notFoundError'][locale ?? LocaleEnum['pt-BR']])

      return HttpResponseToClient.okHttpResponse({
        data,
        locale,
        request: this.httpRequest,
        response: this.httpResponse,
      })

    } catch (err) {

      return HttpResponseToClient.badRequestErrorHttpResponse({
        logMessage: err.message,
        locale,
        request: this.httpRequest,
        response: this.httpResponse,
      })

    }
  }

  // @authenticate({strategy: 'autentikigo', options: {collection: 'Module', action: 'updateOne'}})
  // @put('/modules/{moduleId}')
  // @response(200, {description: 'Module PUT success'})
  // async updateById(
  //   @param.path.string('moduleId') id: string,
  //   @requestBody({
  //     content: HttpDocumentation.createDocRequestSchema(Module)
  //   }) data: Module,
  //   @param.query.string('locale') locale?: LocaleEnum,
  // ): Promise<IHttpResponse> {
  //   try {

  //     await this.moduleRepository.updateById(id, data)

  //     return HttpResponseToClient.noContentHttpResponse({
  //       locale,
  //       request: this.httpRequest,
  //       response: this.httpResponse,
  //     })

  //   } catch (err) {

  //     return HttpResponseToClient.badRequestErrorHttpResponse({
  //       logMessage: err.message,
  //       request: this.httpRequest,
  //       response: this.httpResponse,
  //     })

  //   }
  // }

  // @authenticate({strategy: 'autentikigo', options: {collection: 'Module', action: 'create'}})
  // @patch('/modules/{moduleId}')
  // @response(200, {description: 'Module PATCH success'})
  // async partialUpdateById(
  //   @param.path.string('moduleId') id: string,
  //   @requestBody({
  //     content: HttpDocumentation.createDocRequestSchema(Module)
  //   }) data: Module,
  //   @param.query.string('locale') locale?: LocaleEnum,
  // ): Promise<IHttpResponse> {
  //   try {

  //     await this.moduleRepository.updateById(id, data)

  //     return HttpResponseToClient.noContentHttpResponse({
  //       locale,
  //       request: this.httpRequest,
  //       response: this.httpResponse,
  //     })

  //   } catch (err) {

  //     return HttpResponseToClient.badRequestErrorHttpResponse({
  //       logMessage: err.message,
  //       locale,
  //       request: this.httpRequest,
  //       response: this.httpResponse,
  //     })

  //   }
  // }

  // @authenticate({strategy: 'autentikigo', options: {collection: 'Module', action: 'deleteOne'}})
  // @del('/modules/{moduleId}')
  // @response(204, {description: 'Module DELETE success'})
  // async deleteById(
  //   @param.path.string('moduleId') id: string,
  //   @param.query.string('locale') locale?: LocaleEnum,
  // ): Promise<IHttpResponse> {
  //   try {

  //     const moduleToDelete = await this.moduleRepository.findById(id)

  //     await this.moduleRepository.updateById(id, {...moduleToDelete, _deletedAt: new Date()})

  //     await this.moduleService.deletePermissionAndPermissionActionsRelated(id)

  //     return HttpResponseToClient.noContentHttpResponse({
  //       locale,
  //       request: this.httpRequest,
  //       response: this.httpResponse,
  //     })

  //   } catch (err) {

  //     return HttpResponseToClient.badRequestErrorHttpResponse({
  //       logMessage: err.message,
  //       locale,
  //       request: this.httpRequest,
  //       response: this.httpResponse,
  //     })

  //   }
  // }
}
