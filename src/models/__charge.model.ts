import {model, property} from '@loopback/repository';
import {PaymentTypeEnum} from '../enums/payment.enum';
import {__Default} from './__default.model';

@model()
class FinancialPaymentBoleto {
  @property()
  id: string;

  @property()
  url: string;

  @property()
  pdf: string;

  @property()
  barCode: string;

  @property()
  qrCode: string;

  @property()
  status?: string;
}

@model()
export class __Charge extends __Default {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  _id?: string;

  @property({
    type: 'string',
    required: true,
  })
  paymentType: PaymentTypeEnum;

  @property()
  boleto?: FinancialPaymentBoleto;


  constructor(data?: Partial<__Charge>) {
    super(data);
  }
}

export interface __ChargeRelations {
  // describe navigational properties here
}

export type ChargeWithRelations = __Charge & __ChargeRelations;
