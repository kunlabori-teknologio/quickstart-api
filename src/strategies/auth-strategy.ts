import {AuthenticationBindings, AuthenticationMetadata, AuthenticationStrategy} from '@loopback/authentication';
import {Getter, inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {Request, Response, RestBindings} from '@loopback/rest';
import {UserProfile, securityId} from '@loopback/security';
import {__UserRepository} from '../repositories/auth/__user.repository';
import {VerifyAuthToken} from '../usecases/jwt';
import {serverMessages} from '../utils/server-messages';

export class AutentikigoStrategy implements AuthenticationStrategy {
  name = 'autentikigo'


  constructor(
    @inject.getter(AuthenticationBindings.METADATA) readonly getMetaData: Getter<AuthenticationMetadata>,
    @inject(RestBindings.Http.RESPONSE) private response: Response,

    @repository(__UserRepository) private userRepository: __UserRepository,
  ) { }

  async authenticate(request: Request): Promise<UserProfile | undefined> {
    try {
      // Só consegui acessar as options do metadata especificando ele como any
      const metadata = await this.getMetaData() as any
      const collection = metadata['0']['options']['collection']
      const action = metadata['0']['options']['action']

      const token = request.headers.authorization;
      const payload = new VerifyAuthToken().execute(token);
      const userId = payload.id;

      let ownerId = null

      const permissionGroups = await this.userRepository
        .permissionGroups(userId!)
        .find({
          include: [{
            relation: 'modulePermissions', scope: {
              include: [
                {relation: 'permissionActions', scope: {where: {name: action}}},
                {relation: 'module', scope: {where: {collection}}}
              ]
            }
          }]
        })
      const permissionGroup = permissionGroups[0]

      if (action) {
        if (permissionGroup) {
          let userHasPermission = false;
          permissionGroup.modulePermissions?.forEach(permission => {
            if (permission.module && permission.permissionActions.length) {
              userHasPermission = true
              ownerId = permissionGroup._createdBy
            }
          })
          if (!userHasPermission) throw serverMessages.httpResponse.unauthorizedError['pt-BR']
        } else throw serverMessages.httpResponse.unauthorizedError['pt-BR']
      }

      return {
        id: userId!,
        ownerId: ownerId || userId,
        [securityId]: userId!.toString(),
      }

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
}
