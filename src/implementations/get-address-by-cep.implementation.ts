import {IAddress, IGetAddress} from '../interfaces/address.interface';

const fetch = require('node-fetch');

export class GetAddressByCEPImplementation implements IGetAddress {

  async getAddressByZipcode(zipcode: string, country: string): Promise<IAddress | undefined> {

    switch (country) {
      case 'br':
        const onlyNumberZipcode = zipcode.replace(/[^\d]+/g, '')

        if (onlyNumberZipcode.length !== 8) throw new Error('Incorrect zip code')

        let response = await fetch(
          `https://viacep.com.br/ws/${onlyNumberZipcode}/json/`,
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
      default:
        return undefined
    }
  }

}
