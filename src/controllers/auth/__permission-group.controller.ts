import {authenticate} from '@loopback/authentication';
import {inject, service} from '@loopback/core';
import {
  repository
} from '@loopback/repository';
import {Request, Response, RestBindings, del, get, param, patch, post, put, requestBody, response} from '@loopback/rest';
import {SecurityBindings, UserProfile, securityId} from '@loopback/security';
import {IHttpResponse} from '../../interfaces/http.interface';
import {__PermissionGroup} from '../../models';
import {__PermissionGroupRepository, __PermissionRepository} from '../../repositories';
import {CreatePermissions, UpdatePermissions} from '../../usecases/permissions';
import {
  badRequestErrorHttpResponse,
  createHttpResponse,
  noContentHttpResponse,
  okHttpResponse,
} from '../../utils/http-response.util';
import {
  createDocResponseSchemaForFindManyResults,
  createDocResponseSchemaForFindOneResult
} from '../../utils/lb4-docs';
import {serverMessages} from '../../utils/server-messages';

export class __PermissionGroupController {

  constructor(
    @repository(__PermissionGroupRepository) public permissionGroupRepository: __PermissionGroupRepository,
    @repository(__PermissionRepository) public permissionRepository: __PermissionRepository,

    @inject(RestBindings.Http.REQUEST) private httpRequest: Request,
    @inject(RestBindings.Http.RESPONSE) private httpResponse: Response,

    @service(CreatePermissions) private createPermissions: CreatePermissions,
    @service(UpdatePermissions) private updatePermissions: UpdatePermissions,

    @inject(SecurityBindings.USER, {optional: true}) private currentUser?: UserProfile,
  ) { }

  @authenticate({strategy: 'autentikigo', options: {collection: '__PermissionGroup', action: 'createOne'}})
  @post('/__permission-groups')
  @response(200, {
    description: 'Permission group model instance',
    properties: createDocResponseSchemaForFindOneResult(__PermissionGroup)
  })
  async create(
    @requestBody() data: any,
  ): Promise<IHttpResponse> {
    try {

      const createdBy = this.currentUser?.[securityId] as string;
      const ownerId = this.currentUser?.ownerId as string;

      const permissionGroup = await this.permissionGroupRepository.create({
        ...{name: data.name, description: data.description, project: process.env.DB},
        _createdBy: createdBy,
        _ownerId: ownerId
      });

      await this.createPermissions.execute(
        permissionGroup?._id!,
        data['modulePermissions'],
      );

      return createHttpResponse({
        request: this.httpRequest,
        response: this.httpResponse,
      });

    } catch (err) {

      return badRequestErrorHttpResponse({
        logMessage: err.message,
        request: this.httpRequest,
        response: this.httpResponse,
      });

    }
  }

  @authenticate({strategy: 'autentikigo', options: {collection: '__PermissionGroup', action: 'read'}})
  @get('/__permission-groups')
  @response(200, {
    description: 'Array of Permission group model instances',
    properties: createDocResponseSchemaForFindManyResults(__PermissionGroup)
  })
  async find(
    @param.query.string('filters') filters?: any,
    @param.query.string('project') project?: string,
    @param.query.number('limit') limit?: number,
    @param.query.number('page') page?: number,
    @param.query.string('order_by') orderBy?: string,
  ): Promise<IHttpResponse> {
    try {

      const where = {
        ...(filters || {}),
        and: [{project: project || process.env.DB!}],
        or: [
          {_createdBy: this.currentUser?.[securityId]!},
          {_ownerId: this.currentUser?.ownerId!},
        ]
      };

      let result: any[] = await this.permissionGroupRepository
        .find({
          where,
          include: [
            {
              relation: 'modulePermissions',
              scope: {
                include: [
                  {relation: 'module'}
                ],
              }
            }
          ],
          limit: limit ?? 100,
          skip: (limit ?? 100) * (page ?? 0),
          order: [orderBy ?? '_createdAt DESC'],
        });
      const total = await this.permissionGroupRepository.count(where);

      return okHttpResponse({
        data: {total: total?.count, result},
        request: this.httpRequest,
        response: this.httpResponse,
      });

    } catch (err) {

      return badRequestErrorHttpResponse({
        logMessage: err.message,
        request: this.httpRequest,
        response: this.httpResponse,
      });

    }
  }

