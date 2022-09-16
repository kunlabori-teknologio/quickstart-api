import {Entity, Model, model, property} from '@loopback/repository';
import {getJsonSchema} from '@loopback/rest';

@model()
class AdditionalPersonInfoModel extends Entity {
  @property()
  nickname?: string

  @property()
  genderIdentity?: string
}

@model()
class AdditionalCompanyInfoModel extends Entity {

}

@model()
export class AdditionalInfoModel extends Entity {
  @property({
    jsonSchema: getJsonSchema(AdditionalPersonInfoModel),
    required: false,
  })
  personInfo?: AdditionalPersonInfoModel;

  @property({
    required: false,
    jsonSchema: getJsonSchema(AdditionalCompanyInfoModel)
  })
  companyInfo?: AdditionalCompanyInfoModel;
}

// Signup schema model
@model()
export class Signup extends Model {
  @property({
    required: true,
    description: 'Person/Company Unique ID such as CPF and CNPJ',
  })
  uniqueId: string;

  @property({
    required: true,
  })
  birthday: string;

  @property({
    required: true,
  })
  country: string;

  @property({
    required: false,
    jsonSchema: getJsonSchema(AdditionalInfoModel)
  })
  additionalInfo?: AdditionalInfoModel
}
