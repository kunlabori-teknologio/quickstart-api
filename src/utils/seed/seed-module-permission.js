const {MongoClient, ObjectId} = require('mongodb');
const modules = require('./Module.json');
const {createDefaultPermission} = require('./permission-functions');

const client = new MongoClient(process.env.MONGO_URL);
const databaseName = process.env.AUTH_DB ?? process.env.DB;

const createModules = async client => {
  const db = client.db(databaseName);
  const collection = db.collection('__Module');

  console.info('Updating/Creating modules and default permission');
  for (let moduleIndex = 0; moduleIndex < modules.length; moduleIndex++) {
    const module = modules[moduleIndex];

    const moduleUpdated = await collection.findOneAndUpdate(
      {collection: module.collection},
      {$set: module},
      {
        upsert: true,
        returnDocument: true,
      },
    );

    await createDefaultPermission(moduleUpdated._id.toString(), client);
  }

  console.info('Modules and default permissions created');
};

const createPermissionActions = async client => {
  console.info('Checking and creating permission actions');

  const permissionsActionsInDatabase = await client
    .db(databaseName)
    .collection('__PermissionAction')
    .find()
    .toArray();

  if (permissionsActionsInDatabase.length === 0) {
    const permissionActions = [
      'delete',
      'read',
      'readOne',
      'exportOne',
      'updateOne',
      'createOne',
      'deleteOne',
      'export',
      'update',
      'create',
    ];

    await client
      .db(databaseName)
      .collection('__PermissionAction')
      .insertMany(
        permissionActions.map(permissionAction => {
          return {
            name: permissionAction,
            _deletedAt: null,
          };
        }),
      );
  }

  console.info('Permission actions created!');
};

(async () => {
  await client.connect();
  console.info('Connected successfully to server');

  await createPermissionActions(client);
  await createModules(client);

  db.close();
  console.info('done.');
})();
