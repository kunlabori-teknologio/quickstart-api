import {inject} from '@loopback/core'
import {
  repository
} from '@loopback/repository'
import {get, param, Request, response, Response, RestBindings} from '@loopback/rest'
import {IHttpResponse} from '../../interfaces/http.interface'
import {__PermissionAction} from '../../models'
import {__PermissionActionRepository} from '../../repositories'
import {badRequestErrorHttpResponse, okHttpResponse} from '../../utils/http-response.util'
import {
  createDocResponseSchemaForFindManyResults,
  createDocResponseSchemaForFindOneResult
} from '../../utils/lb4-docs'
import {serverMessages} from '../../utils/server-messages'

export class __PermissionActionController {

  constructor(
    @repository(__PermissionActionRepository) public permissionActionRepository: __PermissionActionRepository,

    @inject(RestBindings.Http.REQUEST) private httpRequest: Request,
    @inject(RestBindings.Http.RESPONSE) private httpResponse: Response,
  ) { }

  @get('/__permission-actions')
  @response(200, {
    description: 'Array of PermissionAction model instances',
    properties: createDocResponseSchemaForFindManyResults(__PermissionAction)
  })
  async find(
    @param.query.string('filters') filters?: any,
    @param.query.number('limit') limit?: number,
    @param.query.number('page') page?: number,
    @param.query.string('order_by') orderBy?: string,
  ): Promise<IHttpResponse> {
    try {

      const result = await this.permissionActionRepository.find({
        where: {...(filters || {})},
        limit: limit ?? 100,
        skip: (limit ?? 100) * (page ?? 0),
        order: [orderBy ?? '_createdAt DESC'],
      });
      const total = await this.permissionActionRepository.count({...(filters || {})});

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

  @get('/__permission-actions/{permissionActionId}')
  @response(200, {
    description: 'PermissionAction model instance',
    properties: createDocResponseSchemaForFindOneResult(__PermissionAction)
  })
  async findById(
    @param.path.string('permissionActionId') id: string,
  ): Promise<IHttpResponse> {
    try {

      const data = await this.permissionActionRepository
        .findOne({where: {and: [{_id: id}, {_deletedAt: {eq: null}}]}});
      if (!data)
        throw new Error(serverMessages.httpResponse.notFoundError['pt-BR']);

      return okHttpResponse({
        data,
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
}
