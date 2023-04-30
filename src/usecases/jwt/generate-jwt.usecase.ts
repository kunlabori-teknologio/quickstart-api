import {sign} from 'jsonwebtoken';
import {IJwtPayload} from '../../interfaces/jwt.interface';

export class GenerateJwt {

  public execute(payload: IJwtPayload, expiresIn: number | string): string {
    const token = sign(
      payload,
      process.env.AUTENTIKIGO_SECRET!,
      {
        expiresIn: expiresIn,
      }
    );

    return `Bearer ${token}`;
  }

}
