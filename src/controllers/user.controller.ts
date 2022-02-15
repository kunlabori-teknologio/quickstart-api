import {authenticate} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {
  repository
} from '@loopback/repository';
import {
  del,
  get,
  param,
  post,
  Request,
  requestBody,
  response,
  Response,
  RestBindings
} from '@loopback/rest';
import {LocaleEnum} from '../enums/locale.enum';
import {Http} from '../implementations/index';
import {IHttpResponse} from '../interfaces/http.interface';
import {PermissionGroup} from '../models';
import {User} from '../models/user.model';
import {UserRepository} from '../repositories';
import {UserHasPermissionGroupsRepository} from '../repositories/user-has-permission-groups.repository';

export class UserController {

  constructor(
    @repository(UserRepository) public userRepository: UserRepository,
    @repository(UserHasPermissionGroupsRepository) private userHasPermissionsRepository: UserHasPermissionGroupsRepository,

    @inject(RestBindings.Http.REQUEST) private httpRequest: Request,
    @inject(RestBindings.Http.RESPONSE) private httpResponse: Response,
  ) { }

  @authenticate({strategy: 'autentikigo', options: {collection: 'User'}})
  @get('/users/{userId}')
  @response(200, {
    description: 'User model instance',
    properties: Http.createDocResponseSchemaForFindOneResult(User)
  })
  async findById(
    @param.path.string('userId') id: string,
    @param.query.string('locale') locale?: LocaleEnum,
  ): Promise<IHttpResponse> {
    try {

      const data = await this.userRepository.findById(id, {include: ['person', 'company']})

      return Http.okHttpResponse({
        data,
        locale,
        request: this.httpRequest,
        response: this.httpResponse,
      })

    } catch (err) {

      return Http.badRequestErrorHttpResponse({
        logMessage: err.message,
        locale,
        request: this.httpRequest,
        response: this.httpResponse,
      })

    }
  }

  @authenticate({strategy: 'autentikigo', options: {collection: 'User', action: 'create'}})
  @post('/users/{userId}/permission-groups')
  @response(200, {
    description: 'Give permissions',
    properties: Http.createDocResponseSchemaForFindOneResult(User)
  })
  async createPermissionGroupRelated(
    @param.path.string('userId') userId: string,
    @requestBody({
      content: {
        'application/json': {schema: {type: 'array', items: {type: 'string'}}}
      }
    })
    permissionGroupIds: string[],
    @param.query.string('locale') locale?: LocaleEnum,
  ): Promise<IHttpResponse> {
    try {

      await this.userHasPermissionsRepository.createAll(permissionGroupIds.map((permissionGroupId) => {
        return {permissionGroupId, userId}
      }))

      const data = await this.userRepository.findById(userId, {include: ['person', 'company', 'permissionGroups']})

      return Http.okHttpResponse({
        data,
        locale,
        request: this.httpRequest,
        response: this.httpResponse,
      })

    } catch (err) {

      return Http.badRequestErrorHttpResponse({
        logMessage: err.message,
        locale,
        request: this.httpRequest,
        response: this.httpResponse,
      })

    }
  }

  @authenticate({strategy: 'autentikigo', options: {collection: 'User'}})
  @get('/users/{userId}/permission-groups')
  @response(200, {
    description: 'Array of permission groups',
    properties: Http.createDocResponseSchemaForFindManyResults(PermissionGroup)
  })
  async findPermissionsRelated(
    @param.path.string('userId') id: string,
    @param.query.number('limit') limit?: number,
    @param.query.number('page') page?: number,
    @param.query.string('order_by') orderBy?: string,
    @param.query.string('locale') locale?: LocaleEnum,
  ): Promise<IHttpResponse> {
    try {

      const filters = Http.createFilterRequestParams(this.httpRequest.url)

      const result = await this.userRepository.permissionGroups(id).find({
        ...filters,
        include: [{relation: 'permissions', scope: {include: ['permissionActions', 'module']}}]
      })

      const total = (await this.userRepository.permissionGroups(id).find({where: filters['where']})).length

      return Http.okHttpResponse({
        data: {total: total, result},
        locale,
        request: this.httpRequest,
        response: this.httpResponse,
      })

    } catch (err) {

      return Http.badRequestErrorHttpResponse({
        logMessage: err.message,
        locale,
        request: this.httpRequest,
        response: this.httpResponse,
      })

    }
  }

  @authenticate({strategy: 'autentikigo', options: {collection: 'User'}})
  @get('/users/{userId}/permission-groups/{projectId}')
  @response(200, {
    description: 'Array of permission groups by project',
    properties: Http.createDocResponseSchemaForFindOneResult(PermissionGroup)
  })
  async findProjectPermissionsRelated(
    @param.path.string('userId') id: string,
    @param.path.string('projectId') projectId: string,
    @param.query.number('limit') limit?: number,
    @param.query.number('page') page?: number,
    @param.query.string('order_by') orderBy?: string,
    @param.query.string('locale') locale?: LocaleEnum,
  ): Promise<IHttpResponse> {
    try {

      const filters = Http.createFilterRequestParams(
        this.httpRequest.url, [{projectId}]
      )

      const permissionGroups = await this.userRepository.permissionGroups(id).find({
        ...filters,
        include: [{relation: 'permissions', scope: {include: ['permissionActions', 'module']}}]
      })

      return Http.okHttpResponse({
        data: permissionGroups.length ? permissionGroups[0] : {},
        locale,
        request: this.httpRequest,
        response: this.httpResponse,
      })

    } catch (err) {

      return Http.badRequestErrorHttpResponse({
        logMessage: err.message,
        locale,
        request: this.httpRequest,
        response: this.httpResponse,
      })

    }
  }

  @authenticate({strategy: 'autentikigo', options: {collection: 'User', action: 'delete'}})
  @del('/users/{userId}/permission-groups')
  @response(200, {description: 'remove permissions'})
  async deletePermissionGroupRelated(
    @param.path.string('userId') userId: string,
    @requestBody({
      content: {
        'application/json': {schema: {type: 'array', items: {type: 'string'}}}
      }
    })
    permissionGroupIds: string[],
    @param.query.string('locale') locale?: LocaleEnum,
  ): Promise<IHttpResponse> {
    try {

      await this.userHasPermissionsRepository.deleteAll({
        or:
          (permissionGroupIds.map((permissionGroupId) => {return {and: [{userId}, {permissionGroupId}]}}))
      })

      return Http.noContentHttpResponse({
        locale,
        request: this.httpRequest,
        response: this.httpResponse,
      })

    } catch (err) {

      return Http.badRequestErrorHttpResponse({
        logMessage: err.message,
        locale,
        request: this.httpRequest,
        response: this.httpResponse,
      })

    }
  }
}
