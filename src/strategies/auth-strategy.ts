import {AuthenticationBindings, AuthenticationMetadata, AuthenticationStrategy} from '@loopback/authentication';
import {Getter, inject} from '@loopback/core';
import {model, repository} from '@loopback/repository';
import {Request, Response, RestBindings} from '@loopback/rest';
import {securityId, UserProfile} from '@loopback/security';
import {HttpClass} from './../classes/http.class';
import {UserRepository} from './../repositories/user.repository';
import {localeMessage, serverMessages} from './../utils/server-messages';

@model()
export class User implements UserProfile {

  [securityId]: string;

  id: number;

  constructor(data?: Partial<User>) {
    Object.assign(this, data);
  }
}

export class AutentikigoStrategy implements AuthenticationStrategy {
  name = 'autentikigo'

  private httpClass


  constructor(
    @inject.getter(AuthenticationBindings.METADATA) readonly getMetaData: Getter<AuthenticationMetadata>,
    @inject(RestBindings.Http.RESPONSE) private response: Response,

    @repository(UserRepository) private userRepository: UserRepository,
  ) {
    this.httpClass = new HttpClass({response: this.response})
  }

  async authenticate(request: Request): Promise<UserProfile | undefined> {

    try {
      const metadata = await this.getMetaData() as any
      const module = metadata['0']['options']['module']
      const action = metadata['0']['options']['action']

      const token = request.headers.authorization!
      const secret = process.env.PROJECT_SECRET!
      const payload = this.httpClass.verifyToken(token, secret)

      const permissions = await this.userRepository
        .permissions(payload?.id)
        .find({
          where: {projectId: process.env.PROJECT_ID},
          include: [{relation: 'acls', scope: {include: ['aclActions']}}]
        })

      // Melhorar esse aninhamento de forEach.
      // Usar o conector do loopback
      let userHasPermission = false;
      permissions.forEach(permission => {
        permission.acls.forEach(acl => {
          acl.aclActions.forEach(aclAction => {
            if (
              (aclAction.name === action && acl.module === module) ||
              (acl.module === '*')
            ) userHasPermission = true
          })
        })
      })
      if (!userHasPermission) throw new Error(serverMessages['httpResponse']['unauthorizedError'][localeMessage])
      const userProfile = this.convertIdToUserProfile(payload?.id);
      return userProfile;

    } catch (err) {

      let message = serverMessages['httpResponse']['unauthorizedError'][localeMessage]
      let statusCode = 401
      switch (err.name) {
        case 'TokenExpiredError':
          message = serverMessages['auth']['expiredAuthToken'][localeMessage]
          statusCode = 602
          break
        case 'JsonWebTokenError':
          message = serverMessages['auth']['invalidAuthToken'][localeMessage]
          statusCode = 603
          break
        default:
          break
      }

      this.httpClass.unauthorizedErrorResponse({message, logMessage: err.message})
    }
  }

  convertIdToUserProfile(id: string): UserProfile {
    return {
      id: id,
      [securityId]: id.toString(),
    };
  }
}
