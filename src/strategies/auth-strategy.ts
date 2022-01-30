import {AuthenticationStrategy} from '@loopback/authentication';
import {model} from '@loopback/repository';
import {HttpErrors, Request} from '@loopback/rest';
import {securityId, UserProfile} from '@loopback/security';
import {JwtPayload, verify} from 'jsonwebtoken';

@model()
export class User implements UserProfile {

  [securityId]: string;

  id: number;

  constructor(data?: Partial<User>) {
    Object.assign(this, data);
  }
}

export class AutentikigoStrategy implements AuthenticationStrategy {
  name = 'autentikigo';

  async authenticate(request: Request): Promise<UserProfile | undefined> {

    try {

      const token = request.headers.authorization?.split(' ')[1];
      const secret = process.env.PROJECT_SECRET;

      // Get user id
      const decoded = verify(token!, secret!) as JwtPayload;
      // const decoded = decode(token as string);
      const userProfile = this.convertIdToUserProfile(decoded.id);
      return userProfile;

    } catch (e) {
      throw new HttpErrors[401](`Unauthorized: ${e.message}`);
    }
  }

  convertIdToUserProfile(id: string): UserProfile {
    return {
      id: id,
      [securityId]: id.toString(),
    };
  }
}
