import {AnyObject} from '@loopback/repository';
import {Company} from '../models';
import {convertBirthdayStringToDate} from '../utils/date-manipulation-functions';

export class CompanyDTO implements Company {
  _id?: string | undefined;
  corporateName: string;
  tradeName: string;
  uniqueId: string;
  birthday: Date;
  email: string;
  responsible: string;
  cnae: ICnae[];

  constructor(companyFromApi: ICompanyFromAPI) {
    const birthday = convertBirthdayStringToDate(companyFromApi.inicioAtividade);
    this.corporateName = companyFromApi.razao;
    this.tradeName = companyFromApi.fantasia;
    this.uniqueId = companyFromApi.cnpj.replace(/\D/g, "");
    this.birthday = birthday;
    this.email = companyFromApi.email;
    this.responsible = companyFromApi.responsavel;
    this.cnae = companyFromApi.cnae;
  }

  getId() {
    throw new Error('Method not implemented.');
  }
  getIdObject(): Object {
    throw new Error('Method not implemented.');
  }
  toJSON(): Object {
    throw new Error('Method not implemented.');
  }
  toObject(options?: AnyObject): Object {
    throw new Error('Method not implemented.');
  }

}
