import ballerinax/mysql;
import ballerina/sql;
import ballerina/regex;

type ResourcePermissionItem record {|
  int resourceId;
  string permission;
|};

type ResourcePermission record {|
  int resourceId;
  string[] permissionList;
|};

type ResourceRole record {|
  int resourceId;
  string role;
|};

configurable string dbHost = ?;
configurable int dbPort = ?;
configurable string dbUser = ?;
configurable string dbPassword = ?;
configurable string database = ?;

function getResourcePermissions(string userId) returns ResourcePermission[] | error {
  mysql:Client dbClient = check new(
    host=dbHost,
    port=dbPort,
    user=dbUser,
    password=dbPassword, 
    database=database,
    connectionPool = { maxOpenConnections: 5 }
  );
  ResourcePermission[] resourcePermissionList = [];
  stream<ResourcePermissionItem, sql:Error?> resultStream = dbClient->query(
    `SELECT user.resourceId as resourceId, GROUP_CONCAT(permission.permissionName) as permission 
    FROM user 
    JOIN role ON user.roleId=role.id 
    JOIN rolepermission ON role.id=rolepermission.roleId 
    JOIN permission ON rolepermission.permissionId=permission.id
    WHERE user.id = ${userId}
    GROUP BY user.resourceId`
  );
  check from ResourcePermissionItem resourcePermission in resultStream
  do {
    string[] permissionList = regex:split(resourcePermission.permission, ",");
    resourcePermissionList.push({
      resourceId: resourcePermission.resourceId,
      permissionList: permissionList
    });
  };
  check resultStream.close();
  check dbClient.close();
  return resourcePermissionList;
}

function addResourcePermission(ResourceRole resourceRole, string userId) returns error? {
  mysql:Client dbClient = check new(
    host=dbHost,
    port=dbPort,
    user=dbUser,
    password=dbPassword, 
    database=database,
    connectionPool = { maxOpenConnections: 5 }
  );
  sql:ExecutionResult result = check dbClient->execute(`
    INSERT INTO user (id, resourceId, roleId)
    SELECT ${userId}, ${resourceRole.resourceId}, id FROM role WHERE roleName=${resourceRole.role}
  `);
  int|string? affectedRowCount = result.affectedRowCount;
  check dbClient.close();
  if affectedRowCount == 1 {
    return;
  } else {
    return error(string `Unable to insert resource permission for user: ${userId}, , resource: ${resourceRole.resourceId}.`);
  }
}

function updateResourcePermission(ResourceRole resourceRole, string userId) returns error? {
  mysql:Client dbClient = check new(
    host=dbHost,
    port=dbPort,
    user=dbUser,
    password=dbPassword, 
    database=database,
    connectionPool = { maxOpenConnections: 5 }
  );
  sql:ExecutionResult result = check dbClient->execute(`
    UPDATE user SET
      roleId = (SELECT id FROM role WHERE roleName=${resourceRole.role})
    WHERE id = ${userId} AND resourceId = ${resourceRole.resourceId}
  `);
  int|string? affectedRowCount = result.affectedRowCount;
  check dbClient.close();
  if affectedRowCount == 1 {
    return;
  } else {
    return error(string `Unable to update resource permission for user: ${userId}, , resource: ${resourceRole.resourceId}.`);
  }
}

function deleteResourcePermission(string userId, int resourceId) returns error? {
  mysql:Client dbClient = check new(
    host=dbHost,
    port=dbPort,
    user=dbUser,
    password=dbPassword, 
    database=database,
    connectionPool = { maxOpenConnections: 5 }
  );
  sql:ExecutionResult result = check dbClient->execute(`
    DELETE FROM user WHERE id=${userId} AND resourceId=${resourceId};
  `);
  int|string? affectedRowCount = result.affectedRowCount;
  check dbClient.close();
  if affectedRowCount == 1 {
    return;
  } else {
    return error(string `Unable to delete resource permission for user: ${userId}, resource: ${resourceId}.`);
  }
}