  @authenticate({strategy: 'autentikigo', options: {collection: '__PermissionGroup', action: 'readOne'}})
  @get('/__permission-groups/{permissionGroupId}')
  @response(200, {
    description: 'Permission group model instance',
    properties: createDocResponseSchemaForFindOneResult(__PermissionGroup)
  })
  async findById(
    @param.path.string('permissionGroupId') id: string,
  ): Promise<IHttpResponse> {
    try {

      let data: any = await this.permissionGroupRepository.findOne({
        where: {and: [{_id: id}, {_deletedAt: {eq: null}}]},
        include: [
          {
            relation: 'modulePermissions',
            scope: {
              include: [
                {relation: 'module'}
              ],
            }
          }
        ]
      });
      if (!data)
        throw new Error(serverMessages.httpResponse.notFoundError['pt-BR']);

      return okHttpResponse({
        data,
        request: this.httpRequest,
        response: this.httpResponse,
      });

    } catch (err) {

      return badRequestErrorHttpResponse({
        logMessage: err.message,
        request: this.httpRequest,
        response: this.httpResponse,
      });

    }
  }

  @authenticate({strategy: 'autentikigo', options: {collection: '__PermissionGroup', action: 'updateOne'}})
  @put('/__permission-groups/{permissionGroupId}')
  @response(200, {description: 'Permission group PUT success'})
  async updateById(
    @param.path.string('permissionGroupId') id: string,
    @requestBody() data: any,
  ): Promise<IHttpResponse> {
    try {

      await this.permissionGroupRepository.replaceById(id, {
        name: data.name,
        description: data.description
      });
      await this.updatePermissions.execute(id, data['modulePermissions']);

      return noContentHttpResponse({
        request: this.httpRequest,
        response: this.httpResponse,
      });

    } catch (err) {

      return badRequestErrorHttpResponse({
        logMessage: err.message,
        request: this.httpRequest,
        response: this.httpResponse,
      });

    }
  }

  @authenticate({strategy: 'autentikigo', options: {collection: '__PermissionGroup', action: 'updateOne'}})
  @patch('/__permission-groups/{permissionGroupId}')
  @response(200, {description: 'Permission group PATCH success'})
  async partialUpdateById(
    @param.path.string('permissionGroupId') id: string,
    @requestBody() data: any,
  ): Promise<IHttpResponse> {
    try {

      await this.permissionGroupRepository.updateById(id, {
        name: data.name,
        description: data.description
      });
      await this.updatePermissions.execute(id, data['modulePermissions']);

      return noContentHttpResponse({
        request: this.httpRequest,
        response: this.httpResponse,
      });

    } catch (err) {

      return badRequestErrorHttpResponse({
        logMessage: err.message,
        request: this.httpRequest,
        response: this.httpResponse,
      });

    }
  }

  @authenticate({strategy: 'autentikigo', options: {collection: '__PermissionGroup', action: 'deleteOne'}})
  @del('/__permission-groups/{permissionGroupId}')
  @response(204, {description: 'Permission group DELETE success'})
  async deleteById(
    @param.path.string('permissionGroupId') id: string,
  ): Promise<IHttpResponse> {
    try {

      await this.permissionGroupRepository
        .updateById(id, {_deletedAt: new Date()});

      return noContentHttpResponse({
        request: this.httpRequest,
        response: this.httpResponse,
      });

    } catch (err) {

      return badRequestErrorHttpResponse({
        request: this.httpRequest,
        response: this.httpResponse,
      });

    }
  }
}
