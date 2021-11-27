import {BindingScope, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import jwt from 'jsonwebtoken';
import {UserRepository} from '../repositories';

@injectable({scope: BindingScope.TRANSIENT})
export class AuthService {
  constructor(
    /* Add @inject to inject parameters */

    @repository(UserRepository)
    private userRepository: UserRepository,
  ) { }

  /*
   * Add service methods here
   */
  public async authenticateUser(ssoId: string, sso: string, project: string, acl: string): Promise<string> {

    switch (sso) {
      case 'google':
        return this.googleAuthentication(ssoId, sso, project, acl);

      case 'apple':
        return this.appleAuthentication(ssoId, sso, project, acl);

      default:
        throw new HttpErrors[400]('SSO not recognized');
    }
  }

  private async googleAuthentication(ssoId: string, sso: string, project: string, acl: string): Promise<string> {

    // Search for user
    var user = await this.userRepository.findOne({where: {googleId: ssoId}});

    // If user doesnt exist, create one
    if (!user) user = await this.createUser(ssoId, sso);

    // Add project
    await this.addProject(user, project, acl);

    // Create token
    const token = await this.createToken({user: user?._id, project: project});

    return token;
  }

  private async appleAuthentication(ssoId: string, sso: string, project: string, acl: string): Promise<string> {

    // Search for user
    var user = await this.userRepository.findOne({where: {googleId: ssoId}});

    // If user doesnt exist, create one
    if (!user) user = await this.createUser(ssoId, sso);

    // Add project
    await this.addProject(user, project, acl);

    // Create token
    const token = await this.createToken({user: user?._id, project: project});

    return token;
  }

  private async addProject(user: any, project: string, acl: string): Promise<void> {
    var userHasAuthorization = user?.projects?.find((el: {project: string;}) => el.project === project) ? true : false;

    // Add project
    if (!userHasAuthorization) {
      (user?.projects || []).push({project: project, acl: acl});
      await this.userRepository.updateById(user._id, {projects: user?.projects});
    }
  }

  private async createUser(ssoId: string, sso: string): Promise<any> {

    var newUser = {};

    switch (sso) {
      case 'google':
        newUser = {googleId: ssoId};
        break;

      case 'apple':
        newUser = {appleId: ssoId};
        break;

      default:
        break;
    }

    const userCreated = this.userRepository.create(newUser);

    return userCreated;
  }

  private async createToken(payload: object): Promise<string> {

    let token = await jwt.sign(payload, process.env.JWT_SECRET as string);

    return token;
  }
}
