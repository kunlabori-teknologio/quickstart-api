import {repository} from '@loopback/repository';
import {__Invitation} from '../../models';
import {__InvitationRepository} from '../../repositories';
import {serverMessages} from '../../utils/server-messages';

export class CreateInvitation {

  constructor(
    @repository(__InvitationRepository) private invitationRepository: __InvitationRepository,
  ){}

  public async execute(
    permissionGroupId: string,
    email: string,
    createdBy: string,
    ownerId: string,
  ): Promise<__Invitation> {
    const invitationAlreadyCreated = await this.invitationRepository.findOne({
      where: {
        and: [
          {permissionGroupId: permissionGroupId},
          {email: email}
        ]
      }
    })
    if (invitationAlreadyCreated)
      throw new Error(serverMessages.invitation.invitationHasAlreadyBeenCreated['pt-BR'])

    const invitation = await this.invitationRepository.create({
      permissionGroupId,
      email,
      project: process.env.DB,
      _createdBy: createdBy, _ownerId: ownerId
    })

    return invitation;
  }

}
