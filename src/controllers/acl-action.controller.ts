import {authenticate} from '@loopback/authentication'
import {inject} from '@loopback/core'
import {
  repository
} from '@loopback/repository'
import {del, get, param, patch, post, put, Request, requestBody, response, Response, RestBindings} from '@loopback/rest'
import {SecurityBindings, securityId, UserProfile} from '@loopback/security'
import {HttpClass} from '../classes/http.class'
import {AclAction} from '../models/acl-action.model'
import {AclActionRepository} from '../repositories'
import {localeMessage, serverMessages} from '../utils/server-messages'

//@authenticate('autentikigo')
export class AclActionController {

  private httpClass

  constructor(
    @repository(AclActionRepository) public aclActionRepository: AclActionRepository,

    @inject(RestBindings.Http.REQUEST) private request: Request,
    @inject(RestBindings.Http.RESPONSE) private response: Response,

    @inject(SecurityBindings.USER, {optional: true}) private currentUser?: UserProfile,
  ) {
    this.httpClass = new HttpClass({response: this.response})
  }

  @authenticate({strategy: 'autentikigo', options: {module: 'ACLAction', action: 'createOne'}})
  @post('/acl-actions')
  @response(200, {
    description: 'AclAction model instance',
    properties: new HttpClass().findOneSchema(AclAction)
  })
  async create(
    @requestBody({content: new HttpClass().requestSchema(AclAction)}) data: any,
  ): Promise<void> {
    try {
      const _createdBy = this.currentUser?.[securityId] as string
      const aclAction = await this.aclActionRepository.create({...data, _createdBy})
      this.httpClass.createResponse({data: aclAction})
    } catch (err) {
      this.httpClass.badRequestErrorResponse({
        message: serverMessages['crudError']['create'][localeMessage],
        logMessage: err.message
      })
    }
  }

  @authenticate({strategy: 'autentikigo', options: {module: 'ACLAction', action: 'read'}})
  @get('/acl-actions')
  @response(200, {
    description: 'Array of AclAction model instances',
    properties: new HttpClass().findAllResponseSchema(AclAction)
  })
  async find(
    @param.query.number('limit') limit: number,
    @param.query.number('page') page: number,
    @param.query.string('order_by') order_by: string,
  ): Promise<void> {
    try {
      const filters = this.httpClass.createFilterRequestParams(this.request.url)
      const result = await this.aclActionRepository.find(filters)
      const total = await this.aclActionRepository.count(filters['where'])
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

  @authenticate({strategy: 'autentikigo', options: {module: 'ACLAction', action: 'readOne'}})
  @get('/acl-actions/{aclActionId}')
  @response(200, {
    description: 'AclAction model instance',
    properties: new HttpClass().findOneSchema(AclAction)
  })
  async findById(
    @param.path.string('aclActionId') id: string,
  ): Promise<void> {
    try {
      const data = await this.aclActionRepository.findById(id)
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

  @authenticate({strategy: 'autentikigo', options: {module: 'ACLAction', action: 'updateOne'}})
  @put('/acl-actions/{aclActionId}')
  @response(200, {description: 'AclAction PUT success'})
  async updateById(
    @param.path.string('aclActionId') id: string,
    @requestBody({content: new HttpClass().requestSchema(AclAction)}) data: any,
  ): Promise<void> {
    try {
      await this.aclActionRepository.updateById(id, data)
      this.httpClass.noContentResponse()
    } catch (err) {
      this.httpClass.badRequestErrorResponse({
        message: serverMessages['crudError']['update'][localeMessage],
        logMessage: err.message,
      })
    }
  }

  @authenticate({strategy: 'autentikigo', options: {module: 'ACLAction', action: 'create'}})
  @patch('/acl-actions/{aclActionId}')
  @response(200, {description: 'AclAction PATCH success'})
  async partialUpdateById(
    @param.path.string('aclActionId') id: string,
    @requestBody({content: new HttpClass().requestSchema(AclAction, true)}) data: any,
  ): Promise<void> {
    try {
      await this.aclActionRepository.updateById(id, data)
      this.httpClass.noContentResponse()
    } catch (err) {
      this.httpClass.badRequestErrorResponse({
        message: serverMessages['crudError']['update'][localeMessage],
        logMessage: err.message,
      })
    }
  }

  @authenticate({strategy: 'autentikigo', options: {module: 'ACLAction', action: 'deleteOne'}})
  @del('/acl-actions/{aclActionId}')
  @response(204, {description: 'AclAction DELETE success'})
  async deleteById(
    @param.path.string('aclActionId') id: string
  ): Promise<void> {
    try {
      await this.aclActionRepository.deleteById(id)
      this.httpClass.noContentResponse()
    } catch (err) {
      this.httpClass.badRequestErrorResponse({
        message: serverMessages['crudError']['delete'][localeMessage],
        logMessage: err.message,
      })
    }
  }
}
