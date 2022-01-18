import {AnyObject} from '@loopback/repository';
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

  constructor(dto: IPersonFromAPI) {
    const birthday = convertBirthdayStringToDate(dto.nascimento);
    this.name = dto.nome;
    this.uniqueId = dto.cpf.replace(/\D/g, "");
    this.birthday = birthday;
    this.gender = dto.genero;
    this.mother = dto.mae;
    this.country = 'br';
  }

}
