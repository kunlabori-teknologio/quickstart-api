import { /* inject, */ BindingScope, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import {AclHasActionsRepository} from './../repositories/acl-has-actions.repository';

@injectable({scope: BindingScope.TRANSIENT})
export class AclService {
  constructor(
    /* Add @inject to inject parameters */
    /**
     * Repositories
     */
    @repository(AclHasActionsRepository)
    private aclHasActionsRepository: AclHasActionsRepository,
  ) { }

  /**
   * Relate acl actions to acl
   * @param aclId string
   * @param aclActionsIds array of string
   */
  public async relateACLActions(
    {aclId, aclActionsIds}: {aclId: string, aclActionsIds: string[]}
  ): Promise<void> {
    await this.aclHasActionsRepository.createAll(
      aclActionsIds.map(el => {
        return {aclId, aclActionId: el};
      }),
    );
  }
  /**
   * Delete Related acl actions
   * @param aclId string
   */
  public async deleteRelatedACLActions({aclId}: {aclId: string}): Promise<void> {
    await this.aclHasActionsRepository.deleteAll({aclId});
  }
}
