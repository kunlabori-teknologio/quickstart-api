import mongoose from 'mongoose';
import {ApplicationConfig, QuickstartApiApplication} from './application';
import {SeedService} from './services';

export * from './application';

export async function main(options: ApplicationConfig = {}) {
  const app = new QuickstartApiApplication(options);
  await app.boot();
  await app.start();

  const url = app.restServer.url;
  console.log(`Server is running at ${url}`);
  console.log(`Try ${url}/ping`);

  const seedService = new SeedService()
  await seedService.seedModulesAndPermissions()

  return app;
}

if (require.main === module) {
  require('dotenv').config();

  // Run the application
  const config = {
    rest: {
      port: +(process.env.PORT ?? 3000),
      host: process.env.HOST,
      // The `gracePeriodForClose` provides a graceful close for http/https
      // servers with keep-alive clients. The default value is `Infinity`
      // (don't force-close). If you want to immediately destroy all sockets
      // upon stop, set its value to `0`.
      // See https://www.npmjs.com/package/stoppable
      gracePeriodForClose: 5000, // 5 seconds
      openApiSpec: {
        // useful when used with OpenAPI-to-GraphQL to locate your application
        setServersFromRequest: true,
      },
    },
  };

  main(config).catch(err => {
    console.error('Cannot start the application.', err);
    process.exit(1);
  });

  mongoose.connect(process.env.MONGO_URL!.replace('__DB_NAME__', process.env.DB!), {
    dbName: process.env.DB!,
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
    // useFindAndModify: false,
  }).then(() => console.log('Mongoose: Connected to db!!'))
}
