import {generateUniqueId} from '@loopback/core';
import {getOnlyUniqueIdNumber, getUserType} from '../utils/general-functions';
import {IFinancial, IFinancialOrder, IFinancialPaymentBoleto} from './../interfaces/financial.interface';

const fetch = require('node-fetch');

export class PagarmeImplementation implements IFinancial {

  pagarmeBaseRoute = 'https://api.pagar.me/core/v5'

  async generateBoleto(order: IFinancialOrder): Promise<IFinancialPaymentBoleto> {
    const userType = getUserType({uniqueId: order.customer.uniqueId, country: 'br'})
    const documentType = userType === 'person' ? 'CPF' : 'CNPJ'

    const bodyRequest = {
      "items": order.items.map(orderItem => {
        return {
          "amount": orderItem.qtd * orderItem.item.unitValue,
          "description": orderItem.item.name,
          "quantity": orderItem.qtd,
          "code": orderItem.item.code ?? generateUniqueId()
        }
      }),
      "customer": {
        "name": order.customer.name,
        "email": order.customer.email,
        "document_type": documentType,
        "document": getOnlyUniqueIdNumber(order.customer.uniqueId),
        "phones": {
          "mobile_phone": {
            "country_code": "55",
            "area_code": "00",
            "number": order.customer.phone ?? '988888888'
          }
        },
        "type": "Individual",
        "address": {
          "line_1": order.customer.address.address,
          // "zip_code": getOnlyUniqueIdNumber(order.customer.address.zipCode),
          "zip_code": "20021130", // Alexis: Por algum motivo, nem todos os CEPs estão funcionando, então deixei o CEP disponibilizado na documentação
          "city": order.customer.address.city,
          "state": order.customer.address.state,
          "country": order.customer.address.country
        }
      },
      "payments": [
        {
          "payment_method": "boleto",
          "boleto": {
            "instructions": order.paymentType?.instructions ?? '',
            "due_at": order.paymentType?.dueAt.toString(),
            "document_number": order.paymentType?.documentNumber ?? "Sem número",
            "type": order.paymentType?.type ?? "DM"
          }
        }
      ]
    }

    const response = await fetch(`${this.pagarmeBaseRoute}/orders`, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
        'Authorization': 'Basic ' + Buffer.from(`${process.env.PAGARME_SECRET_KEY || 'sk_test_QXY7QnKiKKHym2rb'}:`).toString('base64'),
      },
      body: JSON.stringify(bodyRequest),
    })

    if (response.ok) {
      const data = await response.json()

      const charge = (data.charges ?? []).reduce((prev: any, current: any) => {
        if (current.payment_method === 'boleto') return current;
        return prev
      }, null)

      return {
        id: charge.id,
        url: charge.last_transaction.url,
        pdf: charge.last_transaction.pdf,
        barCode: charge.last_transaction.barcode,
        qrCode: charge.last_transaction.qr_code,
        status: charge.status,
      }

    } else {
      throw new Error('Erro when generate boleto.');
    }

  }

}
