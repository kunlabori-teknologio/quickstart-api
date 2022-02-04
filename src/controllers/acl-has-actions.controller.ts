import {repository} from '@loopback/repository';
import {AclRepository} from '../repositories';

export class AclHasActionsController {
  constructor(
    @repository(AclRepository) protected aclRepository: AclRepository,
  ) { }

  // @get('/acls/{id}/acl-actions', {
  //   responses: {
  //     '200': {
  //       description: 'Array of Acl has many AclAction through AclHasActions',
  //       content: {
  //         'application/json': {
  //           schema: {type: 'array', items: getModelSchemaRef(AclAction)},
  //         },
  //       },
  //     },
  //   },
  // })
  // async find(
  //   @param.path.string('id') id: string,
  //   @param.query.object('filter') filter?: Filter<AclAction>,
  // ): Promise<AclAction[]> {
  //   return this.aclRepository.aclActions(id).find(filter);
  // }

  // @post('/acls/{id}/acl-actions', {
  //   responses: {
  //     '200': {
  //       description: 'create a AclAction model instance',
  //       content: {'application/json': {schema: getModelSchemaRef(AclAction)}},
  //     },
  //   },
  // })
  // async create(
  //   @param.path.string('id') id: typeof Acl.prototype._id,
  //   @requestBody({
  //     content: {
  //       'application/json': {
  //         schema: getModelSchemaRef(AclAction, {
  //           title: 'NewAclActionInAcl',
  //           exclude: ['_id'],
  //         }),
  //       },
  //     },
  //   }) aclAction: Omit<AclAction, '_id'>,
  // ): Promise<AclAction> {
  //   return this.aclRepository.aclActions(id).create(aclAction);
  // }

  // @patch('/acls/{id}/acl-actions', {
  //   responses: {
  //     '200': {
  //       description: 'Acl.AclAction PATCH success count',
  //       content: {'application/json': {schema: CountSchema}},
  //     },
  //   },
  // })
  // async patch(
  //   @param.path.string('id') id: string,
  //   @requestBody({
  //     content: {
  //       'application/json': {
  //         schema: getModelSchemaRef(AclAction, {partial: true}),
  //       },
  //     },
  //   })
  //   aclAction: Partial<AclAction>,
  //   @param.query.object('where', getWhereSchemaFor(AclAction)) where?: Where<AclAction>,
  // ): Promise<Count> {
  //   return this.aclRepository.aclActions(id).patch(aclAction, where);
  // }

  // @del('/acls/{id}/acl-actions', {
  //   responses: {
  //     '200': {
  //       description: 'Acl.AclAction DELETE success count',
  //       content: {'application/json': {schema: CountSchema}},
  //     },
  //   },
  // })
  // async delete(
  //   @param.path.string('id') id: string,
  //   @param.query.object('where', getWhereSchemaFor(AclAction)) where?: Where<AclAction>,
  // ): Promise<Count> {
  //   return this.aclRepository.aclActions(id).delete(where);
  // }
}
