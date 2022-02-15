import {Request, Response} from '@loopback/rest';
import {decode, verify} from 'jsonwebtoken';
import {Http} from '..';
import {LocaleEnum} from '../../enums/locale.enum';
import {IAuthToken, ILoginResponse} from '../../interfaces/auth.interface';
import {IHttpResponse} from '../../interfaces/http.interface';
import {serverMessages} from '../../utils/server-messages';

export class AuthToken implements IAuthToken {
  verifyLoginUserInfoToken(
    token: string, secret: string, request: Request, response: Response, locale?: LocaleEnum
  ): IHttpResponse {
    try {

      if (!token) throw new Error(serverMessages['auth']['noAuthToken'][locale ?? LocaleEnum['pt-BR']])

      const authToken = token.split(' ')[1]

      verify(authToken, secret)

      return Http.okHttpResponse({locale, request, response})

    } catch (err) {

      let message = serverMessages['httpResponse']['unauthorizedError'][locale ?? LocaleEnum['pt-BR']]
      let statusCode = 401

      switch (err.name) {
        case 'TokenExpiredError':
          message = serverMessages['auth']['expiredAuthToken'][locale ?? LocaleEnum['pt-BR']]
          statusCode = 602
          break

        case 'JsonWebTokenError':
          message = serverMessages['auth']['invalidAuthToken'][locale ?? LocaleEnum['pt-BR']]
          statusCode = 603
          break

        default:
          break

      }
      return Http.unauthorizedErrorHttpResponse({
        logMessage: err.message, message, statusCode, request, response, locale
      })
    }
  }

  getLoginUserInfoFromToken(token: string): ILoginResponse {
    const authToken = token.split(' ')[1]

    const payload = decode(authToken) as ILoginResponse

    return payload
  }

  getUserIdFromToken(token: string, secret: string): string {
    throw new Error('Method not implemented.');
  }
}
