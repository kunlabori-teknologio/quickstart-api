import {authenticate} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {
  repository
} from '@loopback/repository';
import {
  get, param, Request, response, Response, RestBindings
} from '@loopback/rest';
import {LocaleEnum} from '../enums/locale.enum';
import {HttpDocumentation, HttpResponseToClient} from '../implementations';
import {IHttpResponse} from '../interfaces/http.interface';
import {__User} from '../models';
import {__UserRepository} from '../repositories';

export class __RelatedUsersController {
  constructor(
    @repository(__UserRepository) public userRepository: __UserRepository,

    @inject(RestBindings.Http.REQUEST) private httpRequest: Request,
    @inject(RestBindings.Http.RESPONSE) private httpResponse: Response,
  ) { }

  @authenticate({strategy: 'autentikigo', options: {collection: '__User', action: 'read'}})
  @get('/__related-users')
  @response(200, {
    description: 'Array of related Users',
    properties: HttpDocumentation.createDocResponseSchemaForFindManyResults(__User)
  })
  async find(
    @param.query.string('user') userId: string,
    @param.query.number('limit') limit?: number,
    @param.query.number('page') page?: number,
    @param.query.string('order_by') orderBy?: string,
    @param.query.string('locale') locale?: LocaleEnum,
  ): Promise<IHttpResponse> {
    try {

      let totalResult: any[] = userId ? await this.userRepository.find({
        include: [
          {relation: 'person'},
          {relation: 'company'},
          {
            relation: 'permissionGroups',
            scope: {
              where: {
                _ownerId: userId
              }
            }
          }
        ],
        fields: ['email', '_id']
      }) : []
      totalResult = totalResult.filter(el => el.permissionGroups && el.permissionGroups.length)

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

  // @patch('/related-users')
  // @response(200, {
  //   description: 'User PATCH success count',
  //   content: {'application/json': {schema: CountSchema}},
  // })
  // async updateAll(
  //   @requestBody({
  //     content: {
  //       'application/json': {
  //         schema: getModelSchemaRef(__User, {partial: true}),
  //       },
  //     },
  //   })
  //   user: __User,
  //   @param.where(__User) where?: Where<__User>,
  // ): Promise<Count> {
  //   return this.userRepository.updateAll(user, where);
  // }

  // @get('/related-users/{id}')
  // @response(200, {
  //   description: 'User model instance',
  //   content: {
  //     'application/json': {
  //       schema: getModelSchemaRef(__User, {includeRelations: true}),
  //     },
  //   },
  // })
  // async findById(
  //   @param.path.string('id') id: string,
  //   @param.filter(__User, {exclude: 'where'}) filter?: FilterExcludingWhere<__User>
  // ): Promise<__User> {
  //   return this.userRepository.findById(id, filter);
  // }

  // @patch('/related-users/{id}')
  // @response(204, {
  //   description: 'User PATCH success',
  // })
  // async updateById(
  //   @param.path.string('id') id: string,
  //   @requestBody({
  //     content: {
  //       'application/json': {
  //         schema: getModelSchemaRef(__User, {partial: true}),
  //       },
  //     },
  //   })
  //   user: __User,
  // ): Promise<void> {
  //   await this.userRepository.updateById(id, user);
  // }

  // @put('/related-users/{id}')
  // @response(204, {
  //   description: 'User PUT success',
  // })
  // async replaceById(
  //   @param.path.string('id') id: string,
  //   @requestBody() user: __User,
  // ): Promise<void> {
  //   await this.userRepository.replaceById(id, user);
  // }

  // @del('/related-users/{id}')
  // @response(204, {
  //   description: 'User DELETE success',
  // })
  // async deleteById(@param.path.string('id') id: string): Promise<void> {
  //   await this.userRepository.deleteById(id);
  // }
}
