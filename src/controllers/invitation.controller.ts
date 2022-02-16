import {authenticate} from '@loopback/authentication'
import {inject} from '@loopback/core'
import {
  repository
} from '@loopback/repository'
import {del, get, param, patch, post, put, Request, requestBody, response, Response, RestBindings} from '@loopback/rest'
import {SecurityBindings, securityId, UserProfile} from '@loopback/security'
import {LocaleEnum} from '../enums/locale.enum'
import {Http, SendNodemailerMail} from '../implementations/index'
import {IHttpResponse} from '../interfaces/http.interface'
import {Invitation} from '../models'
import {InvitationRepository} from '../repositories'
import {serverMessages} from '../utils/server-messages'

export class InvitationController {

  constructor(
    @repository(InvitationRepository) public invitationRepository: InvitationRepository,

    @inject(RestBindings.Http.REQUEST) private httpRequest: Request,
    @inject(RestBindings.Http.RESPONSE) private httpResponse: Response,

    @inject(SecurityBindings.USER, {optional: true}) private currentUser?: UserProfile,
  ) { }

  @authenticate({strategy: 'autentikigo', options: {collection: 'Invitation', action: 'createOne'}})
  @post('/invitations')
  @response(200, {
    description: 'Invitation model instance',
    properties: Http.createDocResponseSchemaForFindOneResult(Invitation)
  })
  async create(
    @requestBody({
      content: Http.createDocRequestSchema(Invitation)
    }) data: Invitation,
    @param.query.string('locale') locale?: LocaleEnum,
  ): Promise<IHttpResponse> {
    try {

      const createdBy = this.currentUser?.[securityId] as string
      const ownerId = this.currentUser?.ownerId as string

      const invitation = await this.invitationRepository.create({...data, _createdBy: createdBy, _ownerId: ownerId})

      return Http.createHttpResponse({
        data: invitation,
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

  @authenticate({strategy: 'autentikigo', options: {collection: 'Invitation'}})
  @get('/invitations')
  @response(200, {
    description: 'Array of Invitation model instances',
    properties: Http.createDocResponseSchemaForFindManyResults(Invitation)
  })
  async find(
    @param.query.number('limit') limit?: number,
    @param.query.number('page') page?: number,
    @param.query.string('order_by') orderBy?: string,
    @param.query.string('locale') locale?: LocaleEnum,
  ): Promise<IHttpResponse> {
    try {

      const filters = Http.createFilterRequestParams(this.httpRequest.url)

      const result = await this.invitationRepository.find({...filters, include: ['permissionGroup']})

      const total = await this.invitationRepository.count(filters['where'])

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

  @authenticate({strategy: 'autentikigo', options: {collection: 'Invitation'}})
  @get('/invitations/{invitationId}')
  @response(200, {
    description: 'Invitation model instance',
    properties: Http.createDocResponseSchemaForFindOneResult(Invitation)
  })
  async findById(
    @param.path.string('invitationId') id: string,
    @param.query.string('locale') locale?: LocaleEnum,
  ): Promise<IHttpResponse> {
    try {

      const data = await this.invitationRepository.findOne({where: {and: [{_id: id}, {_deletedAt: {eq: null}}]}})
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
        response: this.httpResponse
      })

    }
  }

  @authenticate({strategy: 'autentikigo', options: {collection: 'Invitation', action: 'updateOne'}})
  @put('/invitations/{invitationId}')
  @response(200, {description: 'Invitation PUT success'})
  async updateById(
    @param.path.string('invitationId') id: string,
    @requestBody({
      content: Http.createDocRequestSchema(Invitation)
    }) data: Invitation,
    @param.query.string('locale') locale?: LocaleEnum,
  ): Promise<IHttpResponse> {
    try {

      await this.invitationRepository.updateById(id, data)

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

  @authenticate({strategy: 'autentikigo', options: {collection: 'Invitation', action: 'updateOne'}})
  @patch('/invitations/{invitationId}')
  @response(200, {description: 'Invitation PATCH success'})
  async partialUpdateById(
    @param.path.string('invitationId') id: string,
    @requestBody({
      content: Http.createDocRequestSchema(Invitation)
    }) data: Invitation,
    @param.query.string('locale') locale?: LocaleEnum,
  ): Promise<IHttpResponse> {
    try {

      await this.invitationRepository.updateById(id, data)

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

  @authenticate({strategy: 'autentikigo', options: {collection: 'Invitation', action: 'deleteOne'}})
  @del('/invitations/{invitationId}')
  @response(204, {description: 'Invitation DELETE success'})
  async deleteById(
    @param.path.string('invitationId') id: string,
    @param.query.string('locale') locale?: LocaleEnum,
  ): Promise<IHttpResponse> {
    try {

      const invitationToDelete = await this.invitationRepository.findById(id)

      await this.invitationRepository.updateById(id, {...invitationToDelete, _deletedAt: new Date()})

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

  @authenticate({strategy: 'autentikigo', options: {collection: 'Invitation'}})
  @get('/invitations/send/{invitationId}')
  @response(200, {description: 'Invitation sent successfully'})
  async sendInvitation(
    @param.path.string('invitationId') id: string,
    @param.query.string('locale') locale?: LocaleEnum,
  ): Promise<IHttpResponse> {
    try {

      const invitation = await this.invitationRepository.findById(id)

      const emailSent = SendNodemailerMail.sendInvitationMail(id, invitation.email)
      if (!emailSent) throw new Error(emailSent!)

      return Http.okHttpResponse({
        message: serverMessages['invitation']['invitationSent'][locale ?? LocaleEnum['pt-BR']],
        locale,
        request: this.httpRequest,
        response: this.httpResponse,
      })

    } catch (err) {

      return Http.badRequestErrorHttpResponse({
        message: serverMessages['invitation']['invitationSentFailed'][locale ?? LocaleEnum['pt-BR']],
        logMessage: err.message,
        locale,
        request: this.httpRequest,
        response: this.httpResponse,
      })

    }
  }
}
