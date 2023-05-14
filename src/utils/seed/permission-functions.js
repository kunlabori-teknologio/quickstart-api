const {ObjectId} = require('mongodb');

// const client = new MongoClient(process.env.MONGO_URL);
const databaseName = process.env.AUTH_DB ?? process.env.DB;

const getDefaultPermissionGroup = async client => {
  const permissionGroupInDatabase = await client
    .db(databaseName)
    .collection('__PermissionGroup')
    .find()
    .toArray();

  if (permissionGroupInDatabase.length > 0) return permissionGroupInDatabase[0];

  const defaultPermissionGroup = await client
    .db(databaseName)
    .collection('__PermissionGroup')
    .insertOne({
      _id: new ObjectId(),
      name: 'Default',
      description: 'Default permission',
      isAdminPermission: true,
    });

  return defaultPermissionGroup;
};

const getModuleDefaultPermission = async (
  moduleId,
  permissionGroupId,
  client,
) => {
  const defaultPermission = await client
    .db(databaseName)
    .collection('__Permission')
    .insertOne({
      _id: new ObjectId(),
      moduleId: new ObjectId(moduleId),
      permissionGroupId: new ObjectId(permissionGroupId),
    });

  return defaultPermission;
};

const giveAllActionsToDefaultPermission = async (permissionId, client) => {
  const permissionActions = await client
    .db(databaseName)
    .collection('__PermissionAction')
    .find()
    .toArray();

  await client
    .db(databaseName)
    .collection('__PermissionHasActions')
    .insertMany(
      permissionActions.map(permissionAction => {
        return {
          permissionId: new ObjectId(permissionId),
          permissionActionId: new ObjectId(permissionAction._id),
        };
      }),
    );
};

const createDefaultPermission = async (moduleId, client) => {
  try {
    const defaultPermissionGroup = await getDefaultPermissionGroup(client);
    const permissionGroupId =
      defaultPermissionGroup?.insertedId ?? defaultPermissionGroup?._id;

    const defaultPermission = await getModuleDefaultPermission(
      moduleId,
      permissionGroupId.toString(),
      client,
    );

    await giveAllActionsToDefaultPermission(
      defaultPermission?.insertedId.toString(),
      client,
    );
  } catch (err) {
    console.error(err.message);
    throw new Error(err.message);
  }
};

module.exports = {
  createDefaultPermission,
};
