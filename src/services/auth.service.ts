import {BindingScope, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import jwt from 'jsonwebtoken';
// import fetch from 'node-fetch';
import {PersonRepository, UserRepository} from '../repositories';
const fetch = require('node-fetch');

@injectable({scope: BindingScope.TRANSIENT})
export class AuthService {
  constructor(
    /* Add @inject to inject parameters */

    @repository(UserRepository)
    private userRepository: UserRepository,

    @repository(PersonRepository)
    private personRepository: PersonRepository,
  ) { }

  /*
   * Add service methods here
   */
  public async authenticateUser(ssoId: string, sso: string, project: string, acl: string, uniqueId?: string, birthday?: string): Promise<string> {

    switch (sso) {
      case 'google':
        return this.googleAuthentication(ssoId, sso, project, acl, uniqueId, birthday);

      case 'apple':
        return this.appleAuthentication(ssoId, sso, project, acl, uniqueId, birthday);

      default:
        throw new HttpErrors[400]('SSO not recognized');
    }
  }

  private async googleAuthentication(ssoId: string, sso: string, project: string, acl: string, uniqueId?: string, birthday?: string): Promise<string> {

    // Search for user
    var user = await this.userRepository.findOne({where: {googleId: ssoId}});

    // If user doesnt exist, create one
    if (!user) user = await this.createUser(ssoId, sso, uniqueId, birthday);

    // Add project
    await this.addProject(user, project, acl);

    // Create token
    const token = await this.createToken({user: user?._id, project: project});

    return token;
  }

  private async appleAuthentication(ssoId: string, sso: string, project: string, acl: string, uniqueId?: string, birthday?: string): Promise<string> {

    // Search for user
    var user = await this.userRepository.findOne({where: {googleId: ssoId}});

    // If user doesnt exist, create one
    if (!user) user = await this.createUser(ssoId, sso, uniqueId, birthday);

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

  private async createUser(ssoId: string, sso: string, uniqueId?: string, birthday?: string): Promise<any> {

    var newUser = {};

    // Search person
    var person = await this.personRepository.findOne({where: {uniqueId: uniqueId}});

    // Create person if doesnt exists
    if (!person) {

      // Get person info in CPF/CNPJ API
      try {

        const response = await fetch(`${process.env.API_CPF_CNPJ}/${uniqueId}`);
        const personFromAPI = await response.json();

        // Check birthday
        if (personFromAPI.nascimento !== birthday)
          throw new HttpErrors[400]('Birthday incorrect');

        // Create person
        person = await this.personRepository.create({
          name: personFromAPI.nome,
          uniqueId: personFromAPI.cpf,
          birthday: personFromAPI.nascimento,
          gender: personFromAPI.genero,
          mother: personFromAPI.mae,
          country: 'br'
        });

      } catch (e) {
        throw new HttpErrors[400](e.message);
      }

    }

    // Add personId
    newUser = {
      personId: person?._id,
    };

    switch (sso) {
      case 'google':
        newUser = {...newUser, googleId: ssoId};
        break;

      case 'apple':
        newUser = {...newUser, appleId: ssoId};
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
