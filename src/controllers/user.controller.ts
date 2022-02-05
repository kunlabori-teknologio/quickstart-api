import {authenticate} from '@loopback/authentication'
import {inject} from '@loopback/core'
import {
  repository
} from '@loopback/repository'
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
} from '@loopback/rest'
import {HttpClass} from '../classes/http.class'
import {PermissionGroup} from '../models'
import {User} from '../models/user.model'
import {UserRepository} from '../repositories'
import {UserHasPermissionGroupsRepository} from '../repositories/user-has-permission-groups.repository'
import {localeMessage} from '../utils/server-messages'
import {serverMessages} from './../utils/server-messages'

export class UserController {

  private httpClass

  constructor(
    @repository(UserRepository) public userRepository: UserRepository,
    @repository(UserHasPermissionGroupsRepository) private userHasPermissionsRepository: UserHasPermissionGroupsRepository,

    @inject(RestBindings.Http.REQUEST) private request: Request,
    @inject(RestBindings.Http.RESPONSE) private response: Response,
  ) {
    this.httpClass = new HttpClass({response: this.response})
  }

  @authenticate({strategy: 'autentikigo', options: {collection: 'User'}})
  @get('/users/{userId}')
  @response(200, {
    description: 'User model instance',
    properties: new HttpClass().findOneSchema(User, false)
  })
  async findById(
    @param.path.string('userId') id: string,
  ): Promise<void> {
    try {
      const data = await this.userRepository.findById(id, {include: ['person', 'company']})
      this.httpClass.okResponse({data, message: serverMessages['crudSuccess']['read'][localeMessage]})
    } catch (err) {
      this.httpClass.badRequestErrorResponse({
        message: serverMessages['crudError']['read'][localeMessage],
        logMessage: err.message
      })
    }
  }

  @authenticate({strategy: 'autentikigo', options: {collection: 'User', action: 'create'}})
  @post('/users/{userId}/permission-groups')
  @response(200, {
    description: 'Give permissions',
    properties: new HttpClass().findOneSchema(User, true)
  })
  async createPermissionGroupRelated(
    @param.path.string('userId') userId: string,
    @requestBody({
      content: {
        'application/json': {schema: {type: 'array', items: {type: 'string'}}}
      }
    })
    permissionGroupIds: string[],
  ): Promise<void> {
    try {
      await this.userHasPermissionsRepository.createAll(permissionGroupIds.map((permissionGroupId) => {
        return {permissionGroupId, userId}
      }))
      const data = await this.userRepository.findById(userId, {include: ['person', 'company', 'permissionGroups']})
      this.httpClass.createResponse({data})
    } catch (err) {
      this.httpClass.badRequestErrorResponse({
        message: serverMessages['crudError']['create'][localeMessage],
        logMessage: err.message
      })
    }
  }

  @authenticate({strategy: 'autentikigo', options: {collection: 'User'}})
  @get('/users/{userId}/permission-groups')
  @response(200, {
    description: 'Array of permission groups',
    properties: new HttpClass().findAllResponseSchema(PermissionGroup)
  })
  async findPermissionsRelated(
    @param.path.string('userId') id: string,
    @param.query.number('limit') limit: number,
    @param.query.number('page') page: number,
    @param.query.string('order_by') order_by: string,
  ): Promise<void> {
    try {
      const filters = this.httpClass.createFilterRequestParams(this.request.url)
      const result = await this.userRepository.permissionGroups(id).find({
        ...filters,
        include: [{relation: 'permissions', scope: {include: ['permissionActions', 'module']}}]
      })
      const total = (await this.userRepository.permissionGroups(id).find({where: filters['where']})).length
      this.httpClass.okResponse({
        data: {total: total, result},
        message: serverMessages['crudSuccess']['read'][localeMessage],
      })
    } catch (err) {
      this.httpClass.badRequestErrorResponse({
        message: serverMessages['crudError']['read'][localeMessage],
        logMessage: err.message
      })
    }
  }

  @authenticate({strategy: 'autentikigo', options: {collection: 'User'}})
  @get('/users/{userId}/permission-groups/{projectId}')
  @response(200, {
    description: 'Array of permission groups by project',
    properties: new HttpClass().findOneSchema(PermissionGroup)
  })
  async findProjectPermissionsRelated(
    @param.path.string('userId') id: string,
    @param.path.string('projectId') projectId: string,
    @param.query.number('limit') limit: number,
    @param.query.number('page') page: number,
    @param.query.string('order_by') order_by: string,
  ): Promise<void> {
    try {
      const filters = this.httpClass.createFilterRequestParams(
        this.request.url, [{projectId}]
      )
      const permissionGroups = await this.userRepository.permissionGroups(id).find({
        ...filters,
        include: [{relation: 'permissions', scope: {include: ['permissionActions', 'module']}}]
      })
      this.httpClass.okResponse({
        data: permissionGroups.length ? permissionGroups[0] : {},
        message: serverMessages['crudSuccess']['read'][localeMessage],
      })
    } catch (err) {
      this.httpClass.badRequestErrorResponse({
        message: serverMessages['crudError']['read'][localeMessage],
        logMessage: err.message
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
  ): Promise<void> {
    try {
      await this.userHasPermissionsRepository.deleteAll({
        or:
          (permissionGroupIds.map((permissionGroupId) => {return {and: [{userId}, {permissionGroupId}]}}))
      })
      this.httpClass.noContentResponse({
        message: serverMessages['crudSuccess']['delete'][localeMessage]
      })
    } catch (err) {
      this.httpClass.badRequestErrorResponse({
        message: serverMessages['crudError']['delete'][localeMessage],
        logMessage: err.message
      })
    }
  }
}
