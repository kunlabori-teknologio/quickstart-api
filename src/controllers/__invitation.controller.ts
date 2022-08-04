import {authenticate} from '@loopback/authentication'
import {inject} from '@loopback/core'
import {
  repository
} from '@loopback/repository'
import {del, get, param, patch, post, put, Request, requestBody, response, Response, RestBindings} from '@loopback/rest'
import {SecurityBindings, securityId, UserProfile} from '@loopback/security'
import {LocaleEnum} from '../enums/locale.enum'
import {HttpDocumentation, HttpResponseToClient} from '../implementations/index'
import {SendNodemailerMailImplementation} from '../implementations/send-nodemailer-mail.implementation'
import {IHttpResponse} from '../interfaces/http.interface'
import {ISendMail} from '../interfaces/send-mail.interface'
import {__Invitation} from '../models'
import {__InvitationRepository} from '../repositories'
import {serverMessages} from '../utils/server-messages'

export class __InvitationController {

  private sendMail: ISendMail

  constructor(
    @repository(__InvitationRepository) public invitationRepository: __InvitationRepository,

    @inject(RestBindings.Http.REQUEST) private httpRequest: Request,
    @inject(RestBindings.Http.RESPONSE) private httpResponse: Response,

    @inject(SecurityBindings.USER, {optional: true}) private currentUser?: UserProfile,
  ) {
    this.sendMail = new SendNodemailerMailImplementation()
  }

  @authenticate({strategy: 'autentikigo', options: {collection: '__Invitation', action: 'createOne'}})
  @post('/__invitations')
  @response(200, {
    description: 'Invitation model instance',
    properties: HttpDocumentation.createDocResponseSchemaForFindOneResult(__Invitation)
  })
  async create(
    @requestBody({
      content: HttpDocumentation.createDocRequestSchema(__Invitation)
    }) data: __Invitation,
    @param.query.string('locale') locale?: LocaleEnum,
  ): Promise<IHttpResponse> {
    try {

      const createdBy = this.currentUser?.[securityId] as string
      const ownerId = this.currentUser?.ownerId as string

      const invitation = await this.invitationRepository.create({...data, _createdBy: createdBy, _ownerId: ownerId})

      this.sendMail.sendInvitationMail(invitation._id as string, invitation.email)

      return HttpResponseToClient.createHttpResponse({
        data: invitation,
        locale,
        request: this.httpRequest,
        response: this.httpResponse,
      })

    } catch (err) {

      return HttpResponseToClient.badRequestErrorHttpResponse({
        logMessage: err.message,
        locale,
        request: this.httpRequest,
        response: this.httpResponse,
      })

    }
  }

  @authenticate({strategy: 'autentikigo', options: {collection: '__Invitation', action: 'read'}})
  @get('/__invitations')
  @response(200, {
    description: 'Array of Invitation model instances',
    properties: HttpDocumentation.createDocResponseSchemaForFindManyResults(__Invitation)
  })
  async find(
    @param.query.number('limit') limit?: number,
    @param.query.number('page') page?: number,
    @param.query.string('order_by') orderBy?: string,
    @param.query.string('locale') locale?: LocaleEnum,
  ): Promise<IHttpResponse> {
    try {
      const createdBy = this.currentUser?.[securityId] as string
      const ownerId = this.currentUser?.ownerId as string

      const url = `${this.httpRequest.url}&_createdBy=${createdBy}&_ownerId=${ownerId}`
      const filters = HttpDocumentation.createFilterRequestParams(url)

      const result = await this.invitationRepository.find({...filters, include: ['permissionGroup']})

      const total = await this.invitationRepository.count(filters['where'])

      return HttpResponseToClient.okHttpResponse({
        data: {total: total?.count, result},
        locale,
        request: this.httpRequest,
        response: this.httpResponse,
      })

    } catch (err) {

      return HttpResponseToClient.badRequestErrorHttpResponse({
        logMessage: err.message,
        locale,
        request: this.httpRequest,
        response: this.httpResponse,
      })

    }
  }

