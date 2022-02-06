import {authenticate} from '@loopback/authentication'
import {inject} from '@loopback/core'
import {
  repository
} from '@loopback/repository'
import {del, get, param, patch, post, put, Request, requestBody, response, Response, RestBindings} from '@loopback/rest'
import {SecurityBindings, securityId, UserProfile} from '@loopback/security'
import {HttpClass} from '../classes/http.class'
import {PermissionGroup} from '../models'
import {PermissionGroupRepository} from '../repositories'
import {localeMessage, serverMessages} from '../utils/server-messages'

export class PermissionGroupController {

  private httpClass

  constructor(
    @repository(PermissionGroupRepository) public permissionGroupRepository: PermissionGroupRepository,

    @inject(RestBindings.Http.REQUEST) private httpRequest: Request,
    @inject(RestBindings.Http.RESPONSE) private httpResponse: Response,

    @inject(SecurityBindings.USER, {optional: true}) private currentUser?: UserProfile,
  ) {
    this.httpClass = new HttpClass({response: this.httpResponse, request: this.httpRequest})
  }

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
    properties: new HttpClass().findOneSchema(PermissionGroup)
  })
  async create(
    @requestBody({content: new HttpClass().requestSchema(PermissionGroup)}) data: PermissionGroup,
  ): Promise<void> {
    try {
      const createdBy = this.currentUser?.[securityId] as string
      const permission = await this.permissionGroupRepository.create({...data, _createdBy: createdBy})
      this.httpClass.createResponse({data: permission})
    } catch (err) {
      this.httpClass.badRequestErrorResponse({
        message: serverMessages['crudError']['create'][localeMessage],
        logMessage: err.message
      })
    }
  }

  @authenticate({strategy: 'autentikigo', options: {collection: 'PermissionGroup'}})
  @get('/permission-groups')
  @response(200, {
    description: 'Array of Permission group model instances',
    properties: new HttpClass().findAllResponseSchema(PermissionGroup)
  })
  async find(
    @param.query.number('limit') limit: number,
    @param.query.number('page') page: number,
    @param.query.string('order_by') orderBy: string,
  ): Promise<void> {
    try {
      const filters = this.httpClass.createFilterRequestParams(this.httpRequest.url)
      const result = await this.permissionGroupRepository.find({...filters, include: [this.getPermissionGroupRelatedPermissions]})
      const total = await this.permissionGroupRepository.count(filters['where'])
      this.httpClass.okResponse({
        data: {total: total?.count, result},
        message: serverMessages['crudSuccess']['read'][localeMessage],
      })
    } catch (err) {
      this.httpClass.badRequestErrorResponse({
        message: serverMessages['crudError']['read'][localeMessage],
        logMessage: err.message
      })
    }
  }

  @authenticate({strategy: 'autentikigo', options: {collection: 'PermissionGroup'}})
  @get('/permission-groups/{permissionGroupId}')
  @response(200, {
    description: 'Permission group model instance',
    properties: new HttpClass().findOneSchema(PermissionGroup)
  })
  async findById(
    @param.path.string('permissionGroupId') id: string,
  ): Promise<void> {
    try {
      const data = await this.permissionGroupRepository.findById(id, {include: [this.getPermissionGroupRelatedPermissions]})
      this.httpClass.okResponse({data, message: serverMessages['crudSuccess']['read'][localeMessage]})
    } catch (err) {
      this.httpClass.badRequestErrorResponse({
        message: serverMessages['crudError']['read'][localeMessage],
        logMessage: err.message
      })
    }
  }

  @authenticate({strategy: 'autentikigo', options: {collection: 'PermissionGroup', action: 'updateOne'}})
  @put('/permission-groups/{permissionGroupId}')
  @response(200, {description: 'Permission group PUT success'})
  async updateById(
    @param.path.string('permissionGroupId') id: string,
    @requestBody({content: new HttpClass().requestSchema(PermissionGroup)}) data: PermissionGroup,
  ): Promise<void> {
    try {
      await this.permissionGroupRepository.updateById(id, data)
      this.httpClass.noContentResponse()
    } catch (err) {
      this.httpClass.badRequestErrorResponse({
        message: serverMessages['crudError']['update'][localeMessage],
        logMessage: err.message,
      })
    }
  }

  @authenticate({strategy: 'autentikigo', options: {collection: 'PermissionGroup', action: 'updateOne'}})
  @patch('/permission-groups/{permissionGroupId}')
  @response(200, {description: 'Permission group PATCH success'})
  async partialUpdateById(
    @param.path.string('permissionGroupId') id: string,
    @requestBody({content: new HttpClass().requestSchema(PermissionGroup, true)}) data: PermissionGroup,
  ): Promise<void> {
    try {
      await this.permissionGroupRepository.updateById(id, data)
      this.httpClass.noContentResponse()
    } catch (err) {
      this.httpClass.badRequestErrorResponse({
        message: serverMessages['crudError']['update'][localeMessage],
        logMessage: err.message,
      })
    }
  }

  @authenticate({strategy: 'autentikigo', options: {collection: 'PermissionGroup', action: 'deleteOne'}})
  @del('/permission-groups/{permissionGroupId}')
  @response(204, {description: 'Permission group DELETE success'})
  async deleteById(
    @param.path.string('permissionGroupId') id: string
  ): Promise<void> {
    try {
      await this.permissionGroupRepository.deleteById(id)
      this.httpClass.noContentResponse()
    } catch (err) {
      this.httpClass.badRequestErrorResponse({
        message: serverMessages['crudError']['delete'][localeMessage],
        logMessage: err.message,
      })
    }
  }
}
