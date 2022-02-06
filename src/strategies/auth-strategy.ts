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
    @inject(RestBindings.Http.REQUEST) private request: Request,

    @repository(UserRepository) private userRepository: UserRepository,
  ) {
    this.httpClass = new HttpClass({response: this.response, request: this.request})
  }

  async authenticate(request: Request): Promise<UserProfile | undefined> {

    try {
      const metadata = await this.getMetaData() as any
      const collection = metadata['0']['options']['collection']
      const action = metadata['0']['options']['action']

      const token = request.headers.authorization!
      const secret = process.env.PROJECT_SECRET!
      const payload = await this.httpClass.verifyToken(token, secret)

      if (payload) {
        const permissionGroups = await this.userRepository
          .permissionGroups(payload?.id)
          .find({
            where: {projectId: process.env.PROJECT_ID},
            include: [{
              relation: 'permissions', scope: {
                include: [
                  {relation: 'permissionActions', scope: {where: {name: action}}},
                  {relation: 'module', scope: {where: {collection}}}
                ]
              }
            }]
          })
        const permissionGroup = permissionGroups[0]
        if ((permissionGroup && permissionGroup.name !== 'Kunlatek - Admin') && action) {
          let userHasPermission = false;
          permissionGroup.permissions?.forEach(permission => {
            if (permission.module && permission.permissionActions.length)
              userHasPermission = true
          })
          if (!userHasPermission) throw new Error(serverMessages['httpResponse']['unauthorizedError'][localeMessage])
        }

        const userProfile = this.convertIdToUserProfile(payload?.id);
        return userProfile;
      }

    } catch (err) {
      this.httpClass.unauthorizedErrorResponse({logMessage: err.message})
    }
  }

  convertIdToUserProfile(id: string): UserProfile {
    return {
      id: id,
      [securityId]: id.toString(),
    };
  }
}
