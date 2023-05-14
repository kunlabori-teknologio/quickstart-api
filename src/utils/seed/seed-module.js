const {MongoClient} = require('mongodb');
const modules = require('./Module.json');

const client = new MongoClient(process.env.MONGO_URL);
const databaseName = process.env.AUTH_DB ?? process.env.DB;
const collectionName = '__Module';

(async () => {
  await client.connect();
  console.info('Connected successfully to server');

  const db = client.db(databaseName);
  const collection = db.collection(collectionName);

  console.info('Updating/Creating modules');
  for (let moduleIndex = 0; moduleIndex < modules.length; moduleIndex++) {
    const module = modules[moduleIndex];

    await collection.updateOne(
      {collection: module.collection},
      {$set: module},
      {
        upsert: true,
      },
    );
  }

  db.close();
  console.info('done.');
})();
