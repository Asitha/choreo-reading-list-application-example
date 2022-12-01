import ballerina/uuid;
import ballerina/http;

enum Status {
    reading,
    read,
    to_read
}

type BookItem record {|
    string name;
    string author;
    Status status;
|};

type Book record {|
    *BookItem;
    string id;
|};

map<Book> books = {};

service /readinglist on new http:Listener(9090) {

    resource function get books() returns Book[]|error? {
        return books.toArray();
    }

    resource function post books(@http:Payload BookItem newBook) returns record {|*http:Ok;|}|error? {
        string bookId = uuid:createType1AsString();
        books[bookId] = {...newBook, id: bookId};
        return {};
    }

    resource function delete books(string id) returns record {|*http:Ok;|}|error? {
        _ = books.remove(id);
        return {};
    }
}
