import {authenticate} from '@loopback/authentication'
import {inject, service} from '@loopback/core'
import {
  repository
} from '@loopback/repository'
import {del, get, param, patch, post, put, Request, requestBody, response, Response, RestBindings} from '@loopback/rest'
import {SecurityBindings, securityId, UserProfile} from '@loopback/security'
import {HttpClass} from '../classes/http.class'
import {Invitation} from '../models'
import {InvitationRepository} from '../repositories'
import {InvitationService} from '../services'
import {localeMessage, serverMessages} from '../utils/server-messages'

export class InvitationController {

  private httpClass

  constructor(
    @repository(InvitationRepository) public invitationRepository: InvitationRepository,

    @inject(RestBindings.Http.REQUEST) private httpRequest: Request,
    @inject(RestBindings.Http.RESPONSE) private httpResponse: Response,

    @service(InvitationService) private invitationService: InvitationService,

    @inject(SecurityBindings.USER, {optional: true}) private currentUser?: UserProfile,
  ) {
    this.httpClass = new HttpClass({response: this.httpResponse, request: this.httpRequest})
  }

  @authenticate({strategy: 'autentikigo', options: {collection: 'Invitation', action: 'createOne'}})
  @post('/invitations')
  @response(200, {
    description: 'Invitation model instance',
    properties: new HttpClass().findOneSchema(Invitation)
  })
  async create(
    @requestBody({content: new HttpClass().requestSchema(Invitation)}) data: Invitation,
  ): Promise<void> {
    try {
      const createdBy = this.currentUser?.[securityId] as string
      const invitation = await this.invitationRepository.create({...data, _createdBy: createdBy})
      this.httpClass.createResponse({data: invitation})
    } catch (err) {
      this.httpClass.badRequestErrorResponse({
        message: serverMessages['crudError']['create'][localeMessage],
        logMessage: err.message
      })
    }
  }

  @authenticate({strategy: 'autentikigo', options: {collection: 'Invitation'}})
  @get('/invitations')
  @response(200, {
    description: 'Array of Invitation model instances',
    properties: new HttpClass().findAllResponseSchema(Invitation)
  })
  async find(
    @param.query.number('limit') limit: number,
    @param.query.number('page') page: number,
    @param.query.string('order_by') orderBy: string,
  ): Promise<void> {
    try {
      const filters = this.httpClass.createFilterRequestParams(this.httpRequest.url)
      const result = await this.invitationRepository.find({...filters, include: ['permissionGroup']})
      const total = await this.invitationRepository.count(filters['where'])
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

  @authenticate({strategy: 'autentikigo', options: {collection: 'Invitation'}})
  @get('/invitations/{invitationId}')
  @response(200, {
    description: 'Invitation model instance',
    properties: new HttpClass().findOneSchema(Invitation)
  })
  async findById(
    @param.path.string('invitationId') id: string,
  ): Promise<void> {
    try {
      const data = await this.invitationRepository.findById(id, {include: ['permissionGroup']})
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

  @authenticate({strategy: 'autentikigo', options: {collection: 'Invitation', action: 'updateOne'}})
  @put('/invitations/{invitationId}')
  @response(200, {description: 'Invitation PUT success'})
  async updateById(
    @param.path.string('invitationId') id: string,
    @requestBody({content: new HttpClass().requestSchema(Invitation)}) data: Invitation,
  ): Promise<void> {
    try {
      await this.invitationRepository.updateById(id, data)
      this.httpClass.noContentResponse()
    } catch (err) {
      this.httpClass.badRequestErrorResponse({
        message: serverMessages['crudError']['update'][localeMessage],
        logMessage: err.message,
      })
    }
  }

  @authenticate({strategy: 'autentikigo', options: {collection: 'Invitation', action: 'updateOne'}})
  @patch('/invitations/{invitationId}')
  @response(200, {description: 'Invitation PATCH success'})
  async partialUpdateById(
    @param.path.string('invitationId') id: string,
    @requestBody({content: new HttpClass().requestSchema(Invitation, true)}) data: Invitation,
  ): Promise<void> {
    try {
      await this.invitationRepository.updateById(id, data)
      this.httpClass.noContentResponse()
    } catch (err) {
      this.httpClass.badRequestErrorResponse({
        message: serverMessages['crudError']['update'][localeMessage],
        logMessage: err.message,
      })
    }
  }

  @authenticate({strategy: 'autentikigo', options: {collection: 'Invitation', action: 'deleteOne'}})
  @del('/invitations/{invitationId}')
  @response(204, {description: 'Invitation DELETE success'})
  async deleteById(
    @param.path.string('invitationId') id: string
  ): Promise<void> {
    try {
      const invitationToDelete = await this.invitationRepository.findById(id)
      await this.invitationRepository.updateById(id, {...invitationToDelete, _deletedAt: new Date()})
      this.httpClass.noContentResponse()
    } catch (err) {
      this.httpClass.badRequestErrorResponse({
        message: serverMessages['crudError']['delete'][localeMessage],
        logMessage: err.message,
      })
    }
  }

  @authenticate({strategy: 'autentikigo', options: {collection: 'Invitation'}})
  @get('/invitations/send/{invitationId}')
  @response(200, {description: 'Invitation sent successfully'})
  async sendInvitation(
    @param.path.string('invitationId') id: string
  ): Promise<void> {
    try {
      const invitation = await this.invitationRepository.findById(id)
      const mailBody = `
        <p>
          <a href='${process.env.SERVER_ROOT_URI}/auth/google-signin?invitationId=${id}'>Login com convite</a>
        </p>
      `
      this.invitationService.sendInvitation(invitation.email, mailBody)
      this.httpClass.okResponse({message: serverMessages['invitation']['invitationSent'][localeMessage]})
    } catch (err) {
      this.httpClass.badRequestErrorResponse({
        message: serverMessages['invitation']['invitationSentFailed'][localeMessage],
        logMessage: err.message
      })
    }
  }
}
