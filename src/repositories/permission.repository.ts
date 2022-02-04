import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, HasManyThroughRepositoryFactory} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {Permission, PermissionRelations, Acl, PermissionHasAcls} from '../models';
import {PermissionHasAclsRepository} from './permission-has-acls.repository';
import {AclRepository} from './acl.repository';

export class PermissionRepository extends DefaultCrudRepository<
  Permission,
  typeof Permission.prototype._id,
  PermissionRelations
> {

  public readonly acls: HasManyThroughRepositoryFactory<Acl, typeof Acl.prototype._id,
          PermissionHasAcls,
          typeof Permission.prototype._id
        >;

  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource, @repository.getter('PermissionHasAclsRepository') protected permissionHasAclsRepositoryGetter: Getter<PermissionHasAclsRepository>, @repository.getter('AclRepository') protected aclRepositoryGetter: Getter<AclRepository>,
  ) {
    super(Permission, dataSource);
    this.acls = this.createHasManyThroughRepositoryFactoryFor('acls', aclRepositoryGetter, permissionHasAclsRepositoryGetter,);
    this.registerInclusionResolver('acls', this.acls.inclusionResolver);
  }
}
