import {authenticate} from '@loopback/authentication'
import {inject} from '@loopback/core'
import {
  repository
} from '@loopback/repository'
import {get, param, Request, response, Response, RestBindings} from '@loopback/rest'
import {SecurityBindings, UserProfile} from '@loopback/security'
import {LocaleEnum} from '../enums/locale.enum'
import {HttpDocumentation, HttpResponseToClient} from '../implementations'
import {IHttpResponse} from '../interfaces/http.interface'
import {PermissionAction} from '../models/permission-action.model'
import {PermissionActionRepository} from '../repositories'
import {serverMessages} from '../utils/server-messages'

export class PermissionActionController {

  constructor(
    @repository(PermissionActionRepository) public permissionActionRepository: PermissionActionRepository,

    @inject(RestBindings.Http.REQUEST) private httpRequest: Request,
    @inject(RestBindings.Http.RESPONSE) private httpResponse: Response,

    @inject(SecurityBindings.USER, {optional: true}) private currentUser?: UserProfile,
  ) { }

  // @authenticate({strategy: 'autentikigo', options: {collection: 'PermissionAction', action: 'createOne'}})
  // @post('/permission-actions')
  // @response(200, {
  //   description: 'PermissionAction model instance',
  //   properties: HttpDocumentation.createDocResponseSchemaForFindOneResult(PermissionAction)
  // })
  // async create(
  //   @requestBody({
  //     content: HttpDocumentation.createDocRequestSchema(PermissionAction)
  //   }) data: PermissionAction,
  //   @param.query.string('locale') locale?: LocaleEnum,
  // ): Promise<IHttpResponse> {
  //   try {

  //     const createdBy = this.currentUser?.[securityId] as string
  //     const ownerId = this.currentUser?.ownerId as string

  //     const permissionAction = await this.permissionActionRepository.create({...data, _createdBy: createdBy, _ownerId: ownerId})

  //     return HttpResponseToClient.createHttpResponse({
  //       data: permissionAction,
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

  @authenticate({strategy: 'autentikigo', options: {collection: 'PermissionAction', action: 'read'}})
  @get('/permission-actions')
  @response(200, {
    description: 'Array of PermissionAction model instances',
    properties: HttpDocumentation.createDocResponseSchemaForFindManyResults(PermissionAction)
  })
  async find(
    @param.query.number('limit') limit?: number,
    @param.query.number('page') page?: number,
    @param.query.string('order_by') orderBy?: string,
    @param.query.string('locale') locale?: LocaleEnum,
  ): Promise<IHttpResponse> {
    try {

      const filters = HttpDocumentation.createFilterRequestParams(this.httpRequest.url)

      const result = await this.permissionActionRepository.find(filters)

      const total = await this.permissionActionRepository.count(filters['where'])

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

  @authenticate({strategy: 'autentikigo', options: {collection: 'PermissionAction', action: 'readOne'}})
  @get('/permission-actions/{permissionActionId}')
  @response(200, {
    description: 'PermissionAction model instance',
    properties: HttpDocumentation.createDocResponseSchemaForFindOneResult(PermissionAction)
  })
  async findById(
    @param.path.string('permissionActionId') id: string,
    @param.query.string('locale') locale?: LocaleEnum,
  ): Promise<IHttpResponse> {
    try {

      const data = await this.permissionActionRepository.findOne({where: {and: [{_id: id}, {_deletedAt: {eq: null}}]}})
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

  // @authenticate({strategy: 'autentikigo', options: {collection: 'PermissionAction', action: 'updateOne'}})
  // @put('/permission-actions/{permissionActionId}')
  // @response(200, {description: 'PermissionAction PUT success'})
  // async updateById(
  //   @param.path.string('permissionActionId') id: string,
  //   @requestBody({
  //     content: HttpDocumentation.createDocRequestSchema(PermissionAction)
  //   }) data: PermissionAction,
  //   @param.query.string('locale') locale?: LocaleEnum,
  // ): Promise<IHttpResponse> {
  //   try {

  //     await this.permissionActionRepository.updateById(id, data)

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

  // @authenticate({strategy: 'autentikigo', options: {collection: 'PermissionAction', action: 'create'}})
  // @patch('/permission-actions/{permissionActionId}')
  // @response(200, {description: 'PermissionAction PATCH success'})
  // async partialUpdateById(
  //   @param.path.string('permissionActionId') id: string,
  //   @requestBody({
  //     content: HttpDocumentation.createDocRequestSchema(PermissionAction)
  //   }) data: PermissionAction,
  //   @param.query.string('locale') locale?: LocaleEnum,
  // ): Promise<IHttpResponse> {
  //   try {

  //     await this.permissionActionRepository.updateById(id, data)

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

  // @authenticate({strategy: 'autentikigo', options: {collection: 'PermissionAction', action: 'deleteOne'}})
  // @del('/permission-actions/{permissionActionId}')
  // @response(204, {description: 'PermissionAction DELETE success'})
  // async deleteById(
  //   @param.path.string('permissionActionId') id: string,
  //   @param.query.string('locale') locale?: LocaleEnum,
  // ): Promise<IHttpResponse> {
  //   try {

  //     const permissionActionToDelete = await this.permissionActionRepository.findById(id)

  //     await this.permissionActionRepository.updateById(id, {...permissionActionToDelete, _deletedAt: new Date()})

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
