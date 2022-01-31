import {inject, service} from '@loopback/core';
import {
  repository
} from '@loopback/repository';
import {
  del, get,
  getModelSchemaRef, param, post, put, Request, requestBody,
  response, Response, RestBindings
} from '@loopback/rest';
import {SecurityBindings, securityId, UserProfile} from '@loopback/security';
import {Permission, User} from '../models';
import {PermissionRepository} from '../repositories';
import {createFilterRequestParams, excludeDefaultParamsFromSchema} from '../utils/general-functions';
import {badRequestError, ok} from '../utils/http-response';
import {localeMessage, serverMessages} from '../utils/server-messages';
import {UserRepository} from './../repositories/user.repository';
import {PermissionService} from './../services/permission.service';
import {UserService} from './../services/user.service';

//@authenticate('autentikigo')
export class PermissionController {
  constructor(
    /**
     * Repositories
     */
    @repository(PermissionRepository)
    public permissionRepository: PermissionRepository,
    @repository(UserRepository)
    private userRepository: UserRepository,
    /**
     * Services
     */
    @service(PermissionService)
    private permissionService: PermissionService,
    @service(UserService)
    private userService: UserService,
    /**
     * Http injections
     */
    @inject(RestBindings.Http.REQUEST)
    private request: Request,
    @inject(RestBindings.Http.RESPONSE)
    private response: Response,
    /**
     * User Profile
     */
    @inject(SecurityBindings.USER, {optional: true})
    private currentUser?: UserProfile,
  ) { }

