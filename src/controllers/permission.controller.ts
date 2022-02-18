import {authenticate} from '@loopback/authentication'
import {inject} from '@loopback/core'
import {
  repository
} from '@loopback/repository'
import {del, get, param, patch, post, put, Request, requestBody, response, Response, RestBindings} from '@loopback/rest'
import {SecurityBindings, securityId, UserProfile} from '@loopback/security'
import {LocaleEnum} from '../enums/locale.enum'
import {HttpDocumentation, HttpResponseToClient} from '../implementations/index'
import {IHttpResponse} from '../interfaces/http.interface'
import {Permission, PermissionAction} from '../models'
import {PermissionRepository} from '../repositories'
import {PermissionHasActionsRepository} from '../repositories/permission-has-actions.repository'
import {serverMessages} from '../utils/server-messages'

export class PermissionController {

  constructor(
    @repository(PermissionRepository) public permissionRepository: PermissionRepository,
    @repository(PermissionHasActionsRepository) private permissionHasActionsRepository: PermissionHasActionsRepository,

    @inject(RestBindings.Http.REQUEST) private httpRequest: Request,
    @inject(RestBindings.Http.RESPONSE) private httpResponse: Response,

    @inject(SecurityBindings.USER, {optional: true}) private currentUser?: UserProfile,
  ) { }

