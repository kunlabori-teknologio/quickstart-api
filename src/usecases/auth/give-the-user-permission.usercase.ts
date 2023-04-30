import {repository} from '@loopback/repository';
import {__UserHasPermissionGroupsRepository} from '../../repositories';

export class GiveTheUserPermission {

  constructor(
    @repository(__UserHasPermissionGroupsRepository)
    private userHasPermissionGroupRepository: __UserHasPermissionGroupsRepository,
  ){}

  public async execute(
    permissionGroupId: string,
    userId: string,
  ) {
    await this.userHasPermissionGroupRepository.create({userId, permissionGroupId})
  }

}
