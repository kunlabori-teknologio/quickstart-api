import {authenticate} from '@loopback/authentication'
import {inject, service} from '@loopback/core'
import {
  repository
} from '@loopback/repository'
import {Request, Response, RestBindings, del, get, param, patch, post, put, requestBody, response} from '@loopback/rest'
import {SecurityBindings, UserProfile, securityId} from '@loopback/security'
import {IHttpResponse} from '../../interfaces/http.interface'
import {__Invitation} from '../../models'
import {__InvitationRepository} from '../../repositories'
import {CreateInvitation} from '../../usecases/invitation/create-invitation.usecase'
import {SendInvitation} from '../../usecases/invitation/send-invitation.usecase'
import {badRequestErrorHttpResponse, createHttpResponse, noContentHttpResponse, okHttpResponse} from '../../utils/http-response.util'
import {createDocRequestSchema, createDocResponseSchemaForFindManyResults, createDocResponseSchemaForFindOneResult, createFilterRequestParams} from '../../utils/lb4-docs'
import {serverMessages} from '../../utils/server-messages'

export class __InvitationController {

  constructor(
    @repository(__InvitationRepository) public invitationRepository: __InvitationRepository,

    @inject(RestBindings.Http.REQUEST) private httpRequest: Request,
    @inject(RestBindings.Http.RESPONSE) private httpResponse: Response,

    @service(CreateInvitation) private createInvitation: CreateInvitation,
    @service(SendInvitation) private sendInvitation: SendInvitation,

    @inject(SecurityBindings.USER, {optional: true}) private currentUser?: UserProfile,
  ) {}

  @authenticate({strategy: 'autentikigo', options: {collection: '__Invitation', action: 'createOne'}})
  @post('/__invitations')
  @response(200, {
    description: 'Invitation model instance',
    properties: createDocResponseSchemaForFindOneResult(__Invitation)
  })
  async create(
    @requestBody({
      content: createDocRequestSchema(__Invitation)
    }) data: __Invitation,
  ): Promise<IHttpResponse> {
    try {

      const createdBy = this.currentUser?.[securityId] as string;
      const ownerId = this.currentUser?.ownerId as string;

      const invitation = await this.createInvitation.execute(
        data.permissionGroupId,
        data.email,
        createdBy,
        ownerId,
      );

      await this.sendInvitation.execute(
        invitation._id!,
        invitation.email,
        data.project,
      );

      return createHttpResponse({
        data: invitation,
        request: this.httpRequest,
        response: this.httpResponse,
      })

    } catch (err) {

      return badRequestErrorHttpResponse({
        logMessage: err.message,
        request: this.httpRequest,
        response: this.httpResponse,
      })

    }
  }

  @authenticate({strategy: 'autentikigo', options: {collection: '__Invitation', action: 'read'}})
  @get('/__invitations')
  @response(200, {
    description: 'Array of Invitation model instances',
    properties: createDocResponseSchemaForFindManyResults(__Invitation)
  })
  async find(
    @param.query.string('project') project?: string,
    @param.query.number('limit') limit?: number,
    @param.query.number('page') page?: number,
    @param.query.string('order_by') orderBy?: string,
  ): Promise<IHttpResponse> {
    try {
      const filters = createFilterRequestParams(
        this.httpRequest.url,
        [
          {'and': [{project: project || process.env.DB!}]},
          {
            'or': [
              {_createdBy: this.currentUser?.[securityId]!},
              {_ownerId: this.currentUser?.ownerId!},
            ]
          },
        ]
      )

      const result = await this.invitationRepository.find({...filters, include: ['permissionGroup']})

      const total = await this.invitationRepository.count(filters['where'])

      return okHttpResponse({
        data: {total: total?.count, result},
        request: this.httpRequest,
        response: this.httpResponse,
      })

    } catch (err) {

      return badRequestErrorHttpResponse({
        logMessage: err.message,
        request: this.httpRequest,
        response: this.httpResponse,
      })

    }
  }

  @authenticate({strategy: 'autentikigo', options: {collection: '__Invitation', action: 'readOne'}})
  @get('/__invitations/{invitationId}')
  @response(200, {
    description: 'Invitation model instance',
    properties: createDocResponseSchemaForFindOneResult(__Invitation)
  })
  async findById(
    @param.path.string('invitationId') id: string,
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
      if (!data) throw new Error(serverMessages.httpResponse.notFoundError['pt-BR'])

      return okHttpResponse({
        data,
        request: this.httpRequest,
        response: this.httpResponse,
      })

    } catch (err) {

      return badRequestErrorHttpResponse({
        logMessage: err.message,
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
      content: createDocRequestSchema(__Invitation)
    }) data: __Invitation,
  ): Promise<IHttpResponse> {
    try {

      await this.invitationRepository.updateById(id, data)

      return noContentHttpResponse({
        request: this.httpRequest,
        response: this.httpResponse,
      })

    } catch (err) {

      return badRequestErrorHttpResponse({
        logMessage: err.message,
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
      content: createDocRequestSchema(__Invitation)
    }) data: __Invitation,
  ): Promise<IHttpResponse> {
    try {

      await this.invitationRepository.updateById(id, data)

      return noContentHttpResponse({
        request: this.httpRequest,
        response: this.httpResponse,
      })

    } catch (err) {

      return badRequestErrorHttpResponse({
        logMessage: err.message,
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
  ): Promise<IHttpResponse> {
    try {

      const invitationToDelete = await this.invitationRepository.findById(id)

      await this.invitationRepository.updateById(id, {...invitationToDelete, _deletedAt: new Date()})

      return noContentHttpResponse({
        request: this.httpRequest,
        response: this.httpResponse,
      })

    } catch (err) {

      return badRequestErrorHttpResponse({
        logMessage: err.message,
        request: this.httpRequest,
        response: this.httpResponse,
      })

    }
  }

  @authenticate({strategy: 'autentikigo', options: {collection: '__Invitation', action: 'readOne'}})
  @get('/__invitations/send/{invitationId}')
  @response(200, {description: 'Invitation sent successfully'})
  async sendInvitationByEmail(
    @param.path.string('invitationId') id: string,
  ): Promise<IHttpResponse> {
    try {

      const invitation = await this.invitationRepository.findById(id)

      await this.sendInvitation.execute(id, invitation.email);

      return okHttpResponse({
        message: serverMessages.invitation.invitationSent['pt-BR'],
        request: this.httpRequest,
        response: this.httpResponse,
      })

    } catch (err) {

      return badRequestErrorHttpResponse({
        message: serverMessages.invitation.invitationSentFailed['pt-BR'],
        logMessage: err.message,
        request: this.httpRequest,
        response: this.httpResponse,
      })

    }
  }
}
