import {ICompanyFromAPI} from '../../interfaces/company.interface';
import {IPersonFromAPI} from '../../interfaces/person.interface';

const fetch = require('node-fetch');

export class CpfCnpjApi {

  public async getPersonData(
    uniqueId: string
  ): Promise<IPersonFromAPI | null> {
    let dataFromApi = await fetch(`${process.env.API_CPF_CNPJ}/2/${uniqueId.replace(/\D/g, "")}`);
    dataFromApi = await dataFromApi.json();

    if (!dataFromApi.status) return null

    return dataFromApi as IPersonFromAPI;
  }

  public async getCompanyData(
    uniqueId: string
  ): Promise<ICompanyFromAPI | null> {
    let dataFromApi = await fetch(`${process.env.API_CPF_CNPJ}/6/${uniqueId.replace(/\D/g, "")}`);
    dataFromApi = await dataFromApi.json();

    if (!dataFromApi.status) return null

    return dataFromApi as ICompanyFromAPI;
  }

}
