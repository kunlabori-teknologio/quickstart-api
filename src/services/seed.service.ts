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

    await this.createPermissionActions(client, process.env.AUTH_DB ?? process.env.DB!)

    client.close()
  }

  private async createPermissionActions(
    client: mongoDB.MongoClient,
    db: string,
  ): Promise<void | null> {
    console.log('Checking and creating modules...')

    const permissionsActionsInDatabase = await client
      .db(db)
      .collection('__PermissionAction')
      .find().toArray()

    if (permissionsActionsInDatabase.length === 0) {
      const permissionActions = [
        'delete', 'read', 'readOne', 'exportOne', 'updateOne',
        'createOne', 'deleteOne', 'export', 'update', 'create'
      ]

      await client
        .db(db)
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

    await this.createModules(client, db)

    console.log('modules created!')
  }

  private async createModules(
    client: mongoDB.MongoClient,
    db: string,
  ): Promise<void> {

    const dir = path.join(__dirname, '../../src/repositories')
    const files = fs.readdirSync(dir)

    let modules = []

    for (const file of files) {
      if (
        !file.startsWith('__') ||
        (process.env.ADMIN_USERS && file.startsWith('__permission-group')) ||
        (process.env.ADMIN_USERS && file.startsWith('__invitation')) ||
        (process.env.ADMIN_USERS && file.startsWith('__related-user'))
      ) {
        if (file.includes('.repository.ts')) {

          const fileDir = path.join(__dirname, `../../src/repositories/${file}`)
          const fileContent = fs.readFileSync(fileDir, {encoding: 'utf8', flag: 'r'})
          let moduleName = fileContent?.split('/* moduleName->')[1]?.replace('<- */', '').trim()

          let moduleIndex = 0;
          if (fileContent.includes('/* moduleIndex->')) {
            moduleIndex = parseInt(fileContent?.split('/* moduleIndex->')[1]?.replace('<- */', ''))
            moduleName = moduleName.slice(0, - (moduleIndex.toString().length + 21)).trim()
          }

          const isReservedModule = file.startsWith('__')
          const moduleHasAlreadyBeenInserted = await this.moduleHasAlreadyBeenInserted(
            client,
            moduleName,
            db,
            (isReservedModule ? db : process.env.DB)!,
          )

          if (!moduleHasAlreadyBeenInserted) {

            const kebabName = file.split('.')[0]
            modules.push({
              moduleName,
              moduleIndex,
              route: `/${kebabName}`,
              collection: `${isReservedModule ? '__' : ''}${kebabCaseToPascalCase(kebabName.replace('__', ''))}`,
              project: isReservedModule ? db : process.env.DB,
            })
          }
        }
      }
    }

    modules.sort((a, b) => (a.moduleIndex > b.moduleIndex) ? 1 : ((b.moduleIndex > a.moduleIndex) ? -1 : 0))
    for (let moduleIndex = 0; moduleIndex < modules.length; moduleIndex++) {
      const module = modules[moduleIndex]

      const moduleCreated = await client
        .db(db)
        .collection('__Module')
        .insertOne({
          _id: new mongoDB.ObjectId(),
          name: module.moduleName,
          description: module.moduleName,
          route: module.route,
          collection: module.collection,
          project: module.project,
          _deletedAt: null,
        })

      await this.createDefaultPermission(
        moduleCreated?.insertedId!.toString(),
        client,
        db,
      )
    }
  }

  private async moduleHasAlreadyBeenInserted(
    client: mongoDB.MongoClient,
    moduleName: string,
    db: string,
    project: string,
  ): Promise<Boolean> {

    const moduleFound = await client
      .db(db)
      .collection('__Module')
      .findOne({
        name: moduleName,
        project: project,
      })

    return moduleFound ? true : false

  }

  private async createDefaultPermissionGroup(
    client: mongoDB.MongoClient,
    db: string,
  ): Promise<any> {

    const permissionGroupInDatabase = await client
      .db(db)
      .collection('__PermissionGroup')
      .find().toArray()

    if (permissionGroupInDatabase.length > 0)
      return permissionGroupInDatabase[0]

    const defaultPermissionGroup = await client
      .db(db)
      .collection('__PermissionGroup')
      .insertOne({
        _id: new mongoDB.ObjectId(),
        name: 'Default',
        description: 'Default permission',
        isAdminPermission: true,
      })

    return defaultPermissionGroup
  }

  private async createModuleDefaultPermission(
    moduleId: string,
    permissionGroupId: string,
    client: mongoDB.MongoClient,
    db: string,
  ): Promise<any> {

    const defaultPermission = await client
      .db(db)
      .collection('__Permission')
      .insertOne({
        _id: new mongoDB.ObjectId(),
        moduleId: new mongoDB.ObjectId(moduleId),
        permissionGroupId: new mongoDB.ObjectId(permissionGroupId),
      })

    return defaultPermission
  }

  private async giveAllActionsToDefaultPermission(
    permissionId: string,
    client: mongoDB.MongoClient,
    db: string,
  ): Promise<void> {

    const permissionActions = await client
      .db(db)
      .collection('__PermissionAction')
      .find().toArray()

    await client
      .db(db)
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

  public async createDefaultPermission(
    moduleId: string,
    client: mongoDB.MongoClient,
    db: string,
  ): Promise<void> {

    try {

      const defaultPermissionGroup = await this.createDefaultPermissionGroup(client, db)

      const permissionGroupId = defaultPermissionGroup?.insertedId ?? defaultPermissionGroup?._id

      const defaultPermission = await this.createModuleDefaultPermission(
        moduleId,
        permissionGroupId!.toString(),
        client,
        db,
      )

      await this.giveAllActionsToDefaultPermission(
        defaultPermission?.insertedId!.toString(),
        client,
        db,
      )

    } catch (err) {

      console.error(err.message)
      throw new Error(err.message);

    }

  }
}
