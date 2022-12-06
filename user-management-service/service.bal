import ballerina/http;
import ballerina/log;
import ballerinax/mysql.driver as _;

# A service representing a network-accessible API
# bound to port `9090`.
service / on new http:Listener(8090) {
    resource function get scopes/user/[string user]() returns ResourcePermission[]|error {
        log:printInfo(string `Resource permissions are fetched for the user: ${user}.`);
        return getResourcePermissions(user);
    }

    resource function post scopes/user/[string user](@http:Payload ResourceRole resourceRole) returns record {|*http:Ok;|}|error {
        error? response = addResourcePermission(resourceRole, user);
        if response is error {
            return response;
        }
        log:printInfo(string `Resource permissions are added for the user: ${user}, resource: ${resourceRole.resourceId}.`);
        return {};
    }

    resource function put scopes/user/[string user](@http:Payload ResourceRole resourceRole) returns record {|*http:Ok;|}|error {
        error? response = updateResourcePermission(resourceRole, user);
        if response is error {
            return response;
        }
        log:printInfo(string `Resource permissions are updated for the user: ${user}, resource: ${resourceRole.resourceId}.`);
        return {};
    }

    resource function delete scopes/user/[string user]/resourceId/[int resourceId]() returns record {|*http:Ok;|}|error {
        error? response = deleteResourcePermission(user, resourceId);
        if response is error {
            return response;
        }
        log:printInfo(string `Resource permissions are deleted for the user: ${user}, resource: ${resourceId}.`);
        return {};
    }
}
