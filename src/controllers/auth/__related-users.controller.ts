import {authenticate} from '@loopback/authentication';
import {inject, service} from '@loopback/core';
import {
  repository
} from '@loopback/repository';
import {
  Request,
  Response, RestBindings,
  get, param, put,
  requestBody, response
} from '@loopback/rest';
import {SecurityBindings, UserProfile, securityId} from '@loopback/security';
import {IHttpResponse} from '../../interfaces/http.interface';
import {__User} from '../../models';
import {__UserHasPermissionGroupsRepository, __UserRepository} from '../../repositories';
import {
  GetPermissionIdsOfARelatedUser,
  GetRelatedUserWithPermissions,
} from '../../usecases/related-users';
import {badRequestErrorHttpResponse, noContentHttpResponse, okHttpResponse} from '../../utils/http-response.util';
import {createDocResponseSchemaForFindManyResults, createDocResponseSchemaForFindOneResult} from '../../utils/lb4-docs';
import {serverMessages} from '../../utils/server-messages';

export class __RelatedUsersController {
  constructor(
    @repository(__UserRepository) public userRepository: __UserRepository,
    @repository(__UserHasPermissionGroupsRepository) public userHasPermissionGroupsRepository: __UserHasPermissionGroupsRepository,

    @inject(RestBindings.Http.REQUEST) private httpRequest: Request,
    @inject(RestBindings.Http.RESPONSE) private httpResponse: Response,

    @service(GetPermissionIdsOfARelatedUser) private getPermissionIdsOfARelatedUser: GetPermissionIdsOfARelatedUser,
    @service(GetRelatedUserWithPermissions) private getRelatedUserWithPermissions: GetRelatedUserWithPermissions,

    @inject(SecurityBindings.USER, {optional: true}) private currentUser?: UserProfile,
  ) { }

  @authenticate({strategy: 'autentikigo', options: {collection: '__PermissionGroup', action: 'createOne'}})
  @get('/__related-users')
  @response(200, {
    description: 'Array of related Users',
    properties: createDocResponseSchemaForFindManyResults(__User)
  })
  async find(
    @param.query.number('limit') limit?: number,
    @param.query.number('page') page?: number,
    @param.query.string('order_by') orderBy?: string,
  ): Promise<IHttpResponse> {
    try {

      let totalResult: any[] = await this.getRelatedUserWithPermissions.execute(
        this.currentUser?.[securityId]!,
        this.currentUser?.ownerId!,
      )

      const result = [...totalResult].splice(
        ((page || 0) * (limit || 10)),
        (limit || 10)
      )

      return okHttpResponse({
        data: {total: totalResult.length, result},
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

  @authenticate({strategy: 'autentikigo', options: {collection: '__PermissionGroup', action: 'createOne'}})
  @get('/__related-users/{id}')
  @response(200, {
    description: 'Related User model instance',
    properties: createDocResponseSchemaForFindOneResult(__User)
  })
  async findById(
    @param.path.string('id') id: string,
  ): Promise<IHttpResponse> {
    try {

      const data: any = await this.userRepository.findOne({
        where: {_id: id},
        include: ['person', 'company', 'permissionGroups'],
        fields: ['email', '_id']
      });
      if (!data) throw new Error(serverMessages.httpResponse.notFoundError['pt-BR']);

      const permission = data.permissionGroups && data.permissionGroups.length && data.permissionGroups.find((el: any) => el.project === process.env.PROJECT)

      const userPermissionGroup: any = await this.userHasPermissionGroupsRepository.findOne({
        where: {
          and: [
            {
              permissionGroupId: permission && permission._id,
              userId: id
            }
          ]
        }
      })

      const dataToReturn = {
        ...data,
        permissionGroupId: permission && permission._id,
        permissionGroup: permission,
        isUserDisabled: userPermissionGroup && userPermissionGroup.isUserDisabled,
      }

      return okHttpResponse({
        data: dataToReturn,
        request: this.httpRequest,
        response: this.httpResponse,
      })

    } catch (err: any) {

      return badRequestErrorHttpResponse({
        logMessage: err.message,
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
  ): Promise<IHttpResponse> {
    try {

      const permissionGroupsIdsToDelete: any[] = await this.getPermissionIdsOfARelatedUser.execute(
        this.currentUser?.[securityId]!, id
      )

      await this.userHasPermissionGroupsRepository.deleteAll({
        or: permissionGroupsIdsToDelete.map(permissionGroupId => {
          return {permissionGroupId, userId: id}
        })
      })

      // if (!data.isUserDisabled)
      await this.userHasPermissionGroupsRepository.create({
        permissionGroupId: data.permissionGroupId,
        userId: id,
        isUserDisabled: data.isUserDisabled,
      })

      return noContentHttpResponse({
        request: this.httpRequest,
        response: this.httpResponse,
      })

    } catch (err: any) {

      return badRequestErrorHttpResponse({
        logMessage: err.message,
        request: this.httpRequest,
        response: this.httpResponse,
      })

    }
  }
}
