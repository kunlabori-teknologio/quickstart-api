/**
 * Locale to use in server messages
 */
export const localeMessage = 'pt-BR';
/**
 * Server messages
 */
export const serverMessages = {
  'httpResponse': {
    'ok': {
      'pt-BR': 'Requisição realizada com sucesso',
      'en-US': 'Successfully request',
    },
    'badRequestError': {
      'pt-BR': 'Requisição incorreta ou corrompida',
      'en-US': 'Incorrect or corrupt request',
    },
    'notFoundError': {
      'pt-BR': 'Recurso não encontrado',
      'en-US': 'Data not found',
    },
    'unauthorizedError': {
      'pt-BR': 'Você não tem autorização para realizar essa ação',
      'en-US': 'Unauthorized request',
    },
    'internalServerError': {
      'pt-BR': 'Desculpa, o servidor não está respondendo! Tente novamente mais tarde',
      'en-US': 'Sorry, server is not responding! Try again later',
    },
  },
  'auth': {
    'getGoogleUrl': {
      'pt-BR': 'Erro ao gerar URL do google',
      'en-US': 'Generate google URL error',
    },
    'getGoogleUser': {
      'pt-BR': 'Erro ao buscar usuário do google',
      'en-US': 'Error when searching for google user',
    },
    'unregisteredUser': {
      'pt-BR': 'Usuário não registrado',
      'en-US': 'User is not registered',
    },
    'uniqueIdIncorrect': {
      'pt-BR': 'CPF/CNPJ incorreto',
      'en-US': 'Incorrect unique id',
    },
    'uniqueIdNotFound': {
      'pt-BR': 'CPF/CNPJ não encontrado',
      'en-US': 'Unique id not found',
    },
    'birthdayIncorrect': {
      'pt-BR': 'A data de nascimento está incorreta',
      'en-US': 'Birthday incorrect',
    },
    'uniqueIdInUse': {
      'pt-BR': 'Este CPF/CNPJ já está sendo utilizado no usuário ',
      'en-US': 'The unique id is already being used by ',
    },
  }
}
