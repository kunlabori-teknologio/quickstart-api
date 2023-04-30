import {service} from '@loopback/core';
import {repository} from '@loopback/repository';
import {__Company, __Person} from '../../models';
import {__CompanyRepository, __PersonRepository} from '../../repositories';
import {UserTypesEnum} from '../../utils/general-functions';
import {serverMessages} from '../../utils/server-messages';
import {GetFullProfileInfo} from './get-full-profile-info.usecase';

export interface IAdditionalInfo {
  personInfo?: any,
  companyInfo?: any,
}

interface ICreateProfileProps {
  userType: UserTypesEnum,
  uniqueId: string,
  additionalInfo?: IAdditionalInfo
}

export class CreateProfile {

  constructor(
    @service(GetFullProfileInfo) private getFullProfileInfo: GetFullProfileInfo,

    @repository(__PersonRepository) private personRepository: __PersonRepository,
    @repository(__CompanyRepository) private companyRepository: __CompanyRepository,
  ){}

  public async execute(
    props: ICreateProfileProps,
  ): Promise<__Person | __Company> {
    try {

      const profileDTO = await this.getFullProfileInfo.execute(
        props.uniqueId,
        props.userType,
        props.additionalInfo,
      );
      if (!profileDTO) throw new Error(serverMessages.auth.uniqueIdNotFound['pt-BR']);

      const profileCreated = await this[`${props.userType}Repository`]
        .create({...profileDTO});

      return profileCreated;

    } catch (err) {

      throw new Error(serverMessages.auth.createProfileError['pt-BR']);

    }
  }

}
