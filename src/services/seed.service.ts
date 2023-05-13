// import {BindingScope, injectable} from '@loopback/core';
// import * as mongoDB from "mongodb";
// import {defaultModulesList, modulesList} from '../utils/modules-list';

// @injectable({scope: BindingScope.TRANSIENT})
// export class SeedService {

//   constructor() { }

//   public async seedModulesAndPermissions() {
//     const client: mongoDB.MongoClient = new mongoDB.MongoClient(process.env.MONGO_URL!);

//     await client.connect()

//     await this.createPermissionActions(client, process.env.AUTH_DB ?? process.env.DB!)

//     client.close()
//   }

//   private async createPermissionActions(
//     client: mongoDB.MongoClient,
//     db: string,
//   ): Promise<void | null> {
//     console.log('Checking and creating modules...')

//     const permissionsActionsInDatabase = await client
//       .db(db)
//       .collection('__PermissionAction')
//       .find().toArray()

//     if (permissionsActionsInDatabase.length === 0) {
//       const permissionActions = [
//         'delete', 'read', 'readOne', 'exportOne', 'updateOne',
//         'createOne', 'deleteOne', 'export', 'update', 'create'
//       ]

//       await client
//         .db(db)
//         .collection('__PermissionAction')
//         .insertMany(
//           permissionActions.map(permissionAction => {
//             return {
//               name: permissionAction,
//               _deletedAt: null,
//             }
//           })
//         )
//     }

//     await this.createModules(client, db)

//     console.log('modules created!')
//   }

//   private async createModules(
//     client: mongoDB.MongoClient,
//     db: string,
//   ): Promise<void> {
//     const modules = [
//       ...(process.env.ADMIN_USERS ? defaultModulesList(db) : []),
//       ...modulesList(process.env.DB!),
//     ]

//     for (let moduleIndex = 0; moduleIndex < modules.length; moduleIndex++) {
//       const module = modules[moduleIndex]

//       const moduleAlreadyBeenInserted = await this.moduleAlreadyBeenInserted(
//         client,
//         module.collection,
//         db,
//         module.project,
//       );

//       if (!moduleAlreadyBeenInserted) {
//         const moduleCreated = await client
//           .db(db)
//           .collection('__Module')
//           .insertOne({
//             _id: new mongoDB.ObjectId(),
//             name: module.name,
//             description: module.name,
//             route: module.route,
//             collection: module.collection,
//             project: module.project,
//             icon: module.icon,
//             _deletedAt: null,
//           })

//         await this.createDefaultPermission(
//           moduleCreated?.insertedId!.toString(),
//           client,
//           db,
//         )
//       } else if (
//         moduleAlreadyBeenInserted.name !== module.name ||
//         moduleAlreadyBeenInserted.route !== module.route ||
//         moduleAlreadyBeenInserted.collection !== module.collection ||
//         moduleAlreadyBeenInserted.project !== module.project ||
//         moduleAlreadyBeenInserted.icon !== module.icon
//       ) {
//         await client
//           .db(db)
//           .collection('__Module')
//           .updateOne(
//             {_id: moduleAlreadyBeenInserted._id},
//             {
//               $set: {
//                 ...moduleAlreadyBeenInserted,
//                 name: module.name,
//                 description: module.name,
//                 route: module.route,
//                 collection: module.collection,
//                 project: module.project,
//                 icon: module.icon,
//               }
//             },
//             {upsert: true}
//           )
//       }

//     }
//   }

//   private async moduleAlreadyBeenInserted(
//     client: mongoDB.MongoClient,
//     collection: string,
//     db: string,
//     project: string,
//   ): Promise<any> {

//     const moduleFound = await client
//       .db(db)
//       .collection('__Module')
//       .findOne({
//         collection: collection,
//         project: project,
//       })

//     return moduleFound

//   }

//   private async createDefaultPermissionGroup(
//     client: mongoDB.MongoClient,
//     db: string,
//   ): Promise<any> {

//     const permissionGroupInDatabase = await client
//       .db(db)
//       .collection('__PermissionGroup')
//       .find().toArray()

//     if (permissionGroupInDatabase.length > 0)
//       return permissionGroupInDatabase[0]

//     const defaultPermissionGroup = await client
//       .db(db)
//       .collection('__PermissionGroup')
//       .insertOne({
//         _id: new mongoDB.ObjectId(),
//         name: 'Default',
//         description: 'Default permission',
//         isAdminPermission: true,
//       })

//     return defaultPermissionGroup
//   }

//   private async createModuleDefaultPermission(
//     moduleId: string,
//     permissionGroupId: string,
//     client: mongoDB.MongoClient,
//     db: string,
//   ): Promise<any> {

//     const defaultPermission = await client
//       .db(db)
//       .collection('__Permission')
//       .insertOne({
//         _id: new mongoDB.ObjectId(),
//         moduleId: new mongoDB.ObjectId(moduleId),
//         permissionGroupId: new mongoDB.ObjectId(permissionGroupId),
//       })

//     return defaultPermission
//   }

//   private async giveAllActionsToDefaultPermission(
//     permissionId: string,
//     client: mongoDB.MongoClient,
//     db: string,
//   ): Promise<void> {

//     const permissionActions = await client
//       .db(db)
//       .collection('__PermissionAction')
//       .find().toArray()

//     await client
//       .db(db)
//       .collection('__PermissionHasActions')
//       .insertMany(
//         permissionActions.map(permissionAction => {
//           return {
//             permissionId: new mongoDB.ObjectId(permissionId),
//             permissionActionId: new mongoDB.ObjectId(permissionAction._id!),
//           }
//         })
//       )
//   }

//   public async createDefaultPermission(
//     moduleId: string,
//     client: mongoDB.MongoClient,
//     db: string,
//   ): Promise<void> {

//     try {

//       const defaultPermissionGroup = await this.createDefaultPermissionGroup(client, db)

//       const permissionGroupId = defaultPermissionGroup?.insertedId ?? defaultPermissionGroup?._id

//       const defaultPermission = await this.createModuleDefaultPermission(
//         moduleId,
//         permissionGroupId!.toString(),
//         client,
//         db,
//       )

//       await this.giveAllActionsToDefaultPermission(
//         defaultPermission?.insertedId!.toString(),
//         client,
//         db,
//       )

//     } catch (err) {

//       console.error(err.message)
//       throw new Error(err.message);

//     }

//   }
// }
