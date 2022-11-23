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
import {__PermissionGroup} from '../models';
import {__PermissionGroupRepository} from '../repositories';
import {__PermissionRepository} from '../repositories/__permission.repository';
import {PermissionService} from '../services/permission.service';
import {serverMessages} from '../utils/server-messages';

export class __PermissionGroupController {

  constructor(
    @repository(__PermissionGroupRepository) public permissionGroupRepository: __PermissionGroupRepository,
    @repository(__PermissionRepository) public permissionRepository: __PermissionRepository,

    @inject(RestBindings.Http.REQUEST) private httpRequest: Request,
    @inject(RestBindings.Http.RESPONSE) private httpResponse: Response,

    @service(PermissionService) private permissionService: PermissionService,

    @inject(SecurityBindings.USER, {optional: true}) private currentUser?: UserProfile,
  ) { }

  private getPermissionGroupRelatedPermissions = {
    relation: 'modulePermissions',
    scope: {
      include: [
        {relation: 'permissionActions', scope: {fields: ['_id']}},
        {relation: 'module'}
      ],
    }
  }

  @authenticate({strategy: 'autentikigo', options: {collection: '__PermissionGroup', action: 'createOne'}})
  @post('/__permission-groups')
  @response(200, {
    description: 'Permission group model instance',
    properties: HttpDocumentation.createDocResponseSchemaForFindOneResult(__PermissionGroup)
  })
  async create(
    // @requestBody({
    //   content: HttpDocumentation.createDocRequestSchema(PermissionGroup)
    // }) data: PermissionGroup,
    @requestBody() data: any,
    @param.query.string('locale') locale?: LocaleEnum,
  ): Promise<IHttpResponse> {
    try {

      const createdBy = this.currentUser?.[securityId] as string
      const ownerId = this.currentUser?.ownerId as string

      // Create permissionGroup
      const permissionGroup = await this.permissionGroupRepository.create({
        ...{name: data.name, description: data.description, project: process.env.DB},
        _createdBy: createdBy,
        _ownerId: ownerId
      })

      // Create permissions
      await this.permissionService.createPermissions(
        permissionGroup?._id!,
        data['modulePermissions'],
      )

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

  @authenticate({strategy: 'autentikigo', options: {collection: '__PermissionGroup', action: 'read'}})
  @get('/__permission-groups')
  @response(200, {
    description: 'Array of Permission group model instances',
    properties: HttpDocumentation.createDocResponseSchemaForFindManyResults(__PermissionGroup)
  })
  async find(
    @param.query.number('limit') limit?: number,
    @param.query.number('page') page?: number,
    @param.query.string('order_by') orderBy?: string,
    @param.query.string('locale') locale?: LocaleEnum,
  ): Promise<IHttpResponse> {
    try {

      let filters = HttpDocumentation.createFilterRequestParams(
        this.httpRequest.url,
        [
          {'and': [{project: process.env.DB!}]},
          {
            'or': [
              {_createdBy: this.currentUser?.[securityId]!},
              {_ownerId: this.currentUser?.ownerId!},
            ]
          }]
      )

      let result: any[] = await this.permissionGroupRepository.find({...filters, include: [this.getPermissionGroupRelatedPermissions]})
      result = result?.map(permissionGroup => {
        permissionGroup.modulePermissions = permissionGroup?.modulePermissions?.map((permissions: any) => {
          permissions.permissionActions = permissions?.permissionActions?.map((action: any) => action._id);
          return permissions;
        })
        return permissionGroup;
      })

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

  @authenticate({strategy: 'autentikigo', options: {collection: '__PermissionGroup', action: 'readOne'}})
  @get('/__permission-groups/{permissionGroupId}')
  @response(200, {
    description: 'Permission group model instance',
    properties: HttpDocumentation.createDocResponseSchemaForFindOneResult(__PermissionGroup)
  })
  async findById(
    @param.path.string('permissionGroupId') id: string,
    @param.query.string('locale') locale?: LocaleEnum,
  ): Promise<IHttpResponse> {
    try {

      let data: any = await this.permissionGroupRepository.findOne({
        where: {and: [{_id: id}, {_deletedAt: {eq: null}}]},
        include: [this.getPermissionGroupRelatedPermissions]
      })

      if (!data) throw new Error(serverMessages['httpResponse']['notFoundError'][locale ?? LocaleEnum['pt-BR']])
      else {
        data.modulePermissions = data.modulePermissions?.map((permissions: any) => {
          permissions.permissionActions = permissions.permissionActions?.map((action: any) => action._id);
          return permissions;
        })
      }

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

  @authenticate({strategy: 'autentikigo', options: {collection: '__PermissionGroup', action: 'updateOne'}})
  @put('/__permission-groups/{permissionGroupId}')
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
      await this.permissionService.updatePermissions(id, data['modulePermissions'])

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

  @authenticate({strategy: 'autentikigo', options: {collection: '__PermissionGroup', action: 'updateOne'}})
  @patch('/__permission-groups/{permissionGroupId}')
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
      await this.permissionService.updatePermissions(id, data['modulePermissions'])

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

  @authenticate({strategy: 'autentikigo', options: {collection: '__PermissionGroup', action: 'deleteOne'}})
  @del('/__permission-groups/{permissionGroupId}')
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
