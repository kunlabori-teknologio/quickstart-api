import {authenticate} from '@loopback/authentication'
import {inject} from '@loopback/core'
import {
  repository
} from '@loopback/repository'
import {del, get, param, patch, post, put, Request, requestBody, response, Response, RestBindings} from '@loopback/rest'
import {SecurityBindings, securityId, UserProfile} from '@loopback/security'
import {LocaleEnum} from '../enums/locale.enum'
import {Http} from '../implementations/index'
import {IHttpResponse} from '../interfaces/http.interface'
import {Project} from '../models/project.model'
import {ProjectRepository} from '../repositories/project.repository'
import {serverMessages} from '../utils/server-messages'

export class ProjectController {

  constructor(
    @repository(ProjectRepository) public projectRepository: ProjectRepository,

    @inject(RestBindings.Http.REQUEST) private httpRequest: Request,
    @inject(RestBindings.Http.RESPONSE) private httpResponse: Response,

    @inject(SecurityBindings.USER, {optional: true}) private currentUser?: UserProfile,
  ) { }

  private getProjectRelatedPermissionsAndModules = [
    {
      relation: 'permissionGroups',
      scope: {
        include: [{
          relation: 'permissions',
          scope: {
            include: ['permissionActions', 'module'],
          }
        }]
      }
    },
    {relation: 'modules'}
  ]

  @authenticate({strategy: 'autentikigo', options: {collection: 'Project', action: 'createOne'}})
  @post('/projects')
  @response(200, {
    description: 'Project model instance',
    properties: Http.createDocResponseSchemaForFindOneResult(Project)
  })
  async create(
    @requestBody({
      content: Http.createDocRequestSchema(Project)
    }) data: Project,
    @param.query.string('locale') locale?: LocaleEnum,
  ): Promise<IHttpResponse> {
    try {

      const createdBy = this.currentUser?.[securityId] as string

      const project = await this.projectRepository.create({...data, _createdBy: createdBy})

      return Http.createHttpResponse({
        data: project,
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

  @authenticate({strategy: 'autentikigo', options: {collection: 'Project'}})
  @get('/projects')
  @response(200, {
    description: 'Array of Project model instances',
    properties: Http.createDocResponseSchemaForFindManyResults(Project)
  })
  async find(
    @param.query.number('limit') limit?: number,
    @param.query.number('page') page?: number,
    @param.query.string('order_by') orderBy?: string,
    @param.query.string('locale') locale?: LocaleEnum,
  ): Promise<IHttpResponse> {
    try {

      const filters = Http.createFilterRequestParams(this.httpRequest.url)

      const result = await this.projectRepository.find({...filters, include: this.getProjectRelatedPermissionsAndModules})

      const total = await this.projectRepository.count(filters['where'])

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

  @authenticate({strategy: 'autentikigo', options: {collection: 'Project'}})
  @get('/projects/{projectId}')
  @response(200, {
    description: 'Project model instance',
    properties: Http.createDocResponseSchemaForFindOneResult(Project)
  })
  async findById(
    @param.path.string('projectId') id: string,
    @param.query.string('locale') locale?: LocaleEnum,
  ): Promise<IHttpResponse> {
    try {

      const data = await this.projectRepository.findOne({
        where: {and: [{_id: id}, {_deletedAt: {eq: null}}]},
        include: this.getProjectRelatedPermissionsAndModules
      })
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

  @authenticate({strategy: 'autentikigo', options: {collection: 'Project', action: 'updateOne'}})
  @put('/projects/{projectId}')
  @response(200, {description: 'Project PUT success'})
  async updateById(
    @param.path.string('projectId') id: string,
    @requestBody({
      content: Http.createDocRequestSchema(Project)
    }) data: Project,
    @param.query.string('locale') locale?: LocaleEnum,
  ): Promise<IHttpResponse> {
    try {

      await this.projectRepository.updateById(id, data)

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

  @authenticate({strategy: 'autentikigo', options: {collection: 'Project', action: 'updateOne'}})
  @patch('/projects/{projectId}')
  @response(200, {description: 'Project PATCH success'})
  async partialUpdateById(
    @param.path.string('projectId') id: string,
    @requestBody({
      content: Http.createDocRequestSchema(Project)
    }) data: Project,
    @param.query.string('locale') locale?: LocaleEnum,
  ): Promise<IHttpResponse> {
    try {

      await this.projectRepository.updateById(id, data)

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

  @authenticate({strategy: 'autentikigo', options: {collection: 'Project', action: 'deleteOne'}})
  @del('/projects/{projectId}')
  @response(204, {description: 'Project DELETE success'})
  async deleteById(
    @param.path.string('projectId') id: string,
    @param.query.string('locale') locale?: LocaleEnum,
  ): Promise<IHttpResponse> {
    try {

      const projectToDelete = await this.projectRepository.findById(id)

      await this.projectRepository.updateById(id, {...projectToDelete, _deletedAt: new Date()})

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
