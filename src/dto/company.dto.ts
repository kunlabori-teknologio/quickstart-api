import {AnyObject} from '@loopback/repository';
import {IBusinessActivityCode, ICompanyFromAPI} from '../interfaces/company.interface';
import {Company} from '../models';
import {AdditionalInfoModel} from '../models/signup.model';
import {convertBirthdayStringToDate} from '../utils/date-manipulation-functions';

export class CompanyDTO implements Company {
  _id?: string | undefined;
  corporateName: string;
  tradeName: string;
  uniqueId: string;
  birthday: Date;
  email: string;
  responsible: string;
  businessActivityCode: IBusinessActivityCode[];


  constructor({dataFromApi, additionalInfo}: {dataFromApi: ICompanyFromAPI, additionalInfo: AdditionalInfoModel}) {
    const birthday = convertBirthdayStringToDate(dataFromApi.inicioAtividade);
    this.corporateName = dataFromApi.razao;
    this.tradeName = dataFromApi.fantasia;
    this.uniqueId = dataFromApi.cnpj.replace(/\D/g, "");
    this.birthday = birthday;
    this.email = dataFromApi.email;
    this.responsible = dataFromApi.responsavel;
    this.businessActivityCode = dataFromApi.cnae;
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
