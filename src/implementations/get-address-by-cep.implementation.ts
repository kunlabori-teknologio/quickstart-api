import {IAddress, IGetAddress} from '../interfaces/address.interface';

const fetch = require('node-fetch');

export class GetAddressByCEPImplementation implements IGetAddress {

  async getAddressByZipcode(zipcode: string, country?: string): Promise<IAddress | undefined> {
    country = country ?? '633eb87dd618a22055bff9c8'

    const onlyNumberZipcode = zipcode.replace(/[^\d]+/g, '')

    switch (country) {
      case '633eb87dd618a22055bff9c8':
        return this.brazil(onlyNumberZipcode)

      default:
        return undefined
    }
  }

  private async brazil(zipcode: string): Promise<IAddress | undefined> {
    if (zipcode.length !== 8) throw new Error('Incorrect zip code')

    let response = await fetch(
      `https://viacep.com.br/ws/${zipcode}/json/`,
      {method: 'GET'}
    );
    const address = await response.json();

    if (address.erro) return undefined;

    return {
      address: address['logradouro'],
      neighborhood: address['bairro'],
      city: address['localidade'],
      state: address['uf'],
      zipcode: address['cep'],
      country: 'Brasil',
    };
  }

}
