import { /* inject, */ BindingScope, injectable} from '@loopback/core';
import {HttpErrors} from '@loopback/rest';

@injectable({scope: BindingScope.TRANSIENT})
export class AuthService {
  constructor(/* Add @inject to inject parameters */) { }

  /*
   * Add service methods here
   */
  public async authenticateUser(ssoId: string, sso: string, project: string): Promise<string> {

    switch (sso) {
      case 'google':
        return this.googleAuthentication(ssoId, project);

      case 'apple':
        throw new HttpErrors[400]('Apple authentication not implemented');

      default:
        throw new HttpErrors[400]('SSO not recognized');
    }
  }

  private async googleAuthentication(ssoId: string, project: string): Promise<string> {
    return 'token for google auth';
  }
}
