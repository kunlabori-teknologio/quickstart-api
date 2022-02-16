import {CompanyDTO} from '../dto/company.dto';
import {PersonDTO} from '../dto/person.dto';
import {AdditionalInfoModel} from '../entities/signup.entity';
import {IGetProfile} from '../interfaces/auth.interface';
import {ICompanyFromAPI} from '../interfaces/company.interface';
import {IPersonFromAPI} from '../interfaces/person.interface';
import {UserTypesEnum} from '../utils/general-functions';
const fetch = require('node-fetch')

export class ProfileFromAPIImplementation implements IGetProfile {

  async getFullProfileInfo(uniqueId: string, userType: UserTypesEnum, additionalInfo?: AdditionalInfoModel): Promise<PersonDTO | CompanyDTO | null> {

    let dataFromCpfCnpjApi = await fetch(`${process.env.API_CPF_CNPJ}/${userType === 'person' ? 2 : 6}/${uniqueId.replace(/\D/g, "")}`)

    dataFromCpfCnpjApi = dataFromCpfCnpjApi.json()

    if (!dataFromCpfCnpjApi.status) return null

    const dataTypedFromCpfCnpjApi: IPersonFromAPI | ICompanyFromAPI = await dataFromCpfCnpjApi

    const profileDTO: PersonDTO | CompanyDTO =
      userType === 'person' ?
        new PersonDTO({dataFromApi: dataTypedFromCpfCnpjApi as IPersonFromAPI, additionalInfo: additionalInfo as AdditionalInfoModel}) :
        new CompanyDTO({dataFromApi: dataTypedFromCpfCnpjApi as ICompanyFromAPI, additionalInfo: additionalInfo as AdditionalInfoModel})

    return profileDTO
  }

}
