import {
  repository
} from '@loopback/repository';
import {AclRepository} from '../repositories';

export class AclController {
  constructor(
    @repository(AclRepository)
    public aclRepository: AclRepository,
  ) { }

  // @post('/acls')
  // @response(200, {
  //   description: 'Acl model instance',
  //   content: {'application/json': {schema: getModelSchemaRef(Acl)}},
  // })
  // async create(
  //   @requestBody({
  //     content: {
  //       'application/json': {
  //         schema: getModelSchemaRef(Acl, {
  //           title: 'NewAcl',

  //         }),
  //       },
  //     },
  //   })
  //   acl: Acl,
  // ): Promise<Acl> {
  //   return this.aclRepository.create(acl);
  // }

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

  // @get('/acls')
  // @response(200, {
  //   description: 'Array of Acl model instances',
  //   content: {
  //     'application/json': {
  //       schema: {
  //         type: 'array',
  //         items: getModelSchemaRef(Acl, {includeRelations: true}),
  //       },
  //     },
  //   },
  // })
  // async find(
  //   @param.filter(Acl) filter?: Filter<Acl>,
  // ): Promise<Acl[]> {
  //   return this.aclRepository.find(filter);
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

  // @get('/acls/{id}')
  // @response(200, {
  //   description: 'Acl model instance',
  //   content: {
  //     'application/json': {
  //       schema: getModelSchemaRef(Acl, {includeRelations: true}),
  //     },
  //   },
  // })
  // async findById(
  //   @param.path.string('id') id: string,
  //   @param.filter(Acl, {exclude: 'where'}) filter?: FilterExcludingWhere<Acl>
  // ): Promise<Acl> {
  //   return this.aclRepository.findById(id, filter);
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

  // @put('/acls/{id}')
  // @response(204, {
  //   description: 'Acl PUT success',
  // })
  // async replaceById(
  //   @param.path.string('id') id: string,
  //   @requestBody() acl: Acl,
  // ): Promise<void> {
  //   await this.aclRepository.replaceById(id, acl);
  // }

  // @del('/acls/{id}')
  // @response(204, {
  //   description: 'Acl DELETE success',
  // })
  // async deleteById(@param.path.string('id') id: string): Promise<void> {
  //   await this.aclRepository.deleteById(id);
  // }
}
