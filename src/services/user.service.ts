import { /* inject, */ BindingScope, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import {Invitation, Project, User} from '../models';
import {UserRepository} from '../repositories';

class UserProjectsDTO implements IProject {
  id: string;
  constructor(project: Project) {
    this.id = project._id as string;
  }
}
class UserInvitationDTO implements IInvitation {
  id: string;
  projectId: string;
  invitedAt: Date;
  constructor(
    {invite, projectId}: {invite: Invitation, projectId: string}
  ) {
    this.id = invite._id as string;
    this.projectId = projectId;
    this.invitedAt = invite._createdAt as Date;
  }
}

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
    {projectId, condition}: {projectId: string, condition: any}
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
