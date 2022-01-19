interface ICompanyFromAPI {
  cnpj: string,
  razao: string,
  fantasia: string,
  inicioAtividade: string,
  responsavel: string,
  cnae: ICnae[],
  email: string,
}

interface ICnae {
  divisao: string,
  grupo: string,
  classe: string,
  subclasse: string,
  fiscal: string,
  descricao: string,
}
