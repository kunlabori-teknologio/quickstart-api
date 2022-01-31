import { /* inject, */ BindingScope, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import {User} from '../models';
import {UserRepository} from '../repositories';

@injectable({scope: BindingScope.TRANSIENT})
export class UserService {
  constructor(
    /* Add @inject to inject parameters */
    @repository(UserRepository)
    private userRepository: UserRepository,
  ) { }

  /*
   * Add service methods here
   */
  public async getUserWithPermissions(
    {projectId, condition}: {projectId: string, condition?: any}
  ): Promise<User | null> {
    const user = await this.userRepository.findOne({
      ...condition,
      include: [
        {relation: 'person'}, {relation: 'company'},
        {
          relation: 'permissions',
          scope: {
            where: {projectId},
            include: [
              {
                relation: 'acls',
                scope: {
                  include: [{relation: 'aclActions'}]
                }
              }
            ]
          }
        }
      ]
    });
    return user;
  }
}
