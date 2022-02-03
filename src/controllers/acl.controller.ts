import {inject} from '@loopback/core';
import {
  repository
} from '@loopback/repository';
import {del, get, param, patch, post, put, Request, requestBody, response, Response, RestBindings} from '@loopback/rest';
import {SecurityBindings, securityId, UserProfile} from '@loopback/security';
import {AclAction} from '../models/acl-action.model';
import {Acl} from '../models/acl.model';
import {AclRepository} from '../repositories';
import {localeMessage, serverMessages} from '../utils/server-messages';
import {HttpClass} from './../classes/http.class';
import {AclHasActionsRepository} from './../repositories/acl-has-actions.repository';

//@authenticate('autentikigo')
export class AclController {

  private httpClass

  constructor(
    @repository(AclRepository) public aclRepository: AclRepository,
    @repository(AclHasActionsRepository) private aclHasActionsRepository: AclHasActionsRepository,

    @inject(RestBindings.Http.REQUEST) private request: Request,
    @inject(RestBindings.Http.RESPONSE) private response: Response,

    @inject(SecurityBindings.USER, {optional: true}) private currentUser?: UserProfile,
  ) {
    this.httpClass = new HttpClass({response: this.response})
  }

  @post('/acls')
  @response(200, {
    description: 'Acl model instance',
    properties: new HttpClass().findOneSchema(Acl)
  })
  async create(
    @requestBody({content: new HttpClass().requestSchema(Acl)}) data: any,
  ): Promise<void> {
    try {
      const _createdBy = this.currentUser?.[securityId] as string
      const acl = await this.aclRepository.create({...data, _createdBy})
      this.httpClass.createResponse({data: acl})
    } catch (err) {
      this.httpClass.badRequestErrorResponse({
        message: serverMessages['crudError']['create'][localeMessage],
        logMessage: err.message
      })
    }
  }

  @get('/acls')
  @response(200, {
    description: 'Array of Acl model instances',
    properties: new HttpClass().findAllResponseSchema(Acl)
  })
  async find(
    @param.query.number('limit') limit: number,
    @param.query.number('page') page: number,
    @param.query.string('order_by') order_by: string,
  ): Promise<void> {
    try {
      const filters = this.httpClass.createFilterRequestParams(this.request.url)
      const result = await this.aclRepository.find({...filters, include: ['aclActions']})
      const total = await this.aclRepository.count(filters['where'])
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

  @get('/acls/{aclId}')
  @response(200, {
    description: 'Acl model instance',
    properties: new HttpClass().findOneSchema(Acl)
  })
  async findById(
    @param.path.string('aclId') id: string,
  ): Promise<void> {
    try {
      const data = await this.aclRepository.findById(id, {include: ['aclActions']})
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

  @put('/acls/{aclId}')
  @response(200, {description: 'Acl PUT success'})
  async updateById(
    @param.path.string('aclId') id: string,
    @requestBody({content: new HttpClass().requestSchema(Acl)}) data: any,
  ): Promise<void> {
    try {
      await this.aclRepository.updateById(id, data)
      this.httpClass.noContentResponse()
    } catch (err) {
      this.httpClass.badRequestErrorResponse({
        message: serverMessages['crudError']['update'][localeMessage],
        logMessage: err.message,
      })
    }
  }

  @patch('/acls/{aclId}')
  @response(200, {description: 'Acl PATCH success'})
  async partialUpdateById(
    @param.path.string('aclId') id: string,
    @requestBody({content: new HttpClass().requestSchema(Acl, true)}) data: any,
  ): Promise<void> {
    try {
      await this.aclRepository.updateById(id, data)
      this.httpClass.noContentResponse()
    } catch (err) {
      this.httpClass.badRequestErrorResponse({
        message: serverMessages['crudError']['update'][localeMessage],
        logMessage: err.message,
      })
    }
  }

  @del('/acls/{aclId}')
  @response(204, {description: 'Acl DELETE success'})
  async deleteById(
    @param.path.string('aclId') id: string
  ): Promise<void> {
    try {
      await this.aclRepository.deleteById(id)
      this.httpClass.noContentResponse()
    } catch (err) {
      this.httpClass.badRequestErrorResponse({
        message: serverMessages['crudError']['delete'][localeMessage],
        logMessage: err.message,
      })
    }
  }

  @post('/acls/{aclId}/acl-actions')
  @response(200, {
    description: 'create a AclAction model instance',
    properties: new HttpClass().findOneSchema(Acl)
  })
  async createAclActionsRelated(
    @param.path.string('aclId') aclId: string,
    @requestBody({
      content: {
        'application/json': {schema: {type: 'array', items: {type: 'string'}}}
      }
    })
    aclActionIds: string[],
  ): Promise<void> {
    try {
      await this.aclHasActionsRepository.createAll(aclActionIds.map((aclActionId) => {
        return {aclId, aclActionId}
      }))
      const data = await this.aclRepository.findById(aclId, {include: ['aclActions']})
      this.httpClass.createResponse({data})
    } catch (err) {
      this.httpClass.badRequestErrorResponse({
        message: serverMessages['crudError']['create'][localeMessage],
        logMessage: err.message
      })
    }
  }

  @get('/acls/{aclId}/acl-actions')
  @response(200, {
    description: 'Array of Acl has many AclAction through AclHasActions',
    properties: new HttpClass().findAllResponseSchema(AclAction)
  })
  async findAclActionsRelated(
    @param.path.string('aclId') id: string,
    @param.query.number('limit') limit: number,
    @param.query.number('page') page: number,
    @param.query.string('order_by') order_by: string,
  ): Promise<void> {
    try {
      const filters = this.httpClass.createFilterRequestParams(this.request.url)
      const result = await this.aclRepository.aclActions(id).find(filters)
      const total = (await this.aclRepository.aclActions(id).find({where: filters['where']})).length
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

  @del('/acls/{aclId}/acl-actions')
  @response(200, {
    description: 'create a AclAction model instance',
    properties: new HttpClass().findOneSchema(Acl)
  })
  async delteAclActionsRelated(
    @param.path.string('aclId') aclId: string,
    @requestBody({
      content: {
        'application/json': {schema: {type: 'array', items: {type: 'string'}}}
      }
    })
    aclActionIds: string[],
  ): Promise<void> {
    try {
      await this.aclHasActionsRepository.deleteAll({
        or:
          (aclActionIds.map((aclActionId) => {return {and: [{aclId}, {aclActionId}]}}))
      })
      const data = await this.aclRepository.findById(aclId, {include: ['aclActions']})
      this.httpClass.okResponse({
        message: serverMessages['crudSuccess']['delete'][localeMessage],
        data
      })
    } catch (err) {
      this.httpClass.badRequestErrorResponse({
        message: serverMessages['crudError']['delete'][localeMessage],
        logMessage: err.message
      })
    }
  }
}
