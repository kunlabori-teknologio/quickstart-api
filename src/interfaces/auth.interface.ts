interface ISsoUser {
  googleId?: string,
  appleId?: string,
  email: string,
}

interface ISumaryUser {
  userId: string,
  personInfo?: ISumaryPerson,
  companyInfo?: ISumaryCompany,
}

interface ISumaryPerson {
  name: string,
  uniqueId: string,
  birthday: Date,
  gender: string,
  mother: string,
  country: string,
  username: string,
}

interface ISumaryCompany {
  corporateName: string,
  tradeName: string,
  uniqueId: string,
  birthday: Date,
  email: string,
  responsible: string,
  cnae: ICnae[],
}
