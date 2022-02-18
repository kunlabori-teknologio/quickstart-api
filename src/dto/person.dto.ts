import {AnyObject} from '@loopback/repository';
import {AdditionalInfoModel} from '../entities/signup.entity';
import {IPersonFromAPI} from '../interfaces/person.interface';
import {Person} from '../models';
import {convertBirthdayStringToDate} from '../utils/date-manipulation-functions';

export class PersonDTO implements Person {
  _id?: string | undefined;
  name: string;
  uniqueId: string;
  birthday: Date;
  gender: string;
  mother: string;
  country: string;
  username?: string | undefined;
  nickname?: string | undefined;
  genderIdentity?: string | undefined;

  constructor({dataFromApi, additionalInfo}: {dataFromApi: IPersonFromAPI, additionalInfo: AdditionalInfoModel}) {
    const birthday = convertBirthdayStringToDate(dataFromApi.nascimento);
    this.name = dataFromApi.nome;
    this.uniqueId = dataFromApi.cpf.replace(/\D/g, "");
    this.birthday = birthday;
    this.gender = dataFromApi.genero;
    this.mother = dataFromApi.mae;
    this.country = 'br';
    this.nickname = additionalInfo?.personInfo?.nickname;
    this.genderIdentity = additionalInfo?.personInfo?.genderIdentity;
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
