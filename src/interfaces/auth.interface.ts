import {User} from '../models';

export interface ISsoUser {
  googleId?: string,
  appleId?: string,
  email?: string,
}

export interface IRegistryCheck {
  authToken?: string | null,
  user?: User | null
}

export interface ISumaryUser {
  userId: string,
  personInfo?: ISumaryPerson,
  companyInfo?: ISumaryCompany,
}

export interface ISumaryPerson {
  name: string,
  uniqueId: string,
  birthday: Date,
  gender: string,
  mother: string,
  country: string,
  username: string,
}

export interface ISumaryCompany {
  corporateName: string,
  tradeName: string,
  uniqueId: string,
  birthday: Date,
  email: string,
  responsible: string,
  cnae: IBusinessActivityCode[],
}
