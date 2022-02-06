export interface ICompanyFromAPI {
  cnpj: string,
  razao: string,
  fantasia: string,
  inicioAtividade: string,
  responsavel: string,
  cnae: IBusinessActivityCode[],
  email: string,
}

export interface IBusinessActivityCode {
  divisao: string,
  grupo: string,
  classe: string,
  subclasse: string,
  fiscal: string,
  descricao: string,
}
