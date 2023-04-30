import {inject, service} from '@loopback/core'
import {Request, Response, RestBindings, get, param, response} from '@loopback/rest'
import {IHttpResponse} from '../interfaces/http.interface'
import {GetAddressByZipcode} from '../usecases/address'
import {getSwaggerResponseSchema} from '../utils/general-functions'
import {badRequestErrorHttpResponse, okHttpResponse} from '../utils/http-response.util'
import {serverMessages} from '../utils/server-messages'

export class __ExternalApiController {

  constructor(
    @inject(RestBindings.Http.REQUEST) private httpRequest: Request,
    @inject(RestBindings.Http.RESPONSE) private httpResponse: Response,

    @service(GetAddressByZipcode) private getAddressByZipcode: GetAddressByZipcode,
  ){}

  @get('/__external-api/address')
  @response(200, getSwaggerResponseSchema({
    address: {type: 'string'},
    number: {type: 'string'},
    city: {type: 'string'},
    state: {type: 'string'},
    zipcode: {type: 'string'},
    country: {type: 'string'},
  }))
  async findAddress(
    @param.query.string('zipcode') zipcode: string,
    @param.query.string('country') country?: string,
  ): Promise<IHttpResponse> {
    try {

      const data = await this.getAddressByZipcode.execute(zipcode, country);

      if (!data) throw new Error(serverMessages.crudError.read['pt-BR'])

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
