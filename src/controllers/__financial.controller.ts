import {PagarmeImplementation} from './../implementations/pagarme.implementation';
import {__Charge} from './../models/__charge.model';
import {__ChargeRepository} from './../repositories/__charge.repository';
import {FinancialService} from './../services/financial.service';
// Uncomment these imports to begin using these cool features!

import {inject, service} from '@loopback/core';
import {repository} from '@loopback/repository';
import {get, param, post, Request, requestBody, response, Response, RestBindings} from '@loopback/rest';
import {Order} from '../entities/financial.entity';
import {LocaleEnum} from '../enums/locale.enum';
import {PaymentTypeEnum} from '../enums/payment.enum';
import {HttpDocumentation, HttpResponseToClient} from '../implementations';
import {IHttpResponse} from '../interfaces/http.interface';
import {serverMessages} from '../utils/server-messages';

export class FinancialController {
  private paymentGatway = new PagarmeImplementation()

  constructor(
    @repository(__ChargeRepository) private chargeRepository: __ChargeRepository,

    @service(FinancialService) private financialService: FinancialService,

    @inject(RestBindings.Http.REQUEST) private httpRequest: Request,
    @inject(RestBindings.Http.RESPONSE) private httpResponse: Response,
  ) { }

  @post('/__financial/boletos')
  @response(200, {
    description: 'Boleto info',
    content: {
      'application/json': {
        schema: {
          properties:
          {
            id: {type: 'string'},
            url: {type: 'string'},
            pdf: {type: 'string'},
            barCode: {type: 'string'},
            qrCode: {type: 'string'},
          }
        },
      },
    }
  })
  async createBoleto(
    @requestBody({
      content: HttpDocumentation.createDocRequestSchema(Order)
    }) order: Order,
    @param.query.string('locale') locale?: LocaleEnum,
  ): Promise<IHttpResponse> {
    try {

      const boleto = await this.paymentGatway.generateBoleto({
        ...order,
        paymentType: order.paymentType.boleto,
      })

      await this.chargeRepository.create({
        paymentType: PaymentTypeEnum.boleto,
        boleto
      })

      return HttpResponseToClient.okHttpResponse({
        data: boleto,
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

  @get('/__financial/boletos')
  @response(200, {
    description: 'Array of boletos',
    properties: HttpDocumentation.createDocResponseSchemaForFindManyResults(__Charge)
  })
  async findBoleto(
    @param.query.number('limit') limit?: number,
    @param.query.number('page') page?: number,
    @param.query.string('order_by') orderBy?: string,
    @param.query.string('locale') locale?: LocaleEnum,
  ): Promise<IHttpResponse> {
    try {

      const data = await this.financialService.findChargeByPaymentType(
        this.httpRequest,
        PaymentTypeEnum.boleto,
      )

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

  @get('/__financial/boletos/{boletoId}')
  @response(200, {
    description: 'Invitation model instance',
    properties: HttpDocumentation.createDocResponseSchemaForFindOneResult(__Charge)
  })
  async findBoletoById(
    @param.path.string('boletoId') id: string,
    @param.query.string('locale') locale?: LocaleEnum,
  ): Promise<IHttpResponse> {
    try {

      const data = await this.financialService.findOneChargeByPaymentType(
        id,
        PaymentTypeEnum.boleto,
      )
      if (!data) throw new Error(serverMessages['httpResponse']['notFoundError'][locale ?? LocaleEnum['pt-BR']])

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
        response: this.httpResponse
      })

    }
  }
}
