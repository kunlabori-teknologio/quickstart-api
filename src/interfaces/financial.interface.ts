export interface IFinancialItem {
  name: string,
  unitValue: number,
  code?: string,
}

export interface IFinancialOrderItem {
  qtd: number,
  item: IFinancialItem,
}

export interface IFinancialCustomer {
  name: string,
  email: string,
  uniqueId: string,
  address: IFinancialAddress
  phone?: string,
}

export interface IFinancialAddress {
  address: string,
  zipCode: string,
  city: string,
  state: string,
  country: string,
}

export interface IFinancialPaymentTypeBoleto {
  instructions: string,
  dueAt: Date,
  documentNumber: string,
  type: string,
}
export interface IFinancialPaymentBoleto {
  id: string,
  url: string,
  pdf: string,
  barCode: string,
  qrCode: string,
  status?: string,
}

export interface IFinancialOrder {
  items: IFinancialOrderItem[],
  customer: IFinancialCustomer,
  paymentType: IFinancialPaymentTypeBoleto | null,
}

export interface IFinancial {
  generateBoleto(order: IFinancialOrder): Promise<IFinancialPaymentBoleto>,
}