  @post('/permissions')
  @response(200, {
    description: 'Permission model instance',
    content: {'application/json': {schema: getModelSchemaRef(Permission)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              permissionInfo: getModelSchemaRef(Permission, {
                title: 'NewPermission',
                exclude: [
                  ...excludeDefaultParamsFromSchema(),
                  'projectId',
                ]
              }),
              acls: {
                type: 'array',
                items: {type: 'string'},
              }
            }
          },
        },
      },
    })
    data: any,
  ): Promise<void> {
    try {
      /**
       * Create Permission
       */
      const _createdBy = this.currentUser?.[securityId] as string;
      const permissionCreated = await this.permissionRepository.create({
        ...data.permissionInfo, _createdBy, projectId: process.env.PROJECT_ID
      });
      /**
       * Relate acls
       */
      await this.permissionService.relateACLs({permissionId: permissionCreated._id!, aclsIds: data.acls});
      /**
       * Get permission with acls
       */
      const permission = await this.permissionRepository.findById(permissionCreated._id, {
        include: [{
          relation: 'acls',
          scope: {
            include: [{relation: 'aclActions'}]
          }
        }],
      });
      ok({response: this.response, data: permission, message: serverMessages['crudSuccess']['create'][localeMessage]});
    } catch (err) {
      badRequestError({
        response: this.response,
        message: serverMessages['crudError']['create'][localeMessage],
        logMessage: err.message,
      });
    }
  }

  @get('/permissions')
  @response(200, {
    description: 'Array of Permission model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Permission, {includeRelations: true}),
        },
      },
    },
  })
  async find(): Promise<void> {
    try {
      /**
       * Create filters
       */
      const filters = createFilterRequestParams(
        this.request.url,
        [{'projectId': process.env.PROJECT_ID}],
      );
      const result = await this.permissionRepository.find({
        ...filters,
        include: [{
          relation: 'acls',
          scope: {
            include: [{relation: 'aclActions'}]
          }
        }]
      });
      const total = await this.permissionRepository.count(filters['where']);
      ok({
        response: this.response,
        message: serverMessages['crudSuccess']['read'][localeMessage],
        data: {
          total: total?.count,
          result,
        }
      });
    } catch (err) {
      badRequestError({
        response: this.response,
        message: serverMessages['crudError']['read'][localeMessage],
        logMessage: err.message,
      })
    }
  }

  @get('/permissions/{id}')
  @response(200, {
    description: 'Permission model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Permission, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
  ): Promise<void> {
    try {
      const data = await this.permissionRepository.findById(id, {
        include: [{
          relation: 'acls',
          scope: {
            include: [{relation: 'aclActions'}]
          }
        }]
      });
      ok({response: this.response, data, message: serverMessages['crudSuccess']['read'][localeMessage]});
    } catch (err) {
      badRequestError({
        response: this.response,
        message: serverMessages['crudError']['read'][localeMessage],
        logMessage: err.message,
      })
    }
  }

  @put('/permissions/{id}')
  @response(204, {
    description: 'Permission PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              permissionInfo: getModelSchemaRef(Permission, {
                title: 'NewPermission',
                exclude: [
                  ...excludeDefaultParamsFromSchema(),
                  'projectId',
                ],
              }),
              acls: {
                type: 'array',
                items: {type: 'string'},
              }
            }
          },
        },
      },
    })
    data: any,
  ): Promise<void> {
    try {
      /**
       * Delete acls related
       */
      await this.permissionService.deleteRelatedACLs({permissionId: id});
      /**
       * Update permission
       */
      await this.permissionRepository.updateById(id, {
        ...data.permissionInfo,
        projectId: process.env.PROJECT_ID
      });
      /**
       * Relate acls
       */
      await this.permissionService.relateACLs({permissionId: id, aclsIds: data.acls});
      /**
       * Get permission with acls
       */
      const acl = await this.permissionRepository.findById(id, {
        include: [{
          relation: 'acls',
          scope: {
            include: [{relation: 'aclActions'}]
          }
        }]
      });
      ok({response: this.response, data: acl, message: serverMessages['crudSuccess']['update'][localeMessage]});
    } catch (err) {
      badRequestError({
        response: this.response,
        message: serverMessages['crudError']['update'][localeMessage],
        logMessage: err.message,
      })
    }
  }

  @del('/permissions/{id}')
  @response(204, {
    description: 'Permission DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    try {
      await this.permissionRepository.deleteById(id);
      ok({response: this.response, message: serverMessages['crudSuccess']['delete'][localeMessage]});
    } catch (err) {
      badRequestError({
        response: this.response,
        message: serverMessages['crudError']['delete'][localeMessage],
        logMessage: err.message,
      })
    }
  }

  /**
   * Give and remove permission to a user
   */
  @post('/permissions/give/{userId}')
  @response(200, {
    description: 'User model instance',
    content: {'application/json': {schema: getModelSchemaRef(User)}},
  })
  async givePermission(
    @param.path.string('userId') userId: string,
    @requestBody({
      content: {
        'application/json': {
          schema: {
            title: 'Permission ids array',
            type: 'array',
            items: {type: 'string'},
          },
        },
      },
    })
    permissionsIds: string[],
  ): Promise<void> {
    try {
      /**
       * Check user and permission
       */
      await this.permissionService.checkIfUserAndPermissionsExists({userId, permissionsIds});
      /**
       * Relate permissions
       */
      await this.permissionService.relatePermissions({userId, permissionsIds});
      /**
       * Get user with permissions
       */
      const user = await this.userService.getUserWithPermissions({
        condition: {where: {_id: userId}},
        projectId: process.env.PROJECT_ID!,
      });
      ok({response: this.response, data: user, message: serverMessages['permission']['permissionGiven'][localeMessage]});
    } catch (err) {
      badRequestError({
        response: this.response,
        message: serverMessages['crudError']['update'][localeMessage],
        logMessage: err.message,
      });
    }
  }

  @del('/permissions/remove/{userId}')
  @response(200, {
    description: 'User model instance',
    content: {'application/json': {schema: getModelSchemaRef(User)}},
  })
  async removePermission(
    @param.path.string('userId') userId: string,
    @requestBody({
      content: {
        'application/json': {
          schema: {
            title: 'Permission ids array',
            type: 'array',
            items: {type: 'string'},
          },
        },
      },
    })
    permissionsIds: string[],
  ): Promise<void> {
    try {
      /**
       * Check user and permission
       */
      await this.permissionService.checkIfUserAndPermissionsExists({userId, permissionsIds});
      /**
       * Remove permissions
       */
      await this.permissionService.removePermissions({userId, permissionsIds});
      /**
       * Get user with permissions
       */
      const user = await this.userService.getUserWithPermissions({
        condition: {where: {_id: userId}},
        projectId: process.env.PROJECT_ID!,
      });
      ok({response: this.response, data: user, message: serverMessages['permission']['permissionRemoved'][localeMessage]});
    } catch (err) {
      badRequestError({
        response: this.response,
        message: serverMessages['crudError']['update'][localeMessage],
        logMessage: err.message,
      });
    }
  }

  // @get('/permissions/count')
  // @response(200, {
  //   description: 'Permission model count',
  //   content: {'application/json': {schema: CountSchema}},
  // })
  // async count(
  //   @param.where(Permission) where?: Where<Permission>,
  // ): Promise<Count> {
  //   return this.permissionRepository.count(where);
  // }

  // @patch('/permissions')
  // @response(200, {
  //   description: 'Permission PATCH success count',
  //   content: {'application/json': {schema: CountSchema}},
  // })
  // async updateAll(
  //   @requestBody({
  //     content: {
  //       'application/json': {
  //         schema: getModelSchemaRef(Permission, {partial: true}),
  //       },
  //     },
  //   })
  //   permission: Permission,
  //   @param.where(Permission) where?: Where<Permission>,
  // ): Promise<Count> {
  //   return this.permissionRepository.updateAll(permission, where);
  // }

  // @patch('/permissions/{id}')
  // @response(204, {
  //   description: 'Permission PATCH success',
  // })
  // async updateById(
  //   @param.path.string('id') id: string,
  //   @requestBody({
  //     content: {
  //       'application/json': {
  //         schema: getModelSchemaRef(Permission, {partial: true}),
  //       },
  //     },
  //   })
  //   permission: Permission,
  // ): Promise<void> {
  //   await this.permissionRepository.updateById(id, permission);
  // }
}
