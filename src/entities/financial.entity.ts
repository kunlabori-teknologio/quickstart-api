import {Entity, model, property} from '@loopback/repository';

@model()
class FinancialItem extends Entity {
  @property()
  name: string;
  @property()
  unitValue: number;
  @property()
  code?: string;
}

@model()
class FinancialOrderItem extends Entity {
  @property()
  qtd: number;
  @property()
  item: FinancialItem;
}

@model()
class FinancialAddress extends Entity {
  @property()
  address: string;
  @property()
  zipCode: string;
  @property()
  city: string;
  @property()
  state: string;
  @property()
  country: string;
}

@model()
class FinancialCustomer extends Entity {
  @property()
  name: string;
  @property()
  email: string;
  @property()
  uniqueId: string;
  @property()
  address: FinancialAddress;
  @property()
  phone?: string;
}

@model()
class FinancialPaymentTypeBoleto extends Entity {
  @property()
  instructions: string;
  @property()
  dueAt: Date;
  @property()
  documentNumber: string;
  @property()
  type: string;
}

@model()
class FinancialPaymentType extends Entity {
  @property()
  boleto: FinancialPaymentTypeBoleto;
}

@model()
export class Order extends Entity {
  @property({
    type: 'array',
    itemType: FinancialOrderItem
  })
  items: FinancialOrderItem[];

  @property()
  customer: FinancialCustomer;

  @property()
  paymentType: FinancialPaymentType;
}
