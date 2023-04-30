import {service} from '@loopback/core';
import {CompanyDTO} from '../../dto/company.dto';
import {PersonDTO} from '../../dto/person.dto';
import {ICompanyFromAPI} from '../../interfaces/company.interface';
import {IPersonFromAPI} from '../../interfaces/person.interface';
import {__CompanyRepository, __PersonRepository} from '../../repositories';
import {CpfCnpjApi} from '../../services/auth/cpf-cnpj.service';
import {UserTypesEnum} from '../../utils/general-functions';
import {IAdditionalInfo} from './create-profile.usecase';

export class GetFullProfileInfo {

  constructor(
    @service(CpfCnpjApi) private cpfCnpjApi: CpfCnpjApi,
  ){}

  public async execute(
    uniqueId: string,
    userType: UserTypesEnum,
    additionalInfo?: IAdditionalInfo,
    personCompanyRepository?: __PersonRepository | __CompanyRepository,
    countryId?: string,
  ): Promise<PersonDTO | CompanyDTO | null> {
    uniqueId = uniqueId.replace(/\D/g, "")

    let dataFromApi: IPersonFromAPI | ICompanyFromAPI | null = null;

    if (!countryId) countryId = '633eb87dd618a22055bff9c8';

    switch (countryId) {
      case '633eb87dd618a22055bff9c8':
        dataFromApi = userType === 'person' ?
          await this.cpfCnpjApi.getPersonData(uniqueId) :
          await this.cpfCnpjApi.getCompanyData(uniqueId);
        break;

      default:
        break;
    }

    if (!dataFromApi) return null

    const profileDTO: PersonDTO | CompanyDTO =
      userType === 'person' ?
        new PersonDTO({dataFromApi: dataFromApi as IPersonFromAPI, additionalInfo: additionalInfo as IAdditionalInfo}) :
        new CompanyDTO({dataFromApi: dataFromApi as ICompanyFromAPI, additionalInfo: additionalInfo as IAdditionalInfo});

    if (personCompanyRepository)
      await personCompanyRepository.create({...profileDTO});

    return profileDTO;
  }

}
