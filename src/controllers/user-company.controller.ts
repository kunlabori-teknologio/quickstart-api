import {
  repository
} from '@loopback/repository';
import {UserRepository} from '../repositories';

export class UserCompanyController {
  constructor(
    @repository(UserRepository) protected userRepository: UserRepository,
  ) { }

  // @get('/users/{id}/company', {
  //   responses: {
  //     '200': {
  //       description: 'User has one Company',
  //       content: {
  //         'application/json': {
  //           schema: getModelSchemaRef(Company),
  //         },
  //       },
  //     },
  //   },
  // })
  // async get(
  //   @param.path.string('id') id: string,
  //   @param.query.object('filter') filter?: Filter<Company>,
  // ): Promise<Company> {
  //   return this.userRepository.companyId(id).get(filter);
  // }

  // @post('/users/{id}/company', {
  //   responses: {
  //     '200': {
  //       description: 'User model instance',
  //       content: {'application/json': {schema: getModelSchemaRef(Company)}},
  //     },
  //   },
  // })
  // async create(
  //   @param.path.string('id') id: typeof User.prototype._id,
  //   @requestBody({
  //     content: {
  //       'application/json': {
  //         schema: getModelSchemaRef(Company, {
  //           title: 'NewCompanyInUser',
  //           exclude: ['_id'],
  //           optional: ['userId']
  //         }),
  //       },
  //     },
  //   }) company: Omit<Company, '_id'>,
  // ): Promise<Company> {
  //   return this.userRepository.companyId(id).create(company);
  // }

  // @patch('/users/{id}/company', {
  //   responses: {
  //     '200': {
  //       description: 'User.Company PATCH success count',
  //       content: {'application/json': {schema: CountSchema}},
  //     },
  //   },
  // })
  // async patch(
  //   @param.path.string('id') id: string,
  //   @requestBody({
  //     content: {
  //       'application/json': {
  //         schema: getModelSchemaRef(Company, {partial: true}),
  //       },
  //     },
  //   })
  //   company: Partial<Company>,
  //   @param.query.object('where', getWhereSchemaFor(Company)) where?: Where<Company>,
  // ): Promise<Count> {
  //   return this.userRepository.companyId(id).patch(company, where);
  // }

  // @del('/users/{id}/company', {
  //   responses: {
  //     '200': {
  //       description: 'User.Company DELETE success count',
  //       content: {'application/json': {schema: CountSchema}},
  //     },
  //   },
  // })
  // async delete(
  //   @param.path.string('id') id: string,
  //   @param.query.object('where', getWhereSchemaFor(Company)) where?: Where<Company>,
  // ): Promise<Count> {
  //   return this.userRepository.companyId(id).delete(where);
  // }
}
