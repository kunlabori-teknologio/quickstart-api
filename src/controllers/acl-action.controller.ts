import {inject} from '@loopback/core';
import {
  FilterExcludingWhere,
  repository
} from '@loopback/repository';
import {get, getModelSchemaRef, param, Request, response, Response, RestBindings} from '@loopback/rest';
import {AclAction} from '../models';
import {AclActionRepository} from '../repositories';
import {createFilterRequestParams} from '../utils/general-functions';
import {ok} from '../utils/http-response';

//@authenticate('autentikigo')
export class AclActionController {
  constructor(
    /**
     * Repositories
     */
    @repository(AclActionRepository)
    public aclActionRepository: AclActionRepository,
    /**
     * Http injections
     */
    @inject(RestBindings.Http.REQUEST)
    private request: Request,
    @inject(RestBindings.Http.RESPONSE)
    private response: Response,
    // @inject(SecurityBindings.USER, {optional: true})
    // private currentUser?: UserProfile,
  ) { }

  @get('/acl-actions')
  @response(200, {
    description: 'Array of AclAction model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(AclAction, {includeRelations: true}),
        },
      },
    },
  })
  async find(): Promise<void> {
    const filters = createFilterRequestParams(this.request.url);
    const result = await this.aclActionRepository.find(filters);
    const total = await this.aclActionRepository.count(filters['where']);
    ok({
      response: this.response,
      data: {
        total: total?.count,
        result,
      }
    });
  }

  @get('/acl-actions/{id}')
  @response(200, {
    description: 'AclAction model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(AclAction, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(AclAction, {exclude: 'where'}) filter?: FilterExcludingWhere<AclAction>
  ): Promise<void> {
    const data = await this.aclActionRepository.findById(id, filter);
    ok({response: this.response, data});
  }

  // @post('/acl-actions')
  // @response(200, {
  //   description: 'AclAction model instance',
  //   content: {'application/json': {schema: getModelSchemaRef(AclAction)}},
  // })
  // async create(
  //   @requestBody({
  //     content: {
  //       'application/json': {
  //         schema: getModelSchemaRef(AclAction, {
  //           title: 'NewAclAction',

  //         }),
  //       },
  //     },
  //   })
  //   aclAction: AclAction,
  // ): Promise<AclAction> {
  //   aclAction._createdBy = this.currentUser?.[securityId] as string;
  //   return this.aclActionRepository.create(aclAction);
  // }

  // @get('/acl-actions/count')
  // @response(200, {
  //   description: 'AclAction model count',
  //   content: {'application/json': {schema: CountSchema}},
  // })
  // async count(
  //   @param.where(AclAction) where?: Where<AclAction>,
  // ): Promise<Count> {
  //   return this.aclActionRepository.count(where);
  // }

  // @patch('/acl-actions')
  // @response(200, {
  //   description: 'AclAction PATCH success count',
  //   content: {'application/json': {schema: CountSchema}},
  // })
  // async updateAll(
  //   @requestBody({
  //     content: {
  //       'application/json': {
  //         schema: getModelSchemaRef(AclAction, {partial: true}),
  //       },
  //     },
  //   })
  //   aclAction: AclAction,
  //   @param.where(AclAction) where?: Where<AclAction>,
  // ): Promise<Count> {
  //   return this.aclActionRepository.updateAll(aclAction, where);
  // }

  // @patch('/acl-actions/{id}')
  // @response(204, {
  //   description: 'AclAction PATCH success',
  // })
  // async updateById(
  //   @param.path.string('id') id: string,
  //   @requestBody({
  //     content: {
  //       'application/json': {
  //         schema: getModelSchemaRef(AclAction, {partial: true}),
  //       },
  //     },
  //   })
  //   aclAction: AclAction,
  // ): Promise<void> {
  //   await this.aclActionRepository.updateById(id, aclAction);
  // }

  // @put('/acl-actions/{id}')
  // @response(204, {
  //   description: 'AclAction PUT success',
  // })
  // async replaceById(
  //   @param.path.string('id') id: string,
  //   @requestBody() aclAction: AclAction,
  // ): Promise<void> {
  //   await this.aclActionRepository.replaceById(id, aclAction);
  // }

  // @del('/acl-actions/{id}')
  // @response(204, {
  //   description: 'AclAction DELETE success',
  // })
  // async deleteById(@param.path.string('id') id: string): Promise<void> {
  //   await this.aclActionRepository.deleteById(id);
  // }
}
