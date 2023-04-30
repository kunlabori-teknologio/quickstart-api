import {repository} from '@loopback/repository';
import {__UserRepository} from '../../repositories';

export interface IAuthorization {
  hasAuthorization: boolean,
  ownerId?: string,
}

export class UserHasAuthorization {

  constructor(
    @repository(__UserRepository) private userRepository: __UserRepository,
  ){}

  public async execute(
    userId: string,
    action: string,
    collection: string,
  ): Promise<IAuthorization> {
    let ownerId;

    const permissionGroups = await this.userRepository
      .permissionGroups(userId)
      .find({
        include: [
          {
            relation: 'permissions',
            scope: {
              include: [
                {relation: 'permissionActions', scope: {where: {name: action}}},
                {relation: 'module', scope: {where: {collection}}},
              ],
            },
          },
        ],
      });
    const permissionGroup = permissionGroups[0];

    let hasAuthorization = false;
    if (action) {
      if (permissionGroup) {
        //} && permissionGroup.name !== 'Kunlatek - Admin') {
        permissionGroup.modulePermissions?.forEach(permission => {
          if (permission.module && permission.permissionActions.length) {
            hasAuthorization = true;
            ownerId = permissionGroup._createdBy;
          }
        });
      }
    }

    return { hasAuthorization, ownerId };
  }
}
