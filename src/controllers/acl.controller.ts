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
import {Acl} from '../models';
import {AclRepository} from '../repositories';
import {createFilterRequestParams, excludeDefaultParamsFromSchema} from '../utils/general-functions';
import {badRequestError, ok} from '../utils/http-response';
import {AclService} from './../services/acl.service';
import {localeMessage, serverMessages} from './../utils/server-messages';

//@authenticate('autentikigo')
export class AclController {
  constructor(
    /**
     * Repositories
     */
    @repository(AclRepository)
    public aclRepository: AclRepository,
    /**
     * Services
     */
    @service(AclService)
    private aclService: AclService,
    /**
     * Http injections
     */
    @inject(RestBindings.Http.REQUEST)
    private request: Request,
    @inject(RestBindings.Http.RESPONSE)
    private response: Response,
    /**
     * User profile
     */
    @inject(SecurityBindings.USER, {optional: true})
    private currentUser?: UserProfile,
  ) { }

  @post('/acls')
  @response(200, {
    description: 'Acl model instance',
    content: {'application/json': {schema: getModelSchemaRef(Acl)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              aclInfo: getModelSchemaRef(Acl, {
                title: 'NewAcl',
                exclude: excludeDefaultParamsFromSchema(),
              }),
              aclActions: {
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
       * Create ACL
       */
      const _createdBy = this.currentUser?.[securityId] as string;
      const aclCreated = await this.aclRepository.create({...data.aclInfo, _createdBy});
      /**
       * Relate acl actions
       */
      await this.aclService.relateACLActions({aclId: aclCreated._id!, aclActionsIds: data.aclActions});
      /**
       * Get ACL with actions
       */
      const acl = await this.aclRepository.findById(aclCreated._id, {include: ['aclActions']});
      ok({response: this.response, data: acl, message: serverMessages['crudSuccess']['create'][localeMessage]});
    } catch (err) {
      badRequestError({
        response: this.response,
        message: serverMessages['crudError']['create'][localeMessage],
        logMessage: err.message,
      });
    }
  }

  @get('/acls')
  @response(200, {
    description: 'Array of Acl model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Acl, {includeRelations: true}),
        },
      },
    },
  })
  async find(): Promise<void> {
    try {
      /**
       * Create filters
       */
      const filters = createFilterRequestParams(this.request.url);
      const result = await this.aclRepository.find({...filters, include: ['aclActions']});
      const total = await this.aclRepository.count(filters['where']);
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

  @get('/acls/{id}')
  @response(200, {
    description: 'Acl model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Acl, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
  ): Promise<void> {
    try {
      const data = await this.aclRepository.findById(id, {include: ['aclActions']});
      ok({response: this.response, data, message: serverMessages['crudSuccess']['read'][localeMessage]});
    } catch (err) {
      badRequestError({
        response: this.response,
        message: serverMessages['crudError']['read'][localeMessage],
        logMessage: err.message,
      })
    }
  }

  @put('/acls/{id}')
  @response(204, {
    description: 'Acl PUT success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              aclInfo: getModelSchemaRef(Acl, {
                title: 'NewAcl',
                exclude: excludeDefaultParamsFromSchema(),
              }),
              aclActions: {
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
       * Delete acl actions related
       */
      await this.aclService.deleteRelatedACLActions({aclId: id});
      /**
       * Update acl
       */
      await this.aclRepository.updateById(id, data.aclInfo);
      /**
       * Relate acl actions
       */
      await this.aclService.relateACLActions({aclId: id, aclActionsIds: data.aclActions});
      /**
       * Get ACL with actions
       */
      const acl = await this.aclRepository.findById(id, {include: ['aclActions']});
      ok({response: this.response, data: acl, message: serverMessages['crudSuccess']['update'][localeMessage]});
    } catch (err) {
      badRequestError({
        response: this.response,
        message: serverMessages['crudError']['update'][localeMessage],
        logMessage: err.message,
      })
    }
  }

  @del('/acls/{id}')
  @response(204, {
    description: 'Acl DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    try {
      await this.aclRepository.deleteById(id);
      ok({response: this.response, message: serverMessages['crudSuccess']['delete'][localeMessage]});
    } catch (err) {
      badRequestError({
        response: this.response,
        message: serverMessages['crudError']['delete'][localeMessage],
        logMessage: err.message,
      })
    }
  }

  // @get('/acls/count')
  // @response(200, {
  //   description: 'Acl model count',
  //   content: {'application/json': {schema: CountSchema}},
  // })
  // async count(
  //   @param.where(Acl) where?: Where<Acl>,
  // ): Promise<Count> {
  //   return this.aclRepository.count(where);
  // }

  // @patch('/acls')
  // @response(200, {
  //   description: 'Acl PATCH success count',
  //   content: {'application/json': {schema: CountSchema}},
  // })
  // async updateAll(
  //   @requestBody({
  //     content: {
  //       'application/json': {
  //         schema: getModelSchemaRef(Acl, {partial: true}),
  //       },
  //     },
  //   })
  //   acl: Acl,
  //   @param.where(Acl) where?: Where<Acl>,
  // ): Promise<Count> {
  //   return this.aclRepository.updateAll(acl, where);
  // }

  // @patch('/acls/{id}')
  // @response(204, {
  //   description: 'Acl PATCH success',
  // })
  // async updateById(
  //   @param.path.string('id') id: string,
  //   @requestBody({
  //     content: {
  //       'application/json': {
  //         schema: getModelSchemaRef(Acl, {partial: true}),
  //       },
  //     },
  //   })
  //   acl: Acl,
  // ): Promise<void> {
  //   await this.aclRepository.updateById(id, acl);
  // }
}
