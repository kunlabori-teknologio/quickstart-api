import {authenticate} from '@loopback/authentication';
import {inject, service} from '@loopback/core';
import {
  repository
} from '@loopback/repository';
import {del, get, param, patch, post, put, Request, requestBody, response, Response, RestBindings} from '@loopback/rest';
import {SecurityBindings, securityId, UserProfile} from '@loopback/security';
import {LocaleEnum} from '../enums/locale.enum';
import {HttpDocumentation, HttpResponseToClient} from '../implementations/index';
import {IHttpResponse} from '../interfaces/http.interface';
import {PermissionGroup} from '../models';
import {PermissionGroupRepository} from '../repositories';
import {serverMessages} from '../utils/server-messages';
import {PermissionRepository} from './../repositories/permission.repository';
import {PermissionService} from './../services/permission.service';

export class PermissionGroupController {

  constructor(
    @repository(PermissionGroupRepository) public permissionGroupRepository: PermissionGroupRepository,
    @repository(PermissionRepository) public permissionRepository: PermissionRepository,

    @inject(RestBindings.Http.REQUEST) private httpRequest: Request,
    @inject(RestBindings.Http.RESPONSE) private httpResponse: Response,

    @service(PermissionService) private permissionService: PermissionService,

    @inject(SecurityBindings.USER, {optional: true}) private currentUser?: UserProfile,
  ) { }

  private getPermissionGroupRelatedPermissions = {
    relation: 'permissions',
    scope: {
      include: ['permissionActions', 'module'],
    }
  }

  @authenticate({strategy: 'autentikigo', options: {collection: 'PermissionGroup', action: 'createOne'}})
  @post('/permission-groups')
  @response(200, {
    description: 'Permission group model instance',
    properties: HttpDocumentation.createDocResponseSchemaForFindOneResult(PermissionGroup)
  })
  async create(
    // @requestBody({
    //   content: HttpDocumentation.createDocRequestSchema(PermissionGroup)
    // }) data: PermissionGroup,
    @requestBody() data: any,
    @param.query.string('locale') locale?: LocaleEnum,
  ): Promise<IHttpResponse> {
    try {

      // data = {
      //   name: string,
      //   description: string,
      //   isAdminPermission: true,
      //   modules: [{
      //     module: string,
      //     permissionActions: []string
      //   }]
      // }

      const createdBy = this.currentUser?.[securityId] as string
      const ownerId = this.currentUser?.ownerId as string

      // Create permissionGroup
      const permissionGroup = await this.permissionGroupRepository.create({
        ...{name: data.name, description: data.description},
        _createdBy: createdBy,
        _ownerId: ownerId
      })

      // Create permissions
      const permissions = await this.permissionService.createPermissions(
        permissionGroup?._id!,
        data.modules,
      )

      // Create permissionHasActions
      await this.permissionService.createPermissionHasActions(permissions, data['modules'])

      return HttpResponseToClient.createHttpResponse({
        // data: permission,
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

  @authenticate({strategy: 'autentikigo', options: {collection: 'PermissionGroup', action: 'read'}})
  @get('/permission-groups')
  @response(200, {
    description: 'Array of Permission group model instances',
    properties: HttpDocumentation.createDocResponseSchemaForFindManyResults(PermissionGroup)
  })
  async find(
    @param.query.number('limit') limit?: number,
    @param.query.number('page') page?: number,
    @param.query.string('order_by') orderBy?: string,
    @param.query.string('locale') locale?: LocaleEnum,
  ): Promise<IHttpResponse> {
    try {

      const filters = HttpDocumentation.createFilterRequestParams(this.httpRequest.url)

      const result = await this.permissionGroupRepository.find({...filters, include: [this.getPermissionGroupRelatedPermissions]})

      const total = await this.permissionGroupRepository.count(filters['where'])

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

  @authenticate({strategy: 'autentikigo', options: {collection: 'PermissionGroup', action: 'readOne'}})
  @get('/permission-groups/{permissionGroupId}')
  @response(200, {
    description: 'Permission group model instance',
    properties: HttpDocumentation.createDocResponseSchemaForFindOneResult(PermissionGroup)
  })
  async findById(
    @param.path.string('permissionGroupId') id: string,
    @param.query.string('locale') locale?: LocaleEnum,
  ): Promise<IHttpResponse> {
    try {

      const data = await this.permissionGroupRepository.findOne({
        where: {and: [{_id: id}, {_deletedAt: {eq: null}}]},
        include: [this.getPermissionGroupRelatedPermissions]
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

  @authenticate({strategy: 'autentikigo', options: {collection: 'PermissionGroup', action: 'updateOne'}})
  @put('/permission-groups/{permissionGroupId}')
  @response(200, {description: 'Permission group PUT success'})
  async updateById(
    @param.path.string('permissionGroupId') id: string,
    // @requestBody({
    //   content: HttpDocumentation.createDocRequestSchema(PermissionGroup)
    // }) data: PermissionGroup,
    @requestBody() data: any,
    @param.query.string('locale') locale?: LocaleEnum,
  ): Promise<IHttpResponse> {
    try {

      // update permissionGroup
      await this.permissionGroupRepository.updateById(id, {
        name: data.name,
        description: data.description
      })

      // Delete and Create permissions
      const permissionsToDeleteActions = await this.permissionRepository.find({
        where: {permissionGroupId: id}
      })
      const permissions = await this.permissionService.updatePermissions(id, data.modules)

      // Delete and Create permissionHasActions
      this.permissionService.updatePermissionHasActions(
        permissionsToDeleteActions,
        permissions,
        data['modules']
      )

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

  @authenticate({strategy: 'autentikigo', options: {collection: 'PermissionGroup', action: 'updateOne'}})
  @patch('/permission-groups/{permissionGroupId}')
  @response(200, {description: 'Permission group PATCH success'})
  async partialUpdateById(
    @param.path.string('permissionGroupId') id: string,
    // @requestBody({
    //   content: HttpDocumentation.createDocRequestSchema(PermissionGroup)
    // }) data: PermissionGroup,
    @requestBody() data: any,
    @param.query.string('locale') locale?: LocaleEnum,
  ): Promise<IHttpResponse> {
    try {

      // update permissionGroup
      await this.permissionGroupRepository.updateById(id, {
        name: data.name,
        description: data.description
      })

      // Delete and Create permissions
      const permissionsToDeleteActions = await this.permissionRepository.find({
        where: {permissionGroupId: id}
      })
      const permissions = await this.permissionService.updatePermissions(id, data.modules)

      // Delete and Create permissionHasActions
      this.permissionService.updatePermissionHasActions(
        permissionsToDeleteActions,
        permissions,
        data['modules']
      )

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

  @authenticate({strategy: 'autentikigo', options: {collection: 'PermissionGroup', action: 'deleteOne'}})
  @del('/permission-groups/{permissionGroupId}')
  @response(204, {description: 'Permission group DELETE success'})
  async deleteById(
    @param.path.string('permissionGroupId') id: string,
    @param.query.string('locale') locale?: LocaleEnum,
  ): Promise<IHttpResponse> {
    try {

      const permissionGroupToDelete = await this.permissionGroupRepository.findById(id)

      await this.permissionGroupRepository.updateById(id, {...permissionGroupToDelete, _deletedAt: new Date()})

      return HttpResponseToClient.noContentHttpResponse({
        locale,
        request: this.httpRequest,
        response: this.httpResponse,
      })

    } catch (err) {

      return HttpResponseToClient.badRequestErrorHttpResponse({
        locale,
        request: this.httpRequest,
        response: this.httpResponse,
      })

    }
  }
}
