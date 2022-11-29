import ballerina/uuid;
import ballerina/http;

enum Status {
    reading,
    read,
    to_read
}

type Book record {|
    string id;
    string name;
    string author;
    Status status;
|};

map<Book> books = {};

service /readinglist on new http:Listener(9090) {

    resource function get books() returns Book[]|error? {
        return books.toArray();
    }

    resource function post books(@http:Payload Book newBook) returns record {|*http:Ok;|}|error? {
        newBook.id = uuid:createType1AsString();
        books[newBook.id] = newBook;
        return {};
    }

    resource function delete books(string id) returns record {|*http:Ok;|}|error? {
        _ = books.remove(id);
        return {};
    }
}