  @authenticate({strategy: 'autentikigo', options: {collection: 'Permission', action: 'createOne'}})
  @post('/permissions')
  @response(200, {
    description: 'Permission model instance',
    properties: HttpDocumentation.createDocResponseSchemaForFindOneResult(Permission)
  })
  async create(
    @requestBody({
      content: HttpDocumentation.createDocRequestSchema(Permission)
    }) data: Permission,
    @param.query.string('locale') locale?: LocaleEnum,
  ): Promise<IHttpResponse> {
    try {

      const createdBy = this.currentUser?.[securityId] as string
      const ownerId = this.currentUser?.ownerId as string

      const permission = await this.permissionRepository.create({...data, _createdBy: createdBy, _ownerId: ownerId})

      return HttpResponseToClient.createHttpResponse({
        data: permission,
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

  @authenticate({strategy: 'autentikigo', options: {collection: 'Permission'}})
  @get('/permissions')
  @response(200, {
    description: 'Array of Permission model instances',
    properties: HttpDocumentation.createDocResponseSchemaForFindManyResults(Permission)
  })
  async find(
    @param.query.number('limit') limit?: number,
    @param.query.number('page') page?: number,
    @param.query.string('order_by') orderBy?: string,
    @param.query.string('locale') locale?: LocaleEnum,
  ): Promise<IHttpResponse> {
    try {

      const filters = HttpDocumentation.createFilterRequestParams(this.httpRequest.url)

      const result = await this.permissionRepository.find({...filters, include: ['permissionActions', 'module']})

      const total = await this.permissionRepository.count(filters['where'])

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

  @authenticate({strategy: 'autentikigo', options: {collection: 'Permission'}})
  @get('/permissions/{permissionId}')
  @response(200, {
    description: 'Permission model instance',
    properties: HttpDocumentation.createDocResponseSchemaForFindOneResult(Permission)
  })
  async findById(
    @param.path.string('permissionId') id: string,
    @param.query.string('locale') locale?: LocaleEnum,
  ): Promise<IHttpResponse> {
    try {

      const data = await this.permissionRepository.findOne({
        where: {and: [{_id: id}, {_deletedAt: {eq: null}}]},
        include: ['permissionActions', 'module']
      })
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

  @authenticate({strategy: 'autentikigo', options: {collection: 'Permission', action: 'updateOne'}})
  @put('/permissions/{permissionId}')
  @response(200, {description: 'Permission PUT success'})
  async updateById(
    @param.path.string('permissionId') id: string,
    @requestBody({
      content: HttpDocumentation.createDocRequestSchema(Permission)
    }) data: Permission,
    @param.query.string('locale') locale?: LocaleEnum,
  ): Promise<IHttpResponse> {
    try {

      await this.permissionRepository.updateById(id, data)

      return HttpResponseToClient.noContentHttpResponse({
        locale,
        request: this.httpRequest,
        response: this.httpResponse
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

  @authenticate({strategy: 'autentikigo', options: {collection: 'Permission', action: 'updateOne'}})
  @patch('/permissions/{permissionId}')
  @response(200, {description: 'Permission PATCH success'})
  async partialUpdateById(
    @param.path.string('permissionId') id: string,
    @requestBody({
      content: HttpDocumentation.createDocRequestSchema(Permission)
    }) data: Permission,
    @param.query.string('locale') locale?: LocaleEnum,
  ): Promise<IHttpResponse> {
    try {

      await this.permissionRepository.updateById(id, data)

      return HttpResponseToClient.noContentHttpResponse({
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

  @authenticate({strategy: 'autentikigo', options: {collection: 'Permission', action: 'deleteOne'}})
  @del('/permissions/{permissionId}')
  @response(204, {description: 'Permission DELETE success'})
  async deleteById(
    @param.path.string('permissionId') id: string,
    @param.query.string('locale') locale?: LocaleEnum,
  ): Promise<IHttpResponse> {
    try {

      const permissionToDelete = await this.permissionRepository.findById(id)

      await this.permissionRepository.updateById(id, {...permissionToDelete, _deletedAt: new Date()})

      return HttpResponseToClient.noContentHttpResponse({
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

  @authenticate({strategy: 'autentikigo', options: {collection: 'Permission', action: 'create'}})
  @post('/permissions/{permissionId}/permission-actions')
  @response(200, {
    description: 'create a PermissionAction model instance',
    properties: HttpDocumentation.createDocResponseSchemaForFindOneResult(Permission)
  })
  async createPermissionActionsRelated(
    @param.path.string('permissionId') permissionId: string,
    @requestBody({
      content: {
        'application/json': {schema: {type: 'array', items: {type: 'string'}}}
      }
    })
    permissionActionIds: string[],
    @param.query.string('locale') locale?: LocaleEnum,
  ): Promise<IHttpResponse> {
    try {

      await this.permissionHasActionsRepository.createAll(permissionActionIds.map((permissionActionId) => {
        return {permissionId, permissionActionId}
      }))

      const data = await this.permissionRepository.findById(permissionId, {include: ['permissionActions', 'module']})

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
        response: this.httpResponse
      })

    }
  }

  @authenticate({strategy: 'autentikigo', options: {collection: 'Permission'}})
  @get('/permissions/{permissionId}/permission-actions')
  @response(200, {
    description: 'Array of Permission has many PermissionAction through PermissionHasActions',
    properties: HttpDocumentation.createDocResponseSchemaForFindManyResults(PermissionAction)
  })
  async findPermissionActionsRelated(
    @param.path.string('permissionId') id?: string,
    @param.query.number('limit') limit?: number,
    @param.query.number('page') page?: number,
    @param.query.string('order_by') orderBy?: string,
    @param.query.string('locale') locale?: LocaleEnum,
  ): Promise<IHttpResponse> {
    try {

      const filters = HttpDocumentation.createFilterRequestParams(this.httpRequest.url)

      const result = await this.permissionRepository.permissionActions(id).find(filters)

      const total = (await this.permissionRepository.permissionActions(id).find({where: filters['where']})).length

      return HttpResponseToClient.okHttpResponse({
        data: {total: total, result},
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

  @authenticate({strategy: 'autentikigo', options: {collection: 'Permission', action: 'delete'}})
  @del('/permissions/{permissionId}/permission-actions')
  @response(200, {
    description: 'delete a PermissionAction model instance',
    properties: HttpDocumentation.createDocResponseSchemaForFindOneResult(Permission)
  })
  async deletePermissionActionsRelated(
    @param.path.string('permissionId') permissionId: string,
    @requestBody({
      content: {
        'application/json': {schema: {type: 'array', items: {type: 'string'}}}
      }
    })
    permissionActionIds: string[],
    @param.query.string('locale') locale?: LocaleEnum,
  ): Promise<IHttpResponse> {
    try {

      await this.permissionHasActionsRepository.deleteAll({
        or:
          (permissionActionIds.map((permissionActionId) => {return {and: [{permissionId}, {permissionActionId}]}}))
      })

      const data = await this.permissionRepository.findById(permissionId, {include: ['permissionActions', 'module']})

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
}
