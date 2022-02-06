import {authenticate} from '@loopback/authentication'
import {inject} from '@loopback/core'
import {
  repository
} from '@loopback/repository'
import {del, get, param, patch, post, put, Request, requestBody, response, Response, RestBindings} from '@loopback/rest'
import {SecurityBindings, securityId, UserProfile} from '@loopback/security'
import {HttpClass} from '../classes/http.class'
import {Module} from '../models/module.model'
import {ModuleRepository} from '../repositories/module.repository'
import {localeMessage, serverMessages} from '../utils/server-messages'

export class ModuleController {

  private httpClass

  constructor(
    @repository(ModuleRepository) public moduleRepository: ModuleRepository,

    @inject(RestBindings.Http.REQUEST) private httpRequest: Request,
    @inject(RestBindings.Http.RESPONSE) private httpResponse: Response,

    @inject(SecurityBindings.USER, {optional: true}) private currentUser?: UserProfile,
  ) {
    this.httpClass = new HttpClass({response: this.httpResponse, request: this.httpRequest})
  }

  @authenticate({strategy: 'autentikigo', options: {collection: 'Module', action: 'createOne'}})
  @post('/modules')
  @response(200, {
    description: 'Module model instance',
    properties: new HttpClass().findOneSchema(Module)
  })
  async create(
    @requestBody({content: new HttpClass().requestSchema(Module)}) data: Module,
  ): Promise<void> {
    try {
      const createdBy = this.currentUser?.[securityId] as string
      const module = await this.moduleRepository.create({...data, _createdBy: createdBy})
      this.httpClass.createResponse({data: module})
    } catch (err) {
      this.httpClass.badRequestErrorResponse({
        message: serverMessages['crudError']['create'][localeMessage],
        logMessage: err.message
      })
    }
  }

  @authenticate({strategy: 'autentikigo', options: {collection: 'Module'}})
  @get('/modules')
  @response(200, {
    description: 'Array of Module model instances',
    properties: new HttpClass().findAllResponseSchema(Module)
  })
  async find(
    @param.query.number('limit') limit: number,
    @param.query.number('page') page: number,
    @param.query.string('order_by') orderBy: string,
  ): Promise<void> {
    try {
      const filters = this.httpClass.createFilterRequestParams(this.httpRequest.url)
      const result = await this.moduleRepository.find(filters)
      const total = await this.moduleRepository.count(filters['where'])
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

  @authenticate({strategy: 'autentikigo', options: {collection: 'Module'}})
  @get('/modules/{moduleId}')
  @response(200, {
    description: 'Module model instance',
    properties: new HttpClass().findOneSchema(Module)
  })
  async findById(
    @param.path.string('moduleId') id: string,
  ): Promise<void> {
    try {
      const data = await this.moduleRepository.findById(id)
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

  @authenticate({strategy: 'autentikigo', options: {collection: 'Module', action: 'updateOne'}})
  @put('/modules/{moduleId}')
  @response(200, {description: 'Module PUT success'})
  async updateById(
    @param.path.string('moduleId') id: string,
    @requestBody({content: new HttpClass().requestSchema(Module)}) data: Module,
  ): Promise<void> {
    try {
      await this.moduleRepository.updateById(id, data)
      this.httpClass.noContentResponse()
    } catch (err) {
      this.httpClass.badRequestErrorResponse({
        message: serverMessages['crudError']['update'][localeMessage],
        logMessage: err.message,
      })
    }
  }

  @authenticate({strategy: 'autentikigo', options: {collection: 'Module', action: 'create'}})
  @patch('/modules/{moduleId}')
  @response(200, {description: 'Module PATCH success'})
  async partialUpdateById(
    @param.path.string('moduleId') id: string,
    @requestBody({content: new HttpClass().requestSchema(Module, true)}) data: Module,
  ): Promise<void> {
    try {
      await this.moduleRepository.updateById(id, data)
      this.httpClass.noContentResponse()
    } catch (err) {
      this.httpClass.badRequestErrorResponse({
        message: serverMessages['crudError']['update'][localeMessage],
        logMessage: err.message,
      })
    }
  }

  @authenticate({strategy: 'autentikigo', options: {collection: 'Module', action: 'deleteOne'}})
  @del('/modules/{moduleId}')
  @response(204, {description: 'Module DELETE success'})
  async deleteById(
    @param.path.string('moduleId') id: string
  ): Promise<void> {
    try {
      await this.moduleRepository.deleteById(id)
      this.httpClass.noContentResponse()
    } catch (err) {
      this.httpClass.badRequestErrorResponse({
        message: serverMessages['crudError']['delete'][localeMessage],
        logMessage: err.message,
      })
    }
  }
}
