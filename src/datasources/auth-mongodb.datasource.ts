import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';

const config = {
  name: 'auth_mongodb',
  connector: 'mongodb',
  url: `${process.env.MONGO_URL!}/${process.env.AUTH_DB ?? process.env.DB}`,
  host: 'localhost',
  port: 27017,
  user: '',
  password: '',
  database: process.env.AUTH_DB ?? process.env.DB,
  useNewUrlParser: true
};

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class AuthMongodbDataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'auth_mongodb';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.auth_mongodb', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
