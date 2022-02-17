import {AuthenticationBindings, AuthenticationMetadata, AuthenticationStrategy} from '@loopback/authentication';
import {Getter, inject} from '@loopback/core';
import {model, repository} from '@loopback/repository';
import {Request, Response, RestBindings} from '@loopback/rest';
import {securityId, UserProfile} from '@loopback/security';
import {LocaleEnum} from '../enums/locale.enum';
import {JwtToken} from '../implementations';
import {serverMessages} from '../utils/server-messages';
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


      const tokenVerified = JwtToken.verifyAuthToken(
        request.headers.authorization!, process.env.PROJECT_SECRET!,
        request, this.response, LocaleEnum['pt-BR']
      )
      if (!tokenVerified) return

      const userId = JwtToken.getUserIdFromToken(request.headers.authorization!)

      let ownerId = null

      const permissionGroups = await this.userRepository
        .permissionGroups(userId)
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

      if (action) {
        if (permissionGroup) {//} && permissionGroup.name !== 'Kunlatek - Admin') {
          let userHasPermission = false;
          permissionGroup.permissions?.forEach(permission => {
            if (permission.module && permission.permissionActions.length) {
              userHasPermission = true
              ownerId = permissionGroup._createdBy
            }
          })
          if (!userHasPermission) throw serverMessages['httpResponse']['unauthorizedError'][LocaleEnum['pt-BR']]
        } else throw serverMessages['httpResponse']['unauthorizedError'][LocaleEnum['pt-BR']]
      }

      const userProfile = this.convertIdToUserProfile(userId, ownerId)
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
