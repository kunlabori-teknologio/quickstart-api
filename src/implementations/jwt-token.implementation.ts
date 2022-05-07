import {Request, Response} from '@loopback/rest';
import {decode, JwtPayload, verify} from 'jsonwebtoken';
import {LocaleEnum} from '../enums/locale.enum';
import {IAuthToken, ILoginUserInfo} from '../interfaces/auth.interface';
import {serverMessages} from '../utils/server-messages';
import {HttpResponseToClient} from './index';

export class JwtTokenImplementation implements IAuthToken {

  verifyAuthToken(
    token: string, secret: string, request: Request, response: Response, locale?: LocaleEnum
  ): boolean {
    try {

      if (!token) throw new Error(serverMessages['auth']['noAuthToken'][locale ?? LocaleEnum['pt-BR']])

      const authToken = token.split(' ')[1]

      verify(authToken, secret)

      return true

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

      const errorResponse = HttpResponseToClient.unauthorizedErrorHttpResponse({
        logMessage: err.message, message, statusCode, request, response, locale
      })
      response.send(errorResponse)

      return false
    }
  }

  getLoginUserInfoFromToken(token: string): ILoginUserInfo {
    const authToken = token.split(' ')[1]

    const payload = decode(authToken) as ILoginUserInfo

    return payload
  }

  getUserIdFromToken(token: string): string {
    const authToken = token.split(' ')[1]

    const payload = decode(authToken) as JwtPayload

    return payload.id
  }
}
