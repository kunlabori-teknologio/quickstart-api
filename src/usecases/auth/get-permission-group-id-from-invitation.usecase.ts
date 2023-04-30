import {repository} from '@loopback/repository';
import {__InvitationRepository} from '../../repositories';
import {serverMessages} from '../../utils/server-messages';

export class GetPermissionGroupIdFromInvitation {

  constructor(
    @repository(__InvitationRepository)
    private invitationRepository: __InvitationRepository,
  ){}

  public async execute(
    invitationId: string,
    email: string,
  ): Promise<string> {

    const invitation = await this.invitationRepository
      .findById(invitationId, { include: ['permissionGroup'] });

    if (invitation.email !== email)
      throw new Error(serverMessages.auth.emailInvitationIncorrect['pt-BR']);
    else return invitation.permissionGroupId

  }

}
