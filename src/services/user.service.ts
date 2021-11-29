import { /* inject, */ BindingScope, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
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
  public async getUserInfo(id: string): Promise<any> {

    // Get user
    const user = await this.userRepository.findById(id);

    // Get PersonInfo
    const personInfo = await this.personRepository.findById(user.personId);

    return personInfo;

  }

  public async getUserACL(id: string, project: string): Promise<any> {

    // Get user
    const user = await this.userRepository.findById(id);

    // Get ACL Id from project
    const projectFound = await user.projects?.find(el => el.project === project);
    const ACLId = projectFound.acl;

    // Get ACL
    const ACL = await this.aclRepository.findById(ACLId);

    return ACL;

  }
}
