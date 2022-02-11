import {authenticate} from '@loopback/authentication'
import {inject} from '@loopback/core'
import {
  repository
} from '@loopback/repository'
import {del, get, param, patch, post, put, Request, requestBody, response, Response, RestBindings} from '@loopback/rest'
import {SecurityBindings, securityId, UserProfile} from '@loopback/security'
import {HttpClass} from '../classes/http.class'
import {PermissionAction} from '../models/permission-action.model'
import {PermissionActionRepository} from '../repositories'
import {localeMessage, serverMessages} from '../utils/server-messages'

export class PermissionActionController {

  private httpClass

  constructor(
    @repository(PermissionActionRepository) public permissionActionRepository: PermissionActionRepository,

    @inject(RestBindings.Http.REQUEST) private httpRequest: Request,
    @inject(RestBindings.Http.RESPONSE) private httpResponse: Response,

    @inject(SecurityBindings.USER, {optional: true}) private currentUser?: UserProfile,
  ) {
    this.httpClass = new HttpClass({response: this.httpResponse, request: this.httpRequest})
  }

  @authenticate({strategy: 'autentikigo', options: {collection: 'PermissionAction', action: 'createOne'}})
  @post('/permission-actions')
  @response(200, {
    description: 'PermissionAction model instance',
    properties: new HttpClass().findOneSchema(PermissionAction)
  })
  async create(
    @requestBody({content: new HttpClass().requestSchema(PermissionAction)}) data: PermissionAction,
  ): Promise<void> {
    try {
      const createdBy = this.currentUser?.[securityId] as string
      const permissionAction = await this.permissionActionRepository.create({...data, _createdBy: createdBy})
      this.httpClass.createResponse({data: permissionAction})
    } catch (err) {
      this.httpClass.badRequestErrorResponse({
        message: serverMessages['crudError']['create'][localeMessage],
        logMessage: err.message
      })
    }
  }

  @authenticate({strategy: 'autentikigo', options: {collection: 'PermissionAction'}})
  @get('/permission-actions')
  @response(200, {
    description: 'Array of PermissionAction model instances',
    properties: new HttpClass().findAllResponseSchema(PermissionAction)
  })
  async find(
    @param.query.number('limit') limit: number,
    @param.query.number('page') page: number,
    @param.query.string('order_by') orderBy: string,
  ): Promise<void> {
    try {
      const filters = this.httpClass.createFilterRequestParams(this.httpRequest.url)
      const result = await this.permissionActionRepository.find(filters)
      const total = await this.permissionActionRepository.count(filters['where'])
      this.httpClass.okResponse({
        data: {total: total?.count, result},
        message: serverMessages['crudSuccess']['read'][localeMessage]
      })
    } catch (err) {
      this.httpClass.badRequestErrorResponse({
        message: serverMessages['crudError']['read'][localeMessage],
        logMessage: err
      })
    }
  }

  @authenticate({strategy: 'autentikigo', options: {collection: 'PermissionAction'}})
  @get('/permission-actions/{permissionActionId}')
  @response(200, {
    description: 'PermissionAction model instance',
    properties: new HttpClass().findOneSchema(PermissionAction)
  })
  async findById(
    @param.path.string('permissionActionId') id: string,
  ): Promise<void> {
    try {
      const data = await this.permissionActionRepository.findById(id)
      this.httpClass.okResponse({
        data,
        message: serverMessages['crudSuccess']['read'][localeMessage]
      })
    } catch (err) {
      this.httpClass.badRequestErrorResponse({
        message: serverMessages['crudError']['read'][localeMessage],
        logMessage: err.message
      })
    }
  }

  @authenticate({strategy: 'autentikigo', options: {collection: 'PermissionAction', action: 'updateOne'}})
  @put('/permission-actions/{permissionActionId}')
  @response(200, {description: 'PermissionAction PUT success'})
  async updateById(
    @param.path.string('permissionActionId') id: string,
    @requestBody({content: new HttpClass().requestSchema(PermissionAction)}) data: PermissionAction,
  ): Promise<void> {
    try {
      await this.permissionActionRepository.updateById(id, data)
      this.httpClass.noContentResponse()
    } catch (err) {
      this.httpClass.badRequestErrorResponse({
        message: serverMessages['crudError']['update'][localeMessage],
        logMessage: err.message,
      })
    }
  }

  @authenticate({strategy: 'autentikigo', options: {collection: 'PermissionAction', action: 'create'}})
  @patch('/permission-actions/{permissionActionId}')
  @response(200, {description: 'PermissionAction PATCH success'})
  async partialUpdateById(
    @param.path.string('permissionActionId') id: string,
    @requestBody({content: new HttpClass().requestSchema(PermissionAction, true)}) data: PermissionAction,
  ): Promise<void> {
    try {
      await this.permissionActionRepository.updateById(id, data)
      this.httpClass.noContentResponse()
    } catch (err) {
      this.httpClass.badRequestErrorResponse({
        message: serverMessages['crudError']['update'][localeMessage],
        logMessage: err.message,
      })
    }
  }

  @authenticate({strategy: 'autentikigo', options: {collection: 'PermissionAction', action: 'deleteOne'}})
  @del('/permission-actions/{permissionActionId}')
  @response(204, {description: 'PermissionAction DELETE success'})
  async deleteById(
    @param.path.string('permissionActionId') id: string
  ): Promise<void> {
    try {
      const permissionActionToDelete = await this.permissionActionRepository.findById(id)
      await this.permissionActionRepository.updateById(id, {...permissionActionToDelete, _deletedAt: new Date()})
      this.httpClass.noContentResponse()
    } catch (err) {
      this.httpClass.badRequestErrorResponse({
        message: serverMessages['crudError']['delete'][localeMessage],
        logMessage: err.message,
      })
    }
  }
}
