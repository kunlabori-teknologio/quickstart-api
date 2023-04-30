import {repository} from '@loopback/repository';
import {__User} from '../../models';
import {__UserRepository} from '../../repositories';

export class GetRelatedUserWithPermissions {

  constructor(
    @repository(__UserRepository) private userRepository: __UserRepository,
  ){}

  public async execute(userId: string, ownerId?: string): Promise<__User[]>{
    let where = {
      or: [
        {_ownerId: userId}
      ],
      and: [
        {project: process.env.DB}
      ]
    }
    if (ownerId) where.or.push({_ownerId: ownerId})

    const result = await this.userRepository.find({
      include: [
        {relation: 'person'},
        {relation: 'company'},
        {
          relation: 'permissionGroups',
          scope: {
            where
          }
        }
      ],
      fields: ['email', '_id']
    })

    return (result || []).filter((el: __User) => el.permissionGroups && el.permissionGroups.length)
  }

}
