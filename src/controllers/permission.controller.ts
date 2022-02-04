import {inject} from '@loopback/core'
import {
  repository
} from '@loopback/repository'
import {del, get, param, patch, post, put, Request, requestBody, response, Response, RestBindings} from '@loopback/rest'
import {SecurityBindings, securityId, UserProfile} from '@loopback/security'
import {HttpClass} from '../classes/http.class'
import {Acl} from '../models'
import {Permission} from '../models/permission.model'
import {PermissionRepository} from '../repositories'
import {localeMessage, serverMessages} from '../utils/server-messages'
import {PermissionHasAclsRepository} from './../repositories/permission-has-acls.repository'

//@authenticate('autentikigo')
export class PermissionController {

  private httpClass

  constructor(
    @repository(PermissionRepository) public permissionRepository: PermissionRepository,
    @repository(PermissionHasAclsRepository) public permissionHasAclRepository: PermissionHasAclsRepository,

    @inject(RestBindings.Http.REQUEST) private request: Request,
    @inject(RestBindings.Http.RESPONSE) private response: Response,

    @inject(SecurityBindings.USER, {optional: true}) private currentUser?: UserProfile,
  ) {
    this.httpClass = new HttpClass({response: this.response})
  }

  private getPermissionRelatedAcls = {
    relation: 'acls',
    scope: {
      include: [
        {relation: 'aclActions'}
      ]
    }
  }

  @post('/permissions')
  @response(200, {
    description: 'Permission model instance',
    properties: new HttpClass().findOneSchema(Permission)
  })
  async create(
    @requestBody({content: new HttpClass().requestSchema(Permission)}) data: any,
  ): Promise<void> {
    try {
      const _createdBy = this.currentUser?.[securityId] as string
      const permission = await this.permissionRepository.create({...data, _createdBy})
      this.httpClass.createResponse({data: permission})
    } catch (err) {
      this.httpClass.badRequestErrorResponse({
        message: serverMessages['crudError']['create'][localeMessage],
        logMessage: err.message
      })
    }
  }

  @get('/permissions')
  @response(200, {
    description: 'Array of Permission model instances',
    properties: new HttpClass().findAllResponseSchema(Permission)
  })
  async find(
    @param.query.number('limit') limit: number,
    @param.query.number('page') page: number,
    @param.query.string('order_by') order_by: string,
  ): Promise<void> {
    try {
      const filters = this.httpClass.createFilterRequestParams(this.request.url)
      const result = await this.permissionRepository.find({...filters, include: [this.getPermissionRelatedAcls]})
      const total = await this.permissionRepository.count(filters['where'])
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

  @get('/permissions/{permissionId}')
  @response(200, {
    description: 'Permission model instance',
    properties: new HttpClass().findOneSchema(Permission)
  })
  async findById(
    @param.path.string('permissionId') id: string,
  ): Promise<void> {
    try {
      const data = await this.permissionRepository.findById(id, {include: [this.getPermissionRelatedAcls]})
      this.httpClass.okResponse({data, message: serverMessages['crudSuccess']['read'][localeMessage]})
    } catch (err) {
      this.httpClass.badRequestErrorResponse({
        message: serverMessages['crudError']['read'][localeMessage],
        logMessage: err.message
      })
    }
  }

  @put('/permissions/{permissionId}')
  @response(200, {description: 'Permission PUT success'})
  async updateById(
    @param.path.string('permissionId') id: string,
    @requestBody({content: new HttpClass().requestSchema(Permission)}) data: any,
  ): Promise<void> {
    try {
      await this.permissionRepository.updateById(id, data)
      this.httpClass.noContentResponse()
    } catch (err) {
      this.httpClass.badRequestErrorResponse({
        message: serverMessages['crudError']['update'][localeMessage],
        logMessage: err.message,
      })
    }
  }

  @patch('/permissions/{permissionId}')
  @response(200, {description: 'Permission PATCH success'})
  async partialUpdateById(
    @param.path.string('permissionId') id: string,
    @requestBody({content: new HttpClass().requestSchema(Permission, true)}) data: any,
  ): Promise<void> {
    try {
      await this.permissionRepository.updateById(id, data)
      this.httpClass.noContentResponse()
    } catch (err) {
      this.httpClass.badRequestErrorResponse({
        message: serverMessages['crudError']['update'][localeMessage],
        logMessage: err.message,
      })
    }
  }

  @del('/permissions/{permissionId}')
  @response(204, {description: 'Permission DELETE success'})
  async deleteById(
    @param.path.string('permissionId') id: string
  ): Promise<void> {
    try {
      await this.permissionRepository.deleteById(id)
      this.httpClass.noContentResponse()
    } catch (err) {
      this.httpClass.badRequestErrorResponse({
        message: serverMessages['crudError']['delete'][localeMessage],
        logMessage: err.message,
      })
    }
  }

  @post('/permissions/{permissionId}/acls')
  @response(200, {
    description: 'create a Acls model instance',
    properties: new HttpClass().findOneSchema(Permission)
  })
  async createAclsRelated(
    @param.path.string('permissionId') permissionId: string,
    @requestBody({
      content: {
        'application/json': {schema: {type: 'array', items: {type: 'string'}}}
      }
    })
    aclIds: string[],
  ): Promise<void> {
    try {
      await this.permissionHasAclRepository.createAll(aclIds.map((aclId) => {
        return {permissionId, aclId}
      }))
      const data = await this.permissionRepository.findById(permissionId, {include: [this.getPermissionRelatedAcls]})
      this.httpClass.createResponse({data})
    } catch (err) {
      this.httpClass.badRequestErrorResponse({
        message: serverMessages['crudError']['create'][localeMessage],
        logMessage: err.message
      })
    }
  }

  @get('/permissions/{permissionId}/acls')
  @response(200, {
    description: 'Array of permission has many Acls through PermissionHasAcls',
    properties: new HttpClass().findAllResponseSchema(Acl)
  })
  async findAclActionsRelated(
    @param.path.string('permissionId') id: string,
    @param.query.number('limit') limit: number,
    @param.query.number('page') page: number,
    @param.query.string('order_by') order_by: string,
  ): Promise<void> {
    try {
      const filters = this.httpClass.createFilterRequestParams(this.request.url)
      const result = await this.permissionRepository.acls(id).find({...filters, include: ['aclActions']})
      const total = (await this.permissionRepository.acls(id).find({where: filters['where']})).length
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

  @del('/permissions/{permissionId}/acls')
  @response(200, {description: 'delete a Acl'})
  async delteAclActionsRelated(
    @param.path.string('permissionId') permissionId: string,
    @requestBody({
      content: {
        'application/json': {schema: {type: 'array', items: {type: 'string'}}}
      }
    })
    aclIds: string[],
  ): Promise<void> {
    try {
      await this.permissionHasAclRepository.deleteAll({
        or:
          (aclIds.map((aclId) => {return {and: [{permissionId}, {aclId}]}}))
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
