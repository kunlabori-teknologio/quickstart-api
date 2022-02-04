// import {inject} from '@loopback/core';
// import {
//   Count,
//   CountSchema,
//   Filter,
//   FilterExcludingWhere,
//   repository,
//   Where
// } from '@loopback/repository';
// import {
//   del, get,
//   getModelSchemaRef, param, patch, post, put, requestBody,
//   response
// } from '@loopback/rest';
// import {SecurityBindings, securityId, UserProfile} from '@loopback/security';
// import {Invitation} from '../models';
// import {InvitationRepository} from '../repositories';

// export class InvitationController {
//   constructor(
//     @repository(InvitationRepository)
//     public invitationRepository: InvitationRepository,
//     @inject(SecurityBindings.USER, {optional: true})
//     private currentUser?: UserProfile,
//   ) { }

//   @post('/invitations')
//   @response(200, {
//     description: 'Invitation model instance',
//     content: {'application/json': {schema: getModelSchemaRef(Invitation)}},
//   })
//   async create(
//     @requestBody({
//       content: {
//         'application/json': {
//           schema: getModelSchemaRef(Invitation, {
//             title: 'NewInvitation',
//             exclude: ['_id'],
//           }),
//         },
//       },
//     })
//     invitation: Omit<Invitation, '_id'>,
//   ): Promise<Invitation> {
//     invitation._createdBy = this.currentUser?.[securityId] as string;
//     return this.invitationRepository.create(invitation);
//   }

//   @get('/invitations/count')
//   @response(200, {
//     description: 'Invitation model count',
//     content: {'application/json': {schema: CountSchema}},
//   })
//   async count(
//     @param.where(Invitation) where?: Where<Invitation>,
//   ): Promise<Count> {
//     return this.invitationRepository.count(where);
//   }

//   @get('/invitations')
//   @response(200, {
//     description: 'Array of Invitation model instances',
//     content: {
//       'application/json': {
//         schema: {
//           type: 'array',
//           items: getModelSchemaRef(Invitation, {includeRelations: true}),
//         },
//       },
//     },
//   })
//   async find(
//     @param.filter(Invitation) filter?: Filter<Invitation>,
//   ): Promise<Invitation[]> {
//     return this.invitationRepository.find(filter);
//   }

//   @patch('/invitations')
//   @response(200, {
//     description: 'Invitation PATCH success count',
//     content: {'application/json': {schema: CountSchema}},
//   })
//   async updateAll(
//     @requestBody({
//       content: {
//         'application/json': {
//           schema: getModelSchemaRef(Invitation, {partial: true}),
//         },
//       },
//     })
//     invitation: Invitation,
//     @param.where(Invitation) where?: Where<Invitation>,
//   ): Promise<Count> {
//     return this.invitationRepository.updateAll(invitation, where);
//   }

//   @get('/invitations/{id}')
//   @response(200, {
//     description: 'Invitation model instance',
//     content: {
//       'application/json': {
//         schema: getModelSchemaRef(Invitation, {includeRelations: true}),
//       },
//     },
//   })
//   async findById(
//     @param.path.string('id') id: string,
//     @param.filter(Invitation, {exclude: 'where'}) filter?: FilterExcludingWhere<Invitation>
//   ): Promise<Invitation> {
//     return this.invitationRepository.findById(id, filter);
//   }

//   @patch('/invitations/{id}')
//   @response(204, {
//     description: 'Invitation PATCH success',
//   })
//   async updateById(
//     @param.path.string('id') id: string,
//     @requestBody({
//       content: {
//         'application/json': {
//           schema: getModelSchemaRef(Invitation, {partial: true}),
//         },
//       },
//     })
//     invitation: Invitation,
//   ): Promise<void> {
//     await this.invitationRepository.updateById(id, invitation);
//   }

//   @put('/invitations/{id}')
//   @response(204, {
//     description: 'Invitation PUT success',
//   })
//   async replaceById(
//     @param.path.string('id') id: string,
//     @requestBody() invitation: Invitation,
//   ): Promise<void> {
//     await this.invitationRepository.replaceById(id, invitation);
//   }

//   @del('/invitations/{id}')
//   @response(204, {
//     description: 'Invitation DELETE success',
//   })
//   async deleteById(@param.path.string('id') id: string): Promise<void> {
//     await this.invitationRepository.deleteById(id);
//   }
// }
