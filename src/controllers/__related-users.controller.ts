import {authenticate} from '@loopback/authentication';
import {inject, service} from '@loopback/core';
import {
  repository
} from '@loopback/repository';
import {
  get, param, put, Request, requestBody, response, Response, RestBindings
} from '@loopback/rest';
import {SecurityBindings, securityId, UserProfile} from '@loopback/security';
import {LocaleEnum} from '../enums/locale.enum';
import {HttpDocumentation, HttpResponseToClient} from '../implementations';
import {IHttpResponse} from '../interfaces/http.interface';
import {__User} from '../models';
import {__UserRepository} from '../repositories';
import {serverMessages} from '../utils/server-messages';
import {__UserHasPermissionGroupsRepository} from './../repositories/__user-has-permission-groups.repository';
import {RelatedUsersService} from './../services/related-users.service';

export class __RelatedUsersController {
  constructor(
    @repository(__UserRepository) public userRepository: __UserRepository,
    @repository(__UserHasPermissionGroupsRepository) public userHasPermissionGroupsRepository: __UserHasPermissionGroupsRepository,

    @inject(RestBindings.Http.REQUEST) private httpRequest: Request,
    @inject(RestBindings.Http.RESPONSE) private httpResponse: Response,

    @service(RelatedUsersService) private relatedUsersService: RelatedUsersService,

    @inject(SecurityBindings.USER, {optional: true}) private currentUser?: UserProfile,
  ) { }

  @authenticate({strategy: 'autentikigo', options: {collection: '__PermissionGroup', action: 'createOne'}})
  @get('/__related-users')
  @response(200, {
    description: 'Array of related Users',
    properties: HttpDocumentation.createDocResponseSchemaForFindManyResults(__User)
  })
  async find(
    @param.query.number('limit') limit?: number,
    @param.query.number('page') page?: number,
    @param.query.string('order_by') orderBy?: string,
    @param.query.string('locale') locale?: LocaleEnum,
  ): Promise<IHttpResponse> {
    try {

      let totalResult: any[] = await this.relatedUsersService.getRelatedUsersWithPermissions(this.currentUser?.[securityId]!)

      const result = [...totalResult].splice(
        ((page || 0) * (limit || 10)),
        (limit || 10)
      )

      return HttpResponseToClient.okHttpResponse({
        data: {total: totalResult.length, result},
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

  @authenticate({strategy: 'autentikigo', options: {collection: '__PermissionGroup', action: 'createOne'}})
  @get('/__related-users/{id}')
  @response(200, {
    description: 'Related User model instance',
    properties: HttpDocumentation.createDocResponseSchemaForFindOneResult(__User)
  })
  async findById(
    @param.path.string('id') id: string,
    @param.query.string('locale') locale?: LocaleEnum,
  ): Promise<IHttpResponse> {
    try {

      const data: any = await this.userRepository.findOne({
        where: {_id: id},
        include: ['person', 'company', 'permissionGroups'],
        fields: ['email', '_id']
      });
      if (!data) throw new Error(serverMessages['httpResponse']['notFoundError'][locale ?? LocaleEnum['pt-BR']]);

      const dataToReturn = {
        ...data,
        permissionGroupId: data.permissionGroups && data.permissionGroups.length && data.permissionGroups[0]._id,
        permissionGroup: data.permissionGroups && data.permissionGroups.length && data.permissionGroups[0],
      }

      return HttpResponseToClient.okHttpResponse({
        data: dataToReturn,
        locale,
        request: this.httpRequest,
        response: this.httpResponse,
      })

    } catch (err: any) {

      return HttpResponseToClient.badRequestErrorHttpResponse({
        logMessage: err.message,
        locale,
        request: this.httpRequest,
        response: this.httpResponse,
      })

    }
  }

  @authenticate({strategy: 'autentikigo', options: {collection: '__PermissionGroup', action: 'createOne'}})
  @put('/__related-users/{id}')
  @response(200, {description: 'Related User PUT success'})
  async updateById(
    @param.path.string('id') id: string,
    @requestBody() data: any,
    @param.query.string('locale') locale?: LocaleEnum,
  ): Promise<IHttpResponse> {
    try {

      const permissionGroupsIdsToDelete: any[] = await this.relatedUsersService.getPermissionIdsOfARelatedUser(
        this.currentUser?.[securityId]!, id
      )

      await this.userHasPermissionGroupsRepository.deleteAll({
        or: permissionGroupsIdsToDelete.map(permissionGroupId => {
          return {permissionGroupId, userId: id}
        })
      })

      await this.userHasPermissionGroupsRepository.create({
        permissionGroupId: data.permissionGroupId,
        userId: id
      })

      return HttpResponseToClient.noContentHttpResponse({
        locale,
        request: this.httpRequest,
        response: this.httpResponse,
      })

    } catch (err: any) {

      return HttpResponseToClient.badRequestErrorHttpResponse({
        logMessage: err.message,
        locale,
        request: this.httpRequest,
        response: this.httpResponse,
      })

    }
  }
}
