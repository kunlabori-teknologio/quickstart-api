import {LocaleEnum} from '../enums/locale.enum';

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
      [LocaleEnum['pt-BR']]: 'Requisição realizada com sucesso',
      [LocaleEnum['en-US']]: 'Successfully request',
    },
    'created': {
      [LocaleEnum['pt-BR']]: 'Recurso criado com sucesso',
      [LocaleEnum['en-US']]: 'Resource successfully created',
    },
    'noContent': {
      [LocaleEnum['pt-BR']]: 'Requisição realizada com sucesso e não há conteúdo adicional como resposta',
      [LocaleEnum['en-US']]: 'Successfully request, but no content response',
    },
    'badRequestError': {
      [LocaleEnum['pt-BR']]: 'Requisição incorreta ou corrompida',
      [LocaleEnum['en-US']]: 'Incorrect or corrupt request',
    },
    'notFoundError': {
      [LocaleEnum['pt-BR']]: 'Recurso não encontrado',
      [LocaleEnum['en-US']]: 'Data not found',
    },
    'unauthorizedError': {
      [LocaleEnum['pt-BR']]: 'Você não tem permissão para realizar essa ação',
      [LocaleEnum['en-US']]: 'Unauthorized request',
    },
    'internalServerError': {
      [LocaleEnum['pt-BR']]: 'Desculpa, o servidor não está respondendo! Tente novamente mais tarde',
      [LocaleEnum['en-US']]: 'Sorry, server is not responding! Try again later',
    },
  },
  'crudSuccess': {
    'create': {
      [LocaleEnum['pt-BR']]: 'Dado criado com sucesso',
      [LocaleEnum['en-US']]: 'Data created successfully',
    },
    'read': {
      [LocaleEnum['pt-BR']]: 'Dado(s) retornado(s) com sucesso',
      [LocaleEnum['en-US']]: 'Data returned successfully',
    },
    'update': {
      [LocaleEnum['pt-BR']]: 'Dado atualizado com sucesso',
      [LocaleEnum['en-US']]: 'Data updated successfully',
    },
    'delete': {
      [LocaleEnum['pt-BR']]: 'Dado deletado com sucesso',
      [LocaleEnum['en-US']]: 'Data removed successfully',
    },
  },
  'crudError': {
    'create': {
      [LocaleEnum['pt-BR']]: 'Erro na criação! Verifique os parâmetros e tente novamente',
      [LocaleEnum['en-US']]: 'Create error! Check parameters and try again',
    },
    'read': {
      [LocaleEnum['pt-BR']]: 'Erro na busca! Verifique os parâmetros e tente novamente',
      [LocaleEnum['en-US']]: 'Get error! Check parameters and try again',
    },
    'update': {
      [LocaleEnum['pt-BR']]: 'Erro na atualização! Verifique os parâmetros e tente novamente',
      [LocaleEnum['en-US']]: 'Update error! Check parameters and try again',
    },
    'delete': {
      [LocaleEnum['pt-BR']]: 'Erro na remoção! Verifique os parâmetros e tente novamente',
      [LocaleEnum['en-US']]: 'Remove error! Check parameters and try again',
    },
  },
  'auth': {
    'getGoogleUrl': {
      [LocaleEnum['pt-BR']]: 'Erro ao gerar URL do google',
      [LocaleEnum['en-US']]: 'Generate google URL error',
    },
    'getGoogleUser': {
      [LocaleEnum['pt-BR']]: 'Erro ao buscar usuário do google',
      [LocaleEnum['en-US']]: 'Error when searching for google user',
    },
    'unregisteredUser': {
      [LocaleEnum['pt-BR']]: 'Usuário não registrado',
      [LocaleEnum['en-US']]: 'User is not registered',
    },
    'loginSuccess': {
      [LocaleEnum['pt-BR']]: 'Login realizado com sucesso',
      [LocaleEnum['en-US']]: 'Successfully login',
    },
    'uniqueIdIncorrect': {
      [LocaleEnum['pt-BR']]: 'CPF/CNPJ incorreto',
      [LocaleEnum['en-US']]: 'Incorrect unique id',
    },
    'uniqueIdNotFound': {
      [LocaleEnum['pt-BR']]: 'CPF/CNPJ não encontrado',
      [LocaleEnum['en-US']]: 'Unique id not found',
    },
    'birthdayIncorrect': {
      [LocaleEnum['pt-BR']]: 'A data de nascimento está incorreta',
      [LocaleEnum['en-US']]: 'Birthday incorrect',
    },
    'uniqueIdInUse': {
      [LocaleEnum['pt-BR']]: 'Este CPF/CNPJ já está sendo utilizado no usuário ',
      [LocaleEnum['en-US']]: 'The unique id is already being used by ',
    },
    'signupError': {
      [LocaleEnum['pt-BR']]: 'Erro ao cadastrar o usuário',
      [LocaleEnum['en-US']]: 'Signup error',
    },
    'signupSuccess': {
      [LocaleEnum['pt-BR']]: 'Cadastro realizado com sucesso',
      [LocaleEnum['en-US']]: 'Signup successfuly',
    },
    'createProfileError': {
      [LocaleEnum['pt-BR']]: 'Erro ao criar o perfil do usuário',
      [LocaleEnum['en-US']]: 'Create profile error',
    },
    'refreshTokenError': {
      [LocaleEnum['pt-BR']]: 'Erro ao gerar o refresh token',
      [LocaleEnum['en-US']]: 'Error generating refresh token',
    },
    'refreshTokenSuccess': {
      [LocaleEnum['pt-BR']]: 'Refresh token gerado com sucesso',
      [LocaleEnum['en-US']]: 'Refresh token generated successfully',
    },
    'noAuthToken': {
      [LocaleEnum['pt-BR']]: 'Token não informado',
      [LocaleEnum['en-US']]: 'Token not provided',
    },
    'invalidAuthToken': {
      [LocaleEnum['pt-BR']]: 'Token invalido',
      [LocaleEnum['en-US']]: 'Invalid token',
    },
    'expiredAuthToken': {
      [LocaleEnum['pt-BR']]: 'Token expirado',
      [LocaleEnum['en-US']]: 'Token expired',
    },
    'emailInvitationIncorrect': {
      [LocaleEnum['pt-BR']]: 'Convite invalido. Utilize o e-mail do usuário convidado',
      [LocaleEnum['en-US']]: 'Invalid invitation. Use correct invited user e-mail',
    },
    'userIsNotAdmin': {
      [LocaleEnum['pt-BR']]: 'Login invalido. Usuário não é admin',
      [LocaleEnum['en-US']]: 'Invalid login. User is not admin',
    },
    'userIsDisabled': {
      [LocaleEnum['pt-BR']]: 'Login invalido. Usuário desabilitado',
      [LocaleEnum['en-US']]: 'Invalid login. User is disabled',
    }
  },
  'user': {
    'personNotFound': {
      [LocaleEnum['pt-BR']]: 'Usuário incorreto! Verifique  os parâmetros e tente novamente',
      [LocaleEnum['en-US']]: 'User incorrect! Check parameters and try again',
    },
    'companyNotFound': {
      [LocaleEnum['pt-BR']]: 'Usuário incorreto! Verifique  os parâmetros e tente novamente',
      [LocaleEnum['en-US']]: 'User incorrect! Check parameters and try again',
    }
  },
  'invitation': {
    'invitationHasAlreadyBeenCreated': {
      [LocaleEnum['pt-BR']]: 'Convite já foi criado',
      [LocaleEnum['en-US']]: 'Invitation has already been created',
    },
    'invitationSent': {
      [LocaleEnum['pt-BR']]: 'Convite enviado com sucesso',
      [LocaleEnum['en-US']]: 'Invitation sent successfuly',
    },
    'invitationSentFailed': {
      [LocaleEnum['pt-BR']]: 'Erro ao enviar o convite',
      [LocaleEnum['en-US']]: 'Invitation sent error',
    }
  }
}
