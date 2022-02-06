import {authenticate} from '@loopback/authentication'
import {inject} from '@loopback/core'
import {
  repository
} from '@loopback/repository'
import {del, get, param, patch, post, put, Request, requestBody, response, Response, RestBindings} from '@loopback/rest'
import {SecurityBindings, securityId, UserProfile} from '@loopback/security'
import {HttpClass} from '../classes/http.class'
import {Project} from '../models/project.model'
import {ProjectRepository} from '../repositories/project.repository'
import {localeMessage, serverMessages} from '../utils/server-messages'

export class ProjectController {

  private httpClass

  constructor(
    @repository(ProjectRepository) public projectRepository: ProjectRepository,

    @inject(RestBindings.Http.REQUEST) private request: Request,
    @inject(RestBindings.Http.RESPONSE) private response: Response,

    @inject(SecurityBindings.USER, {optional: true}) private currentUser?: UserProfile,
  ) {
    this.httpClass = new HttpClass({response: this.response, request: this.request})
  }

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
    properties: new HttpClass().findOneSchema(Project)
  })
  async create(
    @requestBody({content: new HttpClass().requestSchema(Project)}) data: any,
  ): Promise<void> {
    try {
      const _createdBy = this.currentUser?.[securityId] as string
      const project = await this.projectRepository.create({...data, _createdBy})
      this.httpClass.createResponse({data: project})
    } catch (err) {
      this.httpClass.badRequestErrorResponse({
        message: serverMessages['crudError']['create'][localeMessage],
        logMessage: err.message
      })
    }
  }

  @authenticate({strategy: 'autentikigo', options: {collection: 'Project'}})
  @get('/projects')
  @response(200, {
    description: 'Array of Project model instances',
    properties: new HttpClass().findAllResponseSchema(Project)
  })
  async find(
    @param.query.number('limit') limit: number,
    @param.query.number('page') page: number,
    @param.query.string('order_by') order_by: string,
  ): Promise<void> {
    try {
      const filters = this.httpClass.createFilterRequestParams(this.request.url)
      const result = await this.projectRepository.find({...filters, include: this.getProjectRelatedPermissionsAndModules})
      const total = await this.projectRepository.count(filters['where'])
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

  @authenticate({strategy: 'autentikigo', options: {collection: 'Project'}})
  @get('/projects/{projectId}')
  @response(200, {
    description: 'Project model instance',
    properties: new HttpClass().findOneSchema(Project)
  })
  async findById(
    @param.path.string('projectId') id: string,
  ): Promise<void> {
    try {
      const data = await this.projectRepository.findById(id, {include: this.getProjectRelatedPermissionsAndModules})
      this.httpClass.okResponse({data, message: serverMessages['crudSuccess']['read'][localeMessage]})
    } catch (err) {
      this.httpClass.badRequestErrorResponse({
        message: serverMessages['crudError']['read'][localeMessage],
        logMessage: err.message
      })
    }
  }

  @authenticate({strategy: 'autentikigo', options: {collection: 'Project', action: 'updateOne'}})
  @put('/projects/{projectId}')
  @response(200, {description: 'Project PUT success'})
  async updateById(
    @param.path.string('projectId') id: string,
    @requestBody({content: new HttpClass().requestSchema(Project)}) data: any,
  ): Promise<void> {
    try {
      await this.projectRepository.updateById(id, data)
      this.httpClass.noContentResponse()
    } catch (err) {
      this.httpClass.badRequestErrorResponse({
        message: serverMessages['crudError']['update'][localeMessage],
        logMessage: err.message,
      })
    }
  }

  @authenticate({strategy: 'autentikigo', options: {collection: 'Project', action: 'updateOne'}})
  @patch('/projects/{projectId}')
  @response(200, {description: 'Project PATCH success'})
  async partialUpdateById(
    @param.path.string('projectId') id: string,
    @requestBody({content: new HttpClass().requestSchema(Project, true)}) data: any,
  ): Promise<void> {
    try {
      await this.projectRepository.updateById(id, data)
      this.httpClass.noContentResponse()
    } catch (err) {
      this.httpClass.badRequestErrorResponse({
        message: serverMessages['crudError']['update'][localeMessage],
        logMessage: err.message,
      })
    }
  }

  @authenticate({strategy: 'autentikigo', options: {collection: 'Project', action: 'deleteOne'}})
  @del('/projects/{projectId}')
  @response(204, {description: 'Project DELETE success'})
  async deleteById(
    @param.path.string('projectId') id: string
  ): Promise<void> {
    try {
      await this.projectRepository.deleteById(id)
      this.httpClass.noContentResponse()
    } catch (err) {
      this.httpClass.badRequestErrorResponse({
        message: serverMessages['crudError']['delete'][localeMessage],
        logMessage: err.message,
      })
    }
  }
}
