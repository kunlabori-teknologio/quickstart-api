import { /* inject, */ BindingScope, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import axios from 'axios';
import jwt, {JwtPayload} from 'jsonwebtoken';
import querystring from 'query-string';
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

      // Get person info
      const personInfo = await this.personRepository.findById(user.personId);

      // Get ACL
      // const acl = await this.aclRepository.findById(user.acl);

      // Get oauth token


    } catch (e) {

      throw new HttpErrors[400](e.message);

    }

  }

  private async getAuthToken(sso: string, id: string): Promise<string | undefined> {

    if (sso === 'google') return this.getGoogleAuthToken(id);

  }

  private async getGoogleAuthToken(id: string): Promise<string> {

    /*
      * Uses the code to get tokens
      * that can be used to fetch the user's profile
      */
    const url = "https://oauth2.googleapis.com/token";
    const values = {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: 'auth/google',
      grant_type: "authorization_code",
    };

    return axios
      .post(url, querystring.stringify(values), {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      })
      .then((res) => {
        return res.data
      })
      .catch((error) => {
        console.error(`Failed to fetch auth tokens`);
        throw new Error(error.message);
      });

    return '';
  }
}
