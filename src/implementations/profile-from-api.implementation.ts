import {CompanyDTO} from '../dto/company.dto';
import {PersonDTO} from '../dto/person.dto';
import {AdditionalInfoModel} from '../entities/signup.entity';
import {IGetProfile} from '../interfaces/auth.interface';
import {UserTypesEnum} from '../utils/general-functions';
const fetch = require('node-fetch')

export class ProfileFromAPIImplementation implements IGetProfile {

  async getFullProfileInfo(uniqueId: string, userType: UserTypesEnum, additionalInfo?: AdditionalInfoModel): Promise<PersonDTO | CompanyDTO | null> {
    return null
  }

}
