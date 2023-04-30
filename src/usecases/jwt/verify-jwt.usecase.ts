import {verify} from 'jsonwebtoken';
import {IJwtPayload} from '../../interfaces/jwt.interface';
import {serverMessages} from '../../utils/server-messages';

export class VerifyAuthToken {

  public execute(token?: string): IJwtPayload {
    if (!token) throw new Error(serverMessages.auth.noAuthToken['pt-BR']);

    const jwtToken = token.split(' ')[1];

    return verify(jwtToken, process.env.AUTENTIKIGO_SECRET!) as IJwtPayload;
  }
}
