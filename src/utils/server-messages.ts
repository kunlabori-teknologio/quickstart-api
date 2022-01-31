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
  },
  'permission': {
    'userOrPermissionNotFound': {
      'pt-BR': 'Usuário ou permissão incorreto! Verifique  os parâmetros e tente novamente',
      'en-US': 'User or permission incorrect! Check parameters and try again',
    },
    'permissionGiven': {
      'pt-BR': 'Permissão dada com sucesso',
      'en-US': 'Permission given successfully',
    },
    'permissionRemoved': {
      'pt-BR': 'Permissão removida com sucesso',
      'en-US': 'Permission removed successfully',
    }
  }
}
