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
    'created': {
      'pt-BR': 'Recurso criado com sucesso',
      'en-US': 'Resource successfully created',
    },
    'noContent': {
      'pt-BR': 'Requisição realizada com sucesso e não há conteúdo adicional como resposta',
      'en-US': 'Successfully request, but no content response',
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
  'crudSuccess': {
    'create': {
      'pt-BR': 'Dado criado com sucesso',
      'en-US': 'Data created successfully',
    },
    'read': {
      'pt-BR': 'Dado(s) retornado(s) com sucesso',
      'en-US': 'Data returned successfully',
    },
    'update': {
      'pt-BR': 'Dado atualizado com sucesso',
      'en-US': 'Data updated successfully',
    },
    'delete': {
      'pt-BR': 'Dado deletado com sucesso',
      'en-US': 'Data removed successfully',
    },
  },
  'crudError': {
    'create': {
      'pt-BR': 'Erro na criação! Verifique os parâmetros e tente novamente',
      'en-US': 'Create error! Check parameters and try again',
    },
    'read': {
      'pt-BR': 'Erro na busca! Verifique os parâmetros e tente novamente',
      'en-US': 'Get error! Check parameters and try again',
    },
    'update': {
      'pt-BR': 'Erro na atualização! Verifique os parâmetros e tente novamente',
      'en-US': 'Update error! Check parameters and try again',
    },
    'delete': {
      'pt-BR': 'Erro na remoção! Verifique os parâmetros e tente novamente',
      'en-US': 'Remove error! Check parameters and try again',
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
    'loginSuccess': {
      'pt-BR': 'Login realizado com sucesso',
      'en-US': 'Successfully login',
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
    'signupError': {
      'pt-BR': 'Erro ao cadastrar o usuário',
      'en-US': 'Signup error',
    },
    'signupSuccess': {
      'pt-BR': 'Cadastro realizado com sucesso',
      'en-US': 'Signup successfuly',
    },
    'createProfileError': {
      'pt-BR': 'Erro ao criar o perfil do usuário',
      'en-US': 'Create profile error',
    },
    'refreshTokenError': {
      'pt-BR': 'Erro ao gerar o refresh token',
      'en-US': 'Error generating refresh token',
    },
    'refreshTokenSuccess': {
      'pt-BR': 'Refresh token gerado com sucesso',
      'en-US': 'Refresh token generated successfully',
    },
    'invalidAuthToken': {
      'pt-BR': 'Token invalido',
      'en-US': 'Invalid token',
    },
    'expiredAuthToken': {
      'pt-BR': 'Token expirado',
      'en-US': 'Token expired',
    }
  },
  'user': {
    'personNotFound': {
      'pt-BR': 'Usuário incorreto! Verifique  os parâmetros e tente novamente',
      'en-US': 'User incorrect! Check parameters and try again',
    },
    'companyNotFound': {
      'pt-BR': 'Usuário incorreto! Verifique  os parâmetros e tente novamente',
      'en-US': 'User incorrect! Check parameters and try again',
    }
  }
}
