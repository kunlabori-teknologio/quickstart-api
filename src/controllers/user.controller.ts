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
import {Permission} from '../models'
import {Company} from '../models/company.model'
import {Person} from '../models/person.model'
import {User} from '../models/user.model'
import {CompanyRepository, UserRepository} from '../repositories'
import {localeMessage} from '../utils/server-messages'
import {PersonRepository} from './../repositories/person.repository'
import {UserHasPermissionsRepository} from './../repositories/user-has-permissions.repository'
import {serverMessages} from './../utils/server-messages'

export class UserController {

  private httpClass

  constructor(
    @repository(UserRepository) public userRepository: UserRepository,
    @repository(UserHasPermissionsRepository) private userHasPermissionsRepository: UserHasPermissionsRepository,
    @repository(PersonRepository) private personRepository: PersonRepository,
    @repository(CompanyRepository) private companyRepository: CompanyRepository,

    @inject(RestBindings.Http.REQUEST) private request: Request,
    @inject(RestBindings.Http.RESPONSE) private response: Response,
  ) {
    this.httpClass = new HttpClass({response: this.response})
  }

  @get('/users/{userId}')
  @response(200, {
    description: 'User model instance',
    properties: new HttpClass().findOneSchema(User, false)
  })
  async findById(
    @param.path.string('userId') id: string,
  ): Promise<void> {
    try {
      const data = await this.userRepository.findById(id)
      this.httpClass.okResponse({data, message: serverMessages['crudSuccess']['read'][localeMessage]})
    } catch (err) {
      this.httpClass.badRequestErrorResponse({
        message: serverMessages['crudError']['read'][localeMessage],
        logMessage: err.message
      })
    }
  }

  @get('/users/{userId}/person')
  @response(200, {
    description: 'Person model instance',
    properties: new HttpClass().findOneSchema(Person)
  })
  async findPersonRelated(
    @param.path.string('userId') userId: string,
  ): Promise<void> {
    try {
      const data = await this.personRepository.findOne({where: {userId}})
      if (!data) throw new Error(serverMessages['user']['personNotFound'][localeMessage])
      this.httpClass.okResponse({data, message: serverMessages['crudSuccess']['read'][localeMessage]})
    } catch (err) {
      this.httpClass.badRequestErrorResponse({
        message: serverMessages['crudError']['read'][localeMessage],
        logMessage: err.message
      })
    }
  }

  @get('/users/{userId}/company')
  @response(200, {
    description: 'Company model instance',
    properties: new HttpClass().findOneSchema(Company)
  })
  async findCompanyRelated(
    @param.path.string('userId') userId: string,
  ): Promise<void> {
    try {
      const data = await this.companyRepository.findOne({where: {userId}})
      if (!data) throw new Error(serverMessages['user']['companyNotFound'][localeMessage])
      this.httpClass.okResponse({data, message: serverMessages['crudSuccess']['read'][localeMessage]})
    } catch (err) {
      this.httpClass.badRequestErrorResponse({
        message: serverMessages['crudError']['read'][localeMessage],
        logMessage: err.message
      })
    }
  }

  @post('/users/{userId}/permissions')
  @response(200, {
    description: 'Give permissions',
    properties: new HttpClass().findOneSchema(User, true)
  })
  async createPermissionRelated(
    @param.path.string('userId') userId: string,
    @requestBody({
      content: {
        'application/json': {schema: {type: 'array', items: {type: 'string'}}}
      }
    })
    permissionIds: string[],
  ): Promise<void> {
    try {
      await this.userHasPermissionsRepository.createAll(permissionIds.map((permissionId) => {
        return {permissionId, userId}
      }))
      const data = await this.userRepository.findById(userId, {include: ['person', 'company', 'permissions']})
      this.httpClass.createResponse({data})
    } catch (err) {
      this.httpClass.badRequestErrorResponse({
        message: serverMessages['crudError']['create'][localeMessage],
        logMessage: err.message
      })
    }
  }

  @get('/users/{userId}/permissions')
  @response(200, {
    description: 'Array of permission',
    properties: new HttpClass().findAllResponseSchema(Permission)
  })
  async findPermissionsRelated(
    @param.path.string('userId') id: string,
    @param.query.number('limit') limit: number,
    @param.query.number('page') page: number,
    @param.query.string('order_by') order_by: string,
  ): Promise<void> {
    try {
      const filters = this.httpClass.createFilterRequestParams(this.request.url)
      const result = await this.userRepository.permissions(id).find({...filters, include: ['acls']})
      const total = (await this.userRepository.permissions(id).find({where: filters['where']})).length
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

  @del('/users/{userId}/permissions')
  @response(200, {description: 'delete a Permission'})
  async delteAclActionsRelated(
    @param.path.string('userId') userId: string,
    @requestBody({
      content: {
        'application/json': {schema: {type: 'array', items: {type: 'string'}}}
      }
    })
    permissionIds: string[],
  ): Promise<void> {
    try {
      await this.userHasPermissionsRepository.deleteAll({
        or:
          (permissionIds.map((permissionId) => {return {and: [{userId}, {permissionId}]}}))
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
