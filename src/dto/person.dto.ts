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

  constructor(personFromAPI: IPersonFromAPI) {
    const birthday = convertBirthdayStringToDate(personFromAPI.nascimento);
    this.name = personFromAPI.nome;
    this.uniqueId = personFromAPI.cpf.replace(/\D/g, "");
    this.birthday = birthday;
    this.gender = personFromAPI.genero;
    this.mother = personFromAPI.mae;
    this.country = 'br';
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
