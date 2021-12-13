import { /* inject, */ BindingScope, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import jwt, {JwtPayload} from 'jsonwebtoken';
import {AclRepository, PersonRepository, UserRepository} from '../repositories';

@injectable({scope: BindingScope.TRANSIENT})
export class UserService {
  constructor(
    /* Add @inject to inject parameters */
    @repository(UserRepository)
    private userRepository: UserRepository,

    @repository(PersonRepository)
    private personRepository: PersonRepository,

    @repository(AclRepository)
    private aclRepository: AclRepository,
  ) { }

  /*
   * Add service methods here
   */
  public async getUserInfo(token: string): Promise<any> {

    try {
      // Verify token
      const decoded = await jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

      // Get user
      const user = await this.userRepository.findById(decoded.userId);

      // Check if user has authorization
      const hasAuthorization = user.projects.filter(el => el.id === decoded.projectId);
      if (!hasAuthorization.length) throw new Error('User does not have authorization for this project');

      // Get person info
      const personInfo = await this.personRepository.findById(user.personId);

      // TODO: Get ACL
      // const acl = await this.aclRepository.findById(user.acl);

      delete personInfo._id;
      return personInfo;

    } catch (e) {

      throw new HttpErrors[400](e.message);

    }

  }
}