  @authenticate({strategy: 'autentikigo', options: {collection: '__Invitation', action: 'readOne'}})
  @get('/__invitations/{invitationId}')
  @response(200, {
    description: 'Invitation model instance',
    properties: HttpDocumentation.createDocResponseSchemaForFindOneResult(__Invitation)
  })
  async findById(
    @param.path.string('invitationId') id: string,
    @param.query.string('locale') locale?: LocaleEnum,
  ): Promise<IHttpResponse> {
    try {

      const data = await this.invitationRepository.findOne({
        where: {
          and: [
            {_id: id},
            {_deletedAt: {eq: null}}
          ]
        },
        include: ['permissionGroup']
      })
      if (!data) throw new Error(serverMessages['httpResponse']['notFoundError'][locale ?? LocaleEnum['pt-BR']])

      return HttpResponseToClient.okHttpResponse({
        data,
        locale,
        request: this.httpRequest,
        response: this.httpResponse,
      })

    } catch (err) {

      return HttpResponseToClient.badRequestErrorHttpResponse({
        logMessage: err.message,
        locale,
        request: this.httpRequest,
        response: this.httpResponse
      })

    }
  }

  @authenticate({strategy: 'autentikigo', options: {collection: '__Invitation', action: 'updateOne'}})
  @put('/__invitations/{invitationId}')
  @response(200, {description: 'Invitation PUT success'})
  async updateById(
    @param.path.string('invitationId') id: string,
    @requestBody({
      content: HttpDocumentation.createDocRequestSchema(__Invitation)
    }) data: __Invitation,
    @param.query.string('locale') locale?: LocaleEnum,
  ): Promise<IHttpResponse> {
    try {

      await this.invitationRepository.updateById(id, data)

      return HttpResponseToClient.noContentHttpResponse({
        locale,
        request: this.httpRequest,
        response: this.httpResponse,
      })

    } catch (err) {

      return HttpResponseToClient.badRequestErrorHttpResponse({
        logMessage: err.message,
        locale,
        request: this.httpRequest,
        response: this.httpResponse,
      })

    }
  }

  @authenticate({strategy: 'autentikigo', options: {collection: '__Invitation', action: 'updateOne'}})
  @patch('/__invitations/{invitationId}')
  @response(200, {description: 'Invitation PATCH success'})
  async partialUpdateById(
    @param.path.string('invitationId') id: string,
    @requestBody({
      content: HttpDocumentation.createDocRequestSchema(__Invitation)
    }) data: __Invitation,
    @param.query.string('locale') locale?: LocaleEnum,
  ): Promise<IHttpResponse> {
    try {

      await this.invitationRepository.updateById(id, data)

      return HttpResponseToClient.noContentHttpResponse({
        locale,
        request: this.httpRequest,
        response: this.httpResponse,
      })

    } catch (err) {

      return HttpResponseToClient.badRequestErrorHttpResponse({
        logMessage: err.message,
        locale,
        request: this.httpRequest,
        response: this.httpResponse,
      })

    }
  }

  @authenticate({strategy: 'autentikigo', options: {collection: '__Invitation', action: 'deleteOne'}})
  @del('/__invitations/{invitationId}')
  @response(204, {description: 'Invitation DELETE success'})
  async deleteById(
    @param.path.string('invitationId') id: string,
    @param.query.string('locale') locale?: LocaleEnum,
  ): Promise<IHttpResponse> {
    try {

      const invitationToDelete = await this.invitationRepository.findById(id)

      await this.invitationRepository.updateById(id, {...invitationToDelete, _deletedAt: new Date()})

      return HttpResponseToClient.noContentHttpResponse({
        locale,
        request: this.httpRequest,
        response: this.httpResponse,
      })

    } catch (err) {

      return HttpResponseToClient.badRequestErrorHttpResponse({
        logMessage: err.message,
        locale,
        request: this.httpRequest,
        response: this.httpResponse,
      })

    }
  }

  @authenticate({strategy: 'autentikigo', options: {collection: '__Invitation', action: 'readOne'}})
  @get('/__invitations/send/{invitationId}')
  @response(200, {description: 'Invitation sent successfully'})
  async sendInvitation(
    @param.path.string('invitationId') id: string,
    @param.query.string('locale') locale?: LocaleEnum,
  ): Promise<IHttpResponse> {
    try {

      const invitation = await this.invitationRepository.findById(id)

      const emailSent = this.sendMail.sendInvitationMail(id, invitation.email)
      if (!emailSent) throw new Error(emailSent!)

      return HttpResponseToClient.okHttpResponse({
        message: serverMessages['invitation']['invitationSent'][locale ?? LocaleEnum['pt-BR']],
        locale,
        request: this.httpRequest,
        response: this.httpResponse,
      })

    } catch (err) {

      return HttpResponseToClient.badRequestErrorHttpResponse({
        message: serverMessages['invitation']['invitationSentFailed'][locale ?? LocaleEnum['pt-BR']],
        logMessage: err.message,
        locale,
        request: this.httpRequest,
        response: this.httpResponse,
      })

    }
  }
}
