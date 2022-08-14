import { /* inject, */ BindingScope, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import {Request} from '@loopback/rest';
import {HttpDocumentation} from '../implementations';
import {PaymentTypeEnum} from './../enums/payment.enum';
import {__Charge} from './../models/__charge.model';
import {__ChargeRepository} from './../repositories/__charge.repository';

@injectable({scope: BindingScope.TRANSIENT})
export class FinancialService {
  constructor(
    @repository(__ChargeRepository) private chargeRepository: __ChargeRepository,
  ) { }

  public async findChargeByPaymentType(
    httpRequest: Request,
    paymentType: PaymentTypeEnum
  ): Promise<any> {

    const urlWithPaymentType = `${httpRequest.url}&paymentType=${paymentType}`
    const filters = HttpDocumentation.createFilterRequestParams(urlWithPaymentType)

    const result = await this.chargeRepository.find(filters)

    const total = await this.chargeRepository.count(filters['where'])

    return {result, total}
  }

  public async findOneChargeByPaymentType(
    id: string,
    paymentType: PaymentTypeEnum,
  ): Promise<__Charge | null> {

    const data = await this.chargeRepository.findOne({
      where: {
        and: [
          {_id: id},
          {paymentType: paymentType},
          {_deletedAt: {eq: null}}
        ]
      }
    })

    return data;
  }
}
