import {BindingScope, injectable} from '@loopback/core';
import * as fs from 'fs';
import * as mongoDB from "mongodb";
import path from 'path';
import {kebabCaseToPascalCase} from '../utils/text.transformation';

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
    console.log('Checking and creating modules...')

    const permissionsActionsInDatabase = await client
      .db(process.env.DB)
      .collection('__PermissionAction')
      .find().toArray()

    if (permissionsActionsInDatabase.length === 0) {
      const permissionActions = [
        'delete', 'read', 'readOne', 'exportOne', 'updateOne',
        'createOne', 'deleteOne', 'export', 'update', 'create'
      ]

      await client
        .db(process.env.DB)
        .collection('__PermissionAction')
        .insertMany(
          permissionActions.map(permissionAction => {
            return {
              name: permissionAction,
              _deletedAt: null,
            }
          })
        )
    }

    await this.createModules(client)

    console.log('modules created!')
  }

  private async createModules(client: mongoDB.MongoClient): Promise<void> {

    const dir = path.join(__dirname, '../../src/repositories')
    const files = fs.readdirSync(dir)

    for (const file of files) {
      if (
        !file.startsWith('__') ||
        (process.env.ADMIN_USERS && file.startsWith('__permission-group')) ||
        (process.env.ADMIN_USERS && file.startsWith('__invitation')) ||
        (process.env.ADMIN_USERS && file.startsWith('__related-users'))
      ) {
        if (file.includes('.repository.ts')) {

          const fileDir = path.join(__dirname, `../../src/repositories/${file}`)
          const fileContent = fs.readFileSync(fileDir, {encoding: 'utf8', flag: 'r'})
          const moduleName = fileContent?.split('/* moduleName->')[1]?.replace('<- */', '').trim()

          const moduleHasAlreadyBeenInserted = await this.moduleHasAlreadyBeenInserted(client, moduleName)

          if (!moduleHasAlreadyBeenInserted) {
            const isReservedModule = file.startsWith('__')

            const kebabName = file.split('.')[0]
            const module = await client
              .db(process.env.DB)
              .collection('__Module')
              .insertOne({
                _id: new mongoDB.ObjectId(),
                name: moduleName,
                description: moduleName,
                route: `/${kebabName}`,
                collection: `${isReservedModule ? '__' : ''}${kebabCaseToPascalCase(kebabName.replace('__', ''))}`,
                _deletedAt: null,
              })

            await this.createDefaultPermission(module?.insertedId!.toString(), client)
          }
        }
      }
    }
  }

  private async moduleHasAlreadyBeenInserted(client: mongoDB.MongoClient, moduleName: string): Promise<Boolean> {
    const moduleFound = await client
      .db(process.env.DB)
      .collection('__Module')
      .findOne({name: moduleName})

    return moduleFound ? true : false
  }

  private async createDefaultPermissionGroup(client: mongoDB.MongoClient): Promise<any> {

    const permissionGroupInDatabase = await client
      .db(process.env.DB)
      .collection('__PermissionGroup')
      .find().toArray()

    if (permissionGroupInDatabase.length > 0)
      return permissionGroupInDatabase[0]

    const defaultPermissionGroup = await client
      .db(process.env.DB)
      .collection('__PermissionGroup')
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
      .collection('__Permission')
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
      .collection('__PermissionAction')
      .find().toArray()

    await client
      .db(process.env.DB)
      .collection('__PermissionHasActions')
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
