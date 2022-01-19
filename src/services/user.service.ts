import { /* inject, */ BindingScope, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import {Invite, Project, User} from '../models';
import {InviteRepository, ProjectRepository, UserRepository} from '../repositories';
import {userTypes} from '../utils/general-functions';

class UserProjectsDTO implements IProject {
  id: string;
  constructor(project: Project) {
    this.id = project._id as string;
  }
}
class UserInvitesDTO implements IInvite {
  id: string;
  projectId: string;
  invitedAt: Date;
  constructor(
    {invite, projectId}: {invite: Invite, projectId: string}
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
    @repository(ProjectRepository)
    private projectRepository: ProjectRepository,
    @repository(InviteRepository)
    private inviteRepository: InviteRepository,
  ) { }

  /*
   * Add service methods here
   */
  public async updateUser(
    {id, projectIds, inviteIds, userType, profileId}: {id: string, projectIds: string[], inviteIds: string[], userType: userTypes, profileId: string}
  ): Promise<User> {
    // Get user
    let user = await this.userRepository.findById(id),
      projects = user.projects,
      invites = user.invites;
    // Update projects
    if (projectIds.length) {
      const userProjects = await this.projectRepository.find({where: {or: projectIds.map(projectId => {return {'_id': projectId}})}});
      projects = [
        ...(projects || []),
        ...userProjects.map(project => new UserProjectsDTO(project)),
      ];
    }
    // Update invites
    if (inviteIds.length) {
      const userInvites = await this.inviteRepository.find({where: {or: inviteIds.map(inviteId => {return {'_id': inviteId}})}});
      invites = [
        ...(invites || []),
        ...userInvites.map((invite, i) => new UserInvitesDTO({invite, projectId: projectIds[i]})),
      ];
    }
    // Update user
    await this.userRepository.updateById(id, {projects, invites, [`${userType}Id`]: profileId});
    const userUpdated = await this.userRepository.findById(id);
    return userUpdated;
  }
}
