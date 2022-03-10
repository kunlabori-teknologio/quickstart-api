import {AuthenticationBindings, AuthenticationMetadata, AuthenticationStrategy} from '@loopback/authentication';
import {Getter, inject} from '@loopback/core';
import {model, repository} from '@loopback/repository';
import {Request, Response, RestBindings} from '@loopback/rest';
import {securityId, UserProfile} from '@loopback/security';
import {Autentikigo} from '../implementations';
import {UserRepository} from './../repositories/user.repository';

@model()
export class User implements UserProfile {

  [securityId]: string;

  id: number;
  onwerId: string;

  constructor(data?: Partial<User>) {
    Object.assign(this, data);
  }
}

export class AutentikigoStrategy implements AuthenticationStrategy {
  name = 'autentikigo'


  constructor(
    @inject.getter(AuthenticationBindings.METADATA) readonly getMetaData: Getter<AuthenticationMetadata>,
    @inject(RestBindings.Http.RESPONSE) private response: Response,

    @repository(UserRepository) private userRepository: UserRepository,
  ) { }

  async authenticate(request: Request): Promise<UserProfile | undefined> {
    try {
      // Só consegui acessar as options do metadata especificando ele como any
      const metadata = await this.getMetaData() as any
      const collection = metadata['0']['options']['collection']
      const action = metadata['0']['options']['action']

      const authorizedUser = await Autentikigo.verifyAuthorization(
        collection, action, request.headers.authorization!
      )

      const userProfile = this.convertIdToUserProfile(authorizedUser.userId, authorizedUser.ownerId)
      return userProfile

    } catch (err) {

      this.response.status(401)
      this.response.send({
        statusCode: 401,
        message: err.message,
        logMessage: err.message
      })

      return
    }
  }

  convertIdToUserProfile(id: string, ownerId: string | null): UserProfile {
    return {
      id,
      ownerId,
      [securityId]: id.toString(),
    };
  }
}
