import {inject} from '@loopback/core';
import {
  repository
} from '@loopback/repository';
import {Request, Response, RestBindings, get, param, response} from '@loopback/rest';
import {IHttpResponse} from '../../interfaces/http.interface';
import {__Module} from '../../models';
import {__ModuleRepository} from '../../repositories';
import {badRequestErrorHttpResponse, okHttpResponse} from '../../utils/http-response.util';
import {
  createDocResponseSchemaForFindManyResults,
  createDocResponseSchemaForFindOneResult
} from '../../utils/lb4-docs';
import {serverMessages} from '../../utils/server-messages';

export class __ModuleController {

  constructor(
    @repository(__ModuleRepository) public moduleRepository: __ModuleRepository,

    @inject(RestBindings.Http.REQUEST) private httpRequest: Request,
    @inject(RestBindings.Http.RESPONSE) private httpResponse: Response,
  ) { }

  @get('/__modules')
  @response(200, {
    description: 'Array of Module model instances',
    properties: createDocResponseSchemaForFindManyResults(__Module)
  })
  async find(
    @param.query.string('filters') filters?: any,
    @param.query.number('limit') limit?: number,
    @param.query.number('page') page?: number,
    @param.query.string('order_by') orderBy?: string,
  ): Promise<IHttpResponse> {
    try {

      const where = {
        ...(filters || {}),
        or: [
          {project: process.env.AUTH_DB},
          {project: process.env.DB},
        ]
      };

      const result = await this.moduleRepository.find({
        where,
        limit: limit ?? 100,
        skip: (limit ?? 100) * (page ?? 0),
        order: [orderBy ?? '_createdAt DESC'],
      });
      const total = await this.moduleRepository.count(where);

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

  @get('/__modules/{moduleId}')
  @response(200, {
    description: 'Module model instance',
    properties: createDocResponseSchemaForFindOneResult(__Module)
  })
  async findById(
    @param.path.string('moduleId') id: string,
  ): Promise<IHttpResponse> {
    try {

      const data = await this.moduleRepository
        .findOne({where: {and: [{_id: id}, {_deletedAt: {eq: null}}]}});
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
}
