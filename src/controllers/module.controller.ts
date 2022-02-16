import {authenticate} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {
  repository
} from '@loopback/repository';
import {del, get, param, patch, post, put, Request, requestBody, response, Response, RestBindings} from '@loopback/rest';
import {SecurityBindings, securityId, UserProfile} from '@loopback/security';
import {LocaleEnum} from '../enums/locale.enum';
import {Http} from '../implementations/index';
import {IHttpResponse} from '../interfaces/http.interface';
import {Module} from '../models/module.model';
import {ModuleRepository} from '../repositories/module.repository';
import {serverMessages} from '../utils/server-messages';

export class ModuleController {

  constructor(
    @repository(ModuleRepository) public moduleRepository: ModuleRepository,

    @inject(RestBindings.Http.REQUEST) private httpRequest: Request,
    @inject(RestBindings.Http.RESPONSE) private httpResponse: Response,

    @inject(SecurityBindings.USER, {optional: true}) private currentUser?: UserProfile,
  ) { }

  @authenticate({strategy: 'autentikigo', options: {collection: 'Module', action: 'createOne'}})
  @post('/modules')
  @response(200, {
    description: 'Module model instance',
    properties: Http.createDocResponseSchemaForFindOneResult(Module)
  })
  async create(
    @requestBody({
      content: Http.createDocRequestSchema(Module)
    }) data: Module,
    @param.query.string('locale') locale?: LocaleEnum,
  ): Promise<IHttpResponse> {
    try {

      const createdBy = this.currentUser?.[securityId] as string

      const module = await this.moduleRepository.create({...data, _createdBy: createdBy})

      return Http.createHttpResponse({
        data: module,
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

  @authenticate({strategy: 'autentikigo', options: {collection: 'Module'}})
  @get('/modules')
  @response(200, {
    description: 'Array of Module model instances',
    properties: Http.createDocResponseSchemaForFindManyResults(Module)
  })
  async find(
    @param.query.number('limit') limit?: number,
    @param.query.number('page') page?: number,
    @param.query.string('order_by') orderBy?: string,
    @param.query.string('locale') locale?: LocaleEnum,
  ): Promise<IHttpResponse> {
    try {

      const filters = Http.createFilterRequestParams(this.httpRequest.url)

      const result = await this.moduleRepository.find(filters)

      const total = await this.moduleRepository.count(filters['where'])

      return Http.okHttpResponse({
        data: {total: total?.count, result},
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

  @authenticate({strategy: 'autentikigo', options: {collection: 'Module'}})
  @get('/modules/{moduleId}')
  @response(200, {
    description: 'Module model instance',
    properties: Http.createDocResponseSchemaForFindOneResult(Module)
  })
  async findById(
    @param.path.string('moduleId') id: string,
    @param.query.string('locale') locale?: LocaleEnum,
  ): Promise<IHttpResponse> {
    try {

      const data = await this.moduleRepository.findOne({where: {and: [{_id: id}, {_deletedAt: {eq: null}}]}})
      if (!data) throw new Error(serverMessages['httpResponse']['notFoundError'][locale ?? LocaleEnum['pt-BR']])

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

  @authenticate({strategy: 'autentikigo', options: {collection: 'Module', action: 'updateOne'}})
  @put('/modules/{moduleId}')
  @response(200, {description: 'Module PUT success'})
  async updateById(
    @param.path.string('moduleId') id: string,
    @requestBody({
      content: Http.createDocRequestSchema(Module)
    }) data: Module,
    @param.query.string('locale') locale?: LocaleEnum,
  ): Promise<IHttpResponse> {
    try {

      await this.moduleRepository.updateById(id, data)

      return Http.noContentHttpResponse({
        locale,
        request: this.httpRequest,
        response: this.httpResponse,
      })

    } catch (err) {

      return Http.badRequestErrorHttpResponse({
        logMessage: err.message,
        request: this.httpRequest,
        response: this.httpResponse,
      })

    }
  }

  @authenticate({strategy: 'autentikigo', options: {collection: 'Module', action: 'create'}})
  @patch('/modules/{moduleId}')
  @response(200, {description: 'Module PATCH success'})
  async partialUpdateById(
    @param.path.string('moduleId') id: string,
    @requestBody({
      content: Http.createDocRequestSchema(Module)
    }) data: Module,
    @param.query.string('locale') locale?: LocaleEnum,
  ): Promise<IHttpResponse> {
    try {

      await this.moduleRepository.updateById(id, data)

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

  @authenticate({strategy: 'autentikigo', options: {collection: 'Module', action: 'deleteOne'}})
  @del('/modules/{moduleId}')
  @response(204, {description: 'Module DELETE success'})
  async deleteById(
    @param.path.string('moduleId') id: string,
    @param.query.string('locale') locale?: LocaleEnum,
  ): Promise<IHttpResponse> {
    try {

      const moduleToDelete = await this.moduleRepository.findById(id)

      await this.moduleRepository.updateById(id, {...moduleToDelete, _deletedAt: new Date()})

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
