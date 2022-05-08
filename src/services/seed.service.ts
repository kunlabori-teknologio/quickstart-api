import {BindingScope, injectable} from '@loopback/core';
import * as fs from 'fs';
import * as mongoDB from "mongodb";
import path from 'path';
import {pascalfy, replaceKebabfyFunctionToString} from '../utils/text.transformation';

@injectable({scope: BindingScope.TRANSIENT})
export class SeedService {

  constructor() { }

  public async seedModulesAndPermissions() {
    const client: mongoDB.MongoClient = new mongoDB.MongoClient(process.env.MONGO_URL!);

    await client.connect()

    await this.createPermissionActions(client)

    client.close()
  }

  private async createPermissionActions(client: mongoDB.MongoClient): Promise<void | null> {
    const permissionsActionsInDatabase = await client
      .db(process.env.DB)
      .collection('PermissionAction')
      .find().toArray()

    if (permissionsActionsInDatabase.length > 0) return null
    console.log('seeding')

    const permissionActions = [
      'delete', 'read', 'readOne', 'exportOne', 'updateOne',
      'createOne', 'deleteOne', 'export', 'update', 'create'
    ]

    await client
      .db(process.env.DB)
      .collection('PermissionAction')
      .insertMany(
        permissionActions.map(permissionAction => {
          return {name: permissionAction}
        })
      )

    await this.createModules(client)

    console.log('seed complete')
  }

  private async createModules(client: mongoDB.MongoClient): Promise<void> {

    const notCreateModules = [
      'company.', 'esprimi-default.', 'index.', 'invitation.', 'module.', 'user.',
      'permission-action.', 'permission-group.', 'permission-has-actions.',
      'permission.', 'person.', 'project.', 'README.', 'user-has-permission-groups.',
    ]

    const dir = path.join(__dirname, '../repositories')
    const files = fs.readdirSync(dir)

    for (const file of files) {
      if (!notCreateModules.find(el => file.includes(el))) {
        if (file.includes('.repository.d.ts')) {
          const moduleName = replaceKebabfyFunctionToString(file.split('.')[0])
          const module = await client
            .db(process.env.DB)
            .collection('Module')
            .insertOne({
              _id: new mongoDB.ObjectId(),
              name: moduleName.charAt(0).toUpperCase() + moduleName.slice(1),
              description: moduleName.charAt(0).toUpperCase() + moduleName.slice(1),
              route: `/${moduleName}`,
              collection: pascalfy(moduleName),
            })

          await this.createDefaultPermission(module?.insertedId!.toString(), client)
        }
      }
    }
  }

  // private async defaultPermissionGroupExists(client: mongoDB.MongoClient): Promise<PermissionGroup | null> {
  //   const defaultPermissionGroup = (
  //     await client
  //       .db(process.env.DB)
  //       .collection('PermissionGroup')
  //       .findOne({
  //         $and: [
  //           {isAdminPermission: true}
  //         ]
  //       })
  //   ) as PermissionGroup | null
  //   return defaultPermissionGroup;
  // }

  private async createDefaultPermissionGroup(client: mongoDB.MongoClient): Promise<any> {

    const permissionGroupInDatabase = await client
      .db(process.env.DB)
      .collection('PermissionGroup')
      .find().toArray()

    if (permissionGroupInDatabase.length > 0)
      return permissionGroupInDatabase[0]

    const defaultPermissionGroup = await client
      .db(process.env.DB)
      .collection('PermissionGroup')
      .insertOne({
        _id: new mongoDB.ObjectId(),
        name: 'Default',
        description: 'Default permission',
        isAdminPermission: true,
      })

    return defaultPermissionGroup
  }

  private async createModuleDefaultPermission(moduleId: string, permissionGroupId: string, client: mongoDB.MongoClient): Promise<any> {

    const defaultPermission = await client
      .db(process.env.DB)
      .collection('Permission')
      .insertOne({
        _id: new mongoDB.ObjectId(),
        moduleId: new mongoDB.ObjectId(moduleId),
        permissionGroupId: new mongoDB.ObjectId(permissionGroupId),
      })

    return defaultPermission
  }

  private async giveAllActionsToDefaultPermission(permissionId: string, client: mongoDB.MongoClient): Promise<void> {
    const permissionActions = await client
      .db(process.env.DB)
      .collection('PermissionAction')
      .find().toArray()

    await client
      .db(process.env.DB)
      .collection('PermissionHasActions')
      .insertMany(
        permissionActions.map(permissionAction => {
          return {
            permissionId: new mongoDB.ObjectId(permissionId),
            permissionActionId: new mongoDB.ObjectId(permissionAction._id!),
          }
        })
      )
  }

  public async createDefaultPermission(moduleId: string, client: mongoDB.MongoClient): Promise<void> {

    try {

      const defaultPermissionGroup = await this.createDefaultPermissionGroup(client)

      const permissionGroupId = defaultPermissionGroup?.insertedId ?? defaultPermissionGroup?._id

      const defaultPermission = await this.createModuleDefaultPermission(
        moduleId,
        permissionGroupId!.toString(),
        client,
      )

      await this.giveAllActionsToDefaultPermission(
        defaultPermission?.insertedId!.toString(),
        client
      )

    } catch (err) {

      console.error(err.message)
      throw new Error(err.message);

    }

  }
}
