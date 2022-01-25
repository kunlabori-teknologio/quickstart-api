import { /* inject, */ BindingScope, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import {Invitation, Project, User} from '../models';
import {InvitationRepository, ProjectRepository, UserRepository} from '../repositories';
import {userTypes} from '../utils/general-functions';

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
    @repository(ProjectRepository)
    private projectRepository: ProjectRepository,
    @repository(InvitationRepository)
    private invitationRepository: InvitationRepository,
  ) { }

  /*
   * Add service methods here
   */
  public async updateUser(
    {id, projectIds, inviteIds, userType, profileId}: {id: string, projectIds: string[], inviteIds: string[], userType: userTypes, profileId: string}
  ): Promise<User> {
    // Get user
    // let user = await this.userRepository.findById(id),
    //   projects = user.projects,
    //   invitations = user.invitations;
    // // Update projects
    // if (projectIds.length) {
    //   const userProjects = await this.projectRepository.find({where: {or: projectIds.map(projectId => {return {'_id': projectId}})}});
    //   projects = [
    //     ...(projects || []),
    //     ...userProjects.map(project => new UserProjectsDTO(project)),
    //   ];
    // }
    // // Update invitations
    // if (inviteIds.length) {
    //   const userInvitations = await this.invitationRepository.find({where: {or: inviteIds.map(inviteId => {return {'_id': inviteId}})}});
    //   invitations = [
    //     ...(invitations || []),
    //     ...userInvitations.map((invite, i) => new UserInvitationDTO({invite, projectId: projectIds[i]})),
    //   ];
    // }
    // Update user
    await this.userRepository.updateById(id, {/*projects, invitations,*/[`${userType}Id`]: profileId});
    const userUpdated = await this.userRepository.findById(id);
    return userUpdated;
  }
}
