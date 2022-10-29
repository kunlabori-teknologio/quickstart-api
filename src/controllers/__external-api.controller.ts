import {inject} from '@loopback/core'
import {get, param, Request, Response, response, RestBindings} from '@loopback/rest'
import {LocaleEnum} from '../enums/locale.enum'
import {HttpResponseToClient} from '../implementations'
import {GetAddressByCEPImplementation} from '../implementations/get-address-by-cep.implementation'
import {IGetAddress} from '../interfaces/address.interface'
import {IHttpResponse} from '../interfaces/http.interface'
import {serverMessages} from '../utils/server-messages'

export class __ExternalApiController {
  private address: IGetAddress

  constructor(
    @inject(RestBindings.Http.REQUEST) private httpRequest: Request,
    @inject(RestBindings.Http.RESPONSE) private httpResponse: Response,
  ) {

    this.address = new GetAddressByCEPImplementation()

  }

  @get('/__external-api/address/{zipcode}')
  @response(200, {
    description: 'Address info',
    content: {
      'application/json': {
        schema: {
          properties: {
            address: {type: 'string'},
            number: {type: 'string'},
            city: {type: 'string'},
            state: {type: 'string'},
            zipcode: {type: 'string'},
            country: {type: 'string'},
          }
        },
      },
    }
  })
  async findAddress(
    @param.path.string('zipcode') zipcode: string,
    @param.query.string('country') country?: string,
    @param.query.string('locale') locale?: LocaleEnum,
  ): Promise<IHttpResponse> {
    try {

      const data = await this.address.getAddressByZipcode(zipcode, country)

      if (!data) throw new Error(serverMessages['crudError']['read'][locale ?? LocaleEnum['pt-BR']])

      return HttpResponseToClient.okHttpResponse({
        data,
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
}
