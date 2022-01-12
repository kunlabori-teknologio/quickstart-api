interface SsoUser {
  googleId?: string,
  appleId?: string,
  email: string,
}

interface SumaryUser {
  userId: string,
  personInfo?: SumaryPerson,
}

interface SumaryPerson {
  name: string,
  uniqueId: string,
  birthday: Date,
  gender: string,
  mother: string,
  country: string,
  username: string,
}
